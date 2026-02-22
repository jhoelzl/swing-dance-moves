<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { supabase, supabaseConfigError } from "$lib/supabase";
  import Toast from "$lib/components/Toast.svelte";
  import {
    darkMode,
    toggleDarkMode,
    initDarkMode,
    isAdmin,
    allMoves,
    allVideos,
    tagGroups,
    isLoading,
    activeTab,
  } from "$lib/stores";
  import { getAllMoves, getAllTagsGrouped } from "$lib/services/moves";
  import { getAllVideos } from "$lib/services/videos";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";

  let { children } = $props();

  // Check if current page is the login page
  import { page } from "$app/stores";
  let isLoginPage = $derived($page.url.pathname.endsWith("/login"));

  // Error state for failed data loading
  let loadError = $state(false);
  let loadErrorMessage = $state("");

  async function loadData() {
    try {
      const [moves, tags, videos] = await Promise.all([
        getAllMoves(),
        getAllTagsGrouped(),
        getAllVideos(),
      ]);
      allMoves.set(moves);
      tagGroups.set(tags);
      allVideos.set(videos);
    } catch (err) {
      console.error("Failed to load data:", err);
      loadError = true;
      loadErrorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
    } finally {
      isLoading.set(false);
    }
  }

  onMount(async () => {
    initDarkMode();

    // Abort initialization if Supabase credentials are missing
    if (supabaseConfigError) {
      isLoading.set(false);
      return;
    }

    // Check auth state
    const {
      data: { session },
    } = await supabase.auth.getSession();
    isAdmin.set(!!session);

    if (session) {
      await loadData();
    } else {
      isLoading.set(false);
      goto(`${base}/login`);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      isAdmin.set(!!session);
      if (session) {
        await loadData();
      } else {
        allMoves.set([]);
        tagGroups.set([]);
        allVideos.set([]);
        goto(`${base}/login`);
      }
    });

    // Cleanup subscription on component destroy to prevent memory leak
    return () => {
      subscription.unsubscribe();
    };
  });

  async function retryLoad() {
    loadError = false;
    loadErrorMessage = "";
    isLoading.set(true);
    await loadData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    isAdmin.set(false);
    allMoves.set([]);
    tagGroups.set([]);
    allVideos.set([]);
    goto(`${base}/login`);
  }
</script>

{#if loadError}
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6"
  >
    <div
      class="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 p-8 text-center"
    >
      <div class="text-5xl mb-4">😵</div>
      <h1 class="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
        Laden fehlgeschlagen
      </h1>
      <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">
        Die Daten konnten nicht geladen werden. Bitte prüfe deine
        Internetverbindung und versuche es erneut.
      </p>
      {#if loadErrorMessage}
        <p
          class="text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 mb-5"
        >
          {loadErrorMessage}
        </p>
      {/if}
      <button
        onclick={retryLoad}
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Erneut versuchen
      </button>
    </div>
  </div>
{:else if supabaseConfigError}
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6"
  >
    <div
      class="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 p-8 text-center"
    >
      <div class="text-5xl mb-4">⚠️</div>
      <h1 class="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
        Konfigurationsfehler
      </h1>
      <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
        Die Supabase-Umgebungsvariablen sind nicht konfiguriert. Die App kann
        keine Verbindung zur Datenbank herstellen.
      </p>
      <div
        class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left text-xs font-mono text-gray-700 dark:text-gray-300"
      >
        <p class="mb-1">Erstelle eine <strong>.env</strong>-Datei:</p>
        <p class="text-red-500 dark:text-red-400">
          VITE_SUPABASE_URL=https://...
        </p>
        <p class="text-red-500 dark:text-red-400">
          VITE_SUPABASE_ANON_KEY=eyJ...
        </p>
      </div>
    </div>
  </div>
{:else}
  <div
    class="min-h-screen bg-gray-50/80 dark:bg-gray-950 transition-colors duration-300"
  >
    <!-- Navigation -->
    <nav
      class="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800"
    >
      <div class="max-w-3xl mx-auto px-5 py-3.5">
        <div class="flex items-center justify-between">
          <a
            href="{base}/"
            class="flex items-center gap-2.5 text-gray-900 dark:text-white no-underline group"
          >
            <span
              class="text-2xl group-hover:scale-110 transition-transform duration-200"
              >💃</span
            >
            <h1 class="text-lg font-bold tracking-tight">Swing Moves</h1>
          </a>

          <div class="flex items-center gap-1">
            <!-- Dark Mode Toggle -->
            <button
              onclick={toggleDarkMode}
              class="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
              title="Toggle Dark Mode"
            >
              {#if $darkMode}
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              {:else}
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              {/if}
            </button>

            <!-- Admin Login/Logout -->
            {#if $isAdmin}
              {#if $activeTab !== "tags"}
                <a
                  href="{base}/{$activeTab === 'videos' ? 'videos/new' : 'new'}"
                  class="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  title={$activeTab === "videos" ? "Add Video" : "Add Move"}
                >
                  <svg
                    class="w-5 h-5"
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
                </a>
              {/if}
              <button
                onclick={handleLogout}
                class="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                title="Logout"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            {:else}
              <a
                href="{base}/login"
                class="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title="Login"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </a>
            {/if}
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      {#if $isAdmin && !isLoginPage}
        <div class="max-w-3xl mx-auto px-5">
          <div
            class="flex gap-1 border-t border-gray-100 dark:border-gray-800 pt-2"
          >
            <a
              href="{base}/"
              onclick={(e) => {
                e.preventDefault();
                activeTab.set("moves");
                goto(`${base}/`);
              }}
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all no-underline
            {$activeTab === 'moves'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Moves
            </a>
            <a
              href="{base}/videos"
              onclick={(e) => {
                e.preventDefault();
                activeTab.set("videos");
                goto(`${base}/videos`);
              }}
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all no-underline
            {$activeTab === 'videos'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Videos
            </a>
            <a
              href="{base}/tags"
              onclick={(e) => {
                e.preventDefault();
                activeTab.set("tags");
                goto(`${base}/tags`);
              }}
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all no-underline
            {$activeTab === 'tags'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Tags
            </a>
          </div>
        </div>
      {/if}
    </nav>

    <!-- Page Content -->
    <main class="max-w-3xl mx-auto px-5 py-8">
      {#if $isAdmin || isLoginPage}
        {@render children()}
      {:else if !$isLoading}
        <div class="text-center py-24">
          <span class="text-4xl">🕺</span>
          <p class="text-gray-400 dark:text-gray-500 mt-4 mb-5">
            Bitte einloggen, um Moves zu sehen.
          </p>
          <a
            href="{base}/login"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-sm hover:shadow font-medium text-sm"
            >Zum Login</a
          >
        </div>
      {/if}
    </main>
  </div>
{/if}

<Toast />
