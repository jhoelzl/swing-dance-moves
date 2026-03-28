<script lang="ts">
  import { onMount } from "svelte";
  import { allMoves, allSessions, activeTab, addToast } from "$lib/stores";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import { t } from "$lib/i18n";
  import type { Session, Move } from "$lib/types";
  import {
    getAllSessions,
    createSession,
    updateSession,
    deleteSession,
    addMoveToSession,
    removeMoveFromSession,
  } from "$lib/services/sessions";

  // ── local state ──────────────────────────────────────────────
  let sessions = $state<Session[]>([]);
  let loading = $state(true);

  // Create-form visibility and data
  let showCreateForm = $state(false);
  let creating = $state(false);
  let newName = $state("");
  let newDate = $state(todayIso());
  let newNotes = $state("");

  // Which session is currently expanded (shows moves + add-move picker)
  let expandedSessionId = $state<number | null>(null);

  // Inline edit state per session
  let editingSessionId = $state<number | null>(null);
  let editName = $state("");
  let editDate = $state("");
  let editNotes = $state("");
  let saving = $state(false);

  // Delete confirmation modal
  let confirmDeleteOpen = $state(false);
  let sessionToDelete = $state<Session | null>(null);
  let deleting = $state(false);

  // "Add move" picker per session
  let addMoveSessionId = $state<number | null>(null);
  let selectedMoveId = $state<number | null>(null);
  let addingMove = $state(false);
  let moveSortOrder = $state<"a-z" | "z-a" | "newest" | "oldest">("a-z");

  // ── helpers ──────────────────────────────────────────────────
  function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(iso: string): string {
    // e.g. '2026-03-28' → '28.03.2026'
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  }

  /** Moves not yet assigned to the given session, sorted by moveSortOrder. */
  function availableMoves(session: Session): Move[] {
    const assigned = new Set((session.moves ?? []).map((m) => m.move_id));
    const available = $allMoves.filter((m) => !assigned.has(m.move_id));
    return [...available].sort((a, b) => {
      switch (moveSortOrder) {
        case "a-z":
          return a.name.localeCompare(b.name, "de");
        case "z-a":
          return b.name.localeCompare(a.name, "de");
        case "newest":
          return b.move_id - a.move_id;
        case "oldest":
          return a.move_id - b.move_id;
        default:
          return 0;
      }
    });
  }

  // ── lifecycle ─────────────────────────────────────────────────
  onMount(async () => {
    activeTab.set("sessions");
    try {
      sessions = await getAllSessions();
      allSessions.set(sessions);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      addToast(t("session_create_failed"), "error");
    } finally {
      loading = false;
    }
  });

  // ── create session ────────────────────────────────────────────
  async function handleCreate() {
    if (!newName.trim() || !newDate) return;
    creating = true;
    try {
      const session = await createSession({
        name: newName,
        session_date: newDate,
        notes: newNotes,
      });
      sessions = [session, ...sessions];
      allSessions.set(sessions);
      addToast(t("session_created"), "success");
      newName = "";
      newDate = todayIso();
      newNotes = "";
      showCreateForm = false;
    } catch (err) {
      console.error(err);
      addToast(t("session_create_failed"), "error");
    } finally {
      creating = false;
    }
  }

  function cancelCreate() {
    newName = "";
    newDate = todayIso();
    newNotes = "";
    showCreateForm = false;
  }

  // ── edit session ──────────────────────────────────────────────
  function startEdit(session: Session) {
    editingSessionId = session.session_id;
    editName = session.name;
    editDate = session.session_date;
    editNotes = session.notes;
  }

  function cancelEdit() {
    editingSessionId = null;
  }

  async function handleSaveEdit(session: Session) {
    if (!editName.trim() || !editDate) return;
    saving = true;
    try {
      await updateSession(session.session_id, {
        name: editName,
        session_date: editDate,
        notes: editNotes,
      });
      sessions = sessions.map((s) =>
        s.session_id === session.session_id
          ? { ...s, name: editName, session_date: editDate, notes: editNotes }
          : s,
      );
      allSessions.set(sessions);
      addToast(t("session_updated"), "success");
      editingSessionId = null;
    } catch (err) {
      console.error(err);
      addToast(t("session_update_failed"), "error");
    } finally {
      saving = false;
    }
  }

  // ── delete session ────────────────────────────────────────────
  function openDeleteConfirm(session: Session) {
    sessionToDelete = session;
    confirmDeleteOpen = true;
  }

  async function handleConfirmDelete() {
    if (!sessionToDelete) return;
    deleting = true;
    try {
      await deleteSession(sessionToDelete.session_id);
      sessions = sessions.filter(
        (s) => s.session_id !== sessionToDelete!.session_id,
      );
      allSessions.set(sessions);
      addToast(t("session_deleted"), "success");
    } catch (err) {
      console.error(err);
      addToast(t("session_delete_failed"), "error");
    } finally {
      deleting = false;
      confirmDeleteOpen = false;
      sessionToDelete = null;
    }
  }

  // ── add move to session ───────────────────────────────────────
  function openAddMovePicker(sessionId: number) {
    addMoveSessionId = sessionId;
    selectedMoveId = null;
  }

  function cancelAddMove() {
    addMoveSessionId = null;
    selectedMoveId = null;
  }

  async function handleAddMove(session: Session) {
    if (!selectedMoveId) return;
    addingMove = true;
    try {
      await addMoveToSession(session.session_id, selectedMoveId);
      const move = $allMoves.find((m) => m.move_id === selectedMoveId);
      if (move) {
        sessions = sessions.map((s) =>
          s.session_id === session.session_id
            ? {
                ...s,
                moves: [...(s.moves ?? []), move].sort((a, b) =>
                  a.name.localeCompare(b.name, "de"),
                ),
              }
            : s,
        );
        allSessions.set(sessions);
      }
      addMoveSessionId = null;
      selectedMoveId = null;
    } catch (err) {
      console.error(err);
      addToast(t("session_move_add_failed"), "error");
    } finally {
      addingMove = false;
    }
  }

  // ── remove move from session ──────────────────────────────────
  async function handleRemoveMove(session: Session, moveId: number) {
    try {
      await removeMoveFromSession(session.session_id, moveId);
      sessions = sessions.map((s) =>
        s.session_id === session.session_id
          ? { ...s, moves: (s.moves ?? []).filter((m) => m.move_id !== moveId) }
          : s,
      );
      allSessions.set(sessions);
    } catch (err) {
      console.error(err);
      addToast(t("session_move_remove_failed"), "error");
    }
  }
