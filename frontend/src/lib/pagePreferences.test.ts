import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	movesPreferences, movesUrlPreferences, randomPreferences, readPreference,
	sortPreference, videoPreferences, viewPreference, writePreference
} from './pagePreferences.js';

// cspell:ignore unstub
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('page preferences', () => {
	it('round trips independent page selections, including cleared filters', () => {
		const values = new Map<string, string>();
		vi.stubGlobal('localStorage', {
			getItem: (key: string) => values.get(key) ?? null,
			setItem: (key: string, value: string) => values.set(key, value)
		});
		const moves = { tags: [1, 2], query: 'shag', video: 'with', sort: 'newest', expand: true };
		const videos = { query: '', moves: 'without-moves', tags: 'missing-tags', tagIds: [4], view: 'grid' };
		writePreference('moves', moves);
		writePreference('videos', videos);
		writePreference('random', { tags: [], video: 'all' });
		expect(movesPreferences(readPreference('moves'))).toEqual(moves);
		expect(videoPreferences(readPreference('videos'))).toEqual(videos);
		expect(randomPreferences(readPreference('random'))).toEqual({ tags: [], video: 'all' });
		expect(viewPreference('grid')).toBe('grid');
		expect(sortPreference('oldest')).toBe('oldest');
	});

	it('validates stale or malformed values without applying invalid filters', () => {
		expect(movesPreferences({ tags: [1, 1, -1, 1.5, '2'], video: 'bad', sort: 'bad', expand: 'yes' }))
			.toEqual({ tags: [1], query: '', video: 'all', sort: 'a-z', expand: false });
		expect(videoPreferences({ tagIds: [2, 2, 0], view: 'bad', moves: 'bad', tags: 'bad' }))
			.toEqual({ query: '', moves: 'all', tags: 'all', tagIds: [2], view: 'list' });
	});

	it('prefers explicit shared URL filters and restores saved options for a plain URL', () => {
		const saved = movesPreferences({ tags: [8], query: 'saved', video: 'with', sort: 'oldest', expand: true });
		expect(movesUrlPreferences(new URLSearchParams('other=1'), saved)).toEqual(saved);
		expect(movesUrlPreferences(new URLSearchParams('q=shared&tags=2,2,bad&video=0'), saved))
			.toEqual({ tags: [2], query: 'shared', video: 'without', sort: 'oldest', expand: false });
	});

	it('reports unavailable or corrupt storage and keeps the app usable', () => {
		const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.stubGlobal('localStorage', {
			getItem: () => '{',
			setItem: () => { throw new Error('storage unavailable'); }
		});
		expect(readPreference('moves')).toBeNull();
		expect(movesPreferences(readPreference('moves')).sort).toBe('a-z');
		expect(() => writePreference('moves', {})).not.toThrow();
		expect(warning).toHaveBeenCalledTimes(3);
	});
});
