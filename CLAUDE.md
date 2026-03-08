# CLAUDE.md

Guide for AI assistants working on the Disney × Pixar Bracket codebase.

## Project Overview

An interactive tournament bracket for 70 Disney and Pixar movies. Users pick favorites head-to-head through 69 matchups (6 play-in games + 63 main bracket) to crown a champion. State persists in localStorage; Supabase handles auth and cross-device sync.

**Live site:** https://snackdriven.github.io/disney-bracket/

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 7
- **Package manager:** npm
- **Linting:** ESLint 9 (flat config) + typescript-eslint
- **Deployment:** GitHub Pages via GitHub Actions (push to `main`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, no config file; `@theme` in `index.css`)
- **State management:** React hooks (`useState`, `useEffect`) + localStorage
- **Auth/sync:** Supabase (magic link auth, implicit flow)
- **Routing:** None — single-page app. `main.tsx` renders `<AdminPage />` at `/?admin=1`, `<App />` everywhere else.

## Project Structure

```
disney-bracket/
├── src/
│   ├── main.tsx              # Entry point; renders AdminPage at ?admin=1, App elsewhere
│   ├── App.tsx               # Root component (main bracket UI)
│   ├── ErrorBoundary.tsx     # Top-level error boundary
│   ├── types.ts              # Shared TypeScript types
│   ├── test-setup.ts         # Vitest global setup
│   ├── index.css             # Tailwind import + @theme tokens + keyframes
│   ├── hooks/
│   │   ├── useBracketState.ts  # Bracket state, localStorage, URL hash
│   │   ├── useIsMobile.ts
│   │   ├── useMovieMeta.ts     # TMDB fetch + PNG export
│   │   ├── useNotes.ts
│   │   ├── useShareClipboard.ts  # Copy link / copy bracket text
│   │   ├── useSupabaseSync.ts
│   │   └── __tests__/
│   │       ├── useBracketState.test.ts
│   │       └── useNotes.test.ts
│   ├── lib/
│   │   ├── bracket.ts        # Pure bracket state transitions
│   │   ├── canvas.ts         # PNG export / canvas rendering
│   │   ├── colors.ts         # Shared studio color constants (CLR, BADGE_CLR)
│   │   ├── data.ts           # Movie data, seedings, round config
│   │   ├── meta.ts           # fetchMovieMeta — TMDB + OMDB API calls, writes tmdb-meta-v1
│   │   ├── supabase.ts       # Supabase client init
│   │   ├── theme.ts          # Re-exports from colors.ts
│   │   ├── utils.ts          # localStorage helpers, serialization
│   │   └── __tests__/
│   │       ├── bracket.test.ts
│   │       ├── canvas.test.ts
│   │       ├── data.test.ts
│   │       └── utils.test.ts
│   └── components/
│       ├── AdminPage.tsx     # Metadata manager UI (accessible at /?admin=1)
│       ├── AuthModal.tsx
│       ├── Btn.tsx
│       ├── BV.tsx            # Bracket visualizer panel
│       ├── Card.tsx          # Movie matchup card
│       ├── CardNotes.tsx
│       ├── ChampionScreen.tsx
│       ├── Dots.tsx          # Animated background particles
│       ├── FullBracket.tsx
│       ├── MatchView.tsx
│       ├── NotesPanel.tsx
│       ├── SyncStrip.tsx
│       ├── TmdbModal.tsx
│       └── __tests__/
│           └── BV.test.tsx
├── src/__tests__/
│   └── App.test.tsx          # Integration tests (React Testing Library)
├── e2e/
│   ├── auth.spec.js          # Auth modal, session injection
│   ├── bracket.spec.js       # Pick flow, undo, reset, progress
│   ├── exports.spec.js       # Share URL, text export, PNG download
│   ├── notes.spec.js         # Card notes, global notes panel
│   ├── persistence.spec.js   # localStorage, URL hash, share links
│   └── helpers.js            # Shared Playwright utilities
├── supabase/                 # Supabase config and migrations
├── public/                   # Static assets
├── .github/workflows/
│   └── deploy.yml            # CI: tests → build → deploy
├── index.html
├── vite.config.ts            # Vite + Vitest config
├── tsconfig.json
├── playwright.config.js
├── eslint.config.js
├── package.json
└── package-lock.json
```

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Start dev server (Vite)
npm run build         # Production build (output: dist/)
npm run lint          # Run ESLint
npm run preview       # Preview production build locally
npm test              # Run 73 Vitest unit tests
npm run test:e2e      # Run 27 Playwright E2E tests (requires dev server or auto-starts it)
```

## Architecture

### Module split

Business logic lives in `src/lib/` as pure TypeScript functions. State lives in `src/hooks/`. Components are in `src/components/`.

- **`bracket.ts`** — All bracket state transitions: `applyPick`, `applyUndo`, `resetState`, `buildDisplayRds`, `exportBracketText`. All pure functions.
- **`canvas.ts`** — Canvas rendering for the PNG export at 1920×1080.
- **`colors.ts`** — Shared color constants (`CLR`, `BADGE_CLR`) for both React components and canvas. `theme.ts` re-exports from here.
- **`data.ts`** — Movie data (70 movies), seeding constants (`MAIN`, `PLAYIN`, `PIP`, `R1`), round/region names, trivia, static metadata.
- **`meta.ts`** — `fetchMovieMeta(tmdbKey, omdbKey)` fetches poster/rating/runtime/plot from TMDB and OMDB APIs in batches of 20, reads/writes `tmdb-meta-v1` in localStorage.
- **`supabase.ts`** — Supabase client initialization.
- **`utils.ts`** — `loadLS`/`saveLS` for localStorage, `serMatch`/`desMatch` for match serialization, `extractImdbId`.

### Key State Variables

State lives in `useBracketState` (bracket logic), `useShareClipboard` (clipboard), `useNotes`, `useSupabaseSync`, and `useMovieMeta`. Lightweight UI toggles (`hoveredSeed`, `showBracketPanel`, `showFullBracket`) live as plain `useState` in App.tsx.

| Variable | Hook/Location | Meaning | Values |
|----------|---------------|---------|--------|
| `phase` | useBracketState | Phase | `"pi"` (play-in) or `"m"` (main) |
| `playInMatches` | useBracketState | Play-in matches | `Match[]` (6 items) |
| `playInIndex` | useBracketState | Play-in index | 0–5 |
| `rounds` | useBracketState | Rounds | `Match[][]` |
| `currentRound` | useBracketState | Current round | 0–5 |
| `currentMatch` | useBracketState | Current match | Index within round |
| `champion` | useBracketState | Champion | `Movie \| null` |
| `history` | useBracketState | History (for undo) | `HistoryEntry[]` |
| `upsets` | useBracketState | Upset log | `UpsetEntry[]` |
| `animatingSeed` | useBracketState | Animated movie seed | `number \| null` |
| `copiedLink` | useShareClipboard | Share link copied | `boolean` |
| `copiedBracket` | useShareClipboard | Bracket text copied | `boolean` |
| `hoveredSeed` | App.tsx useState | Hovered movie seed | `number \| null` |
| `showBracketPanel` | App.tsx useState | Show bracket panel | `boolean` |
| `showFullBracket` | App.tsx useState | Show full bracket | `boolean` |
| `notes` | useNotes | Movie notes | `Notes` (`Record<number, string>`) |
| `showNotes` | useNotes | Notes panel visible | `boolean` |

### Core Types (src/types.ts)

```ts
interface Movie { seed: number; name: string; year: number; studio: "Disney" | "Pixar"; imdb: string; }
interface Match { players: [Movie, Movie]; winner?: Movie; }
interface DisplayMatch { players: [Movie | null, Movie | null]; winner?: Movie; }
interface ColorScheme { bg: string; accent: string; text: string; }
interface BracketState {
  phase: Phase; playInMatches: Match[]; playInIndex: number;
  rounds: Match[][]; currentRound: number; currentMatch: number;
  champion: Movie | null; history: HistoryEntry[]; upsets: UpsetEntry[];
}
interface HistoryEntry { phase: Phase; matchIndex: number; round: number; wasUpset: boolean; }
```

`SerializedMatch` (`{ p: [Movie, Movie]; w: Movie | null }`) is the wire format used in localStorage and URL hash — separate from `Match` to keep the runtime type clean.

### localStorage Keys and Schema

- `dbk-state` — Serialized bracket state (schema v2; v1 saves with abbreviated keys are migrated automatically on load)
- `dbk-notes` — Movie notes keyed by seed number
- `tmdb-meta-v1` — Movie metadata cache (`Record<number, MovieMeta>`); written by `meta.ts`, managed via AdminPage

**Schema v2** key names match `BracketState` exactly: `phase`, `playInMatches`, `playInIndex`, `rounds`, `currentRound`, `currentMatch`, `champion`, `history`, `upsets`. Includes `_v: 2` marker.

**Schema v1** (old saves) used abbreviated keys: `ph`, `piM`, `piI`, `rds`, `cr`, `cm`, `ch`, `hi`. Detected by `'ph' in data && !('phase' in data)` and migrated in `useBracketState`.

### Auth / Sync

Supabase magic link with implicit flow (`flowType: "implicit"`). Session stored under `storageKey: "disney-bracket-auth"`. On sign-in, Supabase writes `#access_token=...` to the URL hash. The app guards against overwriting this with bracket state before the auth client reads it — there's a regression test for this in `persistence.spec.js`.

