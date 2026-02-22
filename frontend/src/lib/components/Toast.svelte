<script lang="ts">
  import { toasts, removeToast } from "$lib/stores";
</script>

{#if $toasts.length > 0}
  <div
    class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 pointer-events-none"
  >
    {#each $toasts as toast (toast.id)}
      <div
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium backdrop-blur-sm animate-slide-in
          {toast.type === 'success'
          ? 'bg-green-50/95 dark:bg-green-950/95 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
          : toast.type === 'error'
            ? 'bg-red-50/95 dark:bg-red-950/95 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            : 'bg-blue-50/95 dark:bg-blue-950/95 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'}"
      >
        <!-- Icon -->
        {#if toast.type === "success"}
          <svg
            class="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        {:else if toast.type === "error"}
          <svg
            class="w-5 h-5 shrink-0"
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
        {:else}
          <svg
            class="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        {/if}

        <span>{toast.text}</span>

        <!-- Close button -->
        <button
          onclick={() => removeToast(toast.id)}
          class="ml-1 p-0.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
      </div>
    {/each}
  </div>
{/if}

<style>
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(1rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-slide-in {
    animation: slide-in 0.25s ease-out;
  }
</style>
