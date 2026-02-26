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

- Notes on any movie. Write down your reasoning, confront it later.
- Upset tracking. Counts every time you pick the lower seed and judges you for it.
- Undo any pick. Reset the whole bracket. No judgment.
- Shareable link with your full bracket encoded in the URL.
- PNG export at 1920×1080 with all the poster art, when you're done.

---

## Sync

Sign in with a magic link and your bracket and notes follow you across devices, because **this is not a one-session experience**, and anyone who tells you they finished it in one sitting is lying or didn't think hard enough.

Or stay in the browser. Your bracket lives in local storage until you clear it.

---

If 70 movies of genuine heartfelt cinema is too much and you need a palate cleanser, there's also a [Worst Movie Tournament](https://snackdriven.github.io/bad-movie-bracket/) where nobody cries (on purpose).

---

## Dev

```bash
npm install
npm run dev
```

React 19 + Vite. Supabase for auth and sync.

```sql
CREATE TABLE disney_bracket (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notes jsonb NOT NULL DEFAULT '{}',
  state jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE disney_bracket ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bracket data"
  ON disney_bracket FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```
