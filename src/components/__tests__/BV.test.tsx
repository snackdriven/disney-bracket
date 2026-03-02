import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BV } from '../BV.js';
import type { Match } from '../../types.js';

const disney = { seed: 1, name: 'The Lion King', year: 1994, studio: 'Disney' as const, imdb: 'tt0110357' };
const pixar  = { seed: 2, name: 'Toy Story',     year: 1995, studio: 'Pixar'  as const, imdb: 'tt0114709' };
const disney2 = { seed: 3, name: 'Aladdin',       year: 1992, studio: 'Disney' as const, imdb: 'tt0103639' };
const pixar2  = { seed: 4, name: 'Finding Nemo',  year: 2003, studio: 'Pixar'  as const, imdb: 'tt0266543' };

function makeMatch(a = disney, b = pixar, winner?: typeof disney): Match {
  return winner ? { players: [a, b], winner } : { players: [a, b] };
}

describe('BV', () => {
  it('renders play-in matches with both movie names', () => {
    const piMatches: Match[] = [makeMatch()];
    render(<BV mob={false} playInMatches={piMatches} rounds={[]} />);
    expect(screen.getByText('The Lion King')).toBeInTheDocument();
    expect(screen.getByText('Toy Story')).toBeInTheDocument();
  });

  it('renders all round headers from the rounds array', () => {
    const rounds: Match[][] = [
      [makeMatch()],
      [makeMatch(disney2, pixar2)],
    ];
    render(<BV mob={false} playInMatches={[]} rounds={rounds} />);
    // RND[0] = "Round of 64", RND[1] = "Round of 32"
    expect(screen.getByText(/round of 64/i)).toBeInTheDocument();
    expect(screen.getByText(/round of 32/i)).toBeInTheDocument();
  });

  it('upset winner renders in orange (#ff8a65)', () => {
    // seed 4 > seed 1 → upset
    const upsetWinner = { ...pixar2, seed: 10 };
    const upsetLoser  = { ...disney, seed: 1 };
    const piMatches: Match[] = [{ players: [upsetLoser, upsetWinner], winner: upsetWinner }];
    render(<BV mob={false} playInMatches={piMatches} rounds={[]} />);
    const winnerEl = screen.getByText(upsetWinner.name);
    expect(winnerEl).toHaveStyle({ color: '#ff8a65' });
  });
});
