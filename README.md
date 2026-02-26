# Disney & Pixar: The Bracket

You know the argument. Someone says Ratatouille is better than The Lion King and suddenly it's a whole thing. This settles it.

70 Disney and Pixar movies. 69 head-to-head matchups. Pick your favorite in each one until there's a champion. It's March Madness but the stakes are whether WALL-E could beat Coco (he can't, but you do you).

**[Play it live](https://snackdriven.github.io/disney-bracket/)**

## What You Get

- **Play-in round** — the bottom 12 seeds fight for 6 spots in the main bracket. Sorry, Chicken Little.
- **64-movie main bracket** across 6 rounds: Round of 64 → Round of 32 → Sweet 16 → Elite 8 → Final Four → Championship
- **4 regions**: Legends & Legacies, Heart & Heartbreak, Magic & Mischief, Worlds Apart
- **Movie cards** with poster art, IMDb rating, runtime, and a short plot reminder so you don't accidentally vote against a movie you forgot you loved
- **Fun facts** — production trivia for all 70 movies. Did you know Toy Story 2 was accidentally deleted mid-production and rescued from a backup on someone's home computer?
- **Upset tracker** that flags when you pick the lower seed. It keeps a running count and calls out your biggest upset.
- **Notes** on any movie, so you can write "this one made me cry at age 30" and revisit it later
- **Shareable URLs** — your bracket state is encoded right in the link
- **PNG export** — download a full 1920x1080 image of your completed bracket, posters and all
- **Undo & reset** whenever you want. No judgment.

## Sync Across Devices

Click **☁ Sync across devices**, enter your email, and you'll get a magic link. Your bracket and notes follow you after that.

## Development

```bash
npm install
npm run dev
```

React 19, Vite, no backend required. Supabase handles auth and sync if you sign in, but everything works offline too.

If you want to run your own Supabase instance, here's the table:

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
