# Improvements – Swing Dance Moves PWA

Empfohlene Verbesserungen, priorisiert nach Wichtigkeit.
Stand: März 2026

---

## ✅ Bereits implementiert

- **Sortierung der Moves** – Sortier-Dropdown (a-z, z-a, newest, oldest) in der Toolbar mit `localStorage`-Persistierung.
- **Fisher-Yates Shuffle** – Korrekte gleichmäßige Verteilung in `getRandomMoves()`.
- **User Settings** – Settings-Seite mit konfigurierbarer Sprache (de/en) und Anzahl Random Moves (1–5), gespeichert in `user_settings`-Tabelle in Supabase.
- **Login-Seite** – `autocomplete`-Attribute, Passwort-Sichtbarkeit-Toggle, Passwort-Vergessen-Link.
- **Export/Import** – Moves als JSON/CSV exportieren und importieren mit Deduplizierung.
- **Cancel-Links mit base path** – MoveForm und VideoForm nutzen `{base}/` für GitHub Pages.
- **Tags-Verwaltung** – Eigene Seite (Tab) mit CRUD für Tag-Typen und Tags inkl. Farbauswahl.
- **HTML-Sanitization** – DOMPurify in `MoveCard.svelte` mit expliziter Allow-List.
- **Null-Safety** – Optional Chaining in `searchMoves()` und `searchVideos()`.
- **Typen korrigiert** – `Move.synonyms`, `Move.description`, `Video.description` auf `string | null` geändert.
- **Auth State Cleanup** – `onAuthStateChange`-Subscription wird in `onMount`-Cleanup aufgeräumt.
- **deleteMove Video-Referenzen** – `moves_to_videos`-Einträge werden vor Move-Löschung entfernt.
- **Supabase-Client Fehler-UI** – Bei fehlenden Credentials wird eine Error-Seite mit Konfigurationsanleitung angezeigt.
- **Toast-Benachrichtigungen** – Globale Toast-Komponente für alle CRUD-Operationen.
- **Skeleton Loading** – Animierte Platzhalter-Karten statt Spinner beim Laden.
- **Error-UI mit Retry** – Bei `loadData()`-Fehlern wird eine Error-Seite mit Retry-Button angezeigt.
- **Move löschen in MoveCard** – Direkter Lösch-Button mit Bestätigungsdialog in der aufgeklappten Karte.
- **Null-Werte in Edit-Formularen** – `synonyms ?? ''` und `description ?? ''` in Edit-Seiten für Moves und Videos.
- **Svelte-5-Syntax in ConfirmModal** – `onkeydown` statt veralteter `on:keydown`-Syntax, `$props()` statt `createEventDispatcher`.
- **Fehler beim Video-Löschen wird angezeigt** – Toast-Benachrichtigung im catch-Block von `VideoCard.handleDelete`.
- **Route-Parameter Validierung** – `isNaN()`-Prüfung mit Toast-Fehlermeldung und Redirect bei ungültigen IDs.
- **Konfigurierbarer Random-Count** – Anzahl Random Moves wird aus `userSettings.random_moves_count` gelesen (Fallback: 2).
- **SvelteKit Error Page** – `+error.svelte` mit Status-Anzeige, Fehlermeldung, Reload-Button und Home-Link.
- **"Out of moves!" Tab** – Eigener Tab mit zufälligen Moves, kompakter mobiler Toolbar (Filter + Shuffle), Tag-Filter, Video-Only-Filter.
- **i18n-System** – Vollständiges Übersetzungssystem mit de/en Dictionary und `t()`-Funktion, gesteuert über User Settings.
- **VideoCard Löschung über Service Layer** – `handleDelete` in VideoCard nutzt `deleteVideo()` aus dem Service.
- **`$derived.by` in Videos-Seite** – `displayVideos` korrigiert von `$derived(() => ...)` zu `$derived.by(() => ...)`, Template-Zugriffe ohne `()`.
- **Service Layer für toggle()** – `toggle()` in VideoCard und MoveCard nutzt nun `getLinkedMovesForVideo()` und `getVideoRefsForMove()` aus dem Service Layer statt direkter Supabase-Queries.
- **Unbenutzter `showAll` Store entfernt** – Toter Code `showAll` aus `stores.ts` entfernt.
- **Unbenutzter `onMount` Import entfernt** – Ungenutzter `import { onMount }` aus `MoveForm.svelte` entfernt.
- **`handleMoveDeleted` optimiert** – Nach Move-Löschung wird nur noch `getAllMoves()` aufgerufen statt auch Tags und Videos neu zu laden. Ungenutzte Imports entfernt.
- **Dynamisches `lang`-Attribut** – `document.documentElement.lang` wird in `+layout.svelte` per `$effect` reaktiv basierend auf `userSettings.language` gesetzt.
- **Dropbox-Startzeit für Move-Referenzen** – Bei Dropbox-Videos in `MoveCard.svelte` wird `start_time` beim Laden via HTML5-Video-`currentTime` angewendet.
- **Dropbox-Endzeit für Move-Referenzen** – Bei gesetzter `end_time` pausieren Dropbox-Videos in `MoveCard.svelte` automatisch am Endzeitpunkt.
- **Type-Check stabilisiert** – `npm run check` läuft wieder ohne Errors (aktuell: **0 Errors**, nur verbleibende A11y-Warnings in `tags/+page.svelte`).

