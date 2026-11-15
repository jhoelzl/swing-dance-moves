<script lang="ts">
  import { onMount } from "svelte";
  import type { Video } from "#lib/types.js";
  import { getVideoDuration } from "#lib/services/videoDuration.js";
  import { buildVideoTimeline, formatVideoTime, getMoveInterval, sortTimelineMoves, type TimelineMove, type TimelineRange } from "#lib/videoTimeline.js";
  import { t } from "#lib/i18n.js";
  import { allMoves } from "#lib/stores.js";
  import MoveCard from "./MoveCard.svelte";

  interface Props {
    video: Video;
    moves: TimelineMove[];
    expanded: boolean;
    canPlay: boolean;
    onPlayRange?: (start: number, end: number) => void;
  }
  let { video, moves, expanded, canPlay, onPlayRange }: Props = $props();
  let root: HTMLDivElement;
  let duration = $state<number | null>(null);
  let status = $state<"loading" | "ready" | "error">("loading");
  let selected = $state<TimelineRange | null>(null);
  let selectedMoveId = $state<number | null>(null);
  const selectedMove = $derived($allMoves.find((move) => move.move_id === selectedMoveId));
  let mounted = false;
  const timeline = $derived(duration === null ? null : buildVideoTimeline(duration, moves));
  const chapters = $derived(sortTimelineMoves(moves));

  async function loadDuration() {
    status = "loading";
    try {
      const value = await getVideoDuration(video.url);
      if (mounted) {
        duration = value;
        status = "ready";
      }
    } catch (error) {
      console.error("Failed to load video duration:", error);
      if (mounted) status = "error";
    }
  }

  onMount(() => {
    mounted = true;
    if (!("IntersectionObserver" in window)) {
      void loadDuration();
      return () => { mounted = false; };
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        void loadDuration();
      }
    }, { rootMargin: "200px" });
    observer.observe(root);
    return () => {
      mounted = false;
      observer.disconnect();
    };
  });

  function rangeLabel(range: TimelineRange) {
    const name = range.moves.length
      ? range.moves.map((move) => move.move_name.trim()).join(", ")
      : t("timeline_unassigned");
    return `${name} · ${formatVideoTime(range.start)}–${formatVideoTime(range.end)}`;
  }

  function selectRange(range: TimelineRange) {
    selected = range;
    selectedMoveId = null;
  }

  function playSelectedRange() {
    if (!selected) return;
    selectedMoveId = null;
    onPlayRange?.(selected.start, selected.end);
  }
</script>

