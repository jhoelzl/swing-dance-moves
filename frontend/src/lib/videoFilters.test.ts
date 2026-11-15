import { describe, expect, it } from 'vitest';
import { readVideoFilters, videoFiltersUrl } from './videoFilters.js';

describe('video filter URLs', () => {
	it('round trips the search and both active filters while preserving other URL parts', () => {
		const original = new URL('https://example.com/app/videos?other=1#section');
		const filters = { query: 'Swing & Shag', moves: 'with-moves', tags: 'without-tags' } as const;
		const url = videoFiltersUrl(original, filters);
		expect(readVideoFilters(new URL(url.href))).toEqual(filters);
		expect(url.pathname).toBe('/app/videos');
		expect(url.searchParams.get('other')).toBe('1');
		expect(url.hash).toBe('#section');
		expect(original.searchParams.has('moves')).toBe(false);
	});

	it('handles both move filters and removes only cleared filter parameters', () => {
		const url = new URL('https://example.com/videos?q=test&moves=with-moves&tags=without-tags&other=1');
		const updated = videoFiltersUrl(url, { query: 'test', moves: 'without-moves', tags: 'all' });
		expect(readVideoFilters(updated)).toEqual({ query: 'test', moves: 'without-moves', tags: 'all' });
		expect(updated.searchParams.has('tags')).toBe(false);
		const cleared = videoFiltersUrl(updated, { query: '', moves: 'all', tags: 'all' });
		expect(cleared.search).toBe('?other=1');
	});

	it('treats unknown filter values as defaults', () => {
		const url = new URL('https://example.com/videos?moves=invalid&tags=invalid');
		expect(readVideoFilters(url)).toEqual({ query: '', moves: 'all', tags: 'all' });
	});
});
