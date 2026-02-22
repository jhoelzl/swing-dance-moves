# Improvements – Swing Dance Moves PWA

Empfohlene Verbesserungen, priorisiert nach Wichtigkeit.
Stand: Februar 2026

---

## ✅ Bereits implementiert

Die folgenden Punkte wurden umgesetzt und sind nicht mehr offen:

- **Sortierung der Moves** – Sortier-Dropdown (a-z, z-a, newest, oldest) in der Toolbar mit `localStorage`-Persistierung.
- **Fisher-Yates Shuffle** – Korrekte gleichmäßige Verteilung in `getRandomMoves()`.
- **Login-Seite** – `autocomplete`-Attribute, Passwort-Sichtbarkeit-Toggle, Passwort-Vergessen-Link.
- **Export/Import** – Moves als JSON/CSV exportieren und importieren mit Deduplizierung.
- **Cancel-Link in MoveForm** – Nutzt jetzt `{base}/` für GitHub Pages.
- **Tags-Verwaltung** – Eigene Seite (Tab) mit CRUD für Tag-Typen und Tags inkl. Farbauswahl.

---

## 🔴 Hoch – Sicherheit & Stabilität

### 1. HTML-Sanitization in MoveCard
`{@html move.description}` in `MoveCard.svelte` rendert unescaped HTML aus der DB. Falls bösartiger HTML/JS in die Beschreibung gelangt, wird er ausgeführt (XSS).
- **Lösung:** [DOMPurify](https://github.com/cure53/DOMPurify) einbauen und alle `{@html}`-Ausgaben sanitizen.

### 2. Null-Safety in `searchMoves()` und `searchVideos()`
`move.synonyms.toLowerCase()` und `move.description.toLowerCase()` crashen wenn die Werte `null` sind. Gleiches Problem in `searchVideos()` in `videos.ts`.
- **Lösung:** Optional Chaining (`move.synonyms?.toLowerCase()`) oder Fallback auf `''`.

### 3. Typen korrigieren
`Move.synonyms`, `Move.description`, `Move.link` und `Video.description` sind als `string` definiert, können aber `null` aus der DB kommen.
- **Lösung:** Typen in `types.ts` auf `string | null` ändern.

### 4. Auth State Cleanup
`supabase.auth.onAuthStateChange()` in `+layout.svelte` gibt eine Unsubscribe-Funktion zurück, die nie aufgerufen wird → Memory Leak.
- **Lösung:** Rückgabewert in `onMount`-Cleanup aufrufen.

### 5. `deleteMove()` löscht keine Video-Referenzen
`deleteMove()` in `moves.ts` löscht `moves_to_tags`, aber **nicht** `moves_to_videos` — verwaiste Einträge bleiben in der Datenbank.
- **Lösung:** Vor dem Löschen des Moves auch alle `moves_to_videos`-Einträge entfernen.

### 6. Supabase-Client ohne Credentials
Wenn Umgebungsvariablen fehlen, wird `createClient('', '')` aufgerufen statt die App ordentlich zu stoppen. Das `console.warn` wird leicht übersehen.
- **Lösung:** Bei fehlenden Credentials einen klaren Error-State setzen und die App nicht starten.

---

## 🟡 Mittel – UX & Funktionalität

### 7. Toast-Benachrichtigungen
Nach Erstellen/Bearbeiten/Löschen eines Moves gibt es kein visuelles Feedback — nur ein stiller Redirect. Die Tags-Seite und der Import haben bereits Inline-Statusmeldungen, aber es fehlt eine **globale Toast-Komponente**.
- **Lösung:** Wiederverwendbare Toast-Komponente, die von allen CRUD-Operationen genutzt wird.

### 8. Favoriten / Persönliche Lesezeichen
Moves als Favorit markieren, damit man seine meistgenutzten Moves schnell findet.
- **Lösung:** Favoriten in `localStorage` oder in Supabase pro User speichern.

### 9. Share-Button für einzelne Moves
Einen Move direkt teilen (URL, WhatsApp, Copy-to-Clipboard).
- **Lösung:** Web Share API oder Copy-to-Clipboard-Link.

### 10. Skeleton Loading
Statt nur einem Spinner beim Laden Skeleton-Karten anzeigen für bessere wahrgenommene Performance.

### 11. Error-UI bei fehlgeschlagenem Laden
Wenn `loadData()` in `+layout.svelte` fehlschlägt, sieht der User gar nichts — der Fehler wird nur per `console.error` geloggt.
- **Lösung:** Error-State mit Retry-Button anzeigen.

### 12. Keyboard Shortcuts
Keine Tastaturkürzel vorhanden.
- `/` → Suche fokussieren
- `r` → Random Moves
- `Esc` → Filter schließen

### 13. VideoForm Cancel-Link fehlender base path
`VideoForm.svelte` verwendet `href="/videos"` statt `href="{base}/videos"` — bricht auf GitHub Pages.
- **Lösung:** `import { base } from '$app/paths'` und `href="{base}/videos"` verwenden.

### 14. Input-Validierung in MoveForm
Name-Feld hat nur `required`, aber keine Mindestlängen-Validierung.
- Name: mindestens 2 Zeichen (`minlength`)
- YouTube-Vorschau beim Erstellen/Bearbeiten anzeigen

### 15. Hardcodierte Anzahl Random Moves
`getRandomMoves($filteredMoves, 2)` in `+page.svelte` — die Anzahl ist hardcodiert.
- **Lösung:** Konfigurierbar machen (z.B. Dropdown oder Einstellung).

---

## 🟢 Mittel – Accessibility (a11y)

### 16. ARIA-Attribute ergänzen
- `aria-expanded` auf MoveCard/VideoCard Toggle-Buttons (**fehlt**)
- `aria-pressed` auf FilterChips-Buttons (**fehlt**)
- `aria-label` auf Icon-only-Buttons wie Dark Mode, Logout (**teilweise vorhanden**)
- `aria-hidden="true"` auf dekorativen SVG-Icons (**fehlt**)
- `aria-live="polite"` Region für Move-Count und Suchergebnisse (**fehlt**)

### 17. Skip-to-Content Link
Fehlender „Skip to main content"-Link in `+layout.svelte` für Keyboard-Navigation.

### 18. Focus-Visible Styling
Kein sichtbarer Fokus-Indikator definiert — Inputs haben `focus:ring-2`, aber Buttons und Links haben keine expliziten Focus-Styles.
- **Lösung:** `focus-visible:ring-2` global oder auf interaktive Elemente in `app.css`.

### 19. Prefers-Reduced-Motion
Animationen (Card-Hover-Transition, Filter-Panel-Slide) werden nicht deaktiviert für User mit Motion-Sensitivity.
- **Lösung:** `@media (prefers-reduced-motion: reduce)` in `app.css`.

### 20. Interaktive Elemente verschachtelt
In `MoveCard.svelte` befindet sich der Edit-Link `<a>` innerhalb des Toggle-`<button>`. Interaktive Elemente in interaktiven Elementen sind ein A11y-Antipattern.
- **Lösung:** Edit-Link außerhalb des Buttons platzieren, z.B. in einer separaten Action-Bar.

### 21. Sprachattribut / Konsistenz
Die App mischt Deutsch und Englisch (UI-Texte teilweise deutsch, teilweise englisch). Das `lang`-Attribut auf `<html>` sollte korrekt gesetzt und eine konsistente Sprache verwendet werden.

---

## 🔵 Mittel – Performance

### 22. Supabase-Queries optimieren
`getAllMoves()` macht **4 separate Queries** (moves, moves_to_tags, tags mit tag_types, moves_to_videos). Ein einziger Join-Query wäre effizienter:
```ts
supabase.from('moves').select('*, moves_to_tags(*, tags(*, tag_types(*))), moves_to_videos(*)')
```

### 23. YouTube Lazy Loading
YouTube iFrames in `MoveCard.svelte` und `VideoCard.svelte` haben kein `loading="lazy"` Attribut.
- **Lösung:** `loading="lazy"` auf iFrames oder [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed) verwenden.

### 24. Kein Caching / Invalidation-Strategie
Nach jeder Mutation (Create/Update/Delete) werden **alle Moves komplett neu geladen** (`getAllMoves()`). Bei großen Datensätzen ineffizient.
- **Lösung:** Optimistische Updates oder selektives Invalidieren statt komplettes Neuladen.

### 25. Doppelter API-Call in Tags-Seite
`reloadAll()` in `tags/+page.svelte` ruft `loadGroups()` auf (→ `getAllTagsGrouped()`) und danach **nochmal** `getAllTagsGrouped()` — unnötiger doppelter API-Call.
- **Lösung:** Ergebnis aus `loadGroups()` direkt für den Store-Update verwenden.

### 26. Pagination / Virtual Scrolling
Bei vielen Moves werden alle gleichzeitig gerendert. Bei 100+ Moves wird die Performance leiden.
- **Lösung:** Virtual Scrolling (z.B. `svelte-virtual-list`) oder einfache Pagination.

---

## ⚪ Niedrig – Nice-to-Have

### 27. System-Dark-Mode Listener
`initDarkMode()` liest die System-Präferenz nur einmal. Wenn der User sein System auf Dark/Light umstellt, reagiert die App nicht.
- **Lösung:** `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`.

### 28. CI/CD verbessern
- `npm run check` (Svelte-Check + TypeScript) in den Build-Workflow einbauen
- Lighthouse CI für Performance-Monitoring
- Optional: Playwright E2E-Tests

### 29. Tests einführen
Aktuell gibt es keine Tests. Empfehlung:
- **Vitest** für Unit-Tests (`searchMoves`, `extractYouTubeId`, `debounce`, `getRandomMoves`)
- **@testing-library/svelte** für Component-Tests
- **Playwright** für E2E (Login, CRUD, Filter)

### 30. Praxis-Modus
Ein Timer-basierter Modus: alle X Sekunden einen neuen zufälligen Move anzeigen — ideal zum Üben.

### 31. Move-Beziehungen
Variationen und Voraussetzungen zwischen Moves verknüpfen (z.B. „Swingout → Swingout-Variation").

### 32. Offline-Support für PWA
Die App hat ein `manifest.webmanifest` und Service Worker, aber kein echtes Offline-Caching der Supabase-Daten.
- **Lösung:** Daten in IndexedDB oder Cache API zwischenspeichern für Offline-Zugriff.

### 33. Supabase-Typen bereinigen
Mehrfach `as any`-Casts und `@ts-expect-error` in `tags.ts` und `moves.ts` deuten auf fehlerhafte `Database`-Typdefinitionen hin.
- **Lösung:** Typen in `types.ts` mit `supabase gen types` neu generieren oder manuell korrigieren.

### 34. Bestätigungs-Dialog beim Löschen von Moves
Moves können nur über die Edit-Seite gelöscht werden. Kein Schnell-Lösch-Button mit Bestätigung wie bei Videos.

### 35. Doppelter Video-Badge-Code in MoveCard
Der Video-Badge HTML-Code in `MoveCard.svelte` ist zweimal nahezu identisch (einmal mit Tags, einmal ohne).
- **Lösung:** In ein Svelte-Snippet oder eine separate Komponente auslagern.

---

## Zusammenfassung

| Priorität | Anzahl | Fokus |
|---|---|---|
| 🔴 Hoch | 6 | Sicherheit, Stabilität, Datenintegrität |
| 🟡 Mittel (UX) | 9 | User Experience, Funktionalität |
| 🟢 Mittel (a11y) | 6 | Barrierefreiheit |
| 🔵 Mittel (Perf) | 5 | Performance-Optimierung |
| ⚪ Niedrig | 9 | Nice-to-Have, Code-Qualität, Zukunftsfeatures |
