import { describe, expect, it } from 'vitest';
import { buildVideoTimeline, formatVideoTime, youtubeEmbedUrl, type TimelineMove } from './videoTimeline.js';

const move = (id: number, start_time: string | null, end_time: string | null): TimelineMove =>
	({ id, move_id: id, move_name: `Move ${id}`, start_time, end_time });

describe('buildVideoTimeline', () => {
	it('covers the entire duration, including gaps and overlapping assignments', () => {
		const a = move(1, '0:10', '0:40');
		const b = move(2, '0:30', '1:00');
		expect(buildVideoTimeline(80, [b, a])).toEqual({
			incomplete: false,
			ranges: [
				{ start: 0, end: 10, moves: [] },
				{ start: 10, end: 30, moves: [a] },
				{ start: 30, end: 40, moves: [b, a] },
				{ start: 40, end: 60, moves: [b] },
				{ start: 60, end: 80, moves: [] }
			]
		});

	});

	it('flags missing, malformed, inverted and out-of-bounds timestamps', () => {
		const result = buildVideoTimeline(60, [
			move(1, null, '0:20'), move(2, 'bad', '0:40'),
			move(3, '0:30', '0:20'), move(4, '0:40', '1:30')
		]);
		expect(result.incomplete).toBe(true);
		expect(result.ranges).toEqual([{ start: 0, end: 60, moves: [] }]);
	});

	describe('youtubeEmbedUrl', () => {
		it('plays the selected segment inline and stops at its end', () => {
			const url = new URL(youtubeEmbedUrl('M7lc1UVf-VE', 30, 50, true));
			expect(url.searchParams.get('start')).toBe('30');
			expect(url.searchParams.get('end')).toBe('50');
			expect(url.searchParams.get('autoplay')).toBe('1');
			expect(url.searchParams.get('playsinline')).toBe('1');
		});

		it('does not retain an end boundary when playing the full video', () => {
			const url = new URL(youtubeEmbedUrl('M7lc1UVf-VE', 0, null, false));
			expect(url.search).toBe('');
		});
	});

	it('handles zero assignments and unavailable durations', () => {
		expect(buildVideoTimeline(10, []).ranges).toEqual([{ start: 0, end: 10, moves: [] }]);
		expect(buildVideoTimeline(NaN, [])).toEqual({ ranges: [], incomplete: true });
		expect(formatVideoTime(3661)).toBe('1:01:01');
	});
});
