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
- **Styling:** Inline CSS-in-JS (no CSS library or preprocessor)
- **State management:** React hooks (`useState`, `useEffect`) + localStorage
- **Auth/sync:** Supabase (magic link auth, implicit flow)
- **Routing:** None — single-page, single-route app

## Project Structure

```
disney-bracket/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component (~1100 lines)
│   ├── types.ts              # Shared TypeScript types
│   ├── test-setup.ts         # Vitest global setup
│   ├── App.css               # Minimal global styles
│   ├── index.css             # CSS reset
│   └── lib/
│       ├── bracket.ts        # Pure bracket state transitions
│       ├── canvas.ts         # PNG export / canvas rendering
│       ├── data.ts           # Movie data, seedings, round config
│       ├── utils.ts          # localStorage helpers, serialization
│       └── __tests__/
│           ├── bracket.test.ts
│           ├── canvas.test.ts
│           ├── data.test.ts
│           └── utils.test.ts
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
npm test              # Run 84 Vitest unit tests
npm run test:e2e      # Run 27 Playwright E2E tests (requires dev server or auto-starts it)
```

## Architecture

### Module split

Business logic lives in `src/lib/` as pure TypeScript functions. The React component (`App.tsx`) handles all rendering and state, calling into lib functions for state transitions.

- **`bracket.ts`** — All bracket state transitions: `applyPick`, `applyUndo`, `resetState`, `buildDisplayRds`, `exportBracketText`. All pure functions.
- **`canvas.ts`** — Canvas rendering for the PNG export at 1920×1080.
- **`data.ts`** — Movie data (70 movies), seeding constants (`MAIN`, `PLAYIN`, `PIP`, `R1`), round/region names, trivia, static metadata.
- **`utils.ts`** — `loadLS`/`saveLS` for localStorage, `serMatch`/`desMatch` for match serialization, `extractImdbId`.

### Key State Variables in App.tsx (abbreviated names are intentional)

| Variable | Meaning | Values |
|----------|---------|--------|
| `ph` | Phase | `"pi"` (play-in) or `"m"` (main) |
| `piM` | Play-in matches | Array of 6 Match tuples |
| `piI` | Play-in index | 0–5 |
| `rds` | Rounds | `Match[][]` |
| `cr` | Current round | 0–5 |
| `cm` | Current match | Index within round |
| `ch` | Champion | `Movie \| null` |
| `hv` | Hovered movie seed | `number \| null` |
| `an` | Animated movie seed | `number \| null` |
| `bk` | Show bracket panel | `boolean` |
| `fb` | Show full bracket | `boolean` |
| `hi` | History (for undo) | `HistoryEntry[]` |
| `upsets` | Upset log | `UpsetEntry[]` |
| `notes` | Movie notes | `Notes` (`Record<number, string>`) |
| `showNotes` | Notes panel visible | `boolean` |

### Core Types (src/types.ts)

```ts
interface Movie { seed: number; name: string; year: number; studio: "Disney" | "Pixar"; imdb: string; }
type Match = [Movie, Movie] & { winner?: Movie };
interface BracketState { ph: Phase; piM: Match[]; piI: number; rds: Match[][]; cr: number; cm: number; ch: Movie | null; hi: HistoryEntry[]; upsets: UpsetEntry[]; }
```

### localStorage Keys

- `dbk-state` — Serialized bracket state
- `dbk-notes` — Movie notes keyed by seed number

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

84 tests across 4 files in `src/lib/__tests__/`. All test pure functions — no React rendering.

```bash
npm test
```

Coverage areas: bracket state transitions, upset detection, play-in → R64 handoff, undo across phase boundaries, serialization roundtrips, canvas position math, data integrity (seed uniqueness, required fields, STATIC_META completeness).

Notable: `bracket.test.ts` includes a "known defect" test that documents `applyPick` accepting out-of-match movie objects without validation.

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
- **Abbreviated variable names** — follows existing codebase style (`ph`, `cr`, `cm`, `mob`, etc.)
- **Inline styles** — all styling is inline CSS objects, no CSS classes
- **Mobile-first responsive** — `useIsMobile()` hook returns `mob`; every UI change needs desktop + mobile variants
- **No UI dependencies** — no component library, no CSS framework
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

### Adding a new movie

Add to `MAIN` or `PLAYIN` in `src/lib/data.ts` with `{ seed, name, year, studio, imdb }`. Update `PIP` and `R1` pairings. Changing movie count affects the entire bracket structure — the data integrity tests in `data.test.ts` will catch seed uniqueness violations.

### Modifying bracket layout

`R1` is 32 pairs of indices into the combined `MAIN + play-in winners` array. Regions are defined by slicing R1 into groups of 8.

### Adding new UI features

Add components near the bottom of `App.tsx`. Pass `mob` prop for responsive behavior. Use inline styles matching the existing dark theme palette (see below). Export any new pure logic to `src/lib/` and write unit tests for it.

### Color palette reference

- Background gradient: `#06060f → #0e0e24 → #180a20`
- Disney accent: `#4fc3f7` (cyan)
- Pixar accent: `#ff8a65` (orange)
- Gold/highlight: `#ffd54f`
- Purple accent: `#ce93d8`
- Text primary: `#e0e0f0` / `#f0f0ff`
- Text secondary: `#8a8aa8` / `#9898b8`
- Text muted: `#6a6a8e` / `#5a5a7e`
