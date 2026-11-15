<script lang="ts">
  import { t } from "#lib/i18n.js";

  interface Props {
    viewMode: "list" | "grid";
  }

  let { viewMode = $bindable() }: Props = $props();
</script>

<div
  class="inline-flex items-center rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-0.5"
>
  <button
    type="button"
    onclick={() => (viewMode = "list")}
    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer {viewMode ===
    'list'
      ? 'bg-blue-500 text-white'
      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
    title={t("list_view")}
    aria-label={t("list_view")}
    aria-pressed={viewMode === "list"}
  >
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
    {t("list")}
  </button>
  <button
    type="button"
    onclick={() => (viewMode = "grid")}
    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer {viewMode ===
    'grid'
      ? 'bg-blue-500 text-white'
      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
    title={t("grid_view")}
    aria-label={t("grid_view")}
    aria-pressed={viewMode === "grid"}
  >
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
    {t("grid")}
  </button>
</div>
