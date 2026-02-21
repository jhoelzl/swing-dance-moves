# Plan: Swing Dance Moves PWA mit SvelteKit + Supabase

Modernisierung der bestehenden PHP/MySQL-App zu einer **SvelteKit-basierten Progressive Web App**, gehostet auf **GitHub Pages** (kostenlos), mit **Supabase** als Backend (kostenloser Tier). Die App zeigt 64+ Moves mit Multi-Tag-Filterung, Volltextsuche, YouTube-Einbettung und Dark Mode. Admin-Editing wird über Supabase Auth abgesichert (nur dein Account).

**Tech Stack:**
- **Frontend:** SvelteKit + `@sveltejs/adapter-static` (statische SPA)
- **Styling:** Tailwind CSS 4
- **Backend/DB:** Supabase (PostgreSQL, Auth, REST-API)
- **Hosting:** GitHub Pages (kostenlos, via GitHub Actions)
- **PWA:** Service Worker + Web App Manifest

---

## Phase 1: Projekt-Setup

1. **GitHub-Repo erstellen** – z.B. `swing-dance-moves` (public, für GitHub Pages)
2. **SvelteKit-Projekt initialisieren** – `npx sv create swing-dance-moves` mit TypeScript, Tailwind CSS
3. **Adapter konfigurieren** – `@sveltejs/adapter-static` installieren und in `svelte.config.js` konfigurieren mit `fallback: '404.html'` für SPA-Routing
4. **PWA-Setup** – `vite-plugin-pwa` installieren, `manifest.json` mit App-Name "Swing Dance Moves", Icons, Theme-Color, `display: standalone` erstellen
5. **Supabase JS Client** installieren – `@supabase/supabase-js`, Environment-Variablen für `SUPABASE_URL` und `SUPABASE_ANON_KEY` anlegen

## Phase 2: Supabase-Datenbank einrichten

