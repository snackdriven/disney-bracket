# Disney × Pixar Bracket

An interactive tournament bracket for 70 Disney and Pixar movies. Pick your favorites head-to-head through 69 matchups — from play-in games all the way to the championship — and crown your ultimate champion.

**[Play it live](https://snackdriven.github.io/disney-bracket/)**

## How It Works

- **70 movies** across Disney and Pixar, seeded 1–70
- **Play-in round**: The bottom 12 seeds compete in 6 games to earn their spot in the main bracket
- **Main bracket**: 64 movies battle through 6 rounds (Round of 64 → Round of 32 → Sweet 16 → Elite 8 → Final Four → Championship)
- **4 regions**: Legends & Legacies, Heart & Heartbreak, Magic & Mischief, Worlds Apart
- **Movie cards**: Poster art, IMDb rating, and runtime pulled automatically — no setup needed
- **Notes**: Add per-movie notes to track thoughts and debate picks
- **Sync**: Sign in with a magic link to sync your bracket and notes across devices
- **Export**: Share a link, copy results as text, or download a PNG of your full bracket
- **Undo & reset**: Change your mind anytime

## Movie Posters & Ratings

Ratings and runtimes load automatically on first visit using a built-in OMDB key. To also get poster art, click **🎬 Add posters & ratings** in the top bar and enter a free [TMDB API key](https://www.themoviedb.org/settings/api). Keys are stored locally in your browser.

## Sync Across Devices

Click **☁ Sync across devices** and enter your email. You'll get a magic link — click it to sign in, and your bracket state and notes will sync automatically as you pick.

## Development

```bash
npm install
npm run dev
```

Built with React and Vite. Supabase handles auth and sync (optional — the app works fully offline without signing in).

To set up your own Supabase project, create a `disney_bracket` table:

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