Sync is debounced (~2s) after each pick and writes to the `disney_bracket` table. RLS enforces `auth.uid() = user_id`.

### Bracket Structure

- **Play-in:** 12 movies (seeds 59–70) → 6 games → 6 winners
- **Round of 64:** 58 main seeds + 6 play-in winners = 64 movies, 32 matches
- **4 regions** (8 R64 matchups each): Legends & Legacies, Heart & Heartbreak, Magic & Mischief, Worlds Apart
- **Subsequent rounds:** R32 → Sweet 16 → Elite 8 → Final Four → Championship
- **Total picks:** 69 (6 play-in + 63 main)

## Testing

### Unit tests (Vitest)

73 tests across 8 files.

```bash
npm test
```

- `src/lib/__tests__/bracket.test.ts` — State transitions, upset detection, play-in → R64 handoff, undo across phase boundaries, seed-based pick validation
- `src/lib/__tests__/canvas.test.ts` — drawBracket smoke test (does not throw on post-playin state)
- `src/lib/__tests__/data.test.ts` — Data integrity (seed uniqueness, required fields, STATIC_META completeness)
- `src/lib/__tests__/utils.test.ts` — Serialization roundtrips, localStorage helpers
- `src/hooks/__tests__/useBracketState.test.ts` — Hook integration: state restoration, pick/undo/reset
- `src/hooks/__tests__/useNotes.test.ts` — Notes init, save, clear
- `src/components/__tests__/BV.test.tsx` — Bracket visualizer: winner display, upset highlighting
- `src/__tests__/App.test.tsx` — Integration tests via React Testing Library (14 tests)

