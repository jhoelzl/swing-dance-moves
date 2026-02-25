import { writable, derived } from 'svelte/store';
import type { Move, TagGroup, Video, UserSettings } from '$lib/types';
import { filterMovesByTags, searchMoves } from '$lib/services/moves';

// Active tab: 'moves' | 'random' | 'videos' | 'tags' | 'settings'
export const activeTab = writable<'moves' | 'random' | 'videos' | 'tags' | 'settings'>('moves');

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

// User settings (loaded from Supabase)
export const userSettings = writable<UserSettings | null>(null);

// Show all moves vs random selection
export const showAll = writable<boolean>(true);

// Sort order for moves
export type SortOrder = 'a-z' | 'z-a' | 'newest' | 'oldest';
export const sortOrder = writable<SortOrder>('a-z');

// Filter to show only moves with YouTube videos
export const videoOnly = writable<boolean>(false);

// Filtered, searched, and sorted moves (derived)
export const filteredMoves = derived(
	[allMoves, activeFilters, searchQuery, videoOnly, sortOrder],
	([$allMoves, $activeFilters, $searchQuery, $videoOnly, $sortOrder]) => {
		let result = filterMovesByTags($allMoves, $activeFilters);
		result = searchMoves(result, $searchQuery);
		if ($videoOnly) {
			result = result.filter((m) => m.hasVideo);
		}
		// Sort
		result = [...result].sort((a, b) => {
			switch ($sortOrder) {
				case 'a-z':
					return a.name.localeCompare(b.name, 'de');
				case 'z-a':
					return b.name.localeCompare(a.name, 'de');
				case 'newest':
					return b.move_id - a.move_id;
				case 'oldest':
					return a.move_id - b.move_id;
				default:
					return 0;
			}
		});
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

// Toast notification system
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
	id: number;
	text: string;
	type: ToastType;
}

let toastCounter = 0;
export const toasts = writable<ToastMessage[]>([]);

/**
 * Show a toast notification. Auto-dismisses after the given duration.
 */
export function addToast(text: string, type: ToastType = 'success', duration = 3500) {
	const id = ++toastCounter;
	toasts.update((t) => [...t, { id, text, type }]);
	if (typeof window !== 'undefined') {
		setTimeout(() => removeToast(id), duration);
	}
}

export function removeToast(id: number) {
	toasts.update((t) => t.filter((toast) => toast.id !== id));
}
