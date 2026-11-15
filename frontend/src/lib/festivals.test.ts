import { describe, expect, it } from 'vitest';
import { buildFestivalOverviews } from './festivals.js';
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
