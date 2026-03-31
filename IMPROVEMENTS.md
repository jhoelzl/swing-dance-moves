# Improvements – Swing Dance Moves PWA

Empfohlene Verbesserungen, priorisiert nach Wichtigkeit.
Stand: März 2026 (aktualisiert)

---

## ✅ Bereits implementiert (Auszug)

- Sortierung der Moves (a-z, z-a, newest, oldest) mit Persistierung.
- Fisher-Yates Shuffle in `getRandomMoves()`.
- User-Settings (Sprache de/en, Random Count 1-5) in Supabase.
- Login-UX (Autocomplete, Passwort-Toggle, Forgot-Password-Link).
- Export/Import (JSON/CSV) mit Deduplizierung.
- Tags-Verwaltung mit CRUD und Farbauswahl.
- DOMPurify-Sanitization in MoveCard.
- Error-UI + Retry, globale Toasts, Skeleton Loading.
- Route-Parameter-Validierung bei Edit-Seiten.
- i18n-System mit de/en Dictionary.
- Videos-Seite mit List/Grid-View Toggle.
- Dropbox-Preview in Video-Grid-Karten inkl. Fix gegen wiederholte Requests.
- Basis-Testsetup mit Vitest (Unit-Tests vorhanden).
- CI-Grundschutz: gitleaks, actionlint, yamllint, markdownlint, shellcheck, dependency review.
- Security/Checks: Dependabot, CodeQL, zizmor, lychee, knip.

---

## 🔎 Review der bisherigen offenen Punkte (1-27)

### Erledigt / nicht mehr aktuell

- **23. CI/CD verbessern**: größtenteils erledigt (`check`/`test` sind im CI, zusätzliche Security-Checks vorhanden).
- **24. Tests einführen**: nicht mehr aktuell, da bereits Vitest-Tests existieren.

### Weiterhin relevant (bleibt im Backlog)

- **1, 2, 3, 4, 6**: UX/Produktivität (Favoriten, Sharing, Shortcuts, Form-Validierung, Praxis-Timer).
- **5**: Escape für Export-Dropdown weiterhin sinnvoll (kleine UX-Lücke).
- **7 bis 12**: A11y-Themen bleiben wichtig; mehrere Svelte-A11y-Warnings sind weiterhin sichtbar.
- **13, 14, 16, 17**: Performance-Themen bleiben relevant.
- **15**: Doppelter API-Call in Tags-Seite prüfen; wenn weiterhin vorhanden, beheben.
- **18 bis 22**: Refactoring-/Code-Qualitätsthemen bleiben relevant.
- **25, 26, 27**: sinnvolle Produkt-Erweiterungen (Relations, Offline-Daten, Swipe).

---

## 🔴 Hoch – Jetzt priorisieren

### A. A11y-Warnings auf 0 bringen

Ziel: `npm run check` ohne A11y-Warnings.

- Labels korrekt mit Controls verknüpfen (`for`/`id` oder Wrapper-Label).
- Icon-Buttons mit `aria-label` versehen.
- ConfirmModal mit `role="dialog"`, `aria-modal`, `aria-labelledby`, initialem Fokus und Focus-Trap.

### B. Knip-Ergebnisse dauerhaft sauber halten

- `knip` als Gate behalten und nur bewusst dokumentierte Ausnahmen zulassen.
- Bei neuen Exports immer prüfen, ob wirklich public API oder intern.

### C. CI-Signalqualität verbessern

- Branch Protection: obligatorische Required Checks festlegen.
- Optional: „warnungsfrei“-Regel für `svelte-check` (nach A11y-Fixes).

---

## 🟡 Mittel – UX & Features

### 1. Favoriten / Lesezeichen

- Stern auf MoveCard, Favoriten-Filter, optional Sortierung „Favorites first".

### 2. Share für Moves

- Web Share API + Clipboard-Fallback.
- Deep-Link auf konkreten Move (inkl. optionalem Tag-Filter-Context).

### 3. Keyboard Shortcuts

- `/` Suche fokusieren, `r` random shufflen, `g` Grid/List togglen, `Esc` Panels schließen.

### 4. Formularvalidierung ausbauen

