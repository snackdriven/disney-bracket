# Disney & Pixar: The Bracket

An interactive tournament bracket for 70 Disney and Pixar movies. Work through 69 matchups (from play-in games to the championship) and figure out once and for all which one is your favorite.

**[Play it live](https://snackdriven.github.io/disney-bracket/)**

## How It Works

- **70 movies** from Disney and Pixar, seeded 1–70
- **Play-in round**: The bottom 12 seeds compete in 6 games to earn their spot in the main bracket
- **Main bracket**: 64 movies battle through 6 rounds (Round of 64 → Round of 32 → Sweet 16 → Elite 8 → Final Four → Championship)
- **4 regions**: Legends & Legacies, Heart & Heartbreak, Magic & Mischief, Worlds Apart
- **Movie cards** with poster art, IMDb rating, runtime, and a one-line plot summary. All data ships with the app, no API keys needed.
- **Fun facts**: Each movie has a production trivia blurb that shows up as you play
- **Upset tracker**: Picks where the lower seed wins get flagged, with a running count and biggest-upset callout
- **Notes**: Add per-movie notes to track your reasoning
- **Sync**: Sign in with a magic link to sync your bracket and notes across devices
- **Share**: Bracket state gets encoded into the URL, so you can share a link and someone else sees your picks
- **Export**: Copy results as text or download a full 1920x1080 PNG of the completed bracket (with posters)
- **Undo & reset**: Change your mind anytime

## Sync Across Devices

Click **☁ Sync across devices** and enter your email. You'll get a magic link. Click it to sign in, and your bracket state and notes sync automatically as you pick.

## Development

```bash
npm install
npm run dev
```

Built with React 19 and Vite. Supabase handles auth and sync (optional; the app works fully offline without signing in).

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
