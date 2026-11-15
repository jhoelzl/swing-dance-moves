<script lang="ts">
  import type { TagGroup, VideoFormData } from "#lib/types.js";
  import { resolve } from "$app/paths";
  import { t } from "#lib/i18n.js";
  import { getVideoTagGroups } from "#lib/services/videos.js";

  interface Props {
    formData: VideoFormData;
    tagGroups: TagGroup[];
    onsubmit: (data: VideoFormData) => void;
    loading: boolean;
    title: string;
  }

  let { formData, tagGroups, onsubmit, loading, title }: Props = $props();

  let derivedFormData = $derived(formData);
  let localData = $state<VideoFormData>({ ...$state.snapshot(formData) });
  const videoTagGroups = $derived(getVideoTagGroups(tagGroups));

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
      >{t("title")}</label
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
      >{t("video_url")}</label
    >
    <input
      id="url"
      type="text"
      bind:value={localData.url}
      required
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      placeholder={t("video_url_placeholder")}
    />
    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
      YouTube, Dropbox
    </p>
  </div>

  <div>
    <label
      for="description"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >{t("description")}</label
    >
    <textarea
      id="description"
      bind:value={localData.description}
      rows="3"
      class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
      placeholder={t("optional_description")}
    ></textarea>
  </div>

  {#each videoTagGroups as group (group.tagType.tag_type_id)}
    {#if group.tags.length}
      <fieldset>
        <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{group.tagType.tag_type_name}</legend>
        <div class="flex flex-wrap gap-2">
          {#each group.tags as tag (tag.tag_id)}
            <label class="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" bind:group={localData.tagIds} value={tag.tag_id} />
              {tag.tag_name}
            </label>
          {/each}
        </div>
      </fieldset>
    {/if}
  {/each}

  <div class="flex items-center gap-3 pt-2">
    <button
      type="submit"
      disabled={loading}
      class="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
    >
      {loading ? t("saving") : t("save_video")}
    </button>
    <a
      href={resolve("/videos")}
      class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors no-underline"
    >
      {t("cancel")}
    </a>
  </div>
</form>
