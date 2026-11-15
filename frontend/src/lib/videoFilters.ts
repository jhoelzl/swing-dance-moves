import type { VideoTagFilter } from '#lib/services/videos.js';

export type VideoMoveFilter = 'all' | 'with-moves' | 'without-moves';

export interface VideoFilters {
	query: string;
	moves: VideoMoveFilter;
	tags: VideoTagFilter;
}

export function readVideoFilters(url: URL): VideoFilters {
	const moves = url.searchParams.get('moves');
	const tags = url.searchParams.get('tags');
	return {
		query: url.searchParams.get('q') ?? '',
		moves: moves === 'with-moves' || moves === 'without-moves' ? moves : 'all',
		tags: tags === 'without-tags' ? tags : 'all'
	};
}

export function videoFiltersUrl(url: URL, filters: VideoFilters): URL {
	const next = new URL(url);
	for (const [key, value] of [
		['q', filters.query],
		['moves', filters.moves === 'all' ? '' : filters.moves],
		['tags', filters.tags === 'all' ? '' : filters.tags]
	]) {
		if (value) next.searchParams.set(key, value);
		else next.searchParams.delete(key);
	}
	return next;
}
