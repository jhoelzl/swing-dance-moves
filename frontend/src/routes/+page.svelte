<script lang="ts">
  import { onMount } from "svelte";
  import {
    filteredMoves,
    allMoves,
    allVideos,
    tagGroups,
    activeFilters,
    toggleFilter,
    searchQuery,
    isLoading,
    clearFilters,
    videoFilter,
    activeTab,
    sortOrder,
    isAdmin,
  } from "#lib/stores.js";
  import type { SortOrder } from "#lib/stores.js";
  import { getAllMoves } from "#lib/services/moves.js";
  import type { Move } from "#lib/types.js";
  import FilterChips from "#lib/components/FilterChips.svelte";
  import VideoFilter from "#lib/components/VideoFilter.svelte";
  import MoveCard from "#lib/components/MoveCard.svelte";
  import SkeletonCard from "#lib/components/SkeletonCard.svelte";
  import { debounce } from "#lib/utils.js";
  import { resolve } from "$app/paths";
  import { t } from "#lib/i18n.js";

  async function handleMoveDeleted() {
    const moves = await getAllMoves();
    allMoves.set(moves);
  }

  let showFilters = $state(false);
  let searchInputValue = $state("");
  let expandMoves = $state(false);
  let urlSyncReady = $state(false);
  const activeTagNames = $derived(new Map($tagGroups.flatMap((group) => group.tags.map((tag) => [tag.tag_id, tag.tag_name.trim()] as const))));

  const sortOptions: { value: SortOrder; label: string; key: string }[] = [
    { value: "a-z", label: "A – Z", key: "" },
    { value: "z-a", label: "Z – A", key: "" },
    { value: "newest", label: "Newest", key: "newest" },
    { value: "oldest", label: "Oldest", key: "oldest" },
  ];

  // Read filters from URL on mount
  onMount(() => {
    activeTab.set("moves");
    const params = new URLSearchParams(window.location.search);

    // Restore sort order from localStorage
    const storedSort = localStorage.getItem("sortOrder");
    if (storedSort && ["a-z", "z-a", "newest", "oldest"].includes(storedSort)) {
      sortOrder.set(storedSort as SortOrder);
    }

    const tagsParam = params.get("tags");
    if (tagsParam) {
      const tagIds = tagsParam
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
      if (tagIds.length > 0) {
        activeFilters.set([...new Set(tagIds)]);
      }
    }

    const qParam = params.get("q");
    if (qParam) {
      searchQuery.set(qParam);
      searchInputValue = qParam;
    }

    const expandParam = params.get("expand");
    if (expandParam === "1") {
      expandMoves = true;
    }

    const videoParam = params.get("video");
    if (videoParam === "1") {
      videoFilter.set("with");
    } else if (videoParam === "0") {
      videoFilter.set("without");
    }

    // Enable URL sync after initial state is restored
    urlSyncReady = true;
  });

  // Sync filter/search changes back to URL
  $effect(() => {
    if (!urlSyncReady) return;

    const filters = $activeFilters;
    const query = $searchQuery;
    const video = $videoFilter;

    const params = new URLSearchParams();
    if (filters.length > 0) {
      params.set("tags", filters.join(","));
    }
    if (query) {
      params.set("q", query);
    }
    if (video !== "all") {
      params.set("video", video === "with" ? "1" : "0");
    }
    if (expandMoves) params.set("expand", "1");

    const search = params.toString();
    const basePath = resolve("/");
    const newUrl = search ? `${basePath}?${search}` : basePath;

    window.history.replaceState(null, "", newUrl);
  });

  function handleSortChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as SortOrder;
    sortOrder.set(value);
    localStorage.setItem("sortOrder", value);
  }

  const debouncedSearch = debounce((value: string) => {
    searchQuery.set(value);
  }, 300);

  function handleSearchInput(e: Event) {
    const target = e.target as HTMLInputElement;
    debouncedSearch(target.value);
  }

  function resetAllFilters() {
    searchInputValue = "";
    debouncedSearch("");
    clearFilters();
  }
</script>

<svelte:head>
  <title>Swing Dance Moves</title>
</svelte:head>

