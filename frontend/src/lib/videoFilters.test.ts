import { describe, expect, it } from 'vitest';
import { readVideoFilters, videoFiltersUrl, type VideoFilters } from './videoFilters.js';

describe('video filter URLs', () => {
	it('round trips the search and both active filters while preserving other URL parts', () => {
		const original = new URL('https://example.com/app/videos?other=1#section');
		const filters: VideoFilters = { query: 'Swing & Shag', moves: 'with-moves', tags: 'missing-tags', tagIds: [1, 23] };
		const url = videoFiltersUrl(original, filters);
		expect(readVideoFilters(new URL(url.href))).toEqual(filters);
		expect(url.pathname).toBe('/app/videos');
		expect(url.searchParams.get('other')).toBe('1');
		expect(url.hash).toBe('#section');
		expect(original.searchParams.has('moves')).toBe(false);
	});

	it('handles both move filters and removes only cleared filter parameters', () => {
		const url = new URL('https://example.com/videos?q=test&moves=with-moves&tags=missing-tags&tagIds=1,2&other=1');
		const updated = videoFiltersUrl(url, { query: 'test', moves: 'without-moves', tags: 'all', tagIds: [] });
		expect(readVideoFilters(updated)).toEqual({ query: 'test', moves: 'without-moves', tags: 'all', tagIds: [] });
		expect(updated.searchParams.has('tags')).toBe(false);
		expect(updated.searchParams.has('tagIds')).toBe(false);
		const cleared = videoFiltersUrl(updated, { query: '', moves: 'all', tags: 'all', tagIds: [] });
		expect(cleared.search).toBe('?other=1');
	});

	it('treats unknown filter values as defaults', () => {
		const url = new URL('https://example.com/videos?moves=invalid&tags=invalid');
		expect(readVideoFilters(url)).toEqual({ query: '', moves: 'all', tags: 'all', tagIds: [] });
	});

	it('restores legacy without-tags bookmarks as the missing-tags filter', () => {
		const url = new URL('https://example.com/videos?tags=without-tags');
		const filters = readVideoFilters(url);
		expect(filters.tags).toBe('missing-tags');
		expect(videoFiltersUrl(url, filters).searchParams.get('tags')).toBe('missing-tags');
	});

	it('ignores malformed tag IDs and deduplicates valid IDs', () => {
		const url = new URL('https://example.com/videos?tagIds=1,2,1,0,-1,1.5,2x,9007199254740992');
		expect(readVideoFilters(url).tagIds).toEqual([1, 2]);
	});
});
