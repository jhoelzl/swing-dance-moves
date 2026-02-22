<script lang="ts">
  import type { Video } from "$lib/types";
  import { extractYouTubeId, timecodeToSeconds } from "$lib/utils";
  import { isAdmin } from "$lib/stores";
  import { base } from "$app/paths";
  import { supabase } from "$lib/supabase";

  interface LinkedMove {
    move_id: number;
    move_name: string;
    start_time: string;
    end_time: string;
  }

  // Parsed description segment: either plain text or a clickable timestamp
  interface DescSegment {
    type: "text" | "timestamp";
    value: string; // display text
    seconds?: number; // only for timestamp segments
  }

  interface Props {
    video: Video;
    ondeleted?: () => void;
  }

  let { video, ondeleted }: Props = $props();

  let isOpen = $state(false);
  let deleting = $state(false);
  let linkedMoves = $state<LinkedMove[]>([]);
  let linkedMovesLoaded = $state(false);
  let currentStartTime = $state(0);
  let shouldAutoplay = $state(false);
  // Increment key to force iframe reload when seeking
  let embedKey = $state(0);

  const youtubeId = $derived(extractYouTubeId(video.url));

  const embedUrl = $derived(() => {
    if (!youtubeId) return "";
    let url = `https://www.youtube.com/embed/${youtubeId}`;
    const params: string[] = [];
    if (currentStartTime > 0) params.push(`start=${currentStartTime}`);
    if (shouldAutoplay) params.push("autoplay=1");
    if (params.length > 0) url += `?${params.join("&")}`;
    return url;
  });

  /**
   * Parse description text and identify timestamp patterns like "5:10", "1:30:05"
   * at the beginning of lines. Returns segments for rendering.
   */
  function parseDescription(text: string): DescSegment[] {
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

  function seekTo(seconds: number) {
    currentStartTime = seconds;
    shouldAutoplay = true;
    embedKey++;
  }

  async function toggle() {
    isOpen = !isOpen;

    // Lazy-load linked moves when opening
    if (isOpen && !linkedMovesLoaded) {
      try {
        const { data: mappings } = await supabase
          .from("moves_to_videos")
          .select("*")
          .eq("video_id", video.video_id);

        if (mappings && mappings.length > 0) {
          const moveIds = mappings.map((m: any) => m.move_id);
          const { data: moves } = await supabase
            .from("moves")
            .select("move_id, name")
            .in("move_id", moveIds);

          const moveMap = new Map<number, string>();
          for (const m of moves ?? []) {
            moveMap.set(m.move_id, m.name);
          }

          linkedMoves = mappings.map((m: any) => ({
            move_id: m.move_id,
            move_name: moveMap.get(m.move_id) ?? "Unknown",
            start_time: m.start_time ?? "",
            end_time: m.end_time ?? "",
          }));
        }
      } catch (err) {
        console.error("Failed to load linked moves:", err);
      }
      linkedMovesLoaded = true;
    }
  }

  async function handleDelete() {
    if (!confirm("Video wirklich löschen?")) return;
    deleting = true;
    try {
      // Delete references first
      await supabase
        .from("moves_to_videos")
        .delete()
        .eq("video_id", video.video_id);
      await supabase.from("videos").delete().eq("video_id", video.video_id);
      ondeleted?.();
    } catch (err) {
      console.error("Failed to delete video:", err);
    } finally {
      deleting = false;
    }
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
        {/if}
      </div>
    </div>

    <div class="flex items-center gap-2 mt-0.5 shrink-0">
      {#if $isAdmin}
        <a
          href="{base}/videos/edit/{video.video_id}"
          onclick={(e) => e.stopPropagation()}
          class="p-1.5 rounded-md text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:text-gray-600 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-all"
          title="Edit Video"
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
        {#if video.description}
          <div
            class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed mb-4"
          >
            {#each descriptionSegments as seg}
              {#if seg.type === "timestamp" && youtubeId}
                <button
                  onclick={() => seekTo(seg.seconds!)}
                  class="inline-flex items-center gap-0.5 font-mono text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-1.5 py-0.5 rounded transition-colors cursor-pointer border-none text-sm"
                  title="Springe zu {seg.value}"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {seg.value}
                </button>
              {:else}
                {seg.value}
              {/if}
            {/each}
          </div>
        {/if}

        {#if youtubeId}
          <div class="video-container rounded-xl overflow-hidden shadow-sm">
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
              Video ansehen
            </a>
          </div>
        {/if}

        <!-- Linked Moves -->
        {#if linkedMoves.length > 0}
          <div
            class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50"
          >
            <h4
              class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2"
            >
              Verknüpfte Moves
            </h4>
            <div class="space-y-1.5">
              {#each linkedMoves as lm}
                <a
                  href="{base}/?q={encodeURIComponent(
                    lm.move_name.trim(),
                  )}&expand=1"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all no-underline group/move"
                >
                  <svg
                    class="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0"
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
                  <span
                    class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/move:text-blue-600 dark:group-hover/move:text-blue-400 transition-colors"
                    >{lm.move_name}</span
                  >
                  {#if lm.start_time}
                    <span
                      class="text-[11px] font-mono text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded"
                    >
                      {lm.start_time}{lm.end_time ? ` – ${lm.end_time}` : ""}
                    </span>
                  {/if}
                  <svg
                    class="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover/move:text-blue-400 ml-auto shrink-0 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              {/each}
            </div>
          </div>
        {/if}

        {#if $isAdmin}
          <div
            class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-end"
          >
            <button
              onclick={handleDelete}
              disabled={deleting}
              class="text-xs text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? "Löschen..." : "Video löschen"}
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
