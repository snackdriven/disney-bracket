# Disney × Pixar Bracket

At some point you're going to have to put Beauty and the Beast against The Emperor's New Groove. There's no path around it. You're going to sit there and have to choose between the film that was nominated for Best Picture and the one that has no business being as funny as it is, and whatever you pick, you'll spend the next three days wondering if you actually know yourself at all. I'm sorry. There was no other way to build this.

**[Enter if you're ready](https://snackdriven.github.io/disney-bracket/)**

70 movies. 1937 to 2024. 12 fight through a play-in round — yes, even the play-in matters, you will feel things during the play-in — and then 64 go at it across four seeded regions through six brutal rounds. Someone is going to knock out your #1 in the Sweet 16. It happens to everyone. You will be okay. Probably.

Every card has the poster, rating, runtime, and a plot refresher for the ones you thought you remembered until you were staring down a matchup at midnight and realized you couldn't recall a single thing about Atlantis. There's also production trivia on all 70, because what this experience needs is more information to complicate your decisions. Did you know Toy Story 2 was almost entirely deleted by accident and only survived because someone had a backup on their home computer? Now you do. That's going in the notes somewhere between round two and your complete unraveling in the Elite 8.

Notes on every movie so you can document your reasoning and later confront what you were thinking. Upset tracking because your bracket will go off the rails and you deserve to know by how much. Undo whenever you need it — no shame, we've all been there. Shareable link so you can send your bracket to someone and have a real conversation about it. 1920×1080 PNG export to preserve the evidence.

Sign in with a magic link to sync across devices, because this is not a one-session experience and anyone who tells you they finished it in one sitting is lying or didn't think hard enough. Or stay in the browser. Take as long as you need. Some people are still thinking about round three.

React 19 + Vite + Supabase. The tech is fine. It's everything else that's going to get you.

---

## Dev

```bash
npm install
npm run dev
```

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
