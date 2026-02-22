<script lang="ts">
  import { onMount } from "svelte";
  import { activeTab, isLoading, tagGroups } from "$lib/stores";
  import { getAllTagsGrouped } from "$lib/services/moves";
  import {
    getAllTagTypes,
    createTagType,
    updateTagType,
    deleteTagType,
    getTagsByType,
    createTag,
    updateTag,
    deleteTag,
  } from "$lib/services/tags";
  import { getTagColors } from "$lib/utils";
  import type { Tag, TagType, TagGroup } from "$lib/types";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";

  // Available label colors for the color picker
  const labelOptions = [
    { value: "success", name: "Grün" },
    { value: "danger", name: "Rot" },
    { value: "warning", name: "Gelb" },
    { value: "primary", name: "Blau" },
    { value: "secondary", name: "Grau" },
    { value: "light", name: "Hell" },
  ];

  // ── State ──

  let groups = $state<TagGroup[]>([]);
  let loading = $state(true);

  // Tag Type editing
  let editingTypeId = $state<number | null>(null);
  let editTypeName = $state("");
  let editTypeCss = $state("");
  let editTypeSortOrder = $state(0);

  // New Tag Type
  let showNewType = $state(false);
  let newTypeName = $state("");
  let newTypeCss = $state("");
  let newTypeSortOrder = $state(0);

  // Tag editing
  let editingTagId = $state<number | null>(null);
  let editTagName = $state("");
  let editTagLabel = $state("primary");
  let editTagCss = $state("");
  let editTagSort = $state(0);

  // New Tag
  let addingTagToTypeId = $state<number | null>(null);
  let newTagName = $state("");
  let newTagLabel = $state("primary");
  let newTagCss = $state("");
  let newTagSort = $state(0);

  // Confirm modal
  let showConfirm = $state(false);
  let confirmMessage = $state("");
  let confirmAction = $state<() => void>(() => {});

  // Status message
  let statusMessage = $state<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Derived preview colors
  let newTagPreviewColors = $derived(getTagColors(newTagLabel));
  let editTagPreviewColors = $derived(getTagColors(editTagLabel));

  onMount(async () => {
    activeTab.set("tags");
    await loadGroups();
  });

  async function loadGroups() {
    loading = true;
    try {
      groups = await getAllTagsGrouped();
    } catch (err) {
      console.error("Failed to load tags:", err);
      showStatus("error", "Fehler beim Laden der Tags.");
    } finally {
      loading = false;
    }
  }

  function showStatus(type: "success" | "error", text: string) {
    statusMessage = { type, text };
    setTimeout(() => (statusMessage = null), 4000);
  }

  // ── Tag Type CRUD ──

  function startEditType(tt: TagType) {
    editingTypeId = tt.tag_type_id;
    editTypeName = tt.tag_type_name;
    editTypeCss = tt.tag_type_css;
    editTypeSortOrder = tt.sort_order;
  }

  function cancelEditType() {
    editingTypeId = null;
  }

  async function saveEditType() {
    if (!editingTypeId || !editTypeName.trim()) return;
    try {
      await updateTagType(editingTypeId, {
        tag_type_name: editTypeName.trim(),
        tag_type_css: editTypeCss.trim(),
        sort_order: editTypeSortOrder,
      });
      editingTypeId = null;
      await reloadAll();
      showStatus("success", "Kategorie aktualisiert.");
    } catch (err) {
      showStatus("error", `Fehler: ${(err as Error).message}`);
    }
  }

  function confirmDeleteType(tt: TagType) {
    const tagCount =
      groups.find((g) => g.tagType.tag_type_id === tt.tag_type_id)?.tags
        .length ?? 0;
    confirmMessage = `Kategorie "${tt.tag_type_name}" löschen? ${tagCount > 0 ? `${tagCount} Tag(s) werden ebenfalls gelöscht.` : ""}`;
    confirmAction = async () => {
      try {
        await deleteTagType(tt.tag_type_id);
        await reloadAll();
        showStatus("success", `Kategorie "${tt.tag_type_name}" gelöscht.`);
      } catch (err) {
        showStatus("error", `Fehler: ${(err as Error).message}`);
      }
    };
    showConfirm = true;
  }

  async function saveNewType() {
    if (!newTypeName.trim()) return;
    try {
      await createTagType(
        newTypeName.trim(),
        newTypeCss.trim(),
        newTypeSortOrder,
      );
      newTypeName = "";
      newTypeCss = "";
      newTypeSortOrder = 0;
      showNewType = false;
      await reloadAll();
      showStatus("success", "Neue Kategorie erstellt.");
    } catch (err) {
      showStatus("error", `Fehler: ${(err as Error).message}`);
    }
  }

  // ── Tag CRUD ──

  function startEditTag(tag: Tag) {
    editingTagId = tag.tag_id;
    editTagName = tag.tag_name;
    editTagLabel = tag.tag_label;
    editTagCss = tag.tag_css;
    editTagSort = tag.tag_sort;
  }

  function cancelEditTag() {
    editingTagId = null;
  }

  async function saveEditTag() {
    if (!editingTagId || !editTagName.trim()) return;
    try {
      await updateTag(editingTagId, {
        tag_name: editTagName.trim(),
        tag_label: editTagLabel,
        tag_css: editTagCss.trim(),
        tag_sort: editTagSort,
      });
      editingTagId = null;
      await reloadAll();
      showStatus("success", "Tag aktualisiert.");
    } catch (err) {
      showStatus("error", `Fehler: ${(err as Error).message}`);
    }
  }

  function confirmDeleteTag(tag: Tag) {
    confirmMessage = `Tag "${tag.tag_name}" löschen? Zuordnungen zu Moves werden ebenfalls entfernt.`;
    confirmAction = async () => {
      try {
        await deleteTag(tag.tag_id);
        await reloadAll();
        showStatus("success", `Tag "${tag.tag_name}" gelöscht.`);
      } catch (err) {
        showStatus("error", `Fehler: ${(err as Error).message}`);
      }
    };
    showConfirm = true;
  }

  function startAddTag(typeId: number) {
    addingTagToTypeId = typeId;
    newTagName = "";
    newTagLabel = "primary";
    newTagCss = "";
    newTagSort = 0;
  }

  function cancelAddTag() {
    addingTagToTypeId = null;
  }

  async function saveNewTag() {
    if (!addingTagToTypeId || !newTagName.trim()) return;
    try {
      await createTag({
        tag_name: newTagName.trim(),
        tag_label: newTagLabel,
        tag_css: newTagCss.trim(),
        tag_sort: newTagSort,
        tag_type_id: addingTagToTypeId,
      });
      addingTagToTypeId = null;
      await reloadAll();
      showStatus("success", "Neuen Tag erstellt.");
    } catch (err) {
      showStatus("error", `Fehler: ${(err as Error).message}`);
    }
  }

  async function reloadAll() {
    await loadGroups();
    // Also update the global store so other pages reflect the changes
    const freshGroups = await getAllTagsGrouped();
    tagGroups.set(freshGroups);
  }
