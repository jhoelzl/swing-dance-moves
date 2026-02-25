<script lang="ts">
  import type { Move, MoveToVideo } from "$lib/types";
  import TagBadge from "./TagBadge.svelte";
  import { extractYouTubeId, timecodeToSeconds } from "$lib/utils";
  import { isAdmin, addToast } from "$lib/stores";
  import { base } from "$app/paths";
  import { supabase } from "$lib/supabase";
  import { deleteMove } from "$lib/services/moves";
  import DOMPurify from "dompurify";
  import ConfirmModal from "./ConfirmModal.svelte";
  import { t } from "$lib/i18n";

  interface Props {
    move: Move;
    initialOpen?: boolean;
    showDelete?: boolean;
    ondeleted?: () => void;
  }

  let {
    move,
    initialOpen = false,
    showDelete = true,
    ondeleted,
  }: Props = $props();

  let isOpen = $state(initialOpen);
  let videoRefs = $state<MoveToVideo[]>([]);
  let videoRefsLoaded = $state(false);
  let deleting = $state(false);
  let showDeleteConfirm = $state(false);

  const hasVideo = $derived(move.hasVideo ?? false);

  async function toggle() {
    isOpen = !isOpen;

    // Lazy-load video references when opening
    if (isOpen && !videoRefsLoaded) {
      try {
        const { data: mappings } = await supabase
          .from("moves_to_videos")
          .select("*")
          .eq("move_id", move.move_id);

        if (mappings && mappings.length > 0) {
          const videoIds = mappings.map((m: any) => m.video_id);
          const { data: videos } = await supabase
            .from("videos")
            .select("*")
            .in("video_id", videoIds);

          const videoMap = new Map();
          for (const v of videos ?? []) {
            videoMap.set(v.video_id, v);
          }

          videoRefs = mappings.map((m: any) => ({
            ...m,
            video: videoMap.get(m.video_id),
          }));
        }
      } catch (err) {
        console.error("Failed to load video refs:", err);
      }
      videoRefsLoaded = true;
    }
  }

  async function handleDelete() {
    deleting = true;
    showDeleteConfirm = false;
    try {
      await deleteMove(move.move_id);
      addToast(t("move_deleted"));
      ondeleted?.();
    } catch (err) {
      console.error("Failed to delete move:", err);
      addToast(t("move_delete_failed"), "error");
    } finally {
      deleting = false;
    }
  }

  function getYoutubeEmbedUrl(url: string, startTime?: string): string {
    const id = extractYouTubeId(url);
    if (!id) return "";
    let embedUrl = `https://www.youtube.com/embed/${id}`;
    const params: string[] = [];
    if (startTime) {
      const seconds = timecodeToSeconds(startTime);
      if (seconds > 0) params.push(`start=${seconds}`);
    }
    if (params.length > 0) embedUrl += `?${params.join("&")}`;
    return embedUrl;
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
          {#if hasVideo}
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
      {:else if hasVideo}
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
          title={t("edit_move")}
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
            {@html DOMPurify.sanitize(
              move.description
                .replace(/\r\n/g, "\n")
                .replace(/<br\s*\/?>/gi, "\n"),
              {
                ALLOWED_TAGS: [
                  "b",
                  "i",
                  "em",
                  "strong",
                  "a",
                  "br",
                  "p",
                  "ul",
                  "ol",
                  "li",
                ],
                ALLOWED_ATTR: ["href", "target", "rel"],
              },
            )}
          </div>
        {/if}

        {#if $isAdmin && showDelete}
          <div
            class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-end"
          >
            <button
              onclick={() => (showDeleteConfirm = true)}
              disabled={deleting}
              class="text-xs text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? t("deleting") : t("delete_move")}
            </button>
          </div>
        {/if}

        <!-- Linked Video References -->
        {#if videoRefs.length > 0}
          <div
            class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50"
          >
            <h4
              class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2"
            >
              {t("linked_videos")}
            </h4>
            <div class="space-y-3">
              {#each videoRefs as ref}
                {#if ref.video}
                  <div
                    class="rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-3"
                  >
                    <div class="flex items-center gap-2 mb-2">
                      <svg
                        class="w-3.5 h-3.5 text-red-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"
                        />
                      </svg>
                      <span
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >{ref.video.title}</span
                      >
                      {#if ref.start_time}
                        <span
                          class="text-[11px] font-mono text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded"
                        >
                          {ref.start_time}{ref.end_time
                            ? ` – ${ref.end_time}`
                            : ""}
                        </span>
                      {/if}
                    </div>
                    {#if extractYouTubeId(ref.video.url)}
                      <div
                        class="video-container rounded-lg overflow-hidden shadow-sm"
                      >
                        <iframe
                          src={getYoutubeEmbedUrl(
                            ref.video.url,
                            ref.start_time,
                          )}
                          title={ref.video.title}
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                        ></iframe>
                      </div>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<ConfirmModal
  open={showDeleteConfirm}
  title={t("delete_move")}
  message={t("confirm_delete_move")}
  confirmLabel={t("delete")}
  onconfirm={handleDelete}
  oncancel={() => (showDeleteConfirm = false)}
/>
