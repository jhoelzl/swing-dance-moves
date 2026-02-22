# Improvements – Swing Dance Moves PWA

Empfohlene Verbesserungen, priorisiert nach Wichtigkeit.

---

## 🔴 Hoch – Sicherheit & Stabilität


### 1. HTML-Sanitization in MoveCard
`{@html move.description}` rendert unescaped HTML aus der DB. Falls bösartiger HTML/JS in die Beschreibung gelangt, wird er ausgeführt (XSS).
- **Lösung:** [DOMPurify](https://github.com/cure53/DOMPurify) einbauen und alle `{@html}`-Ausgaben sanitizen.

### 2. Null-Safety in `searchMoves()`
`move.synonyms` und `move.description` können `null` sein — `.toLowerCase()` crasht dann.
- **Lösung:** Optional Chaining (`move.synonyms?.toLowerCase()`) oder Fallback auf `''`.

### 3. Typen korrigieren
`Move.synonyms`, `Move.description`, `Move.link` sind als `string` definiert, können aber `null` aus der DB kommen.
- **Lösung:** Typen auf `string | null` ändern.

### 4. Auth State Cleanup
`supabase.auth.onAuthStateChange()` in `+layout.svelte` gibt eine Unsubscribe-Funktion zurück, die nie aufgerufen wird → Memory Leak.
- **Lösung:** Rückgabewert in `onMount` cleanup aufrufen.

---

## 🟡 Mittel – UX & Funktionalität

### 5. Toast-Benachrichtigungen
Nach Erstellen/Bearbeiten/Löschen eines Moves gibt es kein visuelles Feedback — nur ein stiller Redirect.
- **Lösung:** Einfache Toast-Komponente für Erfolgs-/Fehlermeldungen.

### 7. Sortierung der Moves
Aktuell keine Option zum Sortieren (alphabetisch, zuletzt hinzugefügt, etc.).
- **Lösung:** Sortier-Dropdown in der Toolbar.

### 8. Favoriten / Persönliche Lesezeichen
Moves als Favorit markieren, damit man seine meistgenutzten Moves schnell findet.
- **Lösung:** Favoriten in `localStorage` oder in Supabase pro User speichern.

### 9. Share-Button für einzelne Moves
Einen Move direkt teilen (URL, WhatsApp, Copy-to-Clipboard).
- **Lösung:** Web Share API oder Copy-to-Clipboard-Link.

### 10. Skeleton Loading
Statt nur einem Spinner beim Laden Skeleton-Karten anzeigen für bessere wahrgenommene Performance.

### 11. Error-UI bei fehlgeschlagenem Laden
Wenn `loadData()` in `+layout.svelte` fehlschlägt, sieht der User nur einen permanenten Spinner.
- **Lösung:** Error-State mit Retry-Button anzeigen.

### 12. Keyboard Shortcuts
- `/` → Suche fokussieren
- `r` → Random Moves
- `Esc` → Filter schließen

---

## 🟢 Mittel – Accessibility (a11y)

### 13. ARIA-Attribute ergänzen
- `aria-expanded` auf dem MoveCard-Toggle-Button
- `aria-pressed` auf Filter-Chip-Buttons
- `aria-label` auf Icon-only-Buttons (Dark Mode, Logout etc.)
- `aria-hidden="true"` auf dekorativen SVG-Icons
- `aria-live="polite"` Region für dynamische Inhalte (Move-Count, Suchergebnisse)

### 14. Skip-to-Content Link
Fehlender „Skip to main content"-Link für Keyboard-Navigation.

### 15. Focus-Visible Styling
Kein sichtbarer Fokus-Indikator definiert — für Keyboard-User problematisch.
- **Lösung:** `focus-visible:ring-2` Styles global oder auf interaktive Elemente.

### 16. Prefers-Reduced-Motion
Animationen (Card-Hover, Filter-Slide) werden nicht deaktiviert für User mit Motion-Sensitivity.
- **Lösung:** `@media (prefers-reduced-motion: reduce)` in `app.css`.

---

## 🔵 Mittel – Performance

### 17. Supabase-Queries optimieren
`getAllMoves()` macht 3 separate Queries (moves, tags, moves_to_tags). Ein einziger Join-Query wäre effizienter:
```ts
supabase.from('moves').select('*, moves_to_tags(*, tags(*, tag_types(*)))')
```

### 18. YouTube Lazy Loading
YouTube iFrames laden sofort beim Aufklappen der Karte. Für bessere Performance:
- **Lösung:** `loading="lazy"` auf iFrames oder [lite-youtube-embed](https://github.com/nickersoft/lite-youtube-embed) verwenden.

### 19. Fisher-Yates Shuffle
`getRandomMoves()` nutzt `Math.random() - 0.5` zum Sortieren — das produziert keine gleichmäßige Verteilung.
- **Lösung:** Fisher-Yates-Algorithmus implementieren.

---

## ⚪ Niedrig – Nice-to-Have

### 20. Login-Seite verbessern
- `autocomplete="email"` / `autocomplete="current-password"` auf Input-Feldern
- Passwort-Sichtbarkeit-Toggle
- Passwort-Vergessen-Link (wenn Supabase konfiguriert)

### 21. Input-Validierung in MoveForm
- Name: mindestens 2 Zeichen
- Link: gültiges URL-Format prüfen
- YouTube-Vorschau beim Erstellen/Bearbeiten anzeigen

### 22. System-Dark-Mode Listener
`initDarkMode()` liest die System-Präferenz nur einmal. Wenn der User sein System auf Dark/Light umstellt, reagiert die App nicht.
- **Lösung:** `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`.

### 23. CI/CD verbessern
- `npm run check` (Svelte-Check + TypeScript) in den Build-Workflow einbauen
- Lighthouse CI für Performance-Monitoring
- Optional: Playwright E2E-Tests

### 24. Tests einführen
Aktuell gibt es keine Tests. Empfehlung:
- **Vitest** für Unit-Tests (`searchMoves`, `extractYouTubeId`, `debounce`, `getRandomMoves`)
- **@testing-library/svelte** für Component-Tests
- **Playwright** für E2E (Login, CRUD, Filter)

### 25. Praxis-Modus
Ein Timer-basierter Modus: alle X Sekunden einen neuen zufälligen Move anzeigen — ideal zum Üben.

### 26. Move-Beziehungen
Variationen und Voraussetzungen zwischen Moves verknüpfen (z.B. „Swingout → Swingout-Variation").

### 27. Export/Import
Moves als JSON oder CSV exportieren/importieren für Backup oder Sharing.

### 28. Cancel-Link in MoveForm
Der Cancel-Link zeigt auf `/` statt `{base}/` — funktioniert nicht korrekt auf GitHub Pages.

---

## Zusammenfassung

| Priorität | Anzahl | Fokus |
|---|---|---|
| 🔴 Hoch | 4 | Sicherheit, Stabilität, Datenintegrität |
| 🟡 Mittel (UX) | 8 | User Experience, Funktionalität |
| 🟢 Mittel (a11y) | 4 | Barrierefreiheit |
| 🔵 Mittel (Perf) | 3 | Performance-Optimierung |
| ⚪ Niedrig | 9 | Nice-to-Have, Zukunftsfeatures |
