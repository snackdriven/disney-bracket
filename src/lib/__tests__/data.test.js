import { describe, it, expect } from 'vitest';
import { MAIN, PLAYIN, PIP, R1, RND, REG, STATIC_META, ALL_MOVIES, BRACKET_ORDER } from '../data.js';

describe('data constants', () => {
  it('has 70 total movies', () => {
    expect(MAIN.length + PLAYIN.length).toBe(70);
  });

  it('MAIN has 58 movies with seeds 1-58', () => {
    expect(MAIN.length).toBe(58);
    const seeds = MAIN.map(m => m.seed).sort((a, b) => a - b);
    expect(seeds[0]).toBe(1);
    expect(seeds[57]).toBe(58);
  });

  it('PLAYIN has 12 movies with seeds 59-70', () => {
    expect(PLAYIN.length).toBe(12);
    const seeds = PLAYIN.map(m => m.seed).sort((a, b) => a - b);
    expect(seeds[0]).toBe(59);
    expect(seeds[11]).toBe(70);
  });

  it('no duplicate seed numbers', () => {
    const allSeeds = ALL_MOVIES.map(m => m.seed);
    const unique = new Set(allSeeds);
    expect(unique.size).toBe(70);
  });

  it('PIP has exactly 6 pairs covering seeds 59-70', () => {
    expect(PIP.length).toBe(6);
    const counts = {};
    PIP.flatMap(([a, b]) => [PLAYIN[a].seed, PLAYIN[b].seed]).forEach(s => {
      counts[s] = (counts[s] || 0) + 1;
    });
    for (let s = 59; s <= 70; s++) {
      expect(counts[s]).toBe(1);
    }
  });

  it('R1 has 32 pairs', () => {
    expect(R1.length).toBe(32);
  });

  it('R1 pairs reference valid indices (0-63)', () => {
    R1.forEach(([a, b]) => {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(63);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(63);
    });
  });

  it('STATIC_META has an entry for all 70 seeds', () => {
    ALL_MOVIES.forEach(m => {
      expect(STATIC_META[m.seed]).toBeDefined();
    });
  });

  it('all movies have required fields', () => {
    ALL_MOVIES.forEach(m => {
      expect(typeof m.seed).toBe('number');
      expect(typeof m.name).toBe('string');
      expect(typeof m.year).toBe('number');
      expect(m.studio === 'Disney' || m.studio === 'Pixar').toBe(true);
    });
  });

  it('RND has 6 round names', () => {
    expect(RND.length).toBe(6);
  });

  it('REG has 4 region names', () => {
    expect(REG.length).toBe(4);
  });

  it('ALL_MOVIES is MAIN + PLAYIN', () => {
    expect(ALL_MOVIES.length).toBe(70);
    expect(ALL_MOVIES[0]).toBe(MAIN[0]);
    expect(ALL_MOVIES[58]).toBe(PLAYIN[0]);
  });

  it('BRACKET_ORDER covers all 70 movies', () => {
    expect(BRACKET_ORDER.length).toBe(70);
    const seeds = new Set(BRACKET_ORDER.map(m => m.seed));
    expect(seeds.size).toBe(70);
  });
});
