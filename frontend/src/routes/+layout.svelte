<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import type { Session as AuthSession } from "@supabase/supabase-js";
  import { supabase, supabaseConfigError } from "#lib/supabase.js";
  import Toast from "#lib/components/Toast.svelte";
  import {
    darkMode,
    toggleDarkMode,
    initDarkMode,
    isAdmin,
    allMoves,
    allVideos,
    tagGroups,
    isLoading,
    userSettings,
    allSessions,
  } from "#lib/stores.js";
  import { getAllMoves, getAllTagsGrouped } from "#lib/services/moves.js";
  import { getAllVideos } from "#lib/services/videos.js";
  import { getUserSettings } from "#lib/services/settings.js";
  import { getAllSessions } from "#lib/services/sessions.js";
  import { t } from "#lib/i18n.js";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { useRegisterSW } from "virtual:pwa-register/svelte";

  let { children } = $props();
  useRegisterSW();

  let isLoginPage = $derived(page.url.pathname.endsWith("/login"));
  let loadError = $state(false);
  let loadErrorMessage = $state("");

  const navigation = [
    { path: "/", key: "nav_moves", icon: "▦" },
    { path: "/random", key: "nav_random", icon: "↝" },
    { path: "/videos", key: "nav_videos", icon: "▷" },
    { path: "/tags", key: "nav_tags", icon: "◇" },
    { path: "/sessions", key: "nav_sessions", icon: "▤" },
    { path: "/calendar", key: "nav_calendar", icon: "▣" },
  ] as const;

  let translatedNavigation = $derived.by(() => {
    void $userSettings?.language;
    return navigation.map((item) => ({ ...item, label: t(item.key) }));
  });

  let labels = $derived.by(() => {
    void $userSettings?.language;
    return {
      navigation: t("studio_navigation"),
      yourSpace: t("studio_your_space"),
      noteTitle: t("studio_note_title"),
      noteText: t("studio_note_text"),
      library: t("studio_library"),
      darkMode: t("toggle_dark_mode"),
      settings: t("nav_settings"),
      logout: t("logout"),
      login: t("login"),
    };
  });

  function isCurrent(path: (typeof navigation)[number]["path"]) {
    const target = resolve(path);
    return path === "/"
      ? page.url.pathname === target || page.url.pathname === target.replace(/\/$/, "")
      : page.url.pathname === target || page.url.pathname.startsWith(`${target}/`);
  }

  function resetAppState() {
    allMoves.set([]);
    tagGroups.set([]);
    allVideos.set([]);
    allSessions.set([]);
    userSettings.set(null);
  }

  async function loadData() {
    loadError = false;
    loadErrorMessage = "";
    try {
      const [moves, tags, videos, settings, sessions] = await Promise.all([
        getAllMoves(),
        getAllTagsGrouped(),
        getAllVideos(),
        getUserSettings(),
        getAllSessions(),
      ]);
      allMoves.set(moves);
      tagGroups.set(tags);
      allVideos.set(videos);
      userSettings.set(settings);
      allSessions.set(sessions);
    } catch (err) {
      console.error("Failed to load data:", err);
      loadError = true;
      loadErrorMessage = err instanceof Error ? err.message : "Unknown error";
    } finally {
      isLoading.set(false);
    }
  }

  async function syncSessionState(session: AuthSession | null) {
    isAdmin.set(!!session);
    if (session) {
      isLoading.set(true);
      await loadData();
      return;
    }
    resetAppState();
    isLoading.set(false);
    goto(resolve("/login"));
  }

  $effect(() => {
    const lang = $userSettings?.language;
    if (lang) document.documentElement.lang = lang;
  });

  onMount(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    async function init() {
      initDarkMode();
      if (supabaseConfigError) {
        isLoading.set(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      await syncSessionState(session);
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "TOKEN_REFRESHED") {
          isAdmin.set(!!session);
          return;
        }
        window.setTimeout(() => {
          void syncSessionState(session);
        }, 0);
      });
      subscription = data.subscription;
    }

    void init();
    return () => subscription?.unsubscribe();
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
    resetAppState();
    goto(resolve("/login"));
  }
