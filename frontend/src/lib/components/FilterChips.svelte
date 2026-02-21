<script lang="ts">
  import type { TagGroup } from "$lib/types";
  import { activeFilters, toggleFilter } from "$lib/stores";
  import { getTagColors } from "$lib/utils";

  interface Props {
    tagGroups: TagGroup[];
  }

  let { tagGroups }: Props = $props();
</script>

<div class="space-y-4">
  {#each tagGroups as group}
    <div>
      <h3
        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2"
      >
        {group.tagType.tag_type_name}
      </h3>
      <div class="flex flex-wrap gap-2">
        {#each group.tags as tag}
          {@const colors = getTagColors(tag.tag_label)}
          {@const isActive = $activeFilters.includes(tag.tag_id)}
          <button
            onclick={() => toggleFilter(tag.tag_id)}
            class="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer border
						{isActive
              ? colors.activeBg + ' text-white border-transparent shadow-sm'
              : colors.bg +
                ' ' +
                colors.text +
                ' ' +
                colors.border +
                ' hover:shadow-sm'}"
          >
            {#if isActive}
              <svg
                class="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            {/if}
            {tag.tag_name.trim()}
          </button>
        {/each}
      </div>
    </div>
  {/each}
</div>
