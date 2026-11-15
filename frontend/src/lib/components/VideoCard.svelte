<script lang="ts">
  import type { Video } from "#lib/types.js";
  import {
    extractYouTubeId,
    timecodeToSeconds,
    isDropboxUrl,
    getDropboxDirectUrl,
  } from "#lib/utils.js";
  import { isAdmin, addToast, tagDisplayOrder } from "#lib/stores.js";
  import { resolve } from "$app/paths";
  import { deleteVideo } from "#lib/services/videos.js";
  import { sortMoveTags } from "#lib/services/moves.js";
  import ConfirmModal from "./ConfirmModal.svelte";
  import TagBadge from "./TagBadge.svelte";
  import { t } from "#lib/i18n.js";
  import VideoTimeline from "./VideoTimeline.svelte";
  import { youtubeEmbedUrl, type TimelineMove } from "#lib/videoTimeline.js";
  import { tick } from "svelte";

  // Parsed description segment: either plain text or a clickable timestamp
  interface DescSegment {
    type: "text" | "timestamp";
    value: string; // display text
    seconds?: number; // only for timestamp segments
  }

  interface Props {
    video: Video;
    linkedMoves?: TimelineMove[];
    ondeleted?: () => void;
  }

  let { video, linkedMoves = [], ondeleted }: Props = $props();

  let isOpen = $state(false);
  let deleting = $state(false);
  let showDeleteConfirm = $state(false);
  let currentStartTime = $state(0);
  let currentEndTime = $state<number | null>(null);
  let pendingStartTime: number | null = null;
  let shouldAutoplay = $state(false);
  // Increment key to force iframe reload when seeking
  let embedKey = $state(0);

  const youtubeId = $derived(extractYouTubeId(video.url));
  const isDropbox = $derived(isDropboxUrl(video.url));
  const dropboxDirectUrl = $derived(
    isDropbox ? getDropboxDirectUrl(video.url) : null,
  );

  let videoElement: HTMLVideoElement | undefined = $state();
  let playerContainer: HTMLDivElement | undefined = $state();

  const embedUrl = $derived(() => {
    if (!youtubeId) return "";
    return youtubeEmbedUrl(youtubeId, currentStartTime, currentEndTime, shouldAutoplay);
  });

  /**
   * Parse description text and identify timestamp patterns like "5:10", "1:30:05"
   * at the beginning of lines. Returns segments for rendering.
   */
  function parseDescription(text: string | null): DescSegment[] {
    if (!text) return [];
    const segments: DescSegment[] = [];
    // Match timestamps at start of line: e.g. "5:10", "17:10", "1:30:05"
    const regex = /(^|\n)(\d{1,2}:\d{2}(?::\d{2})?)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const prefix = match[1]; // newline or empty
      const timestamp = match[2];
      const matchStart = match.index + prefix.length;

      // Add text before this timestamp
      if (matchStart > lastIndex) {
        segments.push({
          type: "text",
          value: text.slice(lastIndex, matchStart),
        });
      }

      segments.push({
        type: "timestamp",
        value: timestamp,
        seconds: timecodeToSeconds(timestamp),
      });

      lastIndex = matchStart + timestamp.length;
    }

    // Remaining text
    if (lastIndex < text.length) {
      segments.push({ type: "text", value: text.slice(lastIndex) });
    }

    return segments;
  }

  const descriptionSegments = $derived(parseDescription(video.description));

  async function seekTo(seconds: number) {
    currentEndTime = null;
    pendingStartTime = null;
    // For Dropbox videos, seek directly on the HTML5 video element
    if (isDropbox && videoElement) {
      try {
        videoElement.currentTime = seconds;
        await videoElement.play();
      } catch (error) {
        console.error("Failed to seek video:", error);
        addToast(t("timeline_play_failed"), "error");
      }
      return;
    }
    // For YouTube, reload iframe with new start time
    currentStartTime = seconds;
    shouldAutoplay = true;
    embedKey++;
  }

  async function playRange(start: number, end: number) {
    currentStartTime = start;
    currentEndTime = end;
    shouldAutoplay = true;
    isOpen = true;
    if (youtubeId) {
      embedKey++;
      await tick();
      playerContainer?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (isDropbox) {
      await tick();
      playerContainer?.scrollIntoView({ block: "nearest" });
      if (!videoElement) {
        addToast(t("timeline_play_failed"), "error");
        return;
      }
      try {
        if (videoElement.readyState >= 1) videoElement.currentTime = start;
        else pendingStartTime = start;
        await videoElement.play();
      } catch (error) {
        pendingStartTime = null;
        console.error("Failed to play video segment:", error);
        addToast(t("timeline_play_failed"), "error");
      }
    }
  }

  function applyPendingStart() {
    if (videoElement && pendingStartTime !== null) {
      videoElement.currentTime = pendingStartTime;
      pendingStartTime = null;
    }
  }

  function stopAtRangeEnd() {
    if (videoElement && currentEndTime !== null && videoElement.currentTime >= currentEndTime) {
      videoElement.pause();
      currentEndTime = null;
    }
  }

  function toggle() {
    isOpen = !isOpen;
    if (!isOpen && currentEndTime !== null) {
      currentStartTime = 0;
      currentEndTime = null;
      pendingStartTime = null;
      shouldAutoplay = false;
    }
  }

  async function handleDelete() {
    deleting = true;
    showDeleteConfirm = false;
    try {
      await deleteVideo(video.video_id);
      addToast(t("video_deleted"));
      ondeleted?.();
    } catch (err) {
      console.error("Failed to delete video:", err);
      addToast(t("video_delete_failed"), "error");
    } finally {
      deleting = false;
    }
  }
</script>

<div
  class="move-card rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
>
  <div class="flex items-start">
  <button
    onclick={toggle}
    aria-expanded={isOpen}
    class="flex-1 min-w-0 px-5 py-4 text-left flex items-start justify-between gap-3 transition-colors cursor-pointer group"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
        <h3
          class="text-[15px] font-semibold text-gray-900 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          {video.title.trim()}
        </h3>
      </div>
      <div class="flex flex-wrap gap-1.5 mt-2">
        {#if youtubeId}
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"
              />
            </svg>
            YouTube
          </span>
        {:else if isDropbox}
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M6 2l6 3.6L6 9.2 0 5.6zm12 0l6 3.6-6 3.6-6-3.6zM0 12.8l6 3.6 6-3.6-6-3.6zm18-3.6l6 3.6-6 3.6-6-3.6zM6 18l6 3.6L18 18l-6-3.6z"
              />
            </svg>
            Dropbox
          </span>
        {/if}
        <span
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
          title={t("linked_moves")}
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
          {linkedMoves.length}
        </span>
      </div>
      {#if video.tags?.length}
        <div class="flex flex-wrap gap-1.5 mt-2">
          {#each sortMoveTags(video.tags, $tagDisplayOrder) as tag (tag.tag_id)}
            <TagBadge {tag} small />
          {/each}
        </div>
      {/if}
      <span class="mt-2 block text-sm font-medium text-green-700 dark:text-green-400">{isOpen ? t("festival_close_video") : `▶ ${t("festival_watch")}`}</span>
    </div>

    <div class="flex items-center gap-2 mt-0.5 shrink-0">
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
  {#if $isAdmin}
    <a
      href={resolve("/videos/edit/[id]", { id: String(video.video_id) })}
      class="mt-4 mr-4 p-2 rounded-md text-gray-400 hover:text-green-700 hover:bg-green-50 dark:text-gray-500 dark:hover:text-green-300 dark:hover:bg-green-950/30 transition-all"
      title={t("edit_video")}
      aria-label="{t('edit_video')}: {video.title.trim()}"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </a>
  {/if}
  </div>

  <div class="px-5 pb-5">
      {#if isOpen}
        {#if youtubeId}
          <div bind:this={playerContainer} class="video-container rounded-xl overflow-hidden shadow-sm">
            {#key embedKey}
              <iframe
                src={embedUrl()}
                title="{video.title} - YouTube"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            {/key}
          </div>
        {:else if isDropbox && dropboxDirectUrl}
          <div bind:this={playerContainer} class="rounded-xl overflow-hidden shadow-sm">
            <!-- svelte-ignore a11y_media_has_caption -->
            <video
              bind:this={videoElement}
              src={dropboxDirectUrl}
              controls
              playsinline
              preload="metadata"
              onloadedmetadata={applyPendingStart}
              ontimeupdate={stopAtRangeEnd}
              class="w-full rounded-xl"
              title={video.title}
            ></video>
          </div>
        {:else if video.url}
          <div>
            <a
              href={video.url}
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
              {t("watch_video")}
            </a>
          </div>
        {/if}

      {/if}
      <div class:mt-4={isOpen}>
        <VideoTimeline {video} moves={linkedMoves} expanded={isOpen} canPlay={!!youtubeId || !!dropboxDirectUrl} onPlayRange={playRange} />
      </div>
      {#if isOpen}
        {#if video.description}
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {#each descriptionSegments as seg}
              {#if seg.type === "timestamp" && (youtubeId || isDropbox)}
                <button
                  onclick={() => seekTo(seg.seconds!)}
                  class="inline-flex min-h-11 items-center gap-1 font-mono text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-950/40 px-2 rounded transition-colors cursor-pointer border-none text-sm"
                  aria-label="{t('play_at')} {seg.value}"
                  title="{t('play_at')} {seg.value}"
                ><span aria-hidden="true">▶</span>{seg.value}</button>
              {:else}
                {seg.value}
              {/if}
            {/each}
          </div>
        {/if}

        {#if $isAdmin}
          <div
            class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-end"
          >
            <button
              onclick={() => (showDeleteConfirm = true)}
              disabled={deleting}
              class="text-xs text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? t("deleting") : t("delete_video")}
            </button>
          </div>
        {/if}
      {/if}
  </div>
</div>

<ConfirmModal
  open={showDeleteConfirm}
  title={t("delete_video")}
  message={t("confirm_delete_video")}
  confirmLabel={t("delete")}
  onconfirm={handleDelete}
  oncancel={() => (showDeleteConfirm = false)}
/>
