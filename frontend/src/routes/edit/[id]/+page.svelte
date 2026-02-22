<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { isAdmin, tagGroups, allMoves, addToast } from "$lib/stores";
  import {
    getMoveById,
    updateMove,
    deleteMove,
    getAllMoves,
  } from "$lib/services/moves";
  import type { MoveFormData } from "$lib/types";
  import MoveForm from "$lib/components/MoveForm.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";

  let loading = $state(false);
  let deleting = $state(false);
  let error = $state("");
  let showDeleteConfirm = $state(false);
  let formData = $state<MoveFormData>({
    name: "",
    synonyms: "",
    description: "",
    tagIds: [],
    videoRefs: [],
  });
  let moveId = $derived(Number($page.params.id));
  let loaded = $state(false);

  onMount(async () => {
    if (!$isAdmin) {
      goto(`${base}/login`);
      return;
    }

    const move = await getMoveById(moveId);
    if (!move) {
      goto(`${base}/`);
      return;
    }

    formData = {
      name: move.name,
      synonyms: move.synonyms,
      description: move.description,
      tagIds: move.tags?.map((t) => t.tag_id) ?? [],
      videoRefs: (move.videoRefs ?? []).map((r) => ({
        video_id: r.video_id,
        start_time: r.start_time,
        end_time: r.end_time,
      })),
    };
    loaded = true;
  });

  async function handleSubmit(data: MoveFormData) {
    loading = true;
    error = "";
    try {
      await updateMove(moveId, data);
      const moves = await getAllMoves();
      allMoves.set(moves);
      addToast("Move erfolgreich aktualisiert");
      goto(`${base}/`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to update move";
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    deleting = true;
    showDeleteConfirm = false;
    try {
      await deleteMove(moveId);
      const moves = await getAllMoves();
      allMoves.set(moves);
      addToast("Move erfolgreich gelöscht");
      goto(`${base}/`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete move";
    } finally {
      deleting = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Move – Swing Dance Moves</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  >
    {#if error}
      <div
        class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
      >
        {error}
      </div>
    {/if}

    {#if loaded}
      <MoveForm
        {formData}
        tagGroups={$tagGroups}
        onsubmit={handleSubmit}
        {loading}
        title="Edit Move"
      />

      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onclick={() => (showDeleteConfirm = true)}
          disabled={deleting}
          class="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {deleting ? "Deleting..." : "Delete Move"}
        </button>
      </div>
    {:else}
      <div class="flex items-center justify-center py-12">
        <div
          class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    {/if}
  </div>
</div>

<ConfirmModal
  open={showDeleteConfirm}
  title="Move löschen"
  message="Soll dieser Move wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
  confirmLabel="Löschen"
  onconfirm={handleDelete}
  oncancel={() => (showDeleteConfirm = false)}
/>
