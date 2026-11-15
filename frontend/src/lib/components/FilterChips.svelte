<script lang="ts">
  import type { TagGroup } from "#lib/types.js";
  import { activeFilters, toggleFilter } from "#lib/stores.js";
  import { getTagColors } from "#lib/utils.js";
  import { searchTagGroups } from "#lib/services/moves.js";
  import { t } from "#lib/i18n.js";

  interface Props {
    tagGroups: TagGroup[];
    searchable?: boolean;
  }

  let { tagGroups, searchable = false }: Props = $props();
  let tagSearch = $state("");
  let visibleGroups = $derived(searchTagGroups(tagGroups, tagSearch));
</script>

<div class="space-y-4">
  {#if searchable}
    <input
      type="search"
      bind:value={tagSearch}
      placeholder={t("search_tags")}
      aria-label={t("search_tags")}
      class="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-700/40 focus:border-green-600 outline-none"
    />
    {#if tagSearch.trim() && visibleGroups.length === 0}
      <p class="text-sm text-gray-400 dark:text-gray-500">{t("no_tags_found")}</p>
    {/if}
  {/if}
  {#each visibleGroups as group}
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
            aria-pressed={isActive}
            class="inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer border
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
