<script lang="ts">
  import { onMount } from "svelte";
  import {
    allMoves,
    filteredMoves,
    tagGroups,
    activeFilters,
    isLoading,
    activeTab,
    videoFilter,
    clearFilters,
    userSettings,
  } from "#lib/stores.js";
  import { getRandomMoves } from "#lib/services/moves.js";
  import type { Move } from "#lib/types.js";
  import MoveCard from "#lib/components/MoveCard.svelte";
  import FilterChips from "#lib/components/FilterChips.svelte";
  import VideoFilter from "#lib/components/VideoFilter.svelte";
  import SkeletonCard from "#lib/components/SkeletonCard.svelte";
  import { getAllMoves, getAllTagsGrouped } from "#lib/services/moves.js";
  import { getAllVideos } from "#lib/services/videos.js";
  import { t } from "#lib/i18n.js";

  let randomMoves = $state<Move[]>([]);
  let showFilters = $state(false);
  let isShuffling = $state(false);

  onMount(() => {
    activeTab.set("random");
  });

  // Re-shuffle when the available moves change.
  $effect(() => {
    shuffle();
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
        {$activeFilters.length > 0 || $videoFilter !== "all"
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
        {#if $activeFilters.length > 0 || $videoFilter !== "all"}
          <span
            class="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-blue-500 text-white rounded-full"
          >
            {$activeFilters.length + ($videoFilter !== "all" ? 1 : 0)}
          </span>
        {/if}
      </button>
      {#if $activeFilters.length > 0 || $videoFilter !== "all"}
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

      <VideoFilter />
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