<div bind:this={root}>
  {#if status === "loading"}
    <p class="text-xs text-gray-500 dark:text-gray-400">{t("timeline_loading")}</p>
  {:else if status === "error"}
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {t("timeline_unavailable")}
      <button onclick={loadDuration} class="ml-1 underline cursor-pointer">{t("try_again")}</button>
    </p>
  {:else if timeline && duration !== null}
    <div class="flex justify-between gap-2 mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
      <span>{t("timeline_coverage")}</span>
      <span class="font-normal text-gray-400 dark:text-gray-500">{t("timeline_full_video")}</span>
    </div>
    <div class="flex h-6 rounded-lg overflow-hidden" aria-label={t("nav_videos")}>
      {#each timeline.ranges as range}
        <button
          type="button"
          class="min-w-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-900 dark:focus-visible:outline-white {range.moves.length ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600' : 'bg-red-400 hover:bg-red-500 dark:bg-red-500'}"
          style:flex-grow={range.end - range.start}
          style:flex-basis="0%"
          aria-label={rangeLabel(range)}
          title={rangeLabel(range)}
          onpointerenter={(event) => {
            if (event.pointerType !== "touch" && range.moves.length) selectRange(range);
          }}
          onfocus={() => selectRange(range)}
          onclick={() => selectRange(range)}
        ></button>
      {/each}
    </div>
    <div class="flex justify-between mt-1 text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
      <span>0:00</span><span>{formatVideoTime(duration)}</span>
    </div>
    {#if selected}
      <div class="mt-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-3 text-xs text-gray-600 dark:text-gray-300">
      <p aria-live="polite">{rangeLabel(selected)}</p>
      {#if selected.moves.length}
        {#if canPlay && onPlayRange}
        <button
          type="button"
          onclick={playSelectedRange}
          class="mt-3 rounded-lg bg-green-700 hover:bg-green-800 px-3 py-2 font-semibold text-white cursor-pointer"
        >{t("timeline_play_segment")}</button>
        {/if}
        <div class="mt-3 flex flex-wrap gap-2">
          {#each selected.moves as move (move.id)}
            <button
              type="button"
              onclick={() => (selectedMoveId = move.move_id)}
              class="rounded-lg border border-green-200 dark:border-green-800 px-3 py-2 text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/40 cursor-pointer"
            >{t("timeline_show_move")}: {move.move_name.trim()}</button>
          {/each}
        </div>
      {/if}
      </div>
    {:else}
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{t("timeline_select")}</p>
    {/if}
    {#if timeline.incomplete}
      <p class="mt-2 text-xs text-amber-700 dark:text-amber-400">{t("timeline_incomplete")}</p>
    {/if}
  {/if}
  {#if expanded}
    <div class="mt-5">
      <div class="flex items-baseline justify-between gap-2 mb-2">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("timeline_chapters")}</h4>
        <span class="text-xs text-gray-500 dark:text-gray-400">{moves.length}</span>
      </div>
      {#if chapters.length}
        <div class="divide-y divide-gray-100 dark:divide-gray-700/50">
          {#each chapters as move (move.id)}
            {@const interval = getMoveInterval(move, duration)}
            <div class="flex items-center gap-3 py-2 px-2 rounded-lg {selected?.moves.some((item) => item.id === move.id) ? 'bg-green-50 dark:bg-green-950/30' : ''}">
              <span class="w-14 shrink-0 text-xs tabular-nums text-green-700 dark:text-green-400">
                {#if interval}
                  {formatVideoTime(interval.start)}<br /><span class="text-gray-400 dark:text-gray-500">–{formatVideoTime(interval.end)}</span>
                {:else}
                  <span class="text-gray-500 dark:text-gray-400">–</span>
                {/if}
              </span>
              {#if interval && canPlay && onPlayRange}
                <button type="button" onclick={() => onPlayRange(interval.start, interval.end)}
                  aria-label="{t('timeline_play_chapter')}: {move.move_name.trim()}"
                  class="min-w-0 flex-1 min-h-11 text-left cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="block text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{move.move_name.trim()}</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">{t("timeline_play_chapter")}</span>
                </button>
              {:else}
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{move.move_name.trim()}</p>
                  {#if !interval}<p class="text-xs text-gray-500 dark:text-gray-400">{t("timeline_timing_unavailable")}</p>{/if}
                </div>
              {/if}
              <button type="button" onclick={() => (selectedMoveId = move.move_id)}
                aria-label="{t('timeline_show_move')}: {move.move_name.trim()}"
                class="min-h-11 shrink-0 rounded-lg border border-gray-200 dark:border-gray-600 px-3 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{t("timeline_show_move")}</button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="py-2 text-sm text-gray-500 dark:text-gray-400">{t("timeline_no_chapters")}</p>
      {/if}
    </div>
  {/if}
  {#if selectedMoveId !== null}
    <div class="mt-3">
      <button type="button" class="min-h-11 text-xs underline cursor-pointer" onclick={() => (selectedMoveId = null)}>{t("timeline_close_move")}</button>
      {#if selectedMove}
        {#key selectedMove.move_id}
          <MoveCard move={selectedMove} initialOpen={true} showDelete={false} />
        {/key}
      {:else}
        <p role="alert" class="text-xs text-red-600 dark:text-red-400">{t("timeline_move_unavailable")}</p>
      {/if}
    </div>
  {/if}
</div>
