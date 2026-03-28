import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/supabase', () => ({
	supabase: {}
}));

import type { Move } from '$lib/types';
import { filterMovesByTags, getRandomMoves, searchMoves } from '$lib/services/moves';

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

	it('applies AND logic across selected tags', () => {
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