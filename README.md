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

- **Mobile First Gestures**: Swipe left/right on cards native CSS snap-scrolling to flip between gorgeous hero artwork and extensive movie plot/trivia details.
- **On-the-fly Metadata Repair**: Catch an error in a summary or notice a low-res poster? The app has native TMDB search integration built right in to hot-swap movie details instantly.
- **Notes on any movie.** Write down your reasoning, confront it later.
- **Upset tracking.** Counts every time you pick the lower seed and judges you for it.
- **Undo any pick.** Reset the whole bracket. No judgment.

---

## 2-Player Co-op Sync

Sign in with Google OAuth to persist your bracket to the cloud natively—because **this is not a one-session experience**, and anyone who tells you they finished it in one sitting is lying or didn't think hard enough.

Or better yet: Generate a Room Code and invite a friend. The app connects you both peer-to-peer via Firebase Realtime. When a matchup is live, the app enforces **Blind Voting**—it won't reveal or advance the bracket until *both* players have submitted their picks anonymously. If you disagree, work it out.

If you don't log in, your bracket lives securely in local storage until you clear it.
---

If 70 movies of genuine heartfelt cinema is too much and you need a palate cleanser, there's also a [Worst Movie Tournament](https://github.com/snackdriven/bad-movie-bracket) where nobody cries (on purpose).

---

## Dev

Stack: React 19 + TypeScript + Vite. Tailwind CSS v4. Firebase for Google Auth & Real-Time Co-op Sync.

```bash
npm install
npm run dev
```

### Tests

The app started as a single 1,600-line component. All logic, all data, all canvas rendering in one file. Fine for moving fast, bad for knowing whether anything works.

To get it testable, I pulled the pure logic into `src/lib/` modules (bracket state transitions, data constants, canvas math, localStorage helpers) without touching behavior, then wrote tests against those instead of against React.

```bash
npm test          # 73 Vitest unit tests
npm run test:e2e  # 27 Playwright E2E tests at 1920×1080
```

Unit tests cover the core bracket engine: state transitions, upset detection, play-in to R64 handoff, serialization roundtrips, and notes init logic. 

> [!NOTE]
> **E2E Testing is currently paused in CI**. The entire Playwright suite (which historically covered the 69-pick traversal flow) is disabled pending a refactor to accommodate the new Firebase/Co-op architectural changes. Deployments currently rely purely on the Vitest unit tests passing.
