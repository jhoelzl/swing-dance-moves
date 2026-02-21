<script lang="ts">
  import type { Move } from "$lib/types";
  import TagBadge from "./TagBadge.svelte";
  import { extractYouTubeId } from "$lib/utils";
  import { isAdmin } from "$lib/stores";
  import { base } from "$app/paths";

  interface Props {
    move: Move;
  }

  let { move }: Props = $props();

  let isOpen = $state(false);

  const youtubeId = $derived(extractYouTubeId(move.link));

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div
  class="move-card rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 overflow-hidden"
>
  <!-- Header -->
  <button
    onclick={toggle}
    class="w-full px-5 py-4 text-left flex items-start justify-between gap-3 transition-colors cursor-pointer group"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
        <h3
          class="text-[15px] font-semibold text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          {move.name.trim()}
        </h3>
        {#if move.synonyms}
          <span class="text-sm text-gray-400 dark:text-gray-500 italic">
            {move.synonyms}
          </span>
        {/if}
      </div>
      {#if move.tags && move.tags.length > 0}
        <div class="flex flex-wrap gap-1.5 mt-2">
          {#each move.tags as tag}
            <TagBadge {tag} small />
          {/each}
          {#if youtubeId}
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
            >
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"
                />
              </svg>
              Video
            </span>
          {/if}
        </div>
      {:else if youtubeId}
        <div class="flex flex-wrap gap-1.5 mt-2">
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"
              />
            </svg>
            Video
          </span>
        </div>
      {/if}
    </div>

    <div class="flex items-center gap-2 mt-0.5 shrink-0">
      {#if $isAdmin}
        <a
          href="{base}/edit/{move.move_id}"
          onclick={(e) => e.stopPropagation()}
          class="p-1.5 rounded-md text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:text-gray-600 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-all"
          title="Edit Move"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </a>
      {/if}
      <svg
        class="w-4 h-4 text-gray-300 dark:text-gray-600 transition-transform duration-200 {isOpen
          ? 'rotate-180'
          : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </button>

  <!-- Body (collapsible) -->
  {#if isOpen}
    <div class="px-5 pb-5">
      <div class="border-t border-gray-100 dark:border-gray-700/50 pt-4">
        {#if move.description}
          <div
            class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed"
          >
            {@html move.description
              .replace(/\r\n/g, "\n")
              .replace(/<br\s*\/?>/gi, "\n")}
          </div>
        {/if}

        {#if youtubeId}
          <div
            class="mt-4 video-container rounded-xl overflow-hidden shadow-sm"
          >
            <iframe
              src="https://www.youtube.com/embed/{youtubeId}"
              title="{move.name} - YouTube"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        {:else if move.link}
          <div class="mt-4">
            <a
              href={move.link}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Video ansehen
            </a>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