6. **Supabase-Projekt erstellen** auf [supabase.com](https://supabase.com) (Free Tier: 500MB DB, 2 Projekte)
7. **Schema migrieren** – Die 4 Tabellen aus dem bestehenden MySQL-Dump in Supabase SQL Editor anlegen:
   - `tag_types` (5 Einträge: Festival/Classes, Level, Dances, Technical, Rating)
   - `tags` (55 Einträge, FK → `tag_types`)
   - `moves` (64 Einträge: name, synonyms, description, link)
   - `moves_to_tags` (N:M-Verknüpfung)
   - MySQL-Syntax zu PostgreSQL anpassen (`int(11)` → `integer`, `varchar` bleibt, `AUTO_INCREMENT` → `GENERATED ALWAYS AS IDENTITY`, `text` bleibt)
8. **Daten importieren** – INSERT-Statements aus dem SQL-Dump anpassen und in Supabase ausführen
9. **Row Level Security (RLS)** einrichten:
   - **SELECT**: für `anon` und `authenticated` erlaubt (jeder kann lesen)
   - **INSERT/UPDATE/DELETE**: nur für `authenticated` mit deiner User-ID erlaubt
10. **Supabase Auth** – Email/Password-Auth aktivieren, deinen Account anlegen (einziger Admin-User)

## Phase 3: Datenanbindung & State Management

11. **Supabase Client Singleton** – `src/lib/supabase.ts` erstellen mit `createClient()` (einmalige Instanz)
12. **TypeScript-Typen** definieren – Interfaces für `Move`, `Tag`, `TagType`, `MoveToTag` basierend auf dem Schema
13. **Daten-Service Layer** – `src/lib/services/moves.ts` mit Funktionen:
    - `getAllMoves()` – alle Moves mit Tags laden (Supabase Join-Query)
    - `getMovesFiltered(tagIds: number[])` – Multi-Tag-Filter
    - `getRandomMoves(count: number, tagIds?: number[])` – zufällige Moves
    - `searchMoves(query: string)` – Volltextsuche über `name`, `synonyms`, `description`
    - `createMove(move)`, `updateMove(id, move)` – CRUD (auth-geschützt)
    - `getAllTags()` – Tags gruppiert nach TagType laden
14. **Svelte Stores** – Reaktive Stores für: `moves`, `tags`, `activeFilters`, `searchQuery`, `darkMode`, `isAdmin`

## Phase 4: UI-Komponenten

15. **Layout** – `src/routes/+layout.svelte`:
    - Top-Navigation mit App-Name, Suche, Dark-Mode-Toggle, Admin-Login-Button
    - Dark Mode via CSS-Klasse auf `<html>`, Präferenz in `localStorage` speichern
    - Responsive Container (Mobile-first)

16. **Hauptseite** – `src/routes/+page.svelte`:
    - **Filter-Bar**: Horizontale Tag-Chips, gruppiert nach TagType (Dances, Level, Rating, Technical, Festival), mehrere gleichzeitig auswählbar, aktive Chips farbig hervorgehoben (Farbe aus `tag_label`-Feld)
    - **Suchfeld**: Debounced-Input für Volltextsuche
    - **Move-Counter**: "X Moves gefunden"
    - **"I'm out of moves!" Button**: Zeigt 2 zufällige Moves (mit aktuellem Filter)
    - **Move-Liste**: Vertikale Karten/Accordion-Liste

17. **Move-Card Komponente** – `src/lib/components/MoveCard.svelte`:
    - Klappbare Karte (Accordion-Stil)
    - **Header**: Move-Name + Synonyme (subtle) + farbige Tag-Badges
    - **Body**: Beschreibung (formatiert) + eingebettetes YouTube-Video (wenn Link vorhanden, `<iframe>` mit `youtube.com/embed/...` URL-Transformation) + Edit-Button (nur im Admin-Modus)

18. **Tag-Badge Komponente** – `src/lib/components/TagBadge.svelte`:
    - Farbige Badges basierend auf `tag_label`-Wert (success=grün, danger=rot, etc.) – Tailwind-Farben nutzen

19. **Filter-Chips Komponente** – `src/lib/components/FilterChips.svelte`:
    - Gruppierte, klickbare Tag-Chips mit Multi-Select

## Phase 5: Admin-Funktionen

20. **Login-Seite** – `src/routes/login/+page.svelte`:
    - Einfaches Email/Password-Formular
    - Supabase `signInWithPassword()`
    - Nach Login Redirect zur Hauptseite

21. **Move-Editor** – `src/routes/edit/[id]/+page.svelte` und `src/routes/new/+page.svelte`:
    - Formular: Name, Synonyme, Beschreibung (Textarea), YouTube-Link
    - Tag-Checkboxen gruppiert nach TagType (wie in der alten edit.php)
    - Speichern über Supabase Client (INSERT/UPDATE + moves_to_tags sync)
    - Nur sichtbar/erreichbar wenn eingeloggt

22. **Admin-Guard** – Svelte-Layout-Check: Wenn nicht authentifiziert, Redirect zu Login bei Zugriff auf `/edit/*` oder `/new`

## Phase 6: PWA & Dark Mode

23. **Service Worker** – via `vite-plugin-pwa` automatisch generiert, Caching-Strategie: Network-First für API-Calls, Cache-First für statische Assets
24. **Web App Manifest** – Name, Icons (192x192 + 512x512), `theme_color`, `background_color`, `display: standalone`
25. **iOS-Meta-Tags** – `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, Apple-Touch-Icons
26. **Dark Mode** – Tailwind `dark:` Prefix nutzen, Toggle-Switch in der Navigation, Systemeinstellung als Default (`prefers-color-scheme`), Wahl in `localStorage` persistiert

## Phase 7: Deployment

27. **GitHub Actions Workflow** – `.github/workflows/deploy.yml`:
    - Trigger: Push auf `main`
    - Steps: Checkout → Node.js Setup → `npm install` → `npm run build` → Deploy zu GitHub Pages (via `peaceiris/actions-gh-pages` Action)
    - Environment-Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` als GitHub Secrets
28. **GitHub Pages aktivieren** – In Repo-Settings → Pages → Source: GitHub Actions
29. **Custom Domain** (optional) – Falls gewünscht, CNAME konfigurieren

## Phase 8: Daten-Migration Skript

30. **Migrations-Skript** – `scripts/migrate.sql` erstellen:
    - MySQL-Dump nach PostgreSQL konvertieren (Syntax-Unterschiede: Backticks → Anführungszeichen, `AUTO_INCREMENT` → `IDENTITY`, `ENGINE=InnoDB` entfernen)
    - Alle INSERT-Statements für tag_types, tags, moves, moves_to_tags
    - Direkt im Supabase SQL Editor ausführbar

---

## Verification

- **Lokal testen**: `npm run dev` → App unter `localhost:5173` öffnen, alle Features durchklicken
- **PWA testen**: Chrome DevTools → Application → Manifest & Service Worker prüfen; auf iPhone: Safari → "Zum Home-Bildschirm" → App öffnet standalone
- **Filter testen**: Mehrere Tags kombinieren, prüfen ob Ergebnisse korrekt eingeschränkt werden
- **Suche testen**: Nach Moves suchen (z.B. "Sailor", "Tandem"), Ergebnisse gegen alten Datenbestand validieren
- **Admin-Test**: Einloggen, Move erstellen, bearbeiten, prüfen ob Änderungen persistiert sind
- **Dark Mode**: Toggle testen, Seite neuladen → Einstellung bleibt erhalten
- **Deployment**: Push auf `main`, GitHub Action prüfen, Live-URL testen
- **Move-Anzahl**: Sicherstellen dass alle 64 Moves aus dem SQL-Dump migriert wurden

---

## Decisions

- **SvelteKit + adapter-static** statt reinem Svelte: Bietet Routing, Layout-System, und SSG out-of-the-box
- **Supabase** statt JSON-Datei: Ermöglicht echtes CRUD ohne Rebuild, Supabase Free Tier reicht locker (64 Moves << 500MB)
- **GitHub Pages** statt Vercel/Netlify: Wie gewünscht, kostenlos, eng an GitHub integriert
- **PWA** statt Native App: Kein Apple Developer Account (99$/Jahr) nötig, sofort installierbar auf iPhone
- **Supabase Auth** statt URL-Parameter `?adminmode=1`: Echte Absicherung der Edit-Funktionen
- **Multi-Tag-Filter** statt Single-Dropdown: Deutliche Verbesserung gegenüber alter App (mehrere Dimensionen gleichzeitig filtern)
- **YouTube iframe-Embed** statt nur Link: Bessere UX, Videos direkt in der App abspielen
- **Tailwind `dark:` Variant** für Dark Mode: Kein separates Stylesheet nötig, einfach umschaltbar

---

## Bestehendes Datenmodell (aus MySQL-Dump)

### Tabellen & Beziehungen

```
tag_types (1) ←── (N) tags (1) ←── (N) moves_to_tags (N) ──→ (1) moves
```

| Tabelle | Spalten | Einträge |
|---|---|---|
| `tag_types` | tag_type_id, tag_type_name, sort_order, tag_type_css | 5 |
| `tags` | tag_id, tag_type_id (FK), tag_name, tag_label, tag_css, tag_sort | 55 |
| `moves` | move_id, name, synonyms, description, link | 64 |
| `moves_to_tags` | id, move_id (FK), tag_id (FK) | N:M |

### Tag-Typen & Beispiel-Tags

- **Dances** (type 3): Lindy Hop, Balboa, Collegiate Shag, Solo-Jazz
- **Level** (type 2): Beg, Imp, Int, Int+, Int-Adv, Adv
- **Rating** (type 6): easy, difficult, fancy, funny, to practise
- **Technical** (type 5): 6-count, 8-count, 10-count, Redirection, Footwork-Variation, Break, Follower-Hijacking, Swingout-Variation, etc.
- **Festival / Classes** (type 1): 28 Einträge (Celje 2018/2019, Shag Republic, Dragon Swing, LC Shag Beginner/Improver/Intermediates, etc.)

### Tag-Label → Farb-Mapping

| `tag_label` | Bootstrap | Tailwind-Equivalent |
|---|---|---|
| `success` | Grün | `bg-green-500` |
| `danger` | Rot | `bg-red-500` |
| `warning` | Gelb | `bg-yellow-500` |
| `primary` | Blau | `bg-blue-500` |
| `secondary` | Grau | `bg-gray-500` |
| `light` | Hell | `bg-gray-200` |
