<script lang="ts">
  import type { TagGroup, MoveFormData, Video, MoveVideoRef } from "$lib/types";
  import { allVideos } from "$lib/stores";
  import { onMount } from "svelte";

  interface Props {
    formData: MoveFormData;
    tagGroups: TagGroup[];
    onsubmit: (data: MoveFormData) => void;
    loading: boolean;
    title: string;
  }

  let { formData, tagGroups, onsubmit, loading, title }: Props = $props();

  let derivedFormData = $derived(formData);
  let localData = $state<MoveFormData>({ ...formData });

  // Keep in sync when formData changes
  $effect(() => {
    localData = { ...derivedFormData };
    if (!localData.videoRefs) localData.videoRefs = [];
  });

  function toggleTag(tagId: number) {
    if (localData.tagIds.includes(tagId)) {
      localData.tagIds = localData.tagIds.filter((id) => id !== tagId);
    } else {
      localData.tagIds = [...localData.tagIds, tagId];
    }
  }

  function addVideoRef() {
    localData.videoRefs = [
      ...localData.videoRefs,
      { video_id: 0, start_time: "", end_time: "" },
    ];
  }

  function removeVideoRef(index: number) {
    localData.videoRefs = localData.videoRefs.filter((_, i) => i !== index);
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    // Filter out empty video refs
    const cleaned = {
      ...localData,
      videoRefs: localData.videoRefs.filter((r) => r.video_id > 0),
    };
    onsubmit(cleaned);
  }
</script>

<form onsubmit={handleSubmit} class="space-y-5">
  <h2 class="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>

  <div>
    <label
      for="name"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >Name</label
    >
    <input
      id="name"
      type="text"
      bind:value={localData.name}
      required
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
    />
  </div>

  <div>
    <label
      for="synonyms"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >Synonyms</label
    >
    <input
      id="synonyms"
      type="text"
      bind:value={localData.synonyms}
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      placeholder="Other names for this move"
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
      rows="4"
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
      placeholder="Detailed description for leaders"
    ></textarea>
  </div>

  <div>
    <label
      for="link"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >YouTube Link</label
    >
    <input
      id="link"
      type="text"
      bind:value={localData.link}
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      placeholder="https://www.youtube.com/watch?v=..."
    />
  </div>

  <!-- Tags grouped by type -->
  <div class="space-y-4">
    <span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >Tags</span
    >
    {#each tagGroups as group}
      <div
        class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
      >
        <h4
          class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
        >
          {group.tagType.tag_type_name}
        </h4>
        <div class="flex flex-wrap gap-2">
          {#each group.tags as tag}
            <label class="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={localData.tagIds.includes(tag.tag_id)}
                onchange={() => toggleTag(tag.tag_id)}
                class="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300"
                >{tag.tag_name.trim()}</span
              >
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Video References -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >Video-Referenzen</span
      >
      <button
        type="button"
        onclick={addVideoRef}
        class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Video hinzufügen
      </button>
    </div>

    {#if localData.videoRefs && localData.videoRefs.length > 0}
      {#each localData.videoRefs as ref, i}
        <div
          class="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
        >
          <div class="flex items-start gap-2">
            <div class="flex-1 space-y-2">
              <select
                bind:value={ref.video_id}
                class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value={0}>Video auswählen...</option>
                {#each $allVideos as video}
                  <option value={video.video_id}>{video.title}</option>
                {/each}
              </select>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label
                    class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5"
                    >Start (optional)</label
                  >
                  <input
                    type="text"
                    bind:value={ref.start_time}
                    placeholder="z.B. 10:01"
                    class="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div class="flex-1">
                  <label
                    class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5"
                    >Ende (optional)</label
                  >
                  <input
                    type="text"
                    bind:value={ref.end_time}
                    placeholder="z.B. 10:30"
                    class="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onclick={() => removeVideoRef(i)}
              class="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer mt-1"
              title="Entfernen"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    {:else}
      <p class="text-xs text-gray-400 dark:text-gray-500">
        Keine Videos verknüpft. Klicke "Video hinzufügen" um eine Referenz zu
        erstellen.
      </p>
    {/if}
  </div>

  <div class="flex items-center gap-3 pt-2">
    <button
      type="submit"
      disabled={loading}
      class="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
    >
      {loading ? "Saving..." : "Save Move"}
    </button>
    <a
      href="/"
      class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors no-underline"
    >
      Cancel
    </a>
  </div>
</form>
