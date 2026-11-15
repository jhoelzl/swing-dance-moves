import { describe, expect, it, vi } from 'vitest';

const { range } = vi.hoisted(() => ({ range: vi.fn() }));

vi.mock('#lib/supabase.js', () => ({
	supabase: {
		from: () => ({ select: () => ({ order: () => ({ range }) }) })
	}
}));

import type { Tag, TagGroup, Video } from '#lib/types.js';
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

		describe('filterVideosByTagPresence', () => {
			const group = (id: number, name: string): TagGroup => ({
				tagType: { tag_type_id: id, tag_type_name: name, sort_order: 0, tag_type_css: '' },
				tags: []
			});
			const tag = (id: number): Tag => ({
				tag_id: id, tag_type_id: id, tag_name: '', tag_label: '', tag_css: '', tag_sort: 0
			});
			const groups = [group(1, ' Festivals '), group(2, 'TEACHERS'), group(3, 'Other')];
			const festival = tag(1);
			const teacher = tag(2);
			const other = tag(3);

			it('shows videos missing a festival or teacher, including those with unrelated tags', () => {
				const candidates = [
					{ ...videos[0], video_id: 1 },
					{ ...videos[0], video_id: 2, tags: [] },
					{ ...videos[0], video_id: 3, tags: [festival] },
					{ ...videos[0], video_id: 4, tags: [teacher] },
					{ ...videos[0], video_id: 5, tags: [other] },
					{ ...videos[0], video_id: 6, tags: [festival, other] },
					{ ...videos[0], video_id: 7, tags: [teacher, other] },
					{ ...videos[0], video_id: 8, tags: [festival, teacher] },
					{ ...videos[0], video_id: 9, tags: [festival, teacher, other] }
				];
				expect(filterVideosByTagPresence(candidates, 'missing-tags', groups).map((video) => video.video_id))
					.toEqual([1, 2, 3, 4, 5, 6, 7]);
				expect(filterVideosByTagPresence(candidates, 'all', groups)).toBe(candidates);
			});

			it('recognizes the alternate festival group name', () => {
				const complete = [{ ...videos[0], tags: [festival, teacher] }];
				expect(filterVideosByTagPresence(complete, 'missing-tags', [
					group(1, ' Festival / Classes '), groups[1]
				])).toEqual([]);
			});

			it('considers the required category missing when its group is unavailable', () => {
				const complete = [{ ...videos[0], tags: [festival, teacher] }];
				expect(filterVideosByTagPresence(complete, 'missing-tags', [groups[0]])).toEqual(complete);
				expect(filterVideosByTagPresence(complete, 'missing-tags', [groups[1]])).toEqual(complete);
				expect(filterVideosByTagPresence(complete, 'missing-tags', [])).toEqual(complete);
			});
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