{#if $isLoading}
  <div class="py-2">
    <SkeletonCard count={5} variant="move" />
  </div>
{:else}
  <div class="studio-section-heading">
    <div>
      <h1>{t("studio_moves_title")}</h1>
      <p>{t("studio_moves_text")}</p>
    </div>
  </div>

  <!-- Search -->
  <div class="mb-5">
    <div class="relative">
      <svg
        class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={t("search_moves")}
        aria-label={t("search_moves")}
        oninput={handleSearchInput}
        value={searchInputValue}
        class="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:ring-2 focus:ring-green-700/40 focus:border-green-600 dark:focus:border-green-500 outline-none transition-all shadow-sm"
      />
    </div>
  </div>

  <!-- Toolbar: Filter + Count + Random -->
  <div class="flex flex-wrap items-center justify-between mb-5 gap-3">
    <div class="flex items-center gap-2">
      <button
        onclick={() => (showFilters = !showFilters)}
        aria-expanded={showFilters}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer
        {$activeFilters.length > 0
          ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
          : $videoFilter !== "all"
            ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 shadow-sm'}"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {t("filter")}
        {#if $activeFilters.length > 0 || $videoFilter !== "all"}
          <span
            class="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-green-700 text-white rounded-full"
          >
            {$activeFilters.length + ($videoFilter !== "all" ? 1 : 0)}
          </span>
        {/if}
      </button>

      {#if $activeFilters.length > 0 || $videoFilter !== "all"}
        <button
          onclick={resetAllFilters}
          class="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          {t("reset")}
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-3">
      <select
        onchange={handleSortChange}
        aria-label={t("sort_moves")}
        value={$sortOrder}
        class="px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-500 dark:text-gray-400 outline-none cursor-pointer shadow-sm appearance-none pr-7 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239CA3AF%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem]"
      >
        {#each sortOptions as opt}
          <option value={opt.value}>{opt.key ? t(opt.key) : opt.label}</option>
        {/each}
      </select>
      <span
        class="text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums"
      >
        {$filteredMoves.length}
        {$filteredMoves.length === 1 ? t("move_singular") : t("move_plural")}
      </span>
      {#if $isAdmin}
        <a
          href={resolve("/new")}
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl bg-green-800 hover:bg-green-900 text-white transition-all shadow-sm hover:shadow cursor-pointer no-underline"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t("new_move")}
        </a>
      {/if}
    </div>
  </div>

  {#if $activeFilters.length > 0 || $videoFilter !== "all"}
    <div class="mb-5" aria-label={t("active_filters")}>
      <p class="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">{t("active_filters")}</p>
      <div class="flex flex-wrap gap-2">
        {#each $activeFilters as tagId (tagId)}
          {@const name = activeTagNames.get(tagId) ?? `#${tagId}`}
          <button type="button" onclick={() => toggleFilter(tagId)}
            aria-label="{t('remove_filter')}: {name}"
            class="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 px-3 text-sm font-medium text-green-800 dark:text-green-300 cursor-pointer">
            {name}<span aria-hidden="true">×</span>
          </button>
        {/each}
        {#if $videoFilter !== "all"}
          {@const name = t($videoFilter === "with" ? "with_video" : "without_video")}
          <button type="button" onclick={() => videoFilter.set("all")}
            aria-label="{t('remove_filter')}: {name}"
            class="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 px-3 text-sm font-medium text-green-800 dark:text-green-300 cursor-pointer">
            {name}<span aria-hidden="true">×</span>
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Filters Panel -->
  {#if showFilters}
    <div
      class="filter-panel mb-6 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <FilterChips tagGroups={$tagGroups} searchable />
      <VideoFilter />
    </div>
  {/if}

  <!-- Move List -->
  {#if $filteredMoves.length > 0}
    <div class="studio-move-grid">
      {#each $filteredMoves as move (move.move_id)}
        <MoveCard
          {move}
          initialOpen={expandMoves}
          ondeleted={handleMoveDeleted}
        />
      {/each}
    </div>
  {:else}
    <div class="text-center py-16">
      <div class="text-4xl mb-3">🕺</div>
      <p class="text-gray-400 dark:text-gray-500 font-medium">
        {t("no_moves_found")}
      </p>
      <p class="text-gray-300 dark:text-gray-600 text-sm mt-1">
        {t("adjust_filters")}
      </p>
    </div>
  {/if}
{/if}
