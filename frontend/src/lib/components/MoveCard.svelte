<script lang="ts">
	import type { Move } from '$lib/types';
	import TagBadge from './TagBadge.svelte';
	import { extractYouTubeId } from '$lib/utils';
	import { isAdmin } from '$lib/stores';
	import { base } from '$app/paths';

	interface Props {
		move: Move;
	}

	let { move }: Props = $props();

	let isOpen = $state(false);

	const youtubeId = $derived(extractYouTubeId(move.link));

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
	<!-- Header -->
	<button
		onclick={toggle}
		class="w-full px-4 py-3 text-left flex items-start justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
	>
		<div class="flex-1 min-w-0">
			<div class="flex items-baseline flex-wrap gap-1">
				<h3 class="text-base font-semibold text-gray-900 dark:text-white">
					{move.name.trim()}
				</h3>
				{#if move.synonyms}
					<span class="text-sm text-gray-400 dark:text-gray-500">
						{move.synonyms}
					</span>
				{/if}
			</div>
			{#if move.tags && move.tags.length > 0}
				<div class="flex flex-wrap gap-1 mt-1.5">
					{#each move.tags as tag}
						<TagBadge {tag} small />
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex items-center gap-2 mt-1 shrink-0">
			{#if $isAdmin}
				<a
					href="{base}/edit/{move.move_id}"
					onclick={(e) => e.stopPropagation()}
					class="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
					title="Edit Move"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
					</svg>
				</a>
			{/if}
			<svg
				class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
				fill="none" stroke="currentColor" viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</button>

	<!-- Body (collapsible) -->
	{#if isOpen}
		<div class="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
			{#if move.description}
				<div class="pt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
					{@html move.description.replace(/\r\n/g, '\n').replace(/<br\s*\/?>/gi, '\n')}
				</div>
			{/if}

			{#if youtubeId}
				<div class="mt-3 video-container rounded-lg overflow-hidden">
					<iframe
						src="https://www.youtube.com/embed/{youtubeId}"
						title="{move.name} - YouTube"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			{:else if move.link}
				<div class="mt-3">
					<a
						href={move.link}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
					>
						{move.link}
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
