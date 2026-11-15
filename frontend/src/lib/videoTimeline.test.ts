import { describe, expect, it } from 'vitest';
import { buildVideoTimeline, formatVideoTime, getMoveInterval, getMovePlayback, groupTimelineMoves, sortTimelineMoves, youtubeEmbedUrl, type TimelineMove } from './videoTimeline.js';
import type { Move } from './types.js';

const move = (id: number, start_time: string | null, end_time: string | null): TimelineMove =>
	({ id, move_id: id, move_name: `Move ${id}`, start_time, end_time });

describe('groupTimelineMoves', () => {
	it('includes all video links, even moves without a festival tag, and preserves timestamps', () => {
		const moves: Move[] = [
			{ move_id: 1, name: 'Festival move', synonyms: null, description: null, learned_on: null },
			{ move_id: 2, name: 'Other move', synonyms: null, description: null, learned_on: null }
		];
		const links = [
			{ id: 1, video_id: 10, move_id: 1, start_time: '0:10', end_time: '0:20' },
			{ id: 2, video_id: 10, move_id: 2, start_time: '0:30', end_time: '0:40' },
			{ id: 3, video_id: 11, move_id: 99, start_time: null, end_time: null }
		];
		const grouped = groupTimelineMoves(links, moves);
		expect(grouped[10]).toEqual([
			{ ...links[0], move_name: 'Festival move' },
			{ ...links[1], move_name: 'Other move' }
		]);
		expect(grouped[11]).toEqual([{ ...links[2], move_name: '#99' }]);
		expect(buildVideoTimeline(60, grouped[10]).ranges.filter((range) => range.moves.length)).toHaveLength(2);
	});
});

describe('buildVideoTimeline', () => {
	it('uses a move start even when the end is missing or invalid, and rejects invalid starts', () => {
		expect(getMovePlayback(move(1, '1:05', '1:20'))).toEqual({ start: 65, end: 80 });
		expect(getMovePlayback(move(2, '0:00', null))).toEqual({ start: 0, end: null });
		expect(getMovePlayback(move(3, '0:15', '0:10'))).toEqual({ start: 15, end: null });
		expect(getMovePlayback(move(4, null, '0:20'))).toBeNull();
		expect(getMovePlayback(move(5, 'bad', '0:20'))).toBeNull();
	});
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

	it('keeps three touching move assignments as distinct consecutive sections', () => {
		const a = move(1, '0:00', '0:30');
		const b = move(2, '0:30', '1:00');
		const c = move(3, '1:00', '1:30');
		expect(buildVideoTimeline(90, [a, b, c]).ranges).toEqual([
			{ start: 0, end: 30, moves: [a] },
			{ start: 30, end: 60, moves: [b] },
			{ start: 60, end: 90, moves: [c] }
		]);
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

		describe('chapter playback', () => {
			it('orders moves by start time and puts missing timestamps last', () => {
				const missing = move(1, null, null);
				const later = move(2, '2:00', '2:10');
				const earlier = move(3, '0:05', null);
				expect(sortTimelineMoves([missing, later, earlier])).toEqual([earlier, later, missing]);
			});

			it('only plays complete valid ranges, including when duration is unknown', () => {
				const chapter = move(1, '0:10', '0:40');
				expect(getMoveInterval(chapter, null)).toEqual({ start: 10, end: 40 });
				expect(getMoveInterval(chapter, 30)).toBeNull();
				expect(getMoveInterval(move(2, '0:10', null), null)).toBeNull();
				expect(getMoveInterval(move(3, '0:50', '0:20'), null)).toBeNull();
			});
		});

		it('does not retain an end boundary when playing the full video', () => {
			const url = new URL(youtubeEmbedUrl('M7lc1UVf-VE', 0, null, false));
			expect(url.search).toBe('');
		});

		it('keeps start-only playback inline on mobile', () => {
			const url = new URL(youtubeEmbedUrl('M7lc1UVf-VE', 65, null, true));
			expect(url.searchParams.get('start')).toBe('65');
			expect(url.searchParams.get('end')).toBeNull();
			expect(url.searchParams.get('playsinline')).toBe('1');
		});
	});

	it('handles zero assignments and unavailable durations', () => {
		expect(buildVideoTimeline(10, []).ranges).toEqual([{ start: 0, end: 10, moves: [] }]);
		expect(buildVideoTimeline(NaN, [])).toEqual({ ranges: [], incomplete: true });
		expect(formatVideoTime(3661)).toBe('1:01:01');
	});
});