---

## 🔴 Hoch – Bugs & Code-Qualität

(Keine offenen Items)

---

## 🟡 Mittel – UX & Funktionalität

### 1. Favoriten / Persönliche Lesezeichen
Moves als Favorit markieren, damit man seine meistgenutzten Moves schnell findet.
- **Lösung:** Favoriten in `localStorage` speichern, Stern-Icon auf MoveCard, Filter für Favoriten.

### 2. Share-Button für einzelne Moves
Einen Move direkt teilen (URL, WhatsApp, Copy-to-Clipboard).
- **Lösung:** Web Share API oder Copy-to-Clipboard-Link auf MoveCard.

### 3. Keyboard Shortcuts
Keine Tastaturkürzel vorhanden.
- `/` → Suche fokussieren
- `r` → Random Moves shufflen
- `Esc` → Filter/Dropdown schließen

### 4. Input-Validierung in MoveForm/VideoForm
Name-Feld hat nur `required`, aber keine Mindestlängen-Validierung. YouTube-URL wird nicht validiert.
- Name: mindestens 2 Zeichen (`minlength`)
- YouTube-URL: Validierung via `extractYouTubeId()` mit Fehlermeldung
- YouTube-Vorschau beim Erstellen/Bearbeiten anzeigen

### 5. Export-Dropdown: Escape zum Schließen
Das Export/Import-Menü nutzt einen unsichtbaren Backdrop-Button zum Schließen, reagiert aber nicht auf Escape-Taste.
- **Datei:** `routes/+page.svelte`
- **Lösung:** Keydown-Listener für Escape hinzufügen.

### 6. Praxis-Modus mit Timer
Timer-basierter Modus im "Out of moves!"-Tab: alle X Sekunden einen neuen zufälligen Move anzeigen — ideal zum Üben.
- **Lösung:** Timer-Button in der Random-Toolbar mit einstellbarer Sekunden-Zahl. Könnte `userSettings` für Interval nutzen.

---

## 🟢 Mittel – Accessibility (a11y)

### 7. ARIA-Attribute ergänzen
- `aria-expanded` auf MoveCard/VideoCard Toggle-Buttons
- `aria-pressed` auf FilterChips-Buttons
- `aria-label` auf Icon-only-Buttons (Dark Mode, Logout, Export, Shuffle)
- `aria-hidden="true"` auf dekorativen SVG-Icons
- `aria-live="polite"` Region für Move-Count, Suchergebnisse und Random-Moves-Bereich

### 8. Skip-to-Content Link
Fehlender „Skip to main content"-Link in `+layout.svelte` für Keyboard-Navigation.

### 9. Focus-Visible Styling
Inputs haben `focus:ring-2`, aber Buttons und Links haben keine expliziten Focus-Styles.
- **Lösung:** `focus-visible:ring-2 focus-visible:ring-blue-500` global auf interaktive Elemente in `app.css`.

### 10. Prefers-Reduced-Motion
Animationen (Card-Hover-Transition, Filter-Panel-Slide, Toast-Slide) werden nicht deaktiviert für User mit Motion-Sensitivity.
- **Lösung:** `@media (prefers-reduced-motion: reduce)` in `app.css` mit `transition: none` und `animation: none`.

### 11. Interaktive Elemente verschachtelt
In `MoveCard.svelte` und `VideoCard.svelte` befindet sich der Edit-Link `<a>` innerhalb des Toggle-`<button>`. Interaktive Elemente in interaktiven Elementen sind ein A11y-Antipattern.
- **Lösung:** Edit-Link außerhalb des Buttons platzieren, z.B. in einer separaten Action-Bar.

### 12. ConfirmModal: role, aria-modal, Focus-Trap
Das Modal hat weder `role="dialog"`, `aria-modal="true"` noch `aria-labelledby`. Kein Focus-Trapping — Tab navigiert hinter das Modal. Focus wird nicht automatisch ins Modal gesetzt.
- **Datei:** `lib/components/ConfirmModal.svelte`
- **Lösung:** ARIA-Attribute ergänzen, Focus-Trap implementieren, Focus beim Öffnen auf Cancel-Button setzen.

---

## 🔵 Mittel – Performance