</script>

{#if loadError}
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
    <div class="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 p-8 text-center">
      <div class="text-5xl mb-4">😵</div>
      <h1 class="text-xl font-bold text-red-600 dark:text-red-400 mb-3">{t("loading_failed")}</h1>
      <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">{t("data_load_error")}</p>
      {#if loadErrorMessage}
        <p class="text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 mb-5">{loadErrorMessage}</p>
      {/if}
      <button onclick={retryLoad} class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer">{t("try_again")}</button>
    </div>
  </div>
{:else if supabaseConfigError}
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
    <div class="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 p-8 text-center">
      <div class="text-5xl mb-4">⚠️</div>
      <h1 class="text-xl font-bold text-red-600 dark:text-red-400 mb-3">{t("config_error")}</h1>
      <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{t("config_error_desc")}</p>
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left text-xs font-mono text-gray-700 dark:text-gray-300">
        <p class="mb-1">Create a <strong>.env</strong> file:</p>
        <p class="text-red-500 dark:text-red-400">VITE_SUPABASE_URL=https://...</p>
        <p class="text-red-500 dark:text-red-400">VITE_SUPABASE_ANON_KEY=eyJ...</p>
      </div>
    </div>
  </div>
{:else}
  <div class="studio-shell">
    <aside class="studio-sidebar">
      <a class="studio-brand" href={resolve("/")}><span class="studio-brand-mark" aria-hidden="true">♪</span> swing moves<span class="studio-brand-dot">.</span></a>
      {#if $isAdmin && !isLoginPage}
        <nav class="studio-sidebar-nav" aria-label={labels.navigation}>
          <p class="studio-overline">{labels.yourSpace}</p>
          {#each translatedNavigation as item}
            <a href={resolve(item.path)} class:current={isCurrent(item.path)} aria-current={isCurrent(item.path) ? "page" : undefined}>
              <span class="studio-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
            </a>
          {/each}
        </nav>
        <div class="studio-sidebar-note"><strong>{labels.noteTitle}</strong><span>{labels.noteText}</span></div>
      {/if}
    </aside>

    <div class="studio-content">
      <header class="studio-top-bar">
        <a class="studio-mobile-brand studio-brand" href={resolve("/")}><span class="studio-brand-mark" aria-hidden="true">♪</span> swing moves<span class="studio-brand-dot">.</span></a>
        <span class="studio-top-bar-label">{labels.library}</span>
        <div class="studio-actions">
          <button onclick={toggleDarkMode} class="studio-action" aria-label={labels.darkMode} title={labels.darkMode}>{$darkMode ? "☀" : "☾"}</button>
          {#if $isAdmin}
            <a href={resolve("/settings")} class="studio-action" aria-label={labels.settings} title={labels.settings}>⚙</a>
            <button onclick={handleLogout} class="studio-action" aria-label={labels.logout} title={labels.logout}>↪</button>
          {:else}
            <a href={resolve("/login")} class="studio-action" aria-label={labels.login} title={labels.login}>↪</a>
          {/if}
        </div>
      </header>

      <main class="studio-main">
        {#if $isAdmin || isLoginPage}
          {@render children()}
        {:else if !$isLoading}
          <div class="text-center py-24">
            <span class="text-4xl">🕺</span>
            <p class="text-gray-400 dark:text-gray-500 mt-4 mb-5">{t("sign_in_prompt")}</p>
            <a href={resolve("/login")} class="inline-flex px-5 py-2.5 bg-green-700 text-white rounded-xl font-medium text-sm">{t("sign_in")}</a>
          </div>
        {/if}
      </main>
    </div>

    {#if $isAdmin && !isLoginPage}
      <nav class="studio-mobile-nav" aria-label={labels.navigation}>
        {#each translatedNavigation as item}
          <a href={resolve(item.path)} class:current={isCurrent(item.path)} aria-current={isCurrent(item.path) ? "page" : undefined}>
            <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
          </a>
        {/each}
      </nav>
    {/if}
  </div>
{/if}

<Toast />
