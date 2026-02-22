# Improvements – Swing Dance Moves PWA

Empfohlene Verbesserungen, priorisiert nach Wichtigkeit.
Stand: Februar 2026

---

## ✅ Bereits implementiert

- **Sortierung der Moves** – Sortier-Dropdown (a-z, z-a, newest, oldest) in der Toolbar mit `localStorage`-Persistierung.
- **Fisher-Yates Shuffle** – Korrekte gleichmäßige Verteilung in `getRandomMoves()`.
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

---

## 🔴 Hoch – Bugs & Sicherheit

### 1. Null-Werte in Edit-Formularen
`move.synonyms` und `move.description` sind `string | null`, aber `MoveFormData.synonyms/description` erwarten `string`. Bei `null`-Werten aus der DB wird `null` an Formularfelder übergeben → zeigt "null" als Text oder wirft Fehler.
- **Dateien:** `routes/edit/[id]/+page.svelte`, `routes/videos/edit/[id]/+page.svelte`
- **Lösung:** `synonyms: move.synonyms ?? ''`, `description: move.description ?? ''` verwenden.

### 2. `$derived` statt `$derived.by` in Videos-Seite
`displayVideos` verwendet `$derived(() => { ... })`, was eine **Funktion als Wert** ergibt statt das Ergebnis. Die Funktion wird bei jedem Template-Zugriff (`displayVideos().length`, `{#each displayVideos()}`) erneut ausgewertet — dreifache Berechnung pro Render.
- **Datei:** `routes/videos/+page.svelte`
- **Lösung:** `$derived.by(() => { ... })` verwenden, Template-Zugriffe auf `displayVideos` ohne `()`.

### 3. Svelte-4-Syntax in ConfirmModal
`<svelte:window on:keydown={handleKeydown} />` nutzt die veraltete `on:`-Syntax. Funktioniert in Svelte 5, wird aber in Svelte 6 entfernt.
- **Datei:** `lib/components/ConfirmModal.svelte`
- **Lösung:** `<svelte:window onkeydown={handleKeydown} />` verwenden.

### 4. VideoCard umgeht den Service Layer beim Löschen
`VideoCard.handleDelete` löscht direkt via `supabase.from(...)` statt über `deleteVideo()` aus dem Service. Wenn Lösch-Logik erweitert wird (z.B. Logging, zusätzliche Cascade-Deletes), greift das nicht.
- **Datei:** `lib/components/VideoCard.svelte`
- **Lösung:** `import { deleteVideo } from '$lib/services/videos'` verwenden.

### 5. MoveCard lädt Video-Daten direkt über Supabase
Direkte Supabase-Queries in der Komponente statt über den Service Layer. Verstößt gegen Separation of Concerns.
- **Datei:** `lib/components/MoveCard.svelte`
- **Lösung:** In eine Service-Funktion `getVideoRefsForMove(moveId)` auslagern.

### 6. Fehler beim Video-Löschen wird nicht angezeigt
Im `catch`-Block von `VideoCard.handleDelete` wird nur `console.error` aufgerufen, kein Toast für den User.
- **Datei:** `lib/components/VideoCard.svelte`
- **Lösung:** `addToast("Fehler beim Löschen des Videos", "error")` im catch-Block hinzufügen.

### 7. Keine Validierung von Route-Parameter IDs
`Number($page.params.id)` ergibt `NaN` bei ungültigen URLs wie `/edit/abc`. Die Seite schlägt still fehl.
- **Dateien:** `routes/edit/[id]/+page.ts`, `routes/videos/edit/[id]/+page.ts`
- **Lösung:** `isNaN(moveId)` prüfen und direkt mit Fehlermeldung redirecten.

---

## 🟡 Mittel – UX & Funktionalität

### 8. Favoriten / Persönliche Lesezeichen
Moves als Favorit markieren, damit man seine meistgenutzten Moves schnell findet.
- **Lösung:** Favoriten in `localStorage` speichern, Stern-Icon auf MoveCard, Filter für Favoriten.

### 9. Share-Button für einzelne Moves
Einen Move direkt teilen (URL, WhatsApp, Copy-to-Clipboard).
- **Lösung:** Web Share API oder Copy-to-Clipboard-Link auf MoveCard.

### 10. Keyboard Shortcuts
Keine Tastaturkürzel vorhanden.
- `/` → Suche fokussieren
- `r` → Random Moves
- `Esc` → Filter/Dropdown schließen

