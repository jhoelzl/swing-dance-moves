<script lang="ts">
  import { videoFilter } from "#lib/stores.js";
  import { t } from "#lib/i18n.js";

  const options = [
    { value: "with", label: "with_video" },
    { value: "without", label: "without_video" },
  ] as const;
</script>

<div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
  <h3 class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
    {t("media")}
  </h3>
  <div class="flex flex-wrap gap-2">
    {#each options as option}
      <button
        onclick={() => videoFilter.set($videoFilter === option.value ? "all" : option.value)}
        aria-pressed={$videoFilter === option.value}
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer border
          {$videoFilter === option.value
            ? 'bg-red-500 dark:bg-red-600 text-white border-transparent shadow-sm'
            : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:shadow-sm'}"
      >
        {#if $videoFilter === option.value}
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        {/if}
        {t(option.label)}
      </button>
    {/each}
  </div>
</div>
