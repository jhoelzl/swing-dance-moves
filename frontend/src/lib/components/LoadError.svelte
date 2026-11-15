<script lang="ts">
  import { t } from "#lib/i18n.js";

  interface Props {
    message: string;
    retry: () => void;
  }

  let { message, retry }: Props = $props();
</script>

<div role="alert" class="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
  <p>{message}</p>
  <button type="button" onclick={retry} class="mt-2 min-h-11 rounded-lg px-2 font-semibold underline cursor-pointer">{t("try_again")}</button>
</div>
