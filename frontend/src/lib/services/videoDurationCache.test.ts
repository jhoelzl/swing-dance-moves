import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

const mocks = vi.hoisted(() => ({
	getVideoDuration: vi.fn(),
	update: vi.fn(),
	eq: vi.fn(),
	is: vi.fn(),
	select: vi.fn(),
	maybeSingle: vi.fn()
}));
vi.mock('./videoDuration.js', () => ({ getVideoDuration: mocks.getVideoDuration }));
vi.mock('#lib/supabase.js', () => ({ supabase: { from: () => ({ update: mocks.update }) } }));

import { allVideos } from '#lib/stores.js';
import { loadVideoDuration } from './videoDurationCache.js';
import type { Video } from '#lib/types.js';

const video: Video = {
	video_id: 1, title: 'Video', url: 'https://example.com/one',
	description: '', created_at: '', duration_seconds: null
};

beforeEach(() => {
	vi.clearAllMocks();
	mocks.update.mockReturnValue({ eq: mocks.eq });
	mocks.eq.mockReturnValue({ eq: mocks.eq, is: mocks.is });
	mocks.is.mockReturnValue({ select: mocks.select });
	mocks.select.mockReturnValue({ maybeSingle: mocks.maybeSingle });
	mocks.maybeSingle.mockResolvedValue({ data: { video_id: 1 }, error: null });
	mocks.getVideoDuration.mockResolvedValue(120);
	allVideos.set([video]);
});

describe('persisted video durations', () => {
	it('uses a stored duration without loading metadata or writing', async () => {
		expect(await loadVideoDuration({ ...video, duration_seconds: 45 })).toBe(45);
		expect(mocks.getVideoDuration).not.toHaveBeenCalled();
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it('looks up missing durations, saves conditionally, and updates the store', async () => {
		expect(await Promise.all([loadVideoDuration(video), loadVideoDuration(video)])).toEqual([120, 120]);
		await vi.waitFor(() => expect(get(allVideos)[0].duration_seconds).toBe(120));
		expect(mocks.getVideoDuration).toHaveBeenCalledTimes(1);
		expect(mocks.update).toHaveBeenCalledWith({ duration_seconds: 120 });
		expect(mocks.eq).toHaveBeenCalledWith('video_id', 1);
		expect(mocks.eq).toHaveBeenCalledWith('url', video.url);
		expect(mocks.is).toHaveBeenCalledWith('duration_seconds', null);
	});

	it('does not replace a changed URL or persist a failed lookup', async () => {
		let resolve!: (value: number) => void;
		mocks.getVideoDuration.mockReturnValueOnce(new Promise<number>((done) => { resolve = done; }));
		mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
		const request = loadVideoDuration(video);
		allVideos.set([{ ...video, url: 'https://example.com/two' }]);
		resolve(120);
		await request;
		await vi.waitFor(() => expect(mocks.maybeSingle).toHaveBeenCalled());
		expect(get(allVideos)[0].duration_seconds).toBeNull();
		mocks.getVideoDuration.mockRejectedValueOnce(new Error('metadata unavailable'));
		await expect(loadVideoDuration({ ...video, video_id: 2 })).rejects.toThrow('metadata unavailable');
		expect(mocks.update).toHaveBeenCalledTimes(1);
	});

	it('shows the duration even when saving the cache fails, and reports the failure', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error('write failed') });
			expect(await loadVideoDuration(video)).toBe(120);
			await vi.waitFor(() => expect(log).toHaveBeenCalledWith('Failed to save video duration:', expect.any(Error)));
			expect(get(allVideos)[0].duration_seconds).toBeNull();
		} finally {
			log.mockRestore();
		}
	});
});
