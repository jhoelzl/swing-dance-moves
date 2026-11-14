import { afterEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

vi.mock('#lib/supabase.js', () => ({ supabase: {} }));

import { activeFilters, allMoves, clearFilters, filteredMoves, searchQuery, tagDisplayOrder, tagGroups, videoFilter } from '#lib/stores.js';
import type { Move } from '#lib/types.js';

const moves: Move[] = [
	{ move_id: 1, name: 'With video', synonyms: null, description: null, learned_on: null, hasVideo: true,
		tags: [{ tag_id: 1, tag_type_id: 1, tag_name: 'Teacher', tag_label: '', tag_css: '', tag_sort: 0 }] },
	{ move_id: 2, name: 'Without video', synonyms: null, description: null, learned_on: null, hasVideo: false,
		tags: [{ tag_id: 1, tag_type_id: 1, tag_name: 'Teacher', tag_label: '', tag_css: '', tag_sort: 0 }] },
	{ move_id: 3, name: 'Other', synonyms: null, description: null, learned_on: null, hasVideo: false }
];

afterEach(() => {
	clearFilters();
	allMoves.set([]);
	tagGroups.set([]);
});

describe('tag display order', () => {
	it('tracks the sequence of groups and tags when the groups change', () => {
		const groups = [
			{ tagType: { tag_type_id: 1, tag_type_name: 'Teachers', sort_order: 0, tag_type_css: '' }, tags: [
				{ tag_id: 2, tag_type_id: 1, tag_name: 'B', tag_label: '', tag_css: '', tag_sort: 0 },
				{ tag_id: 1, tag_type_id: 1, tag_name: 'A', tag_label: '', tag_css: '', tag_sort: 0 }
			] },
			{ tagType: { tag_type_id: 2, tag_type_name: 'Festivals', sort_order: 0, tag_type_css: '' }, tags: [
				{ tag_id: 3, tag_type_id: 2, tag_name: 'Festival', tag_label: '', tag_css: '', tag_sort: 0 }
			] }
		];
		tagGroups.set(groups);
		expect([...get(tagDisplayOrder).keys()]).toEqual([2, 1, 3]);
		tagGroups.set([...groups].reverse());
		expect([...get(tagDisplayOrder).keys()]).toEqual([3, 2, 1]);
	});
});

describe('video filter', () => {
	it('combines video status with tag and text filters and resets to all', () => {
		allMoves.set(moves);
		activeFilters.set([1]);
		videoFilter.set('without');
		expect(get(filteredMoves).map((move) => move.move_id)).toEqual([2]);

		searchQuery.set('with');
		videoFilter.set('with');
		expect(get(filteredMoves).map((move) => move.move_id)).toEqual([1]);

		clearFilters();
		expect(get(videoFilter)).toBe('all');
		expect(get(filteredMoves)).toHaveLength(3);
	});
});
