<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import {
    isAdmin,
    tagGroups,
    allMoves,
    allSessions,
    addToast,
  } from "$lib/stores";
  import {
    getMoveById,
    updateMove,
    deleteMove,
    getAllMoves,
  } from "$lib/services/moves";
  import {
    getSessionsForMove,
    addMoveToSession,
    removeMoveFromSession,
  } from "$lib/services/sessions";
  import type { MoveFormData, Session } from "$lib/types";
  import MoveForm from "$lib/components/MoveForm.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import { t } from "$lib/i18n";

  let loading = $state(false);
  let deleting = $state(false);
  let error = $state("");
  let showDeleteConfirm = $state(false);
  let sessionRefs = $state<Session[]>([]);
  let selectedSessionId = $state<number | null>(null);
  let addingSession = $state(false);
  let removingSessionId = $state<number | null>(null);
  let formData = $state<MoveFormData>({
    name: "",
    synonyms: "",
    description: "",
    learned_on: "",
    tagIds: [],
    videoRefs: [],
  });
  let moveId = $derived(Number($page.params.id));
  let loaded = $state(false);

  const availableSessionsForMove = $derived(
    $allSessions.filter(
      (s) => !sessionRefs.some((sr) => sr.session_id === s.session_id),
    ),
  );

  function formatSessionDate(iso: string): string {
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  }

  onMount(async () => {
    if (!$isAdmin) {
      goto(`${base}/login`);
      return;
    }

    if (isNaN(moveId)) {
      addToast(t("invalid_move_id"), "error");
      goto(`${base}/`);
      return;
    }

    const move = await getMoveById(moveId);
    if (!move) {
      goto(`${base}/`);
      return;
    }

    formData = {
      name: move.name,
      synonyms: move.synonyms ?? "",
      description: move.description ?? "",
      learned_on: move.learned_on ?? "",
      tagIds: move.tags?.map((t) => t.tag_id) ?? [],
      videoRefs: (move.videoRefs ?? []).map((r) => ({
        video_id: r.video_id,
        start_time: r.start_time,
        end_time: r.end_time,
      })),
    };

    sessionRefs = await getSessionsForMove(moveId);
    loaded = true;
  });

  async function handleSubmit(data: MoveFormData) {
    loading = true;
    error = "";
    try {
      await updateMove(moveId, data);
      const moves = await getAllMoves();
      allMoves.set(moves);
      addToast(t("move_updated"));
      goto(`${base}/`);
    } catch (err) {
      error = err instanceof Error ? err.message : t("failed_update_move");
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
      addToast(t("move_deleted"));
      goto(`${base}/`);
    } catch (err) {
      error = err instanceof Error ? err.message : t("failed_delete_move");
    } finally {
      deleting = false;
    }
  }

  async function handleAddSession() {
    if (!selectedSessionId) return;
    addingSession = true;
    error = "";
    try {
      await addMoveToSession(selectedSessionId, moveId);
      const session = $allSessions.find(
        (s) => s.session_id === selectedSessionId,
      );
      if (
        session &&
        !sessionRefs.some((s) => s.session_id === session.session_id)
      ) {
        sessionRefs = [...sessionRefs, session].sort((a, b) =>
          b.session_date.localeCompare(a.session_date),
        );
      }
      selectedSessionId = null;
      addToast(t("move_added_to_session"), "success");
    } catch (err) {
      error =
        err instanceof Error ? err.message : t("move_add_to_session_failed");
    } finally {
      addingSession = false;
    }
  }

  async function handleRemoveSession(sessionId: number) {
    removingSessionId = sessionId;
    error = "";
    try {
      await removeMoveFromSession(sessionId, moveId);
      sessionRefs = sessionRefs.filter((s) => s.session_id !== sessionId);
    } catch (err) {
      error =
        err instanceof Error
          ? err.message
          : t("move_remove_from_session_failed");
    } finally {
      removingSessionId = null;
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
        title={t("edit_move_title")}
      />

      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t("linked_sessions")}
        </h3>

        <div class="flex gap-2 mb-3 flex-wrap">
          <select
            bind:value={selectedSessionId}
            class="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={null}>{t("move_select_session")}</option>
            {#each availableSessionsForMove as session (session.session_id)}
              <option value={session.session_id}>
                {session.name} — {formatSessionDate(session.session_date)}
              </option>
            {/each}
          </select>
          <button
            onclick={handleAddSession}
            disabled={addingSession || !selectedSessionId}
            class="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            {addingSession ? t("saving") : t("move_add_to_session")}
          </button>
        </div>

        {#if sessionRefs.length === 0}
          <p class="text-sm text-gray-400 dark:text-gray-500 italic">
            {t("no_linked_sessions")}
          </p>
        {:else}
          <div class="flex flex-wrap gap-2">
            {#each sessionRefs as session (session.session_id)}
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800"
              >
                <svg
                  class="w-3 h-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {session.name}
                <span class="opacity-60">·</span>
                <span class="opacity-75"
                  >{formatSessionDate(session.session_date)}</span
                >
                <button
                  onclick={() => handleRemoveSession(session.session_id)}
                  disabled={removingSessionId === session.session_id}
                  class="ml-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-800/60 p-0.5 transition-colors cursor-pointer disabled:opacity-50"
                  title={t("remove")}
                >
                  <svg
                    class="w-3 h-3"
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
            {/each}
          </div>
        {/if}
      </div>

      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onclick={() => (showDeleteConfirm = true)}
          disabled={deleting}
          class="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {deleting ? t("deleting") : t("delete_move")}
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
  title={t("delete_move")}
  message={t("confirm_delete_move")}
  confirmLabel={t("delete")}
  onconfirm={handleDelete}
  oncancel={() => (showDeleteConfirm = false)}
/>
