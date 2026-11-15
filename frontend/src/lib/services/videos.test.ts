import { describe, expect, it, vi } from 'vitest';

const { range } = vi.hoisted(() => ({ range: vi.fn() }));

vi.mock('#lib/supabase.js', () => ({
	supabase: {
		from: () => ({ select: () => ({ order: () => ({ range }) }) })
	}
}));

import type { Video } from '#lib/types.js';
import { filterVideosByTagPresence, getAllVideoMoveLinks, searchVideos } from '#lib/services/videos.js';

const videos: Video[] = [
	{
		video_id: 1,
		title: 'Swing Out Breakdown',
		url: 'https://example.com/swing-out',
		description: 'Detailed partner connection drill',
		created_at: '2026-03-28T10:00:00Z'
	},
	{
		video_id: 2,
		title: 'Charleston Basics',
		url: 'https://example.com/charleston',
		description: 'Footwork fundamentals',
		created_at: '2026-03-28T11:00:00Z'
	}
];

describe('searchVideos', () => {
	it('returns all videos for an empty query', () => {
		expect(searchVideos(videos, '   ')).toEqual(videos);
	});

	it('filters videos that have no assigned tags', () => {
		const taggedVideos = [
			{ ...videos[0], tags: [{ tag_id: 1, tag_type_id: 1, tag_name: 'Festival', tag_label: '', tag_css: '', tag_sort: 0 }] },
			{ ...videos[1], tags: [] }
		];
		expect(filterVideosByTagPresence(taggedVideos, 'without-tags')).toEqual([taggedVideos[1]]);
		expect(filterVideosByTagPresence([videos[0], taggedVideos[0]], 'without-tags')).toEqual([videos[0]]);
		expect(filterVideosByTagPresence(taggedVideos, 'all')).toBe(taggedVideos);
	});

	describe('getAllVideoMoveLinks', () => {
		it('loads every page of links', async () => {
			const link = { id: 1, video_id: 2, move_id: 3, start_time: null, end_time: null };
			range.mockReset()
				.mockResolvedValueOnce({ data: Array(1000).fill(link), error: null })
				.mockResolvedValueOnce({ data: [link], error: null });
			expect(await getAllVideoMoveLinks()).toHaveLength(1001);
			expect(range).toHaveBeenNthCalledWith(1, 0, 999);
			expect(range).toHaveBeenNthCalledWith(2, 1000, 1999);
		});

		it('surfaces a database error rather than treating links as empty', async () => {
			range.mockReset().mockResolvedValueOnce({ data: null, error: new Error('failed') });
			await expect(getAllVideoMoveLinks()).rejects.toThrow('failed');
		});
	});

	it('matches title and description case-insensitively', () => {
		expect(searchVideos(videos, 'swing')).toEqual([videos[0]]);
		expect(searchVideos(videos, 'fundamentals')).toEqual([videos[1]]);
	});
});
