<script lang="ts">
  interface Props {
    /** Number of skeleton cards to show */
    count?: number;
    /** Variant: 'move' shows tag placeholders, 'video' shows a wider layout */
    variant?: "move" | "video";
  }

  let { count = 4, variant = "move" }: Props = $props();
</script>

<div class="flex flex-col gap-3">
  {#each Array(count) as _, i}
    <div
      class="rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-pulse"
    >
      <div class="px-5 py-4">
        <!-- Title line -->
        <div class="flex items-center gap-3">
          <div
            class="h-4 rounded-md bg-gray-200 dark:bg-gray-700"
            style="width: {50 + ((i * 37) % 30)}%"
          ></div>
          {#if variant === "move"}
            <div
              class="h-3.5 rounded-md bg-gray-100 dark:bg-gray-700/60"
              style="width: {15 + ((i * 23) % 15)}%"
            ></div>
          {/if}
        </div>

        <!-- Tags / subtitle -->
        {#if variant === "move"}
          <div class="flex flex-wrap gap-1.5 mt-3">
            {#each Array(1 + (i % 3)) as _}
              <div
                class="h-5 w-14 rounded-full bg-gray-100 dark:bg-gray-700/50"
              ></div>
            {/each}
          </div>
        {:else}
          <div class="mt-2">
            <div class="h-3 w-3/4 rounded-md bg-gray-100 dark:bg-gray-700/50"></div>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
