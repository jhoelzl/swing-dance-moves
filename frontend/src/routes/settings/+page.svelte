<script lang="ts">
  import { onMount } from "svelte";
  import { userSettings, activeTab, addToast } from "$lib/stores";
  import { getUserSettings, updateUserSettings } from "$lib/services/settings";
  import { exportAllData } from "$lib/services/exportImport";
  import type { UserSettings } from "$lib/types";
  import { t } from "$lib/i18n";

  let language = $state<"de" | "en">("de");
  let randomMovesCount = $state(2);
  let isSaving = $state(false);
  let isExporting = $state(false);

  onMount(() => {
    activeTab.set("settings");

    // Initialize form from store
    if ($userSettings) {
      language = $userSettings.language;
      randomMovesCount = $userSettings.random_moves_count;
    }
  });

  async function handleSave() {
    isSaving = true;
    try {
      const updated = await updateUserSettings({
        language,
        random_moves_count: randomMovesCount,
      });
      userSettings.set(updated);
      addToast(t("settings_saved"), "success");
    } catch (err) {
      console.error("Failed to save settings:", err);
      addToast(t("settings_save_failed"), "error");
    } finally {
      isSaving = false;
    }
  }

  async function handleExportAll() {
    isExporting = true;
    try {
      await exportAllData();
      addToast(t("export_success"), "success");
    } catch (err) {
      console.error("Failed to export data:", err);
      addToast(t("export_failed"), "error");
    } finally {
      isExporting = false;
    }
  }
</script>

<svelte:head>
  <title>Settings – Swing Dance Moves</title>
</svelte:head>

<div class="max-w-lg mx-auto">
  <h2
    class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
  >
    <svg
      class="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
    {t("settings")}
  </h2>

  <div class="space-y-6">
    <!-- Language Setting -->
    <div
      class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5"
    >
      <label
        for="language"
        class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
      >
        {t("language")}
      </label>
      <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">
        {t("language_desc")}
      </p>
      <select
        id="language"
        bind:value={language}
        class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        <option value="de">🇩🇪 Deutsch</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>

    <!-- Random Moves Count Setting -->
    <div
      class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5"
    >
      <label
        for="randomMovesCount"
        class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
      >
        {t("random_moves_count")}
      </label>
      <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">
        {t("random_moves_desc")}
      </p>
      <select
        id="randomMovesCount"
        bind:value={randomMovesCount}
        class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        {#each [1, 2, 3, 4, 5] as n}
          <option value={n}>{n}</option>
        {/each}
      </select>
    </div>

    <!-- Export Data -->
    <div
      class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5"
    >
      <h3
        class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
      >
        {t("export_all_data")}
      </h3>
      <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">
        {t("export_all_desc")}
      </p>
      <button
        onclick={handleExportAll}
        disabled={isExporting}
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isExporting}
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
          {t("exporting")}
        {:else}
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {t("export_all_data")}
        {/if}
      </button>
    </div>
  </div>

  <!-- Save Button -->
  <div class="mt-8">
    <button
      onclick={handleSave}
      disabled={isSaving}
      class="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {#if isSaving}
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
      {/if}
      {t("save")}
    </button>
  </div>
</div>