</script>

<svelte:head>
  <title>Tags verwalten – Swing Moves</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center py-24">
    <div class="text-center">
      <div
        class="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="mt-4 text-sm text-gray-400 dark:text-gray-500">
        Loading tags...
      </p>
    </div>
  </div>
{:else}
  <!-- Status Message -->
  {#if statusMessage}
    <div
      class="mb-5 px-4 py-3 rounded-xl text-sm font-medium
        {statusMessage.type === 'success'
        ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}"
    >
      {statusMessage.type === "success" ? "✅" : "❌"}
      {statusMessage.text}
    </div>
  {/if}

  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">
      Tags verwalten
    </h2>
    <button
      onclick={() => (showNewType = !showNewType)}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm hover:shadow cursor-pointer"
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
          d="M12 4v16m8-8H4"
        />
      </svg>
      Neue Kategorie
    </button>
  </div>

  <!-- New Tag Type Form -->
  {#if showNewType}
    <div
      class="mb-6 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm"
    >
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Neue Kategorie erstellen
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >Name</label
          >
          <input
            type="text"
            bind:value={newTypeName}
            placeholder="z.B. Level"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >CSS-Klasse (optional)</label
          >
          <input
            type="text"
            bind:value={newTypeCss}
            placeholder="z.B. badge-info"
            class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >Reihenfolge</label
          >
          <input
            type="number"
            bind:value={newTypeSortOrder}
            class="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button
          onclick={saveNewType}
          class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
        >
          Erstellen
        </button>
        <button
          onclick={() => (showNewType = false)}
          class="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
        >
          Abbrechen
        </button>
      </div>
    </div>
  {/if}

  <!-- Tag Groups -->
  <div class="space-y-6">
    {#each groups as group (group.tagType.tag_type_id)}
      <div
        class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <!-- Tag Type Header -->
        {#if editingTypeId === group.tagType.tag_type_id}
          <!-- Editing tag type -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >Name</label
                >
                <input
                  type="text"
                  bind:value={editTypeName}
                  class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >CSS-Klasse</label
                >
                <input
                  type="text"
                  bind:value={editTypeCss}
                  class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >Reihenfolge</label
                >
                <input
                  type="number"
                  bind:value={editTypeSortOrder}
                  class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                onclick={saveEditType}
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
              >
                Speichern
              </button>
              <button
                onclick={cancelEditType}
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
            </div>
          </div>
        {:else}
          <!-- Display tag type -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800"
          >
            <div class="flex items-center gap-3">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                {group.tagType.tag_type_name}
              </h3>
              <span
                class="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums"
              >
                {group.tags.length}
                {group.tags.length === 1 ? "Tag" : "Tags"} · Pos {group.tagType
                  .sort_order}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                onclick={() => startEditType(group.tagType)}
                class="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer"
                title="Kategorie bearbeiten"
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
              </button>
              <button
                onclick={() => startAddTag(group.tagType.tag_type_id)}
                class="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40 transition-all cursor-pointer"
                title="Tag hinzufügen"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onclick={() => confirmDeleteType(group.tagType)}
                class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                title="Kategorie löschen"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        {/if}

        <!-- New Tag Form (inline) -->
        {#if addingTagToTypeId === group.tagType.tag_type_id}
          <div
            class="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-b border-gray-100 dark:border-gray-800"
          >
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >Name</label
                >
                <input
                  type="text"
                  bind:value={newTagName}
                  placeholder="Tag-Name"
                  class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >Farbe</label
                >
                <select
                  bind:value={newTagLabel}
                  class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none cursor-pointer"
                >
                  {#each labelOptions as opt}
                    <option value={opt.value}>{opt.name}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >CSS (optional)</label
                >
                <input
                  type="text"
                  bind:value={newTagCss}
                  placeholder="tag_css"
                  class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >Reihenfolge</label
                >
                <input
                  type="number"
                  bind:value={newTagSort}
                  class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>
            <!-- Color Preview -->
            <div class="mt-3 flex items-center gap-3">
              <span class="text-xs text-gray-500 dark:text-gray-400"
                >Vorschau:</span
              >
              <span
                class="{newTagPreviewColors.bg} {newTagPreviewColors.text} border {newTagPreviewColors.border} inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
              >
                {newTagName || "Tag"}
              </span>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                onclick={saveNewTag}
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
              >
                Erstellen
              </button>
              <button
                onclick={cancelAddTag}
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
            </div>
          </div>
        {/if}

        <!-- Tag List -->
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          {#each group.tags as tag (tag.tag_id)}
            {#if editingTagId === tag.tag_id}
              <!-- Editing tag row -->
              <div class="p-4 bg-yellow-50/30 dark:bg-yellow-950/10">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label
                      class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >Name</label
                    >
                    <input
                      type="text"
                      bind:value={editTagName}
                      class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >Farbe</label
                    >
                    <select
                      bind:value={editTagLabel}
                      class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none cursor-pointer"
                    >
                      {#each labelOptions as opt}
                        <option value={opt.value}>{opt.name}</option>
                      {/each}
                    </select>
                  </div>
                  <div>
                    <label
                      class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >CSS</label
                    >
                    <input
                      type="text"
                      bind:value={editTagCss}
                      class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >Reihenfolge</label
                    >
                    <input
                      type="number"
                      bind:value={editTagSort}
                      class="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>
                <!-- Color Preview -->
                <div class="mt-3 flex items-center gap-3">
                  <span class="text-xs text-gray-500 dark:text-gray-400"
                    >Vorschau:</span
                  >
                  <span
                    class="{editTagPreviewColors.bg} {editTagPreviewColors.text} border {editTagPreviewColors.border} inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    {editTagName || "Tag"}
                  </span>
                </div>
                <div class="flex gap-2 mt-3">
                  <button
                    onclick={saveEditTag}
                    class="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
                  >
                    Speichern
                  </button>
                  <button
                    onclick={cancelEditTag}
                    class="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            {:else}
              <!-- Display tag row -->
              <div
                class="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="{getTagColors(tag.tag_label).bg} {getTagColors(tag.tag_label).text} border {getTagColors(tag.tag_label).border} inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    {tag.tag_name.trim()}
                  </span>
                  <span
                    class="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums"
                  >
                    Pos {tag.tag_sort} · {tag.tag_label}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    onclick={() => startEditTag(tag)}
                    class="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer"
                    title="Tag bearbeiten"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onclick={() => confirmDeleteTag(tag)}
                    class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                    title="Tag löschen"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            {/if}
          {/each}

          {#if group.tags.length === 0}
            <div class="px-4 py-6 text-center">
              <p class="text-sm text-gray-400 dark:text-gray-500">
                Keine Tags in dieser Kategorie.
              </p>
            </div>
          {/if}
        </div>
      </div>
    {/each}

    {#if groups.length === 0}
      <div class="text-center py-16">
        <div class="text-4xl mb-3">🏷️</div>
        <p class="text-gray-400 dark:text-gray-500 font-medium">
          Noch keine Tag-Kategorien vorhanden.
        </p>
        <p class="text-gray-300 dark:text-gray-600 text-sm mt-1">
          Erstelle eine neue Kategorie, um Tags zu verwalten.
        </p>
      </div>
    {/if}
  </div>
{/if}

<!-- Confirm Modal -->
<ConfirmModal
  open={showConfirm}
  message={confirmMessage}
  onconfirm={() => {
    confirmAction();
    showConfirm = false;
  }}
  oncancel={() => (showConfirm = false)}
/>
