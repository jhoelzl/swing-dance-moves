<script lang="ts">
  import { onMount } from "svelte";
  import {
    allMoves,
    filteredMoves,
    tagGroups,
    activeFilters,
    isLoading,
    activeTab,
    videoOnly,
    clearFilters,
    userSettings,
  } from "$lib/stores";
  import { getRandomMoves } from "$lib/services/moves";
  import type { Move } from "$lib/types";
  import MoveCard from "$lib/components/MoveCard.svelte";
  import FilterChips from "$lib/components/FilterChips.svelte";
  import SkeletonCard from "$lib/components/SkeletonCard.svelte";
  import { getAllMoves, getAllTagsGrouped } from "$lib/services/moves";
  import { getAllVideos } from "$lib/services/videos";
  import { t } from "$lib/i18n";
  import { base } from "$app/paths";

  let randomMoves = $state<Move[]>([]);
  let showFilters = $state(false);
  let isShuffling = $state(false);

  onMount(() => {
    activeTab.set("random");
    // Pick initial random moves once data is loaded
    if ($filteredMoves.length > 0) {
      shuffle();
    }
  });

  // Re-shuffle when filtered moves change (e.g. filter applied)
  let prevFilterKey = $state("");
  $effect(() => {
    const key = `${$activeFilters.join(",")}-${$videoOnly}`;
    if (key !== prevFilterKey && $filteredMoves.length > 0) {
      prevFilterKey = key;
      shuffle();
    }
  });

  function shuffle() {
    isShuffling = true;
    const count = $userSettings?.random_moves_count ?? 2;
    randomMoves = getRandomMoves($filteredMoves, count);
    // Brief animation delay
    setTimeout(() => {
      isShuffling = false;
    }, 300);
  }

  async function handleMoveDeleted() {
    const [moves, tags, videos] = await Promise.all([
      getAllMoves(),
      getAllTagsGrouped(),
      getAllVideos(),
    ]);
    allMoves.set(moves);
    tagGroups.set(tags);
    // Re-shuffle after delete
    shuffle();
  }
</script>

<svelte:head>
  <title>{t("nav_random")} – Swing Dance Moves</title>
</svelte:head>

{#if $isLoading}
  <div class="py-2">
    <SkeletonCard count={2} variant="move" />
  </div>
{:else}
  <!-- Toolbar: Shuffle + Filter -->
  <div class="flex items-center justify-between mb-4 gap-3">
    <div class="flex items-center gap-2">
      <button
        onclick={() => (showFilters = !showFilters)}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer
        {$activeFilters.length > 0 || $videoOnly
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
        {t("filter")}
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
          onclick={() => {
            clearFilters();
            shuffle();
          }}
          class="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          {t("reset")}
        </button>
      {/if}
    </div>

    <button
      onclick={shuffle}
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 touch-manipulation"
    >
      <svg
        class="w-4 h-4 {isShuffling ? 'animate-spin' : ''}"
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
      {t("random_shuffle")}
    </button>
  </div>

  <!-- Filters Panel -->
  {#if showFilters}
    <div
      class="mb-6 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <FilterChips tagGroups={$tagGroups} />

      <!-- Video Filter -->
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <h3
          class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2"
        >
          {t("media")}
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
          Video
        </button>
      </div>
    </div>
  {/if}

  <!-- Random Moves -->
  {#if randomMoves.length > 0}
    <div class="space-y-3">
      {#each randomMoves as move (move.move_id)}
        <div
          class={isShuffling
            ? "opacity-50 transition-opacity duration-200"
            : "opacity-100 transition-opacity duration-200"}
        >
          <MoveCard
            {move}
            initialOpen={true}
            showDelete={false}
            ondeleted={handleMoveDeleted}
          />
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-16">
      <div class="text-4xl mb-3">🤷</div>
      <p class="text-gray-400 dark:text-gray-500 font-medium">
        {t("random_empty")}
      </p>
      <p class="text-gray-300 dark:text-gray-600 text-sm mt-1">
        {t("random_empty_desc")}
      </p>
    </div>
  {/if}
{/if}
