import { describe, expect, it } from 'vitest';
import { buildFestivalOverviews, festivalSelectionUrl, selectFestival } from './festivals.js';
import type { Move, Tag, TagGroup, Video } from './types.js';
import type { VideoMoveLink } from './services/videos.js';

const tag = (id: number, name: string, type: number): Tag => ({
	tag_id: id, tag_name: name, tag_type_id: type, tag_label: '', tag_css: '', tag_sort: 0
});
const festivalA = tag(1, 'Weekend A', 1);
const festivalB = tag(2, 'Weekend B', 1);
const teacher = tag(3, 'Teacher couple', 2);
const groups: TagGroup[] = [
	{ tagType: { tag_type_id: 1, tag_type_name: 'Festivals', sort_order: 0, tag_type_css: '' }, tags: [festivalA, festivalB] },
	{ tagType: { tag_type_id: 2, tag_type_name: 'Teachers', sort_order: 0, tag_type_css: '' }, tags: [teacher] }
];
const move = (id: number, tags: Tag[]): Move => ({
	move_id: id, name: `Move ${id}`, synonyms: null, description: null, learned_on: null, tags
});
const video = (id: number): Video => ({
	video_id: id, title: `Class ${id}`, url: 'https://example.com', description: null, created_at: ''
});
const link = (id: number, moveId: number, videoId: number): VideoMoveLink => ({
	id, move_id: moveId, video_id: videoId, start_time: null, end_time: null
});

describe('buildFestivalOverviews', () => {
	it('groups videos and their festival-tagged moves, deduplicating teacher tags', () => {
		const moves = [move(1, [festivalA, teacher]), move(2, [festivalA, teacher]), move(3, [festivalA])];
		const result = buildFestivalOverviews(groups, moves, [video(1)], [link(1, 1, 1), link(2, 2, 1)]);
		expect(result[0].classes).toEqual([{ video: video(1), moves: moves.slice(0, 2), teachers: [teacher] }]);
		expect(result[0].unassignedMoves).toEqual([moves[2]]);
		expect(result[1].classes).toEqual([]);
	});

	describe('festival URL selection', () => {
		it('restores a selected festival from a bookmarked URL and preserves other URL parts', () => {
			const festivals = buildFestivalOverviews(groups, [], [], []);
			const original = new URL('https://example.com/app/festivals?other=1#section');
			const selectedUrl = festivalSelectionUrl(original.href, '2');
			expect(original.searchParams.has('festival')).toBe(false);
			expect(selectedUrl.pathname).toBe('/app/festivals');
			expect(selectedUrl.searchParams.get('other')).toBe('1');
			expect(selectedUrl.hash).toBe('#section');
			expect(selectFestival(festivals, new URL(selectedUrl.href).searchParams.get('festival'))?.festival).toEqual(festivalB);
			expect(selectFestival(festivals, original.searchParams.get('festival'))?.festival).toEqual(festivalA);
			const changedUrl = festivalSelectionUrl(selectedUrl.href, '1');
			expect(changedUrl.searchParams.getAll('festival')).toEqual(['1']);
			expect(selectFestival(festivals, changedUrl.searchParams.get('festival'))?.festival).toEqual(festivalA);
			expect(selectFestival(festivals, selectedUrl.searchParams.get('festival'))?.festival).toEqual(festivalB);
		});

		it('does not silently select a different festival for an invalid or removed ID', () => {
			const festivals = buildFestivalOverviews(groups, [], [], []);
			expect(selectFestival(festivals, '99')).toBeUndefined();
			expect(selectFestival(festivals, '')).toBeUndefined();
			expect(selectFestival([], '1')).toBeUndefined();
		});
	});

	it('flags videos linked to multiple festivals without presenting them as classes', () => {
		const moves = [move(1, [festivalA]), move(2, [festivalB]), move(3, [festivalA, festivalB])];
		const videos = [video(1), video(2)];
		const result = buildFestivalOverviews(groups, moves, videos, [link(1, 1, 1), link(2, 2, 1), link(3, 3, 2)]);
		for (const overview of result) {
			expect(overview.classes).toEqual([]);
			expect(overview.ambiguousVideos).toEqual(videos);
			expect(overview.unassignedMoves.length).toBe(2);
		}
	});

	it('does not infer a class for untagged moves or without a Festivals group', () => {
		const moves = [move(1, [festivalA]), move(2, [])];
		const links = [link(1, 1, 1), link(2, 2, 1)];
		expect(buildFestivalOverviews(groups, moves, [video(1)], links)[0].classes[0].moves).toEqual([moves[0]]);
		expect(buildFestivalOverviews([], moves, [video(1)], links)).toEqual([]);
	});
});
