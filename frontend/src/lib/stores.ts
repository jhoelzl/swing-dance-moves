import { writable, derived } from 'svelte/store';
import type { Move, TagGroup, Video } from '$lib/types';
import { filterMovesByTags, searchMoves } from '$lib/services/moves';

// Active tab: 'moves' | 'videos'
export const activeTab = writable<'moves' | 'videos'>('moves');

// All moves loaded from Supabase
export const allMoves = writable<Move[]>([]);

// All videos loaded from Supabase
export const allVideos = writable<Video[]>([]);

// All tag groups loaded from Supabase
export const tagGroups = writable<TagGroup[]>([]);

// Currently active filter tag IDs
export const activeFilters = writable<number[]>([]);

// Search query string
export const searchQuery = writable<string>('');

// Dark mode state
export const darkMode = writable<boolean>(false);

// Admin authentication state
export const isAdmin = writable<boolean>(false);

// Loading state
export const isLoading = writable<boolean>(true);

// Show all moves vs random selection
export const showAll = writable<boolean>(true);

// Filter to show only moves with YouTube videos
export const videoOnly = writable<boolean>(false);

// Filtered and searched moves (derived)
export const filteredMoves = derived(
	[allMoves, activeFilters, searchQuery, videoOnly],
	([$allMoves, $activeFilters, $searchQuery, $videoOnly]) => {
		let result = filterMovesByTags($allMoves, $activeFilters);
		result = searchMoves(result, $searchQuery);
		if ($videoOnly) {
			result = result.filter(
				(m) =>
					m.link &&
					(m.link.includes('youtube.com') || m.link.includes('youtu.be'))
			);
		}
		return result;
	}
);

// Toggle a tag filter
export function toggleFilter(tagId: number) {
	activeFilters.update((filters) => {
		if (filters.includes(tagId)) {
			return filters.filter((id) => id !== tagId);
		}
		return [...filters, tagId];
	});
}

// Clear all filters
export function clearFilters() {
	activeFilters.set([]);
	searchQuery.set('');
	videoOnly.set(false);
}

// Initialize dark mode from localStorage or system preference
export function initDarkMode() {
	if (typeof window === 'undefined') return;

	const stored = localStorage.getItem('darkMode');
	if (stored !== null) {
		const isDark = stored === 'true';
		darkMode.set(isDark);
		document.documentElement.classList.toggle('dark', isDark);
	} else {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		darkMode.set(prefersDark);
		document.documentElement.classList.toggle('dark', prefersDark);
	}
}

// Toggle dark mode
export function toggleDarkMode() {
	darkMode.update((current) => {
		const next = !current;
		if (typeof window !== 'undefined') {
			localStorage.setItem('darkMode', String(next));
			document.documentElement.classList.toggle('dark', next);
		}
		return next;
	});
}
