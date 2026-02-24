<script lang="ts">
  import { t } from "$lib/i18n";

  interface Props {
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onconfirm: () => void;
    oncancel: () => void;
  }

  let {
    open,
    title = t("confirmation"),
    message,
    confirmLabel = t("delete"),
    cancelLabel = t("cancel"),
    onconfirm,
    oncancel,
  }: Props = $props();

  /**
   * Handle keyboard events: Escape to cancel, Enter to confirm
   */
  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      oncancel();
    }
  }

  /**
   * Close modal when clicking the backdrop
   */
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      oncancel();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onclick={handleBackdropClick}
  >
    <!-- Modal -->
    <div
      class="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden animate-modal-in"
    >
      <!-- Header -->
      <div class="px-6 pt-6 pb-2">
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50"
          >
            <svg
              class="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-4">
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {message}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 px-6 pb-6 pt-2">
        <button
          onclick={oncancel}
          class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
        >
          {cancelLabel}
        </button>
        <button
          onclick={onconfirm}
          class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes modal-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .animate-modal-in {
    animation: modal-in 0.15s ease-out;
  }
</style>
