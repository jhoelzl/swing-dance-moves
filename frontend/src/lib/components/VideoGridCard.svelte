<script lang="ts">
  import type { Video } from "$lib/types";
  import {
    extractYouTubeId,
    getVideoSourceType,
    getDropboxDirectUrl,
  } from "$lib/utils";
  import { isAdmin } from "$lib/stores";
  import { base } from "$app/paths";
  import { t } from "$lib/i18n";

  interface Props {
    video: Video;
    linkedMoveCount?: number;
  }

  let { video, linkedMoveCount = 0 }: Props = $props();

  let dropboxPreviewError = $state(false);
  let dropboxPreviewLoaded = $state(false);
  let previewVideoEl: HTMLVideoElement | undefined = $state();

  const youtubeId = $derived(extractYouTubeId(video.url));
  const sourceType = $derived(getVideoSourceType(video.url));
  const thumbnailUrl = $derived(
    youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null,
  );
  const dropboxPreviewUrl = $derived(
    sourceType === "dropbox" ? getDropboxDirectUrl(video.url) : null,
  );

  // Some Dropbox MP4 links can keep requesting ranges when seeking early.
  // We keep the first available frame at time 0 and fallback if loading stalls.
  $effect(() => {
    if (
      sourceType !== "dropbox" ||
      !dropboxPreviewUrl ||
      dropboxPreviewLoaded ||
      dropboxPreviewError
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dropboxPreviewError = true;
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  });

  function handleDropboxPreviewLoaded() {
    dropboxPreviewLoaded = true;
    if (!previewVideoEl) return;
    previewVideoEl.pause();
  }

  function handleDropboxPreviewError() {
    dropboxPreviewError = true;
  }
</script>

<div
  class="relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/80 shadow-sm"
>
  <a
    href={video.url}
    target="_blank"
    rel="noopener noreferrer"
    class="group block relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
    title={video.title}
    aria-label="{t('watch_video')}: {video.title}"
  >
    <div class="relative w-full pt-[100%] bg-gray-100 dark:bg-gray-900">
      {#if thumbnailUrl}
        <img
          src={thumbnailUrl}
          alt={video.title}
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      {:else if sourceType === "dropbox" && dropboxPreviewUrl && !dropboxPreviewError}
        <video
          bind:this={previewVideoEl}
          src={dropboxPreviewUrl}
          preload="metadata"
          muted
          playsinline
          onloadeddata={handleDropboxPreviewLoaded}
          onerror={handleDropboxPreviewError}
          onstalled={handleDropboxPreviewError}
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        ></video>
      {:else}
        <div
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500"
        >
          <svg
            class="w-9 h-9"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span class="text-xs font-medium uppercase tracking-wide">
            {sourceType === "dropbox" ? "Dropbox" : "Video"}
          </span>
        </div>
      {/if}

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100 opacity-100 transition-opacity"
      ></div>

      <div
        class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-black/50 text-white border border-white/20"
      >
        {#if sourceType === "youtube"}
          YouTube
        {:else if sourceType === "dropbox"}
          Dropbox
        {:else}
          Video
        {/if}
      </div>

      <div
        class="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-green-500/90 text-white"
      >
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        {linkedMoveCount}
      </div>

      <div class="absolute inset-x-0 bottom-0 p-3">
        <p
          class="text-white text-sm font-semibold leading-snug line-clamp-2 drop-shadow-sm"
        >
          {video.title.trim()}
        </p>
      </div>
    </div>
  </a>

  {#if $isAdmin}
    <a
      href="{base}/videos/edit/{video.video_id}"
      class="absolute bottom-2 right-2 p-1.5 rounded-md text-white/90 bg-black/45 hover:bg-black/60 transition-colors"
      title={t("edit_video")}
      aria-label="{t('edit_video')}: {video.title}"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
</div>
