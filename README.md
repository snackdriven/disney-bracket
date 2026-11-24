# Disney × Pixar Bracket

At some point you're going to have to put **Beauty and the Beast** against **The Emperor's New Groove**.

There's no path around it. You're going to sit there and have to choose between the film that was nominated for Best Picture and the one that has no business being as funny as it is, and whatever you pick, you'll spend the next three days wondering if you actually know yourself at all.

I'm sorry. There was no other way to build this.

**[Enter if you're ready →](https://snackdriven.github.io/disney-bracket/)**

---

## The setup

70 movies. 1937 to 2024.

12 fight through a play-in round (yes, even the play-in matters, you will feel things during the play-in) and then 64 go at it across four seeded regions through six brutal rounds. Someone is going to knock out your #1 in the Sweet 16. It happens to everyone. You will be okay. Probably.

Regions: **Legends & Legacies** · **Heart & Heartbreak** · **Magic & Mischief** · **Worlds Apart**

---

## What's on the cards

Every card has the poster, IMDb rating, runtime, and a plot refresher for the ones you thought you remembered until you were staring down a matchup at midnight and realized you couldn't recall a single thing about Atlantis.

There's also production trivia on all 70 movies, because what this experience needs is more information to complicate your decisions.

Did you know Toy Story 2 was almost entirely deleted by accident and only survived because someone had a backup on their home computer? Now you do. You can't un-know that now.

---

## Features

- **Swipe through the cards.** Move between artwork, plot summaries, and trivia with left/right swipes on mobile.
- **Fix movie details.** Search TMDB from the app to replace a summary or a low-resolution poster.
- **Notes on any movie.** Write down your reasoning, confront it later.
- **Upset tracking.** Counts every time you pick the lower seed and judges you for it.
- **Undo any pick.** Reset the whole bracket. No judgment.

---

## Save your bracket

Sign in with Google to sync your bracket across devices. This is not a one-session experience, and anyone who tells you they finished it in one sitting is lying or didn't think hard enough.

**Co-op retirement edit by Codex (GPT-6 AI agent), November 23, 2026:** Room co-op is retired in this client. Old room links show a notice before loading a bracket or connecting to Firebase. Continue explicitly to use this device’s saved bracket; the room hash is not imported automatically. A recovery link is saved locally when storage permits. Existing room records, local backups, and personal cloud records are not deleted. Older open clients may still use rooms; backend access has not been shut down.

Solo play works without signing in. Your bracket saves in this browser until you clear its site storage; signing out does not clear the local copy.

---

If 70 movies of genuine heartfelt cinema is too much and you need a palate cleanser, there's also a [Worst Movie Tournament](https://github.com/snackdriven/bad-movie-bracket) where nobody cries (on purpose).

---

## Dev

Stack: React 19, TypeScript, Vite, and Tailwind CSS v4. Firebase handles Google sign-in and real-time sync.

```bash
npm install
npm run dev
```

### Tests

Testing scope updated by Codex (GPT-6 AI agent), November 23, 2026.

The default gate is nine P0/P1 cases: three UI flows, three Firebase client API contracts, and three security cases. Playwright TypeScript runs the five browser cases on desktop Chromium and Pixel 5; four fast contract checks run once. No snapshot suite or stale Supabase login fixtures.

```bash
npx playwright install chromium  # first local setup only
npm test                        # default critical gate
npm run test:e2e                # 3 UI + 2 browser-security cases, desktop and mobile
npm run test:api                # 3 Firebase client API contracts
npm run test:security           # account isolation + 2 browser security cases
npm run test:unit               # optional original unit/integration suite
```

| Priority | Cases |
|---|---|
| P0/P1 browser | Finished-bracket reroll with preview/cancel/recovery/reload; first Sweet 16 reroll and keyboard/Undo; solo picks and notes through reload/Undo/reset. |
| P0 API contract | Hydrate before upload and apply notes-only changes; confirm only successful writes; abort concurrent cloud overwrite and preserve both copies. |
| P0 security | Account-switch/denied-read isolation; corrupt saves and divergent imports; legacy room links with no sync initialization or credential exposure. |

The API contracts use the real sync hook and an in-memory Firebase SDK boundary. They do **not** prove deployed Firebase authorization rules or live Google login/cross-device persistence. Browser security checks use synthetic local fixtures; they do not probe personal cloud data.

Pull requests run the critical gate plus source/E2E typechecks and build. Only a push to `main` deploys to Pages; PR jobs do not receive deployment permissions.

## Commits and releases

See [RELEASE.md](RELEASE.md) for Commitizen commands, SemVer and changelog maintenance.
