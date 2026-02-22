<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { isAdmin, allVideos, activeTab, addToast } from "$lib/stores";
  import { createVideo, getAllVideos } from "$lib/services/videos";
  import type { VideoFormData } from "$lib/types";
  import VideoForm from "$lib/components/VideoForm.svelte";

  let loading = $state(false);
  let error = $state("");

  const formData: VideoFormData = $state({
    title: "",
    url: "",
    description: "",
  });

  onMount(() => {
    activeTab.set("videos");
    if (!$isAdmin) goto(`${base}/login`);
  });

  async function handleSubmit(data: VideoFormData) {
    loading = true;
    error = "";
    try {
      await createVideo(data);
      // Reload all videos
      const videos = await getAllVideos();
      allVideos.set(videos);
      addToast("Video erfolgreich erstellt");
      goto(`${base}/videos`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create video";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Neues Video – Swing Dance Moves</title>
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

    <VideoForm
      {formData}
      onsubmit={handleSubmit}
      {loading}
      title="Neues Video"
    />
  </div>
</div>
