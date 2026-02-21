<script lang="ts">
	import type { TagGroup } from '$lib/types';
	import { activeFilters, toggleFilter } from '$lib/stores';
	import { getTagColors } from '$lib/utils';

	interface Props {
		tagGroups: TagGroup[];
	}

	let { tagGroups }: Props = $props();
</script>

<div class="space-y-3">
	{#each tagGroups as group}
		<div>
			<h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
				{group.tagType.tag_type_name}
			</h3>
			<div class="flex flex-wrap gap-1.5">
				{#each group.tags as tag}
					{@const colors = getTagColors(tag.tag_label)}
					{@const isActive = $activeFilters.includes(tag.tag_id)}
					<button
						onclick={() => toggleFilter(tag.tag_id)}
						class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer
						{isActive
							? colors.bg + ' ' + colors.text + ' ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-500 dark:ring-offset-gray-900 scale-105'
							: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}"
					>
						{tag.tag_name.trim()}
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>
