<script lang="ts">
  import type { VideoFormData } from "$lib/types";
  import { base } from "$app/paths";

  interface Props {
    formData: VideoFormData;
    onsubmit: (data: VideoFormData) => void;
    loading: boolean;
    title: string;
  }

  let { formData, onsubmit, loading, title }: Props = $props();

  let derivedFormData = $derived(formData);
  let localData = $state<VideoFormData>({ ...formData });

  // Keep in sync when formData changes
  $effect(() => {
    localData = { ...derivedFormData };
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    onsubmit(localData);
  }
</script>

<form onsubmit={handleSubmit} class="space-y-5">
  <h2 class="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>

  <div>
    <label
      for="title"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >Title</label
    >
    <input
      id="title"
      type="text"
      bind:value={localData.title}
      required
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      placeholder="e.g. Lindy Hop Workshop Day 1"
    />
  </div>

  <div>
    <label
      for="url"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >YouTube URL</label
    >
    <input
      id="url"
      type="text"
      bind:value={localData.url}
      required
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      placeholder="https://www.youtube.com/watch?v=..."
    />
  </div>

  <div>
    <label
      for="description"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >Description</label
    >
    <textarea
      id="description"
      bind:value={localData.description}
      rows="3"
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
      placeholder="Optional description..."
    ></textarea>
  </div>

  <div class="flex items-center gap-3 pt-2">
    <button
      type="submit"
      disabled={loading}
      class="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
    >
      {loading ? "Saving..." : "Save Video"}
    </button>
    <a
      href="{base}/videos"
      class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors no-underline"
    >
      Cancel
    </a>
  </div>
</form>