### 11. Input-Validierung in MoveForm/VideoForm
Name-Feld hat nur `required`, aber keine Mindestlängen-Validierung. YouTube-URL wird nicht validiert.
- Name: mindestens 2 Zeichen (`minlength`)
- YouTube-URL: Validierung via `extractYouTubeId()` mit Fehlermeldung
- YouTube-Vorschau beim Erstellen/Bearbeiten anzeigen

### 12. Hardcodierte Anzahl Random Moves
`getRandomMoves($filteredMoves, 2)` — die Anzahl ist fest auf 2 codiert.
- **Datei:** `routes/+page.svelte`
- **Lösung:** Konfigurierbar machen (z.B. Dropdown 1–5 oder Einstellung).

### 13. Export-Dropdown: Escape zum Schließen
Das Export/Import-Menü nutzt einen unsichtbaren Backdrop-Button zum Schließen, reagiert aber nicht auf Escape-Taste.
- **Datei:** `routes/+page.svelte`
- **Lösung:** Keydown-Listener für Escape hinzufügen.

### 14. handleMoveDeleted lädt unnötig Tags und Videos neu
Nach Move-Löschung werden Tags und Videos komplett neu geladen, obwohl sich nur die Moves geändert haben.
- **Datei:** `routes/+page.svelte`
- **Lösung:** Nur `getAllMoves()` aufrufen statt alle drei Datensätze.

### 15. SvelteKit Error Page fehlt
Keine `+error.svelte` für unbehandelte Fehler. Bei unerwarteten Exceptions in einer Route gibt es keine benutzerfreundliche Fehlermeldung.
- **Lösung:** `src/routes/+error.svelte` erstellen mit freundlicher Fehlerseite und Retry-Button.

---

## 🟢 Mittel – Accessibility (a11y)

### 16. ARIA-Attribute ergänzen
- `aria-expanded` auf MoveCard/VideoCard Toggle-Buttons
- `aria-pressed` auf FilterChips-Buttons
- `aria-label` auf Icon-only-Buttons (Dark Mode, Logout, Export)
- `aria-hidden="true"` auf dekorativen SVG-Icons
- `aria-live="polite"` Region für Move-Count und Suchergebnisse

### 17. Skip-to-Content Link
Fehlender „Skip to main content"-Link in `+layout.svelte` für Keyboard-Navigation.

### 18. Focus-Visible Styling
Inputs haben `focus:ring-2`, aber Buttons und Links haben keine expliziten Focus-Styles.
- **Lösung:** `focus-visible:ring-2 focus-visible:ring-blue-500` global auf interaktive Elemente in `app.css`.

### 19. Prefers-Reduced-Motion
Animationen (Card-Hover-Transition, Filter-Panel-Slide, Toast-Slide) werden nicht deaktiviert für User mit Motion-Sensitivity.
- **Lösung:** `@media (prefers-reduced-motion: reduce)` in `app.css` mit `transition: none` und `animation: none`.

### 20. Interaktive Elemente verschachtelt
In `MoveCard.svelte` und `VideoCard.svelte` befindet sich der Edit-Link `<a>` innerhalb des Toggle-`<button>`. Interaktive Elemente in interaktiven Elementen sind ein A11y-Antipattern.
- **Lösung:** Edit-Link außerhalb des Buttons platzieren, z.B. in einer separaten Action-Bar.

### 21. ConfirmModal: role, aria-modal, Focus-Trap
Das Modal hat weder `role="dialog"`, `aria-modal="true"` noch `aria-labelledby`. Kein Focus-Trapping — Tab navigiert hinter das Modal. Focus wird nicht automatisch ins Modal gesetzt.
- **Datei:** `lib/components/ConfirmModal.svelte`
- **Lösung:** ARIA-Attribute ergänzen, Focus-Trap implementieren, Focus beim Öffnen auf Cancel-Button setzen.

### 22. Sprachattribut / Konsistenz
`app.html` hat `lang="en"`, aber UI mischt Deutsch und Englisch (Buttons, Labels, Toasts, Placeholder-Texte).
- **Lösung:** `lang="de"` setzen und alle UI-Texte konsistent auf Deutsch umstellen, oder i18n einführen.

---

## 🔵 Mittel – Performance

### 23. Supabase-Queries optimieren
`getAllMoves()` macht **4 separate Queries** (moves, moves_to_tags, tags mit tag_types, moves_to_videos). Ein einziger Join-Query wäre effizienter:
```ts
supabase.from('moves').select('*, moves_to_tags(*, tags(*, tag_types(*))), moves_to_videos(*)')
```

