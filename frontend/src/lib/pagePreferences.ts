import type { SortOrder, VideoFilter } from '#lib/stores.js';
import type { VideoFilters } from '#lib/videoFilters.js';

export type ViewMode = 'list' | 'grid';

export interface MovesPreferences {
	tags: number[];
	query: string;
	video: VideoFilter;
	sort: SortOrder;
	expand: boolean;
}

export interface VideoPreferences extends VideoFilters {
	view: ViewMode;
}

export interface RandomPreferences {
	tags: number[];
	video: VideoFilter;
}

function object(value: unknown): Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? value as Record<string, unknown>
		: {};
}

function tagIds(value: unknown): number[] {
	return Array.isArray(value)
		? [...new Set(value.filter((id): id is number => Number.isSafeInteger(id) && id > 0))]
		: [];
}

export function sortPreference(value: unknown): SortOrder {
	return value === 'z-a' || value === 'newest' || value === 'oldest' ? value : 'a-z';
}

export function viewPreference(value: unknown): ViewMode {
	return value === 'grid' ? 'grid' : 'list';
}

function videoPreference(value: unknown): VideoFilter {
	return value === 'with' || value === 'without' ? value : 'all';
}

export function movesPreferences(value: unknown): MovesPreferences {
	const saved = object(value);
	return {
		tags: tagIds(saved.tags),
		query: typeof saved.query === 'string' ? saved.query : '',
		video: videoPreference(saved.video),
		sort: sortPreference(saved.sort),
		expand: saved.expand === true
	};
}

export function randomPreferences(value: unknown): RandomPreferences {
	const saved = object(value);
	return { tags: tagIds(saved.tags), video: videoPreference(saved.video) };
}

export function videoPreferences(value: unknown): VideoPreferences {
	const saved = object(value);
	return {
		query: typeof saved.query === 'string' ? saved.query : '',
		moves: saved.moves === 'with-moves' || saved.moves === 'without-moves' ? saved.moves : 'all',
		tags: saved.tags === 'missing-tags' ? 'missing-tags' : 'all',
		tagIds: tagIds(saved.tagIds),
		view: viewPreference(saved.view)
	};
}

export function readPreference(key: string): unknown {
	try {
		const value = localStorage.getItem(key);
		return value === null ? null : JSON.parse(value);
	} catch (error) {
		console.warn(`Could not read page preferences (${key}):`, error);
		return null;
	}
}

export function writePreference(key: string, value: unknown): void {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.warn(`Could not save page preferences (${key}):`, error);
	}
}

export function movesUrlPreferences(params: URLSearchParams, saved: MovesPreferences): MovesPreferences {
	if (!['tags', 'q', 'video', 'expand'].some((key) => params.has(key))) return saved;
	return {
		...saved,
		tags: tagIds((params.get('tags') ?? '').split(',').filter((id) => /^[1-9]\d*$/.test(id)).map(Number)),
		query: params.get('q') ?? '',
		video: params.get('video') === '1' ? 'with' : params.get('video') === '0' ? 'without' : 'all',
		expand: params.get('expand') === '1'
	};
}
