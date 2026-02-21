<script lang="ts">
  import {
    filteredMoves,
    tagGroups,
    activeFilters,
    searchQuery,
    isLoading,
    clearFilters,
    showAll,
  } from "$lib/stores";
  import { getRandomMoves } from "$lib/services/moves";
  import type { Move } from "$lib/types";
  import FilterChips from "$lib/components/FilterChips.svelte";
  import MoveCard from "$lib/components/MoveCard.svelte";
  import { debounce } from "$lib/utils";

  let randomMoves = $state<Move[]>([]);
  let showFilters = $state(false);

  const displayMoves = $derived($showAll ? $filteredMoves : randomMoves);

  function handleRandomMoves() {
    randomMoves = getRandomMoves($filteredMoves, 2);
    showAll.set(false);
  }

  function handleShowAll() {
    showAll.set(true);
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
  <div class="flex items-center justify-center py-20">
    <div class="text-center">
      <div
        class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-3 text-gray-500 dark:text-gray-400">Loading moves...</p>
    </div>
  </div>
{:else}
  <!-- Search -->
  <div class="mb-4">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
        class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      />
    </div>
  </div>

  <!-- Filter Toggle & Actions -->
  <div class="flex items-center justify-between mb-4 gap-3">
    <div class="flex items-center gap-2">
      <button
        onclick={() => (showFilters = !showFilters)}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
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
        {#if $activeFilters.length > 0}
          <span
            class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-500 text-white rounded-full"
          >
            {$activeFilters.length}
          </span>
        {/if}
      </button>

      {#if $activeFilters.length > 0}
        <button
          onclick={clearFilters}
          class="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          Clear
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {$filteredMoves.length} Moves
      </span>
    </div>
  </div>

  <!-- Filters Panel -->
  {#if showFilters}
    <div
      class="mb-5 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <FilterChips tagGroups={$tagGroups} />
    </div>
  {/if}

  <!-- Random Moves / Show All Buttons -->
  <div class="flex justify-center gap-3 mb-5">
    <button
      onclick={handleRandomMoves}
      class="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
    >
      🎲 I'm out of moves!
    </button>
    {#if !$showAll}
      <button
        onclick={handleShowAll}
        class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors cursor-pointer"
      >
        Show all
      </button>
    {/if}
  </div>

  <!-- Move List -->
  {#if displayMoves.length > 0}
    <div class="space-y-2">
      {#each displayMoves as move (move.move_id)}
        <MoveCard {move} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400 text-lg">No moves found!</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">
        Try adjusting your filters or search query.
      </p>
    </div>
  {/if}
{/if}
