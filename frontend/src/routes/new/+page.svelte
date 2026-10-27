<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { isAdmin, tagGroups, allMoves, addToast } from "#lib/stores.js";
  import { createMove, getAllMoves } from "#lib/services/moves.js";
  import type { MoveFormData } from "#lib/types.js";
  import MoveForm from "#lib/components/MoveForm.svelte";
  import { t } from "#lib/i18n.js";

  let loading = $state(false);
  let error = $state("");

  const formData: MoveFormData = $state({
    name: "",
    synonyms: "",
    description: "",
    learned_on: "",
    tagIds: [],
    videoRefs: [],
  });

  onMount(() => {
    if (!$isAdmin) goto(resolve("/login"));
  });

  async function handleSubmit(data: MoveFormData) {
    loading = true;
    error = "";
    try {
      await createMove(data);
      // Reload all moves
      const moves = await getAllMoves();
      allMoves.set(moves);
      addToast(t("move_created"));
      goto(resolve("/"));
    } catch (err) {
      error = err instanceof Error ? err.message : t("failed_create_move");
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>New Move – Swing Dance Moves</title>
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

    <MoveForm
      {formData}
      tagGroups={$tagGroups}
      onsubmit={handleSubmit}
      {loading}
      title={t("add_new_move")}
    />
  </div>
</div>