</script>

<svelte:head>
  <title>Sessions – Swing Dance Moves</title>
</svelte:head>

<!-- Header row -->
<div class="flex items-center justify-between mb-6">
  <div>
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">
      {t("sessions_title")}
    </h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
      {sessions.length}
      {sessions.length === 1 ? t("session_singular") : t("sessions_plural")}
    </p>
  </div>
  {#if !showCreateForm}
    <button
      onclick={() => (showCreateForm = true)}
      class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
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
      {t("new_session")}
    </button>
  {/if}
</div>

<!-- Create session form -->
{#if showCreateForm}
  <div
    class="mb-6 bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-5 shadow-sm"
  >
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
      {t("create_session")}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
      <div>
        <label
          for="new-session-name"
          class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
        >
          {t("session_name")} *
        </label>
        <input
          id="new-session-name"
          type="text"
          bind:value={newName}
          placeholder={t("session_name_placeholder")}
          class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label
          for="new-session-date"
          class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
        >
          {t("session_date")} *
        </label>
        <input
          id="new-session-date"
          type="date"
          bind:value={newDate}
          class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
    <div class="mb-4">
      <label
        for="new-session-notes"
        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
      >
        {t("session_notes")}
      </label>
      <textarea
        id="new-session-notes"
        bind:value={newNotes}
        rows="2"
        placeholder={t("session_notes_placeholder")}
        class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      ></textarea>
    </div>
    <div class="flex gap-2">
      <button
        onclick={handleCreate}
        disabled={creating || !newName.trim() || !newDate}
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
      >
        {#if creating}
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          {t("saving")}
        {:else}
          {t("create_session")}
        {/if}
      </button>
      <button
        onclick={cancelCreate}
        class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
      >
        {t("cancel")}
      </button>
    </div>
  </div>
{/if}

<!-- Loading skeleton -->
{#if loading}
  <div class="space-y-3">
    {#each [1, 2, 3] as _}
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse"
      >
        <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div class="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    {/each}
  </div>

  <!-- Empty state -->
{:else if sessions.length === 0}
  <div class="text-center py-20">
    <span class="text-5xl">📅</span>
    <p class="text-gray-500 dark:text-gray-400 mt-4 mb-2 font-medium">
      {t("no_sessions_yet")}
    </p>
    <p class="text-sm text-gray-400 dark:text-gray-500">
      {t("no_sessions_hint")}
    </p>
  </div>

  <!-- Session list -->
{:else}
  <div class="space-y-3">
    {#each sessions as session (session.session_id)}
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <!-- Session header -->
        {#if editingSessionId === session.session_id}
          <!-- Inline edit form -->
          <div class="p-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label
                  for="edit-name-{session.session_id}"
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  {t("session_name")} *
                </label>
                <input
                  id="edit-name-{session.session_id}"
                  type="text"
                  bind:value={editName}
                  class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  for="edit-date-{session.session_id}"
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  {t("session_date")} *
                </label>
                <input
                  id="edit-date-{session.session_id}"
                  type="date"
                  bind:value={editDate}
                  class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div class="mb-3">
              <label
                for="edit-notes-{session.session_id}"
                class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
              >
                {t("session_notes")}
              </label>
              <textarea
                id="edit-notes-{session.session_id}"
                bind:value={editNotes}
                rows="2"
                placeholder={t("session_notes_placeholder")}
                class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
            <div class="flex gap-2">
              <button
                onclick={() => handleSaveEdit(session)}
                disabled={saving || !editName.trim() || !editDate}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                {saving ? t("saving") : t("save")}
              </button>
              <button
                onclick={cancelEdit}
                class="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        {:else}
          <!-- Normal view -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            onclick={() =>
              (expandedSessionId =
                expandedSessionId === session.session_id
                  ? null
                  : session.session_id)}
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 flex-wrap">
                <span
                  class="font-semibold text-gray-900 dark:text-white truncate"
                >
                  {session.name}
                </span>
                <span
                  class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full shrink-0"
                >
                  📅 {formatDate(session.session_date)}
                </span>
                <span
                  class="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full shrink-0"
                >
                  {session.moves?.length ?? 0}
                  {t("session_move_count")}
                </span>
              </div>
              {#if session.notes}
                <p
                  class="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate"
                >
                  {session.notes}
                </p>
              {/if}
            </div>

            <!-- Action buttons -->
            <div
              class="flex items-center gap-1 shrink-0"
              onclick={(e) => e.stopPropagation()}
              role="presentation"
            >
              <button
                onclick={() => startEdit(session)}
                title={t("edit_session")}
                class="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
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
                onclick={() => openDeleteConfirm(session)}
                title={t("delete_session")}
                class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
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

              <!-- Expand/collapse chevron -->
              <svg
                class="w-4 h-4 text-gray-400 transition-transform duration-200 {expandedSessionId ===
                session.session_id
                  ? 'rotate-180'
                  : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        {/if}

        <!-- Expanded: move list -->
        {#if expandedSessionId === session.session_id && editingSessionId !== session.session_id}
          <div class="border-t border-gray-100 dark:border-gray-800 px-5 py-4">
            <div class="flex items-center justify-between mb-3">
              <span
                class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {t("session_moves")}
              </span>
              {#if addMoveSessionId !== session.session_id}
                <button
                  onclick={() => openAddMovePicker(session.session_id)}
                  class="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
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
                  {t("session_add_move")}
                </button>
              {/if}
            </div>

            <!-- Add-move picker -->
            {#if addMoveSessionId === session.session_id}
              <!-- Sort controls -->
              <div class="flex items-center gap-1.5 mb-2 flex-wrap">
                <span class="text-xs text-gray-400 dark:text-gray-500 mr-1"
                  >{t("session_move_sort")}:</span
                >
                {#each [["a-z", t("sort_a_z")], ["z-a", t("sort_z_a")], ["newest", t("sort_newest")], ["oldest", t("sort_oldest")]] as [val, label] (val)}
                  <button
                    onclick={() =>
                      (moveSortOrder = val as
                        | "a-z"
                        | "z-a"
                        | "newest"
                        | "oldest")}
                    class="px-2 py-0.5 text-xs rounded-full transition-colors cursor-pointer {moveSortOrder ===
                    val
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
                  >
                    {label}
                  </button>
                {/each}
              </div>
              <div class="flex gap-2 mb-3 flex-wrap">
                <select
                  bind:value={selectedMoveId}
                  class="flex-1 min-w-0 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={null}>{t("session_select_move")}</option>
                  {#each availableMoves(session) as move (move.move_id)}
                    <option value={move.move_id}>{move.name}</option>
                  {/each}
                </select>
                <button
                  onclick={() => handleAddMove(session)}
                  disabled={addingMove || !selectedMoveId}
                  class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  {addingMove ? t("saving") : t("session_add_move")}
                </button>
                <button
                  onclick={cancelAddMove}
                  class="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  {t("cancel")}
                </button>
              </div>
            {/if}

            <!-- Assigned moves list -->
            {#if !session.moves || session.moves.length === 0}
              <p class="text-sm text-gray-400 dark:text-gray-500 italic py-2">
                {t("session_no_moves")}
              </p>
            {:else}
              <ul class="space-y-1.5">
                {#each session.moves as move (move.move_id)}
                  <li
                    class="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    <span
                      class="text-sm font-medium text-gray-800 dark:text-gray-200"
                    >
                      {move.name}
                    </span>
                    <button
                      onclick={() => handleRemoveMove(session, move.move_id)}
                      title={t("remove")}
                      class="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shrink-0"
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
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<!-- Delete confirmation modal -->
<ConfirmModal
  open={confirmDeleteOpen}
  title={t("delete_session")}
  message={t("confirm_delete_session")}
  confirmLabel={deleting ? t("deleting") : t("delete")}
  onconfirm={handleConfirmDelete}
  oncancel={() => {
    confirmDeleteOpen = false;
    sessionToDelete = null;
  }}
/>