### E2E tests (Playwright)

27 test cases in `e2e/`, run against Chromium and Pixel 5 (mobile). Viewport: 1920×1080 on desktop.

```bash
npm run test:e2e
```

Coverage areas: full 69-pick flow, undo/reset, progress bar, auth modal open/close/escape, injected session behavior, sync network request on pick, localStorage persistence across reload, URL hash share links, text export, PNG download, notes (card-level and global panel).

### CI

Both suites run on every push to `main` before the build. Deploy is blocked if either fails. Playwright installs only Chromium in CI (both projects use the Chromium engine).

## Code Conventions

- **TypeScript** — strict mode, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- **Descriptive variable names** — full names throughout (`phase`, `currentRound`, `playInMatches`, etc.)
- **Styling** — Tailwind utility classes for static layout/spacing/typography/fixed colors; inline `style={{}}` only for dynamic runtime values (studio-dependent colors like `c.ac`, `c.bg`). Never mix the two on the same property.
- **Dynamic studio colors** — set as CSS custom properties on the element (`style={{ '--ac': c.ac } as React.CSSProperties}`) and reference via arbitrary Tailwind value (`className="text-[var(--ac)]"`) when used alongside Tailwind classes, or just inline when simpler.
- **Mobile-first responsive** — `useIsMobile()` hook returns `mob`; every UI change needs desktop + mobile variants
- **No component library** — all UI is hand-built with Tailwind
- **AdminPage exception** — `AdminPage.tsx` uses only inline `style={{}}` (no Tailwind at all); this is intentional for the isolated admin tool
- **Functional components only** — no class components
- **ESLint** — `varsIgnorePattern: '^[A-Z_]'` allows unused uppercase names (component imports)

## Deployment

Push to `main` → GitHub Actions:
1. `npm ci`
2. `npm test` (unit tests)
3. Playwright install + `npm run test:e2e`
4. `npm run build`
5. Deploy `dist/` to GitHub Pages

Vite config sets `base: '/disney-bracket/'` for correct asset paths.

## Common Tasks

### Using the admin page

Navigate to `/?admin=1`. Enter TMDB (v3 auth) and OMDB API keys, click "Save Keys," then "Fetch Missing" to fill gaps or "Refresh All" to rebuild from scratch. Keys are stored in `sessionStorage` only — they don't persist across browser sessions. Cache lives in `localStorage` under `tmdb-meta-v1`.

### Adding a new movie

Add to `MAIN` or `PLAYIN` in `src/lib/data.ts` with `{ seed, name, year, studio, imdb }`. Update `PIP` and `R1` pairings. Changing movie count affects the entire bracket structure — the data integrity tests in `data.test.ts` will catch seed uniqueness violations.

### Modifying bracket layout

`R1` is 32 pairs of indices into the combined `MAIN + play-in winners` array. Regions are defined by slicing R1 into groups of 8.

### Adding new UI features

Add a new file in `src/components/`. Pass `mob` prop for responsive behavior. Use Tailwind classes for static styles; inline `style={{}}` for dynamic studio-dependent colors. Import and use the component in `App.tsx`. Export any new pure logic to `src/lib/` and write unit tests for it.

### Color palette reference

- Background gradient: `#06060f → #0e0e24 → #180a20`
- Disney accent: `#4fc3f7` (cyan)
- Pixar accent: `#ff8a65` (orange)
- Gold/highlight: `#ffd54f`
- Purple accent: `#ce93d8`
- Text primary: `#e0e0f0` / `#f0f0ff`
- Text secondary: `#8a8aa8` / `#9898b8`
- Text muted: `#6a6a8e` / `#5a5a7e`
