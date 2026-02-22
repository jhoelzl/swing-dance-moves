<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { isAdmin, allVideos, activeTab } from "$lib/stores";
  import {
    getVideoById,
    updateVideo,
    deleteVideo,
    getAllVideos,
  } from "$lib/services/videos";
  import type { VideoFormData } from "$lib/types";
  import VideoForm from "$lib/components/VideoForm.svelte";

  let loading = $state(false);
  let deleting = $state(false);
  let error = $state("");
  let formData = $state<VideoFormData>({
    title: "",
    url: "",
    description: "",
  });
  let videoId = $derived(Number($page.params.id));
  let loaded = $state(false);

  onMount(async () => {
    activeTab.set("videos");
    if (!$isAdmin) {
      goto(`${base}/login`);
      return;
    }

    const video = await getVideoById(videoId);
    if (!video) {
      goto(`${base}/videos`);
      return;
    }

    formData = {
      title: video.title,
      url: video.url,
      description: video.description,
    };
    loaded = true;
  });

  async function handleSubmit(data: VideoFormData) {
    loading = true;
    error = "";
    try {
      await updateVideo(videoId, data);
      const videos = await getAllVideos();
      allVideos.set(videos);
      goto(`${base}/videos`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to update video";
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    if (!confirm("Video wirklich löschen?")) return;
    deleting = true;
    try {
      await deleteVideo(videoId);
      const videos = await getAllVideos();
      allVideos.set(videos);
      goto(`${base}/videos`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete video";
    } finally {
      deleting = false;
    }
  }
</script>

<svelte:head>
  <title>Video bearbeiten – Swing Dance Moves</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  >
    {#if error}
      <div
        class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
      >
        {error}
      </div>
    {/if}

    {#if loaded}
      <VideoForm
        {formData}
        onsubmit={handleSubmit}
        {loading}
        title="Video bearbeiten"
      />

      <div
        class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"
      >
        <button
          onclick={handleDelete}
          disabled={deleting}
          class="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          {deleting ? "Löschen..." : "Video löschen"}
        </button>
      </div>
    {:else}
      <div class="flex justify-center py-12">
        <div
          class="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    {/if}
  </div>
</div>
