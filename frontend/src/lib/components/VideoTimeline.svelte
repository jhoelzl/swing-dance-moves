<script lang="ts">
  import { onMount } from "svelte";
  import type { Video } from "#lib/types.js";
  import { getVideoDuration } from "#lib/services/videoDuration.js";
  import { buildVideoTimeline, formatVideoTime, type TimelineMove, type TimelineRange } from "#lib/videoTimeline.js";
  import { t } from "#lib/i18n.js";
  import { allMoves } from "#lib/stores.js";
  import MoveCard from "./MoveCard.svelte";

  interface Props {
    video: Video;
    moves: TimelineMove[];
    onPlayRange: (start: number, end: number) => void;
  }
  let { video, moves, onPlayRange }: Props = $props();
  let root: HTMLDivElement;
  let duration = $state<number | null>(null);
  let status = $state<"loading" | "ready" | "error">("loading");
  let selected = $state<TimelineRange | null>(null);
  let selectedMoveId = $state<number | null>(null);
  const selectedMove = $derived($allMoves.find((move) => move.move_id === selectedMoveId));
  let mounted = false;
  const timeline = $derived(duration === null ? null : buildVideoTimeline(duration, moves));

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
    onPlayRange(selected.start, selected.end);
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
    <div class="mt-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 px-3 py-3 text-xs text-gray-600 dark:text-gray-300">
      <p aria-live="polite">{selected ? rangeLabel(selected) : t("timeline_select")}</p>
      {#if selected && selected.moves.length}
        <button
          type="button"
          onclick={playSelectedRange}
          class="mt-3 rounded-lg bg-green-700 hover:bg-green-800 px-3 py-2 font-semibold text-white cursor-pointer"
        >{t("timeline_play_segment")}</button>
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
    {#if selectedMoveId !== null}
      <div class="mt-3">
        <button type="button" class="mb-2 text-xs underline cursor-pointer" onclick={() => (selectedMoveId = null)}>{t("timeline_close_move")}</button>
        {#if selectedMove}
          {#key selectedMove.move_id}
            <MoveCard move={selectedMove} initialOpen={true} showDelete={false} />
          {/key}
        {:else}
          <p role="alert" class="text-xs text-red-600 dark:text-red-400">{t("timeline_move_unavailable")}</p>
        {/if}
      </div>
    {/if}
    {#if timeline.incomplete}
      <p class="mt-2 text-xs text-amber-700 dark:text-amber-400">{t("timeline_incomplete")}</p>
    {/if}
  {/if}
  {#if moves.length}
    <div class="flex flex-wrap gap-1.5 mt-3">
      {#each moves as move (move.id)}
        <span class="rounded-md border border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950/30 px-2 py-1 text-[11px] text-green-700 dark:text-green-300">
          {move.move_name.trim()}{#if move.start_time && move.end_time}
            <span class="tabular-nums opacity-75">{move.start_time}–{move.end_time}</span>
          {/if}
        </span>
      {/each}
    </div>
  {/if}
</div>
