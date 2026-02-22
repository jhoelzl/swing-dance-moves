<script lang="ts">
  import { onMount } from "svelte";
  import { allVideos, isLoading, isAdmin, activeTab } from "$lib/stores";
  import SkeletonCard from "$lib/components/SkeletonCard.svelte";
  import { searchVideos } from "$lib/services/videos";
  import type { Video } from "$lib/types";
  import VideoCard from "$lib/components/VideoCard.svelte";
  import { getAllVideos } from "$lib/services/videos";
  import { debounce } from "$lib/utils";
  import { base } from "$app/paths";
  import { supabase } from "$lib/supabase";

  let searchQuery = $state("");
  let searchInputValue = $state("");
  let showFilters = $state(false);

  // Filter: 'all' | 'with-moves' | 'without-moves'
  let moveFilter = $state<"all" | "with-moves" | "without-moves">("all");

  // Set of video IDs that have at least one linked move
  let videoIdsWithMoves = $state<Set<number>>(new Set());

  const displayVideos = $derived(() => {
    let result = searchVideos($allVideos, searchQuery);
    if (moveFilter === "with-moves") {
      result = result.filter((v) => videoIdsWithMoves.has(v.video_id));
    } else if (moveFilter === "without-moves") {
      result = result.filter((v) => !videoIdsWithMoves.has(v.video_id));
    }
    return result;
  });

  onMount(async () => {
    activeTab.set("videos");
    await loadVideoMoveLinks();
  });

  async function loadVideoMoveLinks() {
    try {
      const { data } = await supabase
        .from("moves_to_videos")
        .select("video_id");
      videoIdsWithMoves = new Set((data ?? []).map((d: any) => d.video_id));
    } catch (err) {
      console.error("Failed to load video-move links:", err);
    }
  }

  const debouncedSearch = debounce((value: string) => {
    searchQuery = value;
  }, 300);

  function handleSearchInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchInputValue = target.value;
    debouncedSearch(target.value);
  }

  function clearFilters() {
    moveFilter = "all";
  }

  async function handleVideoDeleted() {
    const videos = await getAllVideos();
    allVideos.set(videos);
    await loadVideoMoveLinks();
  }
</script>

<svelte:head>
  <title>Videos – Swing Dance Moves</title>
</svelte:head>

{#if $isLoading}
  <div class="py-2">
    <SkeletonCard count={4} variant="video" />
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
        placeholder="Search videos..."
        oninput={handleSearchInput}
        value={searchInputValue}
        class="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-500 outline-none transition-all shadow-sm"
      />
    </div>
  </div>

  <!-- Toolbar -->
  <div class="flex items-center justify-between mb-5 gap-3">
    <div class="flex items-center gap-2">
      <button
        onclick={() => (showFilters = !showFilters)}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer
        {moveFilter !== 'all'
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
        {#if moveFilter !== "all"}
          <span
            class="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-blue-500 text-white rounded-full"
          >
            1
          </span>
        {/if}
      </button>

      {#if moveFilter !== "all"}
        <button
          onclick={clearFilters}
          class="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          Reset
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-3">
      <span
        class="text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums"
      >
        {displayVideos().length}
        {displayVideos().length === 1 ? "Video" : "Videos"}
      </span>

      {#if $isAdmin}
        <a
          href="{base}/videos/new"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm hover:shadow cursor-pointer no-underline"
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
          New Video
        </a>
      {/if}
    </div>
  </div>

  <!-- Filter Panel -->
  {#if showFilters}
    <div
      class="filter-panel mb-6 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <h3
        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3"
      >
        Move Link
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          onclick={() => (moveFilter = "all")}
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer border
          {moveFilter === 'all'
            ? 'bg-blue-500 dark:bg-blue-600 text-white border-transparent shadow-sm'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:shadow-sm'}"
        >
          All
        </button>
        <button
          onclick={() =>
            (moveFilter = moveFilter === "with-moves" ? "all" : "with-moves")}
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer border
          {moveFilter === 'with-moves'
            ? 'bg-green-500 dark:bg-green-600 text-white border-transparent shadow-sm'
            : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:shadow-sm'}"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          With Moves
        </button>
        <button
          onclick={() =>
            (moveFilter =
              moveFilter === "without-moves" ? "all" : "without-moves")}
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer border
          {moveFilter === 'without-moves'
            ? 'bg-orange-500 dark:bg-orange-600 text-white border-transparent shadow-sm'
            : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:shadow-sm'}"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Without Moves
        </button>
      </div>
    </div>
  {/if}

  <!-- Video List -->
  {#if displayVideos().length > 0}
    <div class="space-y-3">
      {#each displayVideos() as video (video.video_id)}
        <VideoCard {video} ondeleted={handleVideoDeleted} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-16">
      <div class="text-4xl mb-3">🎬</div>
      <p class="text-gray-400 dark:text-gray-500 font-medium">
        No videos found
      </p>
      <p class="text-gray-300 dark:text-gray-600 text-sm mt-1">
        Add a new video or adjust your search.
      </p>
    </div>
  {/if}
{/if}
