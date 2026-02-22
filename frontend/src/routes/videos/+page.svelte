<script lang="ts">
  import { onMount } from "svelte";
  import { allVideos, isLoading, isAdmin, activeTab } from "$lib/stores";
  import { searchVideos } from "$lib/services/videos";
  import type { Video } from "$lib/types";
  import VideoCard from "$lib/components/VideoCard.svelte";
  import { getAllVideos } from "$lib/services/videos";
  import { debounce } from "$lib/utils";
  import { base } from "$app/paths";

  let searchQuery = $state("");
  let searchInputValue = $state("");

  const displayVideos = $derived(searchVideos($allVideos, searchQuery));

  onMount(() => {
    activeTab.set("videos");
  });

  const debouncedSearch = debounce((value: string) => {
    searchQuery = value;
  }, 300);

  function handleSearchInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchInputValue = target.value;
    debouncedSearch(target.value);
  }

  async function handleVideoDeleted() {
    const videos = await getAllVideos();
    allVideos.set(videos);
  }
</script>

<svelte:head>
  <title>Videos – Swing Dance Moves</title>
</svelte:head>

{#if $isLoading}
  <div class="flex items-center justify-center py-24">
    <div class="text-center">
      <div
        class="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-4 text-sm text-gray-400 dark:text-gray-500">
        Loading videos...
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
        placeholder="Videos suchen..."
        oninput={handleSearchInput}
        value={searchInputValue}
        class="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-500 outline-none transition-all shadow-sm"
      />
    </div>
  </div>

  <!-- Toolbar -->
  <div class="flex items-center justify-between mb-5 gap-3">
    <span
      class="text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums"
    >
      {displayVideos.length}
      {displayVideos.length === 1 ? "Video" : "Videos"}
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
        Neues Video
      </a>
    {/if}
  </div>

  <!-- Video List -->
  {#if displayVideos.length > 0}
    <div class="space-y-3">
      {#each displayVideos as video (video.video_id)}
        <VideoCard {video} ondeleted={handleVideoDeleted} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-16">
      <div class="text-4xl mb-3">🎬</div>
      <p class="text-gray-400 dark:text-gray-500 font-medium">
        Keine Videos gefunden
      </p>
      <p class="text-gray-300 dark:text-gray-600 text-sm mt-1">
        Füge ein neues Video hinzu oder passe deine Suche an.
      </p>
    </div>
  {/if}
{/if}
