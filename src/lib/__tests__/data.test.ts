import { describe, it, expect } from 'vitest';
import { MAIN, PLAYIN, PIP, R1, RND, REG, STATIC_META, ALL_MOVIES, BRACKET_ORDER } from '../data.js';

describe('data constants', () => {
  it('has 70 total movies', () => {
    expect(MAIN.length + PLAYIN.length).toBe(70);
  });

  it('MAIN has 58 movies with seeds 1-58 (contiguous)', () => {
    expect(MAIN.length).toBe(58);
    const seeds = MAIN.map(m => m.seed).sort((a, b) => a - b);
    seeds.forEach((s, i) => expect(s).toBe(i + 1));
  });

  it('PLAYIN has 12 movies with seeds 59-70 (contiguous)', () => {
    expect(PLAYIN.length).toBe(12);
    const seeds = PLAYIN.map(m => m.seed).sort((a, b) => a - b);
    seeds.forEach((s, i) => expect(s).toBe(i + 59));
  });

  it('no duplicate seed numbers', () => {
    const allSeeds = ALL_MOVIES.map(m => m.seed);
    const unique = new Set(allSeeds);
    expect(unique.size).toBe(70);
  });

  it('PIP has exactly 6 pairs covering seeds 59-70', () => {
    expect(PIP.length).toBe(6);
    const counts: Record<number, number> = {};
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
      expect(m.name.length).toBeGreaterThan(0);
      expect(typeof m.year).toBe('number');
      expect(m.year).toBeGreaterThan(1900);
      expect(m.studio === 'Disney' || m.studio === 'Pixar').toBe(true);
    });
  });

  it('RND has 6 round names', () => {
    expect(RND.length).toBe(6);
  });

  it('REG has 4 region names', () => {
    expect(REG.length).toBe(4);
  });

  it('ALL_MOVIES is MAIN then PLAYIN in order', () => {
    expect(ALL_MOVIES.every((m, i) =>
      m === (i < MAIN.length ? MAIN[i] : PLAYIN[i - MAIN.length])
    )).toBe(true);
  });

  it('BRACKET_ORDER covers all 70 movies', () => {
    expect(BRACKET_ORDER.length).toBe(70);
    const seeds = new Set(BRACKET_ORDER.map(m => m.seed));
    expect(seeds.size).toBe(70);
  });

  it('MAIN movies all have non-empty imdb fields', () => {
    MAIN.forEach(m => { expect(m.imdb.length).toBeGreaterThan(0); });
  });

  it('PLAYIN movies all have non-empty imdb fields', () => {
    PLAYIN.forEach(m => { expect(m.imdb.length).toBeGreaterThan(0); });
  });

  it('R1 has no duplicate movie references', () => {
    const indices = R1.flatMap(([a, b]) => [a, b]);
    expect(new Set(indices).size).toBe(64);
  });

  it('STATIC_META entries have all content fields', () => {
    ALL_MOVIES.forEach(m => {
      const entry = STATIC_META[m.seed];
      expect(entry.runtime?.length ?? 0).toBeGreaterThan(0);
      expect(entry.rating?.length ?? 0).toBeGreaterThan(0);
      expect(entry.poster?.length ?? 0).toBeGreaterThan(0);
      expect(entry.plot?.length ?? 0).toBeGreaterThan(0);
    });
  });
});
