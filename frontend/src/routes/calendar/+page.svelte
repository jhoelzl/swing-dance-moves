<script lang="ts">
  import { onMount } from "svelte";
  import { activeTab, allMoves, allSessions } from "$lib/stores";
  import { getLang, t } from "$lib/i18n";
  import type { Move, Session } from "$lib/types";

  type CalendarEntry = {
    type: "session" | "learned";
    id: number;
    label: string;
  };

  type DayCell = {
    iso: string;
    date: Date;
    inMonth: boolean;
    isToday: boolean;
    sessionCount: number;
    learnedCount: number;
  };

  let currentMonth = $state(startOfMonth(new Date()));
  let selectedDate = $state(toIsoDate(new Date()));

  onMount(() => {
    activeTab.set("calendar");
  });

  const locale = $derived(getLang() === "de" ? "de-DE" : "en-US");

  const entriesByDate = $derived.by(() => {
    const map = new Map<string, CalendarEntry[]>();

    for (const session of $allSessions) {
      const key = session.session_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        type: "session",
        id: session.session_id,
        label: session.name,
      });
    }

    for (const move of $allMoves) {
      if (!move.learned_on) continue;
      const key = move.learned_on;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        type: "learned",
        id: move.move_id,
        label: move.name,
      });
    }

    return map;
  });

  const monthLabel = $derived(
    new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(currentMonth),
  );

  const weekdayLabels = $derived(getWeekdayLabels(locale));

  const dayCells = $derived.by(() => {
    const start = startOfCalendarGrid(currentMonth);
    const cells: DayCell[] = [];

    for (let i = 0; i < 42; i += 1) {
      const date = addDays(start, i);
      const iso = toIsoDate(date);
      const entries = entriesByDate.get(iso) ?? [];
      const sessionCount = entries.filter((e) => e.type === "session").length;
      const learnedCount = entries.filter((e) => e.type === "learned").length;

      cells.push({
        iso,
        date,
        inMonth: date.getMonth() === currentMonth.getMonth(),
        isToday: iso === toIsoDate(new Date()),
        sessionCount,
        learnedCount,
      });
    }

    return cells;
  });

  const selectedEntries = $derived(entriesByDate.get(selectedDate) ?? []);
  const selectedDateLabel = $derived(
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(fromIsoDate(selectedDate)),
  );

  function toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function fromIsoDate(iso: string): Date {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function addDays(date: Date, amount: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
  }

  function startOfCalendarGrid(monthDate: Date): Date {
    const first = startOfMonth(monthDate);
    const weekday = first.getDay(); // 0 = Sunday
    const offsetFromMonday = (weekday + 6) % 7;
    return addDays(first, -offsetFromMonday);
  }

  function getWeekdayLabels(currentLocale: string): string[] {
    const base = new Date(2026, 0, 5); // Monday
    return Array.from({ length: 7 }, (_, idx) =>
      new Intl.DateTimeFormat(currentLocale, { weekday: "short" }).format(
        addDays(base, idx),
      ),
    );
  }

  function previousMonth() {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
    );
  }

  function nextMonth() {
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
  }

  function goToToday() {
    const today = new Date();
    currentMonth = startOfMonth(today);
    selectedDate = toIsoDate(today);
  }
</script>

<svelte:head>
  <title>Calendar – Swing Dance Moves</title>
</svelte:head>

<div class="space-y-5">
  <div class="flex items-center justify-between gap-3 flex-wrap">
    <div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        {t("calendar_title")}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {t("calendar_subtitle")}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button
        onclick={previousMonth}
        class="px-3 py-2 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        title={t("calendar_prev_month")}
      >
        ←
      </button>
      <button
        onclick={goToToday}
        class="px-3 py-2 rounded-xl text-sm bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
      >
        {t("calendar_today")}
      </button>
      <button
        onclick={nextMonth}
        class="px-3 py-2 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        title={t("calendar_next_month")}
      >
        →
      </button>
    </div>
  </div>

  <div
    class="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-center font-semibold text-gray-800 dark:text-gray-200"
    >
      {monthLabel}
    </div>

    <div class="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
      {#each weekdayLabels as label}
        <div
          class="px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-center"
        >
          {label}
        </div>
      {/each}
    </div>

    <div class="grid grid-cols-7">
      {#each dayCells as cell}
        <button
          onclick={() => (selectedDate = cell.iso)}
          class="min-h-[88px] px-2 py-1.5 text-left border-r border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer
          {cell.inMonth
            ? 'bg-white dark:bg-gray-900'
            : 'bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-600'}
          {selectedDate === cell.iso
            ? 'ring-2 ring-blue-500/40 ring-inset'
            : 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20'}"
        >
          <div
            class="text-xs font-medium {cell.isToday
              ? 'text-blue-600 dark:text-blue-400'
              : cell.inMonth
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-600'}"
          >
            {cell.date.getDate()}
          </div>

          {#if cell.sessionCount > 0 || cell.learnedCount > 0}
            <div class="mt-1.5 space-y-1">
              {#if cell.sessionCount > 0}
                <div
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                >
                  {t("calendar_sessions")}: {cell.sessionCount}
                </div>
              {/if}
              {#if cell.learnedCount > 0}
                <div
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                >
                  {t("calendar_learned_moves")}: {cell.learnedCount}
                </div>
              {/if}
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <div
    class="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4"
  >
    <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
      {selectedDateLabel}
    </h3>

    {#if selectedEntries.length === 0}
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {t("calendar_no_events")}
      </p>
    {:else}
      <div class="space-y-2">
        {#each selectedEntries as entry}
          <div
            class="rounded-xl border px-3 py-2 text-sm
            {entry.type === 'session'
              ? 'bg-green-50/95 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-amber-50/95 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'}"
          >
            <span class="font-semibold mr-1">
              {entry.type === "session"
                ? t("calendar_sessions")
                : t("calendar_learned_moves")}:
            </span>
            <span>{entry.label}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
