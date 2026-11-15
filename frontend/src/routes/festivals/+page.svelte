<script lang="ts">
  import { onMount } from "svelte";
  import { allMoves, allVideos, isLoading, tagGroups, tagDisplayOrder } from "#lib/stores.js";
  import { buildFestivalOverviews } from "#lib/festivals.js";
  import { sortMoveTags } from "#lib/services/moves.js";
  import { getAllVideoMoveLinks, type VideoMoveLink } from "#lib/services/videos.js";
  import TagBadge from "#lib/components/TagBadge.svelte";
  import FestivalClassCard from "#lib/components/FestivalClassCard.svelte";
  import { groupTimelineMoves } from "#lib/videoTimeline.js";
  import { t } from "#lib/i18n.js";

  let links = $state<VideoMoveLink[]>([]);
  let linksLoading = $state(true);
  let linksError = $state(false);
  let selectedId = $state("");
  const festivals = $derived(buildFestivalOverviews($tagGroups, $allMoves, $allVideos, links));
  const videoMoves = $derived(groupTimelineMoves(links, $allMoves));
  const selected = $derived(festivals.find((item) => String(item.festival.tag_id) === selectedId) ?? festivals[0]);

  async function loadLinks() {
    linksLoading = true;
    linksError = false;
    try {
      links = await getAllVideoMoveLinks();
    } catch (error) {
      console.error("Failed to load video-move links:", error);
      linksError = true;
    } finally {
      linksLoading = false;
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

{#if $isLoading || linksLoading}
  <p class="text-sm text-gray-500">{t("festival_loading")}</p>
{:else if linksError}
  <div role="alert" class="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
    <p>{t("video_links_load_failed")}</p>
    <button class="mt-2 underline cursor-pointer" onclick={loadLinks}>{t("try_again")}</button>
  </div>
{:else if !selected}
  <p class="text-sm text-gray-500 dark:text-gray-400">{t("festival_none")}</p>
{:else}
  <label for="festival-select" class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{t("festival_select")}</label>
  <select id="festival-select" value={String(selected.festival.tag_id)} onchange={(event) => selectedId = event.currentTarget.value} class="w-full sm:max-w-sm px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
    {#each festivals as item (item.festival.tag_id)}
      <option value={String(item.festival.tag_id)}>{item.festival.tag_name}</option>
    {/each}
  </select>

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

  {#if selected.ambiguousVideos.length}
    <div role="status" class="mb-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200">
      <p>{t("festival_ambiguous")}</p>
      <ul class="mt-2 list-disc pl-5">
        {#each selected.ambiguousVideos as video (video.video_id)}
          <li><a href={video.url} target="_blank" rel="noopener noreferrer" class="underline">{video.title}</a></li>
        {/each}
      </ul>
    </div>
  {/if}

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
