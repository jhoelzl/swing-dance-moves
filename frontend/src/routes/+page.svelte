<script lang="ts">
  import { onMount } from "svelte";
  import {
    filteredMoves,
    tagGroups,
    activeFilters,
    searchQuery,
    isLoading,
    clearFilters,
    showAll,
    videoOnly,
    activeTab,
    sortOrder,
  } from "$lib/stores";
  import type { SortOrder } from "$lib/stores";
  import { getRandomMoves } from "$lib/services/moves";
  import type { Move } from "$lib/types";
  import FilterChips from "$lib/components/FilterChips.svelte";
  import MoveCard from "$lib/components/MoveCard.svelte";
  import { debounce } from "$lib/utils";
  import { base } from "$app/paths";

  let randomMoves = $state<Move[]>([]);
  let showFilters = $state(false);
  let searchInputValue = $state("");
  let expandMoves = $state(false);
  let urlSyncReady = false;

  const sortOptions: { value: SortOrder; label: string }[] = [
    { value: "a-z", label: "A – Z" },
    { value: "z-a", label: "Z – A" },
    { value: "newest", label: "Neueste" },
    { value: "oldest", label: "Älteste" },
  ];

  const displayMoves = $derived($showAll ? $filteredMoves : randomMoves);

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
        activeFilters.set(tagIds);
        showAll.set(true);
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
      videoOnly.set(true);
    }

    // Enable URL sync after initial state is restored
    urlSyncReady = true;
  });

  // Sync filter/search changes back to URL
  $effect(() => {
    if (!urlSyncReady) return;

    const filters = $activeFilters;
    const query = $searchQuery;
    const video = $videoOnly;

    const params = new URLSearchParams();
    if (filters.length > 0) {
      params.set("tags", filters.join(","));
    }
    if (query) {
      params.set("q", query);
    }
    if (video) {
      params.set("video", "1");
    }

    const search = params.toString();
    const basePath = `${base}/` || "/";
    const newUrl = search ? `${basePath}?${search}` : basePath;

    window.history.replaceState(null, "", newUrl);
  });

  function handleRandomMoves() {
    randomMoves = getRandomMoves($filteredMoves, 2);
    showAll.set(false);
  }

  function handleShowAll() {
    showAll.set(true);
  }

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
</script>

<svelte:head>
  <title>Swing Dance Moves</title>
</svelte:head>

{#if $isLoading}
  <div class="flex items-center justify-center py-24">
    <div class="text-center">
      <div
        class="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-4 text-sm text-gray-400 dark:text-gray-500">
        Loading moves...
      </p>
    </div>
  </div>
{:else}
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
        placeholder="Search moves..."
        oninput={handleSearchInput}
        value={searchInputValue}
        class="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-500 outline-none transition-all shadow-sm"
      />
    </div>
  </div>

  <!-- Toolbar: Filter + Count + Random -->
  <div class="flex items-center justify-between mb-5 gap-3">
    <div class="flex items-center gap-2">
      <button
        onclick={() => (showFilters = !showFilters)}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer
        {$activeFilters.length > 0
          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
          : $videoOnly
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
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
        Filter
        {#if $activeFilters.length > 0 || $videoOnly}
          <span
            class="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-blue-500 text-white rounded-full"
          >
            {$activeFilters.length + ($videoOnly ? 1 : 0)}
          </span>
        {/if}
      </button>

      {#if $activeFilters.length > 0 || $videoOnly}
        <button
          onclick={clearFilters}
          class="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          Reset
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-3">
      <select
        onchange={handleSortChange}
        value={$sortOrder}
        class="px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-500 dark:text-gray-400 outline-none cursor-pointer shadow-sm appearance-none pr-7 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239CA3AF%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem]"
      >
        {#each sortOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
      <span
        class="text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums"
      >
        {$filteredMoves.length}
        {$filteredMoves.length === 1 ? "Move" : "Moves"}
      </span>
      <button
        onclick={handleRandomMoves}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm hover:shadow cursor-pointer touch-manipulation"
        title="Pick 2 random moves"
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Out of moves!
      </button>
    </div>
  </div>

  <!-- Filters Panel -->
  {#if showFilters}
    <div
      class="filter-panel mb-6 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <FilterChips tagGroups={$tagGroups} />

      <!-- Video Filter -->
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <h3
          class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2"
        >
          Media
        </h3>
        <button
          onclick={() => videoOnly.update((v) => !v)}
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer border
          {$videoOnly
            ? 'bg-red-500 dark:bg-red-600 text-white border-transparent shadow-sm'
            : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:shadow-sm'}"
        >
          {#if $videoOnly}
            <svg
              class="w-3 h-3 mr-0.5"
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
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"
            />
          </svg>
          YouTube Video
        </button>
      </div>
    </div>
  {/if}

  <!-- Show All banner when in random mode -->
  {#if !$showAll}
    <div class="flex justify-center mb-5">
      <button
        onclick={handleShowAll}
        class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        Show all moves
      </button>
    </div>
  {/if}

  <!-- Move List -->
  {#if displayMoves.length > 0}
    <div class="space-y-3">
      {#each displayMoves as move (move.move_id)}
        <MoveCard {move} initialOpen={expandMoves} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-16">
      <div class="text-4xl mb-3">🕺</div>
      <p class="text-gray-400 dark:text-gray-500 font-medium">No moves found</p>
      <p class="text-gray-300 dark:text-gray-600 text-sm mt-1">
        Try adjusting your filters or search.
      </p>
    </div>
  {/if}
{/if}
