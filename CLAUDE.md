# CLAUDE.md

Guide for AI assistants working on the Disney × Pixar Bracket codebase.

## Project Overview

An interactive tournament bracket for 70 Disney and Pixar movies. Users pick favorites head-to-head through 69 matchups (6 play-in games + 63 main bracket) to crown a champion. Fully client-side SPA with no backend — all state persists in localStorage.

**Live site:** https://snackdriven.github.io/disney-bracket/

## Tech Stack

- **Framework:** React 19 (JSX, no TypeScript)
- **Build tool:** Vite 7
- **Package manager:** npm
- **Linting:** ESLint 9 (flat config)
- **Deployment:** GitHub Pages via GitHub Actions (push to `main`)
- **Styling:** Inline CSS-in-JS (no CSS library or preprocessor)
- **State management:** React hooks (`useState`, `useEffect`) + localStorage
- **Routing:** None — single-page, single-route app

## Project Structure

```
disney-bracket/
├── src/
│   ├── main.jsx          # React entry point (renders <App/>)
│   ├── App.jsx            # Entire application (~612 lines, monolithic)
│   ├── App.css            # Minimal global styles
│   ├── index.css          # CSS reset
│   └── assets/            # Static assets (react.svg, vite.svg)
├── public/                # Public static files
├── .github/workflows/
│   └── deploy.yml         # CI/CD: build + deploy to GitHub Pages
├── index.html             # HTML entry point
├── vite.config.js         # Vite config (base: '/disney-bracket/')
├── eslint.config.js       # ESLint flat config
├── package.json           # Dependencies and scripts
└── package-lock.json      # Dependency lock
```

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (Vite)
npm run build     # Production build (output: dist/)
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

## Architecture

### Single-File Application

The entire app lives in `src/App.jsx`. This is intentional — the app is small and self-contained. All components, data, state, and logic are co-located in one file.

### Key Sections in App.jsx

1. **`useIsMobile` hook** (lines 3-12) — Responsive breakpoint detection at 600px
2. **Data constants** (lines 14-106):
   - `MAIN` — 58 main-bracket movies (seeds 1-58)
   - `PLAYIN` — 12 play-in movies (seeds 59-70)
   - `PIP` — Play-in pairings (6 pairs, indices into PLAYIN)
   - `R1` — Round of 64 matchup indices (32 pairs, indices into combined array)
   - `RND` — Round names array
   - `REG` — 4 region names
   - `CLR` — Color schemes per studio (Disney=blue/cyan, Pixar=brown/orange)
   - `ALL_MOVIES` — Combined array of all 70 movies
3. **localStorage utilities** (lines 108-112) — `loadLS`, `saveLS`, `serMatch`, `desMatch`
4. **`App` component** (lines 114-328) — Main component with all bracket state and logic
5. **Sub-components** (lines 330-612):
   - `Card` — Movie card (clickable, shows seed/name/year/studio/IMDb)
   - `CardNotes` — Inline notes textarea below a card
   - `NotesPanel` — Global searchable notes management
   - `NoteRow` — Individual movie note entry
   - `Dots` — Animated background stars
   - `Btn` — Reusable styled button
   - `BV` — Bracket view/results summary
   - `RB` — Round block (renders matchups for one round)
   - `MN` — Match name display (win/loss styling)
   - `FullBracket` — Complete bracket visualization across all rounds

### State Variables (abbreviated names are intentional)

| Variable | Meaning | Values |
|----------|---------|--------|
| `ph` | Phase | `"pi"` (play-in) or `"m"` (main) |
| `piM` | Play-in matches | Array of 6 match arrays |
| `piI` | Play-in index | 0-5 |
| `rds` | Rounds | Nested array of matches |
| `cr` | Current round | 0-5 |
| `cm` | Current match | Index within round |
| `ch` | Champion | Movie object or null |
| `hv` | Hovered movie seed | Number or null |
| `an` | Animated movie seed | Number or null (during pick animation) |
| `bk` | Show bracket | Boolean |
| `fb` | Show full bracket | Boolean |
| `hi` | History | Array for undo |
| `notes` | Movie notes | Object keyed by seed |
| `showNotes` | Notes panel visible | Boolean |

### localStorage Keys

- `dbk-state` — Serialized bracket state (phase, matches, rounds, progress, history)
- `dbk-notes` — Movie notes keyed by seed number

### Bracket Structure

- **Play-in round:** 12 movies (seeds 59-70) compete in 6 games
- **Round of 64:** 58 main seeds + 6 play-in winners = 64 movies
- **4 regions** (8 matchups each in R1): Legends & Legacies, Heart & Heartbreak, Magic & Mischief, Worlds Apart
- **Subsequent rounds:** R32 → Sweet 16 → Elite 8 → Final Four → Championship

### Movie Data Shape

```js
{ seed: Number, name: String, year: Number, studio: "Disney"|"Pixar", imdb: String }
```

## Code Conventions

- **Abbreviated variable names** — The codebase uses short names (`ph`, `cr`, `cm`, `mob`, etc.). Follow this convention when modifying existing code.
- **Inline styles** — All styling is inline CSS objects, not CSS classes. Maintain this pattern.
- **Mobile-first responsive** — The `mob` prop (from `useIsMobile()`) controls layout and sizing throughout. Any UI change needs both desktop and mobile variants.
- **No external dependencies for UI** — No component library, no CSS framework. Keep it vanilla React.
- **Functional components only** — No class components.
- **ESLint rules** — `no-unused-vars` ignores names starting with uppercase or underscore (`^[A-Z_]`). This allows unused component imports.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Checks out code
2. Sets up Node 20
3. Runs `npm ci` and `npm run build`
4. Deploys `dist/` to GitHub Pages

The Vite config sets `base: '/disney-bracket/'` for correct asset paths on GitHub Pages.

## Testing

No test framework is currently set up. There are no unit or integration tests. Validate changes by:
1. Running `npm run lint` to catch lint errors
2. Running `npm run build` to verify the production build succeeds
3. Running `npm run dev` and manually testing in the browser

## Common Tasks

### Adding a new movie

Add an entry to `MAIN` or `PLAYIN` in `App.jsx` with `{ seed, name, year, studio, imdb }`. Adjust seedings and bracket pairings (`PIP`, `R1`) accordingly. Changing movie count affects the entire bracket structure.

### Modifying bracket layout

The bracket is built from `R1` (first-round pairings as index pairs into the combined `MAIN + play-in winners` array). Regions are defined by slicing R1 into groups of 8. Changing region assignments means reordering R1.

### Adding new UI features

Add components at the bottom of `App.jsx` following the existing pattern. Pass `mob` prop for responsive behavior. Use inline styles matching the existing dark theme color palette.

### Color palette reference

- Background gradient: `#06060f → #0e0e24 → #180a20`
- Disney accent: `#4fc3f7` (cyan)
- Pixar accent: `#ff8a65` (orange)
- Gold/highlight: `#ffd54f`
- Purple accent: `#ce93d8`
- Text primary: `#e0e0f0` / `#f0f0ff`
- Text secondary: `#8a8aa8` / `#9898b8`
- Text muted: `#6a6a8e` / `#5a5a7e`
