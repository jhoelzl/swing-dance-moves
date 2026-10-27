<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { isAdmin, allVideos, activeTab, addToast } from "#lib/stores.js";
  import { createVideo, getAllVideos } from "#lib/services/videos.js";
  import type { VideoFormData } from "#lib/types.js";
  import VideoForm from "#lib/components/VideoForm.svelte";
  import { t } from "#lib/i18n.js";

  let loading = $state(false);
  let error = $state("");

  const formData: VideoFormData = $state({
    title: "",
    url: "",
    description: "",
  });

  onMount(() => {
    activeTab.set("videos");
    if (!$isAdmin) goto(resolve("/login"));
  });

  async function handleSubmit(data: VideoFormData) {
    loading = true;
    error = "";
    try {
      await createVideo(data);
      // Reload all videos
      const videos = await getAllVideos();
      allVideos.set(videos);
      addToast(t("video_created"));
      goto(resolve("/videos"));
    } catch (err) {
      error = err instanceof Error ? err.message : t("failed_create_video");
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>New Video – Swing Dance Moves</title>
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
      title={t("new_video_title")}
    />
  </div>
</div>
