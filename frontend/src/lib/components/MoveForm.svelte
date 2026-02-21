<script lang="ts">
  import type { TagGroup, MoveFormData } from "$lib/types";
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
  });

  function toggleTag(tagId: number) {
    if (localData.tagIds.includes(tagId)) {
      localData.tagIds = localData.tagIds.filter((id) => id !== tagId);
    } else {
      localData.tagIds = [...localData.tagIds, tagId];
    }
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    onsubmit(localData);
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
