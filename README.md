# Disney × Pixar Bracket

Everyone's got a take. "Up is overrated." "Encanto is better than Frozen." "Cars shouldn't even be in this conversation." Cool. Prove it.

70 movies. 69 head-to-head matchups. One winner. **[Play it here.](https://snackdriven.github.io/disney-bracket/)**

---

## How it works

12 play-in movies fight for the last 6 spots, then 64 go at it across four regions — Legends & Legacies, Heart & Heartbreak, Magic & Mischief, and Worlds Apart. Six rounds total. The whole thing.

Each card has the movie poster, IMDb rating, runtime, and a plot blurb for the ones you half-remember. There's also production trivia on all 70 — like the fact that someone on the Toy Story 2 team accidentally ran a cleanup script and deleted 90% of the finished film, and it was only recovered because the technical director had a backup on her home computer.

Other stuff:
- Notes on any movie so you can explain your picks to yourself later
- Upset tracking (it counts how many times you picked the underdog and roasts you for it)
- Shareable links with your bracket in the URL
- PNG export of your completed bracket — 1920×1080, posters and all
- Undo whenever, reset if you need to start over and pretend this didn't happen

Sign in with a magic link and your bracket syncs across devices. Skip it and everything just lives in your browser.

---

## Dev

```bash
npm install
npm run dev
```

React 19 + Vite. Supabase handles auth and sync (one table):

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
