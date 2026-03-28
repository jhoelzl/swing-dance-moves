import { describe, expect, it, vi } from 'vitest';

import {
	debounce,
	extractYouTubeId,
	getDropboxDirectUrl,
	getTagColors,
	getVideoSourceType,
	isDropboxUrl,
	timecodeToSeconds
} from '$lib/utils';

describe('getTagColors', () => {
	it('returns mapped colors for known labels', () => {
		const colors = getTagColors('success');

		expect(colors.bg).toContain('emerald');
		expect(colors.activeBg).toContain('emerald');
	});

	it('falls back to the default palette for unknown labels', () => {
		const colors = getTagColors('custom-label');

		expect(colors.bg).toContain('violet');
		expect(colors.text).toContain('violet');
	});
});

describe('video URL helpers', () => {
	it('extracts YouTube IDs from watch and short URLs', () => {
		expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
		expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
	});

	it('detects Dropbox URLs and converts shared links to direct URLs', () => {
		const sharedUrl = 'https://www.dropbox.com/s/example123/video.mp4?dl=0';

		expect(isDropboxUrl(sharedUrl)).toBe(true);
		expect(getDropboxDirectUrl(sharedUrl)).toBe(
			'https://dl.dropboxusercontent.com/s/example123/video.mp4?raw=1'
		);
	});

	it('detects the source type of supported URLs', () => {
		expect(getVideoSourceType('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
		expect(getVideoSourceType('https://www.dropbox.com/s/example123/video.mp4?dl=0')).toBe('dropbox');
		expect(getVideoSourceType('https://example.com/video.mp4')).toBeNull();
	});
});

describe('timecodeToSeconds', () => {
	it('converts hh:mm:ss, mm:ss and seconds formats', () => {
		expect(timecodeToSeconds('1:02:03')).toBe(3723);
		expect(timecodeToSeconds('10:05')).toBe(605);
		expect(timecodeToSeconds('42')).toBe(42);
	});

	it('returns 0 for empty or invalid input', () => {
		expect(timecodeToSeconds('')).toBe(0);
		expect(timecodeToSeconds('abc')).toBe(0);
	});
});

describe('debounce', () => {
	it('only invokes the wrapped function once with the latest arguments', () => {
		vi.useFakeTimers();

		const callback = vi.fn();
		const debounced = debounce(callback, 200);

		debounced('first');
		debounced('second');
		vi.advanceTimersByTime(199);

		expect(callback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith('second');

		vi.useRealTimers();
	});
});