<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { allMoves, allVideos, isLoading, tagGroups, tagDisplayOrder, addToast } from "#lib/stores.js";
  import { buildFestivalOverviews, festivalSelectionUrl, selectFestival } from "#lib/festivals.js";
  import { sortMoveTags } from "#lib/services/moves.js";
  import { getAllVideoMoveLinks, type VideoMoveLink } from "#lib/services/videos.js";
  import TagBadge from "#lib/components/TagBadge.svelte";
  import FestivalClassCard from "#lib/components/FestivalClassCard.svelte";
  import SkeletonCard from "#lib/components/SkeletonCard.svelte";
  import LoadError from "#lib/components/LoadError.svelte";
  import { groupTimelineMoves } from "#lib/videoTimeline.js";
  import { t } from "#lib/i18n.js";

  let links = $state<VideoMoveLink[]>([]);
  let linksError = $state(false);
  const festivals = $derived(buildFestivalOverviews($tagGroups, $allMoves, $allVideos, links));
  const videoMoves = $derived(groupTimelineMoves(links, $allMoves));
  const selected = $derived(selectFestival(festivals, page.url.searchParams.get("festival")));

  async function changeFestival(event: Event) {
    const select = event.currentTarget as HTMLSelectElement;
    try {
      await goto(festivalSelectionUrl(page.url.href, select.value), { reset: false });
    } catch (error) {
      console.error("Failed to select festival:", error);
      select.value = selected ? String(selected.festival.tag_id) : "";
      addToast(t("festival_selection_failed"), "error");
    }
  }

  async function loadLinks() {
    linksError = false;
    try {
      links = await getAllVideoMoveLinks();
    } catch (error) {
      console.error("Failed to load video-move links:", error);
      linksError = true;
    }
  }

  onMount(() => { void loadLinks(); });
</script>

<svelte:head>
  <title>Festivals – Swing Dance Moves</title>
</svelte:head>

<div class="studio-section-heading">
  <h1>{t("nav_festivals")}</h1>
  <p>{t("festival_intro")}</p>
</div>

{#if $isLoading}
  <div role="status" aria-label={t("festival_loading")}><SkeletonCard count={3} variant="video" /></div>
{:else if !festivals.length}
  <p class="text-sm text-gray-500 dark:text-gray-400">{t("festival_none")}</p>
{:else}
  {#if linksError}
    <div class="mb-5"><LoadError message={t("video_links_load_failed")} retry={loadLinks} /></div>
  {/if}
  <label for="festival-select" class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{t("festival_select")}</label>
  <select id="festival-select" value={selected ? String(selected.festival.tag_id) : ""} onchange={changeFestival} class="w-full sm:max-w-sm px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
    {#if !selected}<option value="" disabled>{t("festival_select")}</option>{/if}
    {#each festivals as item (item.festival.tag_id)}
      <option value={String(item.festival.tag_id)}>{item.festival.tag_name}</option>
    {/each}
  </select>

  {#if !selected}
    <p role="alert" class="mt-4 text-sm text-amber-700 dark:text-amber-400">{t("festival_not_found")}</p>
  {:else}
  <div class="mt-6 mb-5">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">{selected.festival.tag_name}</h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{selected.classes.length} {t("festival_classes")}</p>
    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{t("festival_inferred")}</p>
    <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
      <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-1"></span>{t("timeline_assigned")}</span>
      <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-red-400 mr-1"></span>{t("timeline_unassigned")}</span>
    </div>
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("timeline_explanation")}</p>
  </div>

  <div class="space-y-4">
    {#each selected.classes as festivalClass (festivalClass.video.video_id)}
      <FestivalClassCard video={festivalClass.video} moves={festivalClass.moves} teachers={festivalClass.teachers} timelineMoves={videoMoves[festivalClass.video.video_id] ?? []} />
    {:else}
      <p class="text-sm text-gray-500 dark:text-gray-400">{t("festival_no_classes")}</p>
    {/each}
  </div>

  {#if selected.unassignedMoves.length}
    <section class="mt-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
      <h3 class="font-semibold text-gray-900 dark:text-white">{t("festival_other_moves")}</h3>
      <ul class="mt-3 space-y-3">
        {#each selected.unassignedMoves as move (move.move_id)}
          <li>
            <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">{move.name}</span>
            <div class="flex flex-wrap gap-1.5 mt-1">
              {#each sortMoveTags(move.tags ?? [], $tagDisplayOrder) as tag (tag.tag_id)}<TagBadge {tag} small />{/each}
            </div>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
  {/if}
{/if}
