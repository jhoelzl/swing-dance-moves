<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import {
    darkMode,
    toggleDarkMode,
    initDarkMode,
    isAdmin,
    allMoves,
    tagGroups,
    isLoading,
  } from "$lib/stores";
  import { getAllMoves, getAllTagsGrouped } from "$lib/services/moves";
  import { base } from "$app/paths";

  let { children } = $props();

  onMount(async () => {
    initDarkMode();

    // Check auth state
    const {
      data: { session },
    } = await supabase.auth.getSession();
    isAdmin.set(!!session);

    supabase.auth.onAuthStateChange((_event, session) => {
      isAdmin.set(!!session);
    });

    // Load data
    try {
      const [moves, tags] = await Promise.all([
        getAllMoves(),
        getAllTagsGrouped(),
      ]);
      allMoves.set(moves);
      tagGroups.set(tags);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      isLoading.set(false);
    }
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    isAdmin.set(false);
  }
</script>

<div
  class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
>
  <!-- Navigation -->
  <nav
    class="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
  >
    <div class="max-w-4xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <a
          href="{base}/"
          class="flex items-center gap-2 text-gray-900 dark:text-white no-underline"
        >
          <span class="text-xl">💃</span>
          <h1 class="text-lg font-bold tracking-tight">Swing Dance Moves</h1>
        </a>

        <div class="flex items-center gap-2">
          <!-- Dark Mode Toggle -->
          <button
            onclick={toggleDarkMode}
            class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
            <a
              href="{base}/new"
              class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Add Move"
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
            <button
              onclick={handleLogout}
              class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
              class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Admin Login"
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
  </nav>

  <!-- Page Content -->
  <main class="max-w-4xl mx-auto px-4 py-6">
    {@render children()}
  </main>
</div>