- Name: `minlength` + klare Fehlermeldung.
- YouTube-URL: harte Validierung via `extractYouTubeId()`.
- Sofort-Vorschau im VideoForm.

### 5. Praxis-Modus mit Timer

- Intervall-Modus im Random-Tab, Intervall in Settings speicherbar.

### 6. Move-Beziehungen

- `move_relations` (Prerequisite, Variation, Follow-up).
- UI: „Das könntest du als Nächstes üben".

### 7. Trainingshistorie erweitern

- Session-Statistiken (Anzahl geübt, häufigste Tags, letzte Wiederholung).

---

## 🟢 Mittel – Accessibility

### 8. ARIA-Set vervollständigen

- `aria-expanded`, `aria-pressed`, `aria-hidden`, `aria-live` konsistent einführen.

### 9. Skip-Link + Fokusführung

- Skip-to-content in Layout.
- Sichtbare Focus-Styles für Buttons/Links global in `app.css`.

### 10. Reduced Motion

- `prefers-reduced-motion` für Übergänge/Animationen respektieren.

### 11. Interaktive Elemente entkoppeln

- Keine `<a>`-Elemente innerhalb klickbarer `<button>`-Container.

---

## 🔵 Mittel – Performance

### 12. Datenzugriff effizienter machen

- `getAllMoves()` optimieren (Join-Strategie oder smartere Batch-Strategie).
- Nach Mutationen selektiv invalidieren statt kompletter Re-Loads.

### 13. Rendering skalieren

- Pagination oder Virtual Scrolling für große Move-Listen.

### 14. Medien-Ladeverhalten verbessern

- YouTube `loading="lazy"` oder Lite-Embed.
- Einheitliche Thumbnail-Strategie (YouTube/Dropbox/Fallback).

### 15. Bundle-/Runtime-Monitoring

- CI-Budget (z.B. `size-limit`) für JS/CSS-Artefakte.
- Optional Lighthouse CI im PR oder nightly.

---

## ⚪ Niedrig – Refactoring & Wartbarkeit

### 16. Delete-/Confirm-Patterns zentralisieren

- Wiederverwendbares Confirm/Delete-Pattern statt Duplikation in mehreren Komponenten.

### 17. Error-Handling vereinheitlichen

- Konvention: Service layer wirft typed Errors, UI layer mapped auf Toast/UI-States.

### 18. Supabase-Typen härten

- `as any`/`@ts-expect-error` schrittweise abbauen.
- DB-Typen regelmäßig regenerieren und diffen.

### 19. Dark-Mode Listener

- Reaktiv auf System-Theme-Wechsel reagieren.

### 20. Komponenten-Duplikate reduzieren

- Wiederkehrende Badges/Action-Bars in Snippets oder kleine Shared Components auslagern.

---

## 🧪 Neue Ideen für CI & Checks

### 21. Action-Pinning auf SHA

- GitHub Actions auf Commit-SHA pinnen (Supply-Chain-Härtung).

### 22. Nightly-Workflow ergänzen

- Geplanter Lauf für externe Link-Checks, Audit, ggf. Performance-Checks.

### 23. Playwright-Smoke in CI

- Schneller E2E-Sanity-Test (Login, Liste laden, CRUD-Grundpfad).

### 24. Testabdeckung messbar machen

- Coverage-Report + Mindestschwelle (z.B. 70-80%).

### 25. PR-Templates/Checklisten

- PR-Template mit Pflichtpunkten: Tests, A11y, i18n, mobile Check.

---

## Zusammenfassung (aktualisiert)

| Priorität | Fokus |
|---|---|
| 🔴 Hoch | A11y-Warnings abbauen, CI-Signalqualität, Knip-Disziplin |
| 🟡 Mittel | UX-/Feature-Ausbau (Favoriten, Share, Shortcuts, Timer, Relations) |
| 🟢 Mittel | Barrierefreiheit konsistent fertigstellen |
| 🔵 Mittel | Datenzugriff, Rendering, Medien-Lazyload, Budgets |
| ⚪ Niedrig | Refactoring, Typ-Härtung, Wartbarkeit |

Nächster sinnvoller Schritt: A11y-Block (Punkte 8 bis 11) in einem dedizierten Branch umsetzen und danach `svelte-check` auf „no warnings" scharf schalten.