### 13. Supabase-Queries optimieren
`getAllMoves()` macht **4 separate Queries** (moves, moves_to_tags, tags mit tag_types, moves_to_videos). Ein einziger Join-Query wäre effizienter:
```ts
supabase.from('moves').select('*, moves_to_tags(*, tags(*, tag_types(*))), moves_to_videos(*)')
```

### 14. YouTube Lazy Loading
YouTube iFrames in `MoveCard.svelte` und `VideoCard.svelte` haben kein `loading="lazy"` Attribut.
- **Lösung:** `loading="lazy"` auf iFrames setzen oder [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed) verwenden.

### 15. Doppelter API-Call in Tags-Seite
`reloadAll()` in `tags/+page.svelte` ruft `loadGroups()` → `getAllTagsGrouped()` auf und danach **nochmal** `getAllTagsGrouped()` für den Store-Update.
- **Lösung:** Ergebnis aus `loadGroups()` direkt für den Store-Update verwenden.

### 16. Kein Caching / Invalidation-Strategie
Nach jeder Mutation (Create/Update/Delete) werden **alle Moves komplett neu geladen** (`getAllMoves()`).
- **Lösung:** Optimistische Updates oder selektives Invalidieren statt komplettes Neuladen.

### 17. Pagination / Virtual Scrolling
Bei vielen Moves werden alle gleichzeitig gerendert. Bei 100+ Moves leidet die Performance.
- **Lösung:** Virtual Scrolling (z.B. `svelte-virtual-list`) oder einfache Pagination.

---

## ⚪ Niedrig – Nice-to-Have & Code-Qualität

### 18. Doppelter Video-Badge-Code in MoveCard
Der Video-Badge HTML-Code in `MoveCard.svelte` ist zweimal nahezu identisch (einmal mit Tags, einmal ohne Tags).
- **Lösung:** In ein Svelte-Snippet `{#snippet videoBadge()}` oder eine separate Komponente auslagern.

### 19. Duplizierte Delete-Patterns
Delete-Logik (State, Handler, ConfirmModal) ist in 4 Dateien nahezu identisch: MoveCard, VideoCard, edit/[id], videos/edit/[id].
- **Lösung:** In einen wiederverwendbaren Composable oder eine Wrapper-Komponente auslagern.

### 20. System-Dark-Mode Listener
`initDarkMode()` liest die System-Präferenz nur einmal. Wenn der User sein System auf Dark/Light umstellt, reagiert die App nicht.
- **Lösung:** `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`.

### 21. Supabase-Typen bereinigen
Mehrfach `as any`-Casts und `@ts-expect-error` in `tags.ts` und `moves.ts` deuten auf fehlerhafte `Database`-Typdefinitionen hin.
- **Lösung:** Typen in `types.ts` mit `supabase gen types` neu generieren oder manuell korrigieren.

### 22. Inkonsistente Fehlerbehandlung
Manche Stellen werfen Fehler weiter (`throw error`), manche loggen nur (`console.error`), manche zeigen eine Fehlermeldung. Kein einheitliches Pattern.
- **Lösung:** Konsistentes Error-Handling einführen: Service-Layer wirft, UI-Layer zeigt Toast.

### 23. CI/CD verbessern
- `npm run check` (Svelte-Check + TypeScript) in den Build-Workflow einbauen
- Lighthouse CI für Performance-Monitoring

### 24. Tests einführen
Aktuell gibt es keine Tests.
- **Vitest** für Unit-Tests (`searchMoves`, `extractYouTubeId`, `debounce`, `getRandomMoves`)
- **@testing-library/svelte** für Component-Tests
- **Playwright** für E2E (Login, CRUD, Filter, Random-Tab)

### 25. Move-Beziehungen
Variationen und Voraussetzungen zwischen Moves verknüpfen (z.B. „Swingout → Swingout-Variation").
- **Lösung:** `move_relations`-Tabelle in Supabase mit `parent_id`, `child_id`, `relation_type`.

### 26. Offline-Support für PWA
Die App hat `manifest.webmanifest` und Service Worker, aber kein echtes Offline-Caching der Supabase-Daten.
- **Lösung:** Daten in IndexedDB oder Cache API zwischenspeichern, Sync bei Reconnect.

### 27. Swipe-Gesten im Random-Tab
Im "Out of moves!"-Tab per Swipe zum nächsten Random Move wechseln — natürlichere Mobile-UX.
- **Lösung:** Touch-Event-Handler oder Bibliothek wie `svelte-gestures` für Swipe-Erkennung.

---

## Zusammenfassung

| Priorität | Anzahl | Fokus |
|---|---|---|
| 🔴 Hoch | 0 | — |
| 🟡 Mittel (UX) | 6 | User Experience, Funktionalität |
| 🟢 Mittel (a11y) | 6 | Barrierefreiheit |
| 🔵 Mittel (Perf) | 5 | Performance-Optimierung |
| ⚪ Niedrig | 10 | Code-Qualität, Nice-to-Have |
| **Gesamt** | **27** | |
