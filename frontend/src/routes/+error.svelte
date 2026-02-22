<script lang="ts">
  import { page } from "$app/stores";
  import { base } from "$app/paths";
</script>

<div class="min-h-[60vh] flex items-center justify-center p-6">
  <div
    class="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 p-8 text-center"
  >
    <div class="text-5xl mb-4">😵</div>
    <h1 class="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
      {$page.status} – {$page.status === 404
        ? "Page not found"
        : "Something went wrong"}
    </h1>
    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">
      {#if $page.status === 404}
        The requested page does not exist or has been moved.
      {:else}
        An unexpected error occurred. Please try again.
      {/if}
    </p>
    {#if $page.error?.message}
      <p
        class="text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 mb-5"
      >
        {$page.error.message}
      </p>
    {/if}
    <div class="flex items-center justify-center gap-3">
      <button
        onclick={() => window.location.reload()}
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
        Try Again
      </button>
      <a
        href="{base}/"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
          />
        </svg>
        Go to Home
      </a>
    </div>
  </div>
</div>