### 24. YouTube Lazy Loading
YouTube iFrames in `MoveCard.svelte` und `VideoCard.svelte` haben kein `loading="lazy"` Attribut.
- **Lösung:** `loading="lazy"` auf iFrames setzen oder [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed) verwenden.

### 25. Doppelter API-Call in Tags-Seite
`reloadAll()` in `tags/+page.svelte` ruft `loadGroups()` → `getAllTagsGrouped()` auf und danach **nochmal** `getAllTagsGrouped()` für den Store-Update.
- **Lösung:** Ergebnis aus `loadGroups()` direkt für den Store-Update verwenden.

### 26. Kein Caching / Invalidation-Strategie
Nach jeder Mutation (Create/Update/Delete) werden **alle Moves komplett neu geladen** (`getAllMoves()`).
- **Lösung:** Optimistische Updates oder selektives Invalidieren statt komplettes Neuladen.

### 27. Pagination / Virtual Scrolling
Bei vielen Moves werden alle gleichzeitig gerendert. Bei 100+ Moves leidet die Performance.
- **Lösung:** Virtual Scrolling (z.B. `svelte-virtual-list`) oder einfache Pagination.

---

## ⚪ Niedrig – Nice-to-Have & Code-Qualität

### 28. Doppelter Video-Badge-Code in MoveCard
Der Video-Badge HTML-Code in `MoveCard.svelte` ist zweimal nahezu identisch (einmal mit Tags, einmal ohne Tags).
- **Lösung:** In ein Svelte-Snippet `{#snippet videoBadge()}` oder eine separate Komponente auslagern.

### 29. Duplizierte Delete-Patterns
Delete-Logik (State, Handler, ConfirmModal) ist in 4 Dateien nahezu identisch: MoveCard, VideoCard, edit/[id], videos/edit/[id].
- **Lösung:** In einen wiederverwendbaren Composable oder eine Wrapper-Komponente auslagern.

### 30. Unbenutzter Import in MoveForm
`import { onMount } from 'svelte'` wird importiert, aber nie verwendet.
- **Datei:** `lib/components/MoveForm.svelte`
- **Lösung:** Import entfernen.

### 31. System-Dark-Mode Listener
`initDarkMode()` liest die System-Präferenz nur einmal. Wenn der User sein System auf Dark/Light umstellt, reagiert die App nicht.
- **Lösung:** `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`.

### 32. Supabase-Typen bereinigen
Mehrfach `as any`-Casts und `@ts-expect-error` in `tags.ts` und `moves.ts` deuten auf fehlerhafte `Database`-Typdefinitionen hin.
- **Lösung:** Typen in `types.ts` mit `supabase gen types` neu generieren oder manuell korrigieren.

### 33. Inkonsistente Fehlerbehandlung
Manche Stellen werfen Fehler weiter (`throw error`), manche loggen nur (`console.error`), manche zeigen eine Fehlermeldung. Kein einheitliches Pattern.
- **Lösung:** Konsistentes Error-Handling einführen: Service-Layer wirft, UI-Layer zeigt Toast.

### 34. CI/CD verbessern
- `npm run check` (Svelte-Check + TypeScript) in den Build-Workflow einbauen
- Lighthouse CI für Performance-Monitoring

### 35. Tests einführen
Aktuell gibt es keine Tests.
- **Vitest** für Unit-Tests (`searchMoves`, `extractYouTubeId`, `debounce`, `getRandomMoves`)
- **@testing-library/svelte** für Component-Tests
- **Playwright** für E2E (Login, CRUD, Filter)

### 36. Praxis-Modus
Timer-basierter Modus: alle X Sekunden einen neuen zufälligen Move anzeigen — ideal zum Üben.

### 37. Move-Beziehungen
Variationen und Voraussetzungen zwischen Moves verknüpfen (z.B. „Swingout → Swingout-Variation").

### 38. Offline-Support für PWA
Die App hat `manifest.webmanifest` und Service Worker, aber kein echtes Offline-Caching der Supabase-Daten.
- **Lösung:** Daten in IndexedDB oder Cache API zwischenspeichern.

---

## Zusammenfassung

| Priorität | Anzahl | Fokus |
|---|---|---|
| 🔴 Hoch | 7 | Bugs, Sicherheit, stille Fehler |
| 🟡 Mittel (UX) | 8 | User Experience, Funktionalität |
| 🟢 Mittel (a11y) | 7 | Barrierefreiheit |
| 🔵 Mittel (Perf) | 5 | Performance-Optimierung |
| ⚪ Niedrig | 11 | Code-Qualität, Nice-to-Have |
| **Gesamt** | **38** | |
