<script lang="ts">
  import type { Tag } from "$lib/types";
  import { getTagColors } from "$lib/utils";

  interface Props {
    tag: Tag;
    small?: boolean;
  }

  let { tag, small = false }: Props = $props();

  const colors = $derived(getTagColors(tag.tag_label));
</script>

<span
  class="{colors.bg} {colors.text} border {colors.border} inline-flex items-center rounded-full font-medium
	{small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}"
>
  {tag.tag_name.trim()}
</span>
