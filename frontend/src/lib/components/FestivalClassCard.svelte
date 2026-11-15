<script lang="ts">
  import { tick } from "svelte";
  import type { Move, Tag, Video } from "#lib/types.js";
  import { extractYouTubeId, getDropboxDirectUrl } from "#lib/utils.js";
  import { getMovePlayback, youtubeEmbedUrl, type TimelineMove } from "#lib/videoTimeline.js";
  import { t } from "#lib/i18n.js";
  import TagBadge from "./TagBadge.svelte";
  import VideoTimeline from "./VideoTimeline.svelte";

  interface Props {
    video: Video;
    moves: Move[];
    teachers: Tag[];
    timelineMoves: TimelineMove[];
  }

  let { video, moves, teachers, timelineMoves }: Props = $props();
  const youtubeId = $derived(extractYouTubeId(video.url));
  const dropboxUrl = $derived(getDropboxDirectUrl(video.url));
  const canPlay = $derived(!!youtubeId || !!dropboxUrl);
  let isOpen = $state(false);
  let startTime = $state(0);
  let endTime = $state<number | null>(null);
  let autoplay = $state(false);
  let embedKey = $state(0);
  let pendingStart: number | null = null;
  let playbackError = $state(false);
  let videoElement: HTMLVideoElement | undefined = $state();
  let playerContainer: HTMLDivElement | undefined = $state();

  function closeVideo() {
    isOpen = false;
    pendingStart = null;
    endTime = null;
    playbackError = false;
  }

  function openVideo() {
    startTime = 0;
    endTime = null;
    autoplay = false;
    playbackError = false;
    isOpen = true;
  }

  async function playSegment(start: number, end: number | null) {
    startTime = start;
    endTime = end;
    autoplay = true;
    playbackError = false;
    isOpen = true;
    if (youtubeId) {
      embedKey++;
      await tick();
      playerContainer?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (!dropboxUrl) {
      playbackError = true;
      return;
    }
    pendingStart = start;
    await tick();
    playerContainer?.scrollIntoView({ block: "nearest" });
    if (!videoElement) {
      playbackError = true;
      return;
    }
    try {
      if (videoElement.readyState >= 1) applyPendingStart();
      if (!playbackError) await videoElement.play();
    } catch (error) {
      console.error("Failed to play video segment:", error);
      playbackError = true;
    }
  }

  function applyPendingStart() {
    if (!videoElement || pendingStart === null) return;
    if (Number.isFinite(videoElement.duration) && pendingStart >= videoElement.duration) {
      pendingStart = null;
      videoElement.pause();
      playbackError = true;
      return;
    }
    try {
      videoElement.currentTime = pendingStart;
      pendingStart = null;
    } catch (error) {
      pendingStart = null;
      console.error("Failed to seek video:", error);
      playbackError = true;
    }
  }

  function stopAtRangeEnd() {
    if (videoElement && endTime !== null && videoElement.currentTime >= endTime) {
      videoElement.pause();
      endTime = null;
    }
  }
</script>

<article class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
  <div class="flex flex-wrap justify-between items-start gap-3">
    <h3 class="font-bold text-gray-900 dark:text-white">{video.title}</h3>
    {#if canPlay}
      <button type="button" onclick={isOpen ? closeVideo : openVideo} class="text-sm font-semibold text-green-700 dark:text-green-400 underline cursor-pointer">
        {isOpen ? t("festival_close_video") : `▶ ${t("festival_watch")}`}
      </button>
    {:else}
      <span class="text-xs text-gray-500 dark:text-gray-400">{t("festival_inline_unavailable")}</span>
    {/if}
  </div>
  {#if isOpen}
    <div bind:this={playerContainer} class="mt-4">
      {#if youtubeId}
        <div class="video-container rounded-xl overflow-hidden shadow-sm">
          {#key embedKey}
            <iframe src={youtubeEmbedUrl(youtubeId, startTime, endTime, autoplay)} title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          {/key}
        </div>
      {:else if dropboxUrl}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video bind:this={videoElement} src={dropboxUrl} controls playsinline preload="metadata"
          onloadedmetadata={applyPendingStart} ontimeupdate={stopAtRangeEnd}
          onerror={() => playbackError = true} class="w-full rounded-xl" title={video.title}></video>
      {/if}
    </div>
  {/if}
  {#if playbackError}
    <p role="alert" class="mt-2 text-sm text-red-600 dark:text-red-400">{t("timeline_play_failed")}</p>
  {/if}
  <div class="mt-4">
    <VideoTimeline {video} moves={timelineMoves} expanded={false} {canPlay} onPlayRange={playSegment} />
  </div>
  <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("festival_teachers")}</p>
  <div class="flex flex-wrap gap-1.5 mt-2">
    {#each teachers as teacher (teacher.tag_id)}
      <TagBadge tag={teacher} small />
    {:else}
      <span class="text-sm text-gray-500">{t("festival_no_teachers")}</span>
    {/each}
  </div>
  <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("move_plural")}</p>
  <ul class="mt-2 space-y-3">
    {#each moves as move (move.move_id)}
      {@const link = timelineMoves.find((item) => item.move_id === move.move_id)}
      {@const playback = link ? getMovePlayback(link) : null}
      <li>
        {#if playback && canPlay}
          <button type="button" onclick={() => playSegment(playback.start, playback.end)}
            aria-label="{t('festival_play_move')}: {move.name}"
            class="text-sm font-semibold text-green-700 dark:text-green-400 underline cursor-pointer text-left">{move.name}</button>
        {:else}
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">{move.name}</span>
          <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">{canPlay ? t("timeline_timing_unavailable") : t("festival_inline_unavailable")}</span>
        {/if}
        <div class="flex flex-wrap gap-1.5 mt-1">
          {#each move.tags ?? [] as tag (tag.tag_id)}<TagBadge {tag} small />{/each}
        </div>
      </li>
    {/each}
  </ul>
</article>
