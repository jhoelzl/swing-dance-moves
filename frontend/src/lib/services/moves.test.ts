import { describe, expect, it, vi } from 'vitest';

vi.mock('#lib/supabase.js', () => ({
	supabase: {}
}));

import type { Move, Tag, TagGroup } from '#lib/types.js';
import { filterMovesByTags, getRandomMoves, searchMoves, searchTagGroups, sortMoveTags } from '#lib/services/moves.js';

const moves: Move[] = [
	{
		move_id: 1,
		name: 'Swing Out',
		synonyms: 'Open Out',
		description: 'Classic Lindy Hop move',
		learned_on: null,
		tags: [
			{ tag_id: 1, tag_type_id: 1, tag_name: 'Lindy Hop', tag_label: 'primary', tag_css: '', tag_sort: 0 },
			{ tag_id: 2, tag_type_id: 2, tag_name: 'Beginner', tag_label: 'success', tag_css: '', tag_sort: 0 }
		],
		hasVideo: true
	},
	{
		move_id: 2,
		name: 'Tuck Turn',
		synonyms: '',
		description: 'A turn pattern for partners',
		learned_on: null,
		tags: [{ tag_id: 1, tag_type_id: 1, tag_name: 'Lindy Hop', tag_label: 'primary', tag_css: '', tag_sort: 0 }],
		hasVideo: false
	},
	{
		move_id: 3,
		name: 'Basic Charleston',
		synonyms: 'Charleston Basic',
		description: 'Solo jazz rhythm',
		learned_on: null,
		tags: [{ tag_id: 3, tag_type_id: 1, tag_name: 'Charleston', tag_label: 'warning', tag_css: '', tag_sort: 0 }],
		hasVideo: false
	}
];

describe('filterMovesByTags', () => {
	it('returns all moves when no tag filter is active', () => {
		expect(filterMovesByTags(moves, [])).toEqual(moves);
	});

	it('applies OR logic within the same tag type', () => {
		expect(filterMovesByTags(moves, [1, 3])).toHaveLength(3);
	});

	it('applies AND logic across different tag types', () => {
		const filtered = filterMovesByTags(moves, [1, 2]);

		expect(filtered).toHaveLength(1);
		expect(filtered[0].name).toBe('Swing Out');
	});
});

describe('searchMoves', () => {
	it('matches against name, synonyms and description case-insensitively', () => {
		expect(searchMoves(moves, 'swing')).toHaveLength(1);
		expect(searchMoves(moves, 'open out')).toHaveLength(1);
		expect(searchMoves(moves, 'partner')).toHaveLength(1);
		expect(searchMoves(moves, 'charleston')).toHaveLength(1);
	});
});

describe('searchTagGroups', () => {
	const groups: TagGroup[] = [
		{
			tagType: { tag_type_id: 1, tag_type_name: 'Teachers', sort_order: 0, tag_type_css: '' },
			tags: [
				{ tag_id: 1, tag_type_id: 1, tag_name: 'Alice Smith', tag_label: '', tag_css: '', tag_sort: 0 },
				{ tag_id: 2, tag_type_id: 1, tag_name: 'Bob Jones', tag_label: '', tag_css: '', tag_sort: 1 }
			]
		},
		{
			tagType: { tag_type_id: 2, tag_type_name: 'Level', sort_order: 1, tag_type_css: '' },
			tags: [{ tag_id: 3, tag_type_id: 2, tag_name: 'Beginner', tag_label: '', tag_css: '', tag_sort: 0 }]
		}
	];

	it('matches tag names case-insensitively and omits groups without matches', () => {
		const result = searchTagGroups(groups, '  ALICE  ');
		expect(result).toHaveLength(1);
		expect(result[0].tags.map((tag) => tag.tag_name)).toEqual(['Alice Smith']);
		expect(groups[0].tags).toHaveLength(2);
		expect(searchTagGroups(groups, 'not found')).toEqual([]);
	});

	it('shows all tags for a blank query', () => {
		expect(searchTagGroups(groups, '  ')).toEqual(groups);
	});
});

describe('sortMoveTags', () => {
	it('follows the displayed group and tag order regardless of mapping order', () => {
		const tags: Tag[] = [
			{ tag_id: 3, tag_type_id: 2, tag_name: 'Festival', tag_label: '', tag_css: '', tag_sort: 0 },
			{ tag_id: 2, tag_type_id: 1, tag_name: 'Zoe', tag_label: '', tag_css: '', tag_sort: 0 },
			{ tag_id: 1, tag_type_id: 1, tag_name: 'Alice', tag_label: '', tag_css: '', tag_sort: 0 }
		];
		const order = new Map([[1, 0], [2, 1], [3, 2]]);
		expect(sortMoveTags(tags, order).map((tag) => tag.tag_id)).toEqual([1, 2, 3]);
		expect(sortMoveTags(tags, new Map([[3, 0], [2, 1], [1, 2]])).map((tag) => tag.tag_id)).toEqual([3, 2, 1]);
		expect(tags.map((tag) => tag.tag_id)).toEqual([3, 2, 1]);
	});

	it('keeps tags missing from the groups in a deterministic order after known tags', () => {
		const tags: Tag[] = [
			{ tag_id: 3, tag_type_id: 2, tag_name: 'Zoe', tag_label: '', tag_css: '', tag_sort: 0 },
			{ tag_id: 2, tag_type_id: 2, tag_name: 'Alice', tag_label: '', tag_css: '', tag_sort: 0 },
			{ tag_id: 1, tag_type_id: 1, tag_name: 'Known', tag_label: '', tag_css: '', tag_sort: 0 }
		];
		expect(sortMoveTags(tags, new Map([[1, 0]])).map((tag) => tag.tag_id)).toEqual([1, 2, 3]);
	});
});

describe('getRandomMoves', () => {
	it('returns the requested number of moves without mutating the original list', () => {
		const original = [...moves];
		const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

		const randomMoves = getRandomMoves(moves, 2);

		expect(randomMoves).toHaveLength(2);
		expect(moves).toEqual(original);

		randomSpy.mockRestore();
	});
});
