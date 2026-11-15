# 🕺 Swing Dance Moves

A **Progressive Web App (PWA)** for browsing, filtering, and discovering swing dance moves — including Lindy Hop, Collegiate Shag, Balboa, Solo Jazz, and more.

**Live:** [jhoelzl.github.io/swing-dance-moves](https://jhoelzl.github.io/swing-dance-moves/)

---

## Features

- **Swing dance moves** with descriptions, synonyms, and YouTube video embeds
- **Multi-tag filtering** — filter by dance style, level, technical type, rating, and festival/class origin simultaneously
- **Custom tag-group order** — use the up/down controls on the Tags page to change the shared order used throughout the app.
- **Festival overview** — browse the `Festivals` tag group by festival, with inline YouTube and Dropbox class videos, move-coverage timelines, linked moves, and teacher tags. Festival and teacher assignments belong directly to videos; move links are only used for timelines and move details. The selected festival is saved in the URL for refreshes and bookmarks. Select a move with a valid start timestamp to play it in the class video.
- **Full-text search** — search across move names, synonyms, and descriptions
- **"Out of moves!" button** — get 2 random moves matching your current filters
- **Video (Youtube/Dropbox) filter** — filter for moves that have a linked video
- **Missing video tags** — find videos missing a festival or teacher tag so they can be completed.
- **Video tag filtering** — filter by festival and teacher tags (any within a group, all selected groups).
- **Video timelines** — list cards show timestamped move assignments in green and unassigned time in red, with dividers between adjacent assigned sections. Hover or tap an assigned segment to play it or view its moves. Expanded cards show a chronological chapter list with playback and move details, including moves without valid timestamps. Red does not necessarily mean a move is missing. Incomplete timestamps are flagged; duration is fetched from YouTube or Dropbox as cards come into view and may be unavailable for restricted or unsupported videos.
- **Bookmarkable filters** — move and video search and filter state is synced to the URL and restored on refresh.
- **Dark mode** — toggle or auto-detect from system preference, persisted in localStorage
- **Reload app** — refresh the current page from the header, including in the installed app
- **PWA / installable** — works offline, installable on iOS and Android home screens
- **Admin mode** — authenticated users can create and edit moves via Supabase Auth
- **Responsive design** — mobile-first, optimized for phones and tablets

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [SvelteKit](https://kit.svelte.dev/) with [Svelte 5](https://svelte.dev/) (runes: `$state`, `$derived`, `$effect`) |
| **Rendering** | Static SPA via `@sveltejs/adapter-static` (SSR disabled, prerendered) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite` |
| **Backend / DB** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, REST API) — Free Tier |
| **PWA** | `@vite-pwa/sveltekit` with auto-updating service worker |
| **Hosting** | [GitHub Pages](https://pages.github.com/) (free) via GitHub Actions |
| **Language** | TypeScript |

---

## Project Structure

```
swing-dance-moves/
├── .githooks/
│   └── pre-commit             # Local pre-commit hook (runs frontend CI checks)
├── .github/workflows/
│   ├── ci.yml                 # PR/main quality checks (audit, spellcheck, lint, test, build)
│   └── deploy.yml             # GitHub Pages build & deploy workflow
├── scripts/
│   ├── init.sql               # PostgreSQL schema + seed + RLS setup for Supabase
│   └── add_video_tags.sql     # Migration for direct video tag assignments
├── frontend/                  # SvelteKit application
│   ├── .env.example           # Environment variable template
│   ├── cspell.json            # Project dictionary for spell checking
│   ├── eslint.config.js       # ESLint flat config
│   ├── package.json
│   ├── stylelint.config.js    # Stylelint config
│   ├── svelte.config.js       # SvelteKit config with static adapter
│   ├── tsconfig.json
│   ├── vite.config.ts         # Vite config with Tailwind + PWA + Vitest
│   ├── src/
│   │   ├── app.css            # Global styles, Tailwind import, custom variants
│   │   ├── app.html           # HTML shell with meta tags & PWA links
│   │   ├── lib/
│   │   │   ├── i18n.ts        # DE/EN translations and translation helper
│   │   │   ├── index.ts       # Public lib exports
│   │   │   ├── stores.ts      # Global stores (filters, auth, dark mode, tab state, etc.)
│   │   │   ├── supabase.ts    # Supabase client singleton
│   │   │   ├── types.ts       # TypeScript interfaces (moves, tags, videos, sessions, settings)
│   │   │   ├── utils.test.ts   # Unit tests for lib helpers
│   │   │   ├── utils.ts       # URL helpers, timecode parsing, debounce, tag colors
│   │   │   ├── services/      # Data access layer (moves, tags, videos, sessions, settings)
│   │   │   ├── components/
│   │   │   │   ├── MoveCard.svelte     # Expandable move card
│   │   │   │   ├── MoveForm.svelte     # Move create/edit form
│   │   │   │   ├── SkeletonCard.svelte # Loading placeholder card
│   │   │   │   ├── VideoCard.svelte    # Video list card
│   │   │   │   ├── VideoForm.svelte    # Video create/edit form
│   │   │   │   ├── FilterChips.svelte  # Grouped tag filter chips
│   │   │   │   ├── TagBadge.svelte     # Tag badge UI
│   │   │   │   ├── Toast.svelte        # Toast notifications
│   │   │   │   └── ConfirmModal.svelte # Reusable confirmation modal
│   │   │   └── assets/        # Static assets
│   │   └── routes/
│   │       ├── +error.svelte   # Error boundary page
│   │       ├── +layout.svelte  # App shell (nav, auth gate, dark mode)
│   │       ├── +layout.ts      # SPA config (`ssr=false`, `prerender=true`)
│   │       ├── +page.svelte    # Main moves page
│   │       ├── calendar/        # Visual calendar for sessions and learned moves
│   │       ├── login/          # Login page
│   │       ├── new/            # Create move page
│   │       ├── edit/[id]/      # Edit move page
│   │       ├── random/         # Random moves view
│   │       ├── videos/         # Video management pages
│   │       ├── tags/           # Tag and tag type management pages
│   │       ├── sessions/       # Training sessions pages
│   │       └── settings/       # User/app settings page
│   └── static/
│       └── robots.txt          # Static public files
├── IMPROVEMENTS.md             # Project improvement notes / backlog
└── backup/                     # Legacy PHP app snapshot and exports
```

---

## Data Model

```
tag_types (1) ←── (N) tags (1) ←── (N) moves_to_tags (N) ──→ (1) moves
```

| Table | Columns |
|---|---|---|
| `tag_types` | tag_type_id, tag_type_name, sort_order, tag_type_css |
| `tags` | tag_id, tag_type_id (FK), tag_name, tag_label, tag_css, tag_sort |
| `moves` | move_id, name, synonyms, description, link |
| `moves_to_tags` | id, move_id (FK), tag_id (FK) | N:M |

### Tag Types

- **Dances** — Lindy Hop, Balboa, Collegiate Shag, Solo Jazz
- **Level** — Beg, Imp, Int, Int+, Int-Adv, Adv
- **Rating** — easy, difficult, fancy, funny, to practise
- **Technical** — 6-count, 8-count, 10-count, Redirection, Footwork-Variation, Break, etc.
- **Festival / Classes** — add your own festival and classes
- **Teachers** — add your own teacher couples

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm

### Local Development

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in `frontend/` (or set as GitHub Secrets for CI):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build

```bash
cd frontend
npm run build
```

Static output is generated in `frontend/build/`.

---

## Deployment

The app auto-deploys to GitHub Pages on every push to `main` via GitHub Actions.

**Workflow:** `.github/workflows/deploy.yml`

1. Checkout → Node.js 20 setup → `npm install` → `npm run build`
2. Deploy `frontend/build/` to GitHub Pages

**Required GitHub Secrets:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Database Setup

To set up the Supabase database from scratch:

1. Create a project on [supabase.com](https://supabase.com) (Free Tier)
2. Run `scripts/init.sql` in the Supabase SQL Editor
3. Enable Email/Password auth and create your admin account
4. Row Level Security is pre-configured:
   - **SELECT**: open for all (anon + authenticated)
   - **INSERT / UPDATE / DELETE**: authenticated users only

For an existing database, run `scripts/reorder_tag_groups.sql` in the Supabase SQL Editor before deploying the tag-group reorder controls.
Run `scripts/add_video_tags.sql` before deploying direct festival and teacher tags on videos. This migration also copies existing festival and teacher tags from linked moves to their videos.
Run `scripts/add_video_duration.sql` before deploying video duration caching. Existing durations are filled as timelines are viewed; unavailable durations are retried later, and changing a video URL clears its cached duration.

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **SvelteKit + adapter-static** | SPA with file-based routing, layouts, SSG — no server needed |
| **Supabase** | Real CRUD without rebuilds; free tier is more than enough for 64 moves |
| **GitHub Pages** | Free hosting, tightly integrated with GitHub Actions CI/CD |
| **PWA** | Installable on mobile without app store; works offline |
| **Supabase Auth** | Proper auth instead of URL-based admin mode (`?adminmode=1`) |
| **Multi-tag filtering** | Major UX improvement over the legacy single-dropdown PHP app |
| **Tailwind CSS 4** | Utility-first styling with built-in dark mode variant |

---

## License

Private project.
