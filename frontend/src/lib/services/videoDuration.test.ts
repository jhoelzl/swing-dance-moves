import { afterEach, describe, expect, it, vi } from 'vitest';

// cspell:ignore unstub
afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

describe('video duration lookup', () => {
	it('shares successful Dropbox metadata requests and caches the result', async () => {
		let created = 0;
		vi.stubGlobal('window', globalThis);
		vi.stubGlobal('document', {
			createElement: () => {
				created++;
				const video = {
					duration: 123,
					onloadedmetadata: null as (() => void) | null,
					onerror: null as (() => void) | null,
					preload: '',
					removeAttribute: () => {},
					load: () => {},
					set src(_value: string) { queueMicrotask(() => video.onloadedmetadata?.()); }
				};
				return video;
			}
		});
		const { getVideoDuration } = await import('./videoDuration.js');
		const url = 'https://www.dropbox.com/s/example/video.mp4';
		expect(await Promise.all([getVideoDuration(url), getVideoDuration(url)])).toEqual([123, 123]);
		expect(await getVideoDuration(url)).toBe(123);
		expect(created).toBe(1);
	});

	it('allows retry after an unavailable duration', async () => {
		let created = 0;
		vi.stubGlobal('window', globalThis);
		vi.stubGlobal('document', {
			createElement: () => {
				const succeeds = ++created > 1;
				const video = {
					duration: succeeds ? 60 : NaN,
					onloadedmetadata: null as (() => void) | null,
					onerror: null as (() => void) | null,
					preload: '',
					removeAttribute: () => {},
					load: () => {},
					set src(_value: string) { queueMicrotask(() => succeeds ? video.onloadedmetadata?.() : video.onerror?.()); }
				};
				return video;
			}
		});
		const { getVideoDuration } = await import('./videoDuration.js');
		const url = 'https://www.dropbox.com/s/example/video.mp4';
		await expect(getVideoDuration(url)).rejects.toThrow('Dropbox duration unavailable');
		expect(await getVideoDuration(url)).toBe(60);
		expect(created).toBe(2);
	});
});
