import { describe, it, expect } from 'vitest';
import { MAIN, PLAYIN, PIP, R1, STATIC_META, ALL_MOVIES, BRACKET_ORDER } from '../data.js';

describe('data constants', () => {
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
      expect(m.year).toBeGreaterThanOrEqual(1937); // Snow White (1937) is the earliest possible Disney film
      expect(m.year).toBeLessThanOrEqual(new Date().getFullYear());
      expect(m.studio === 'Disney' || m.studio === 'Pixar').toBe(true);
    });
  });

  it('BRACKET_ORDER covers all 70 movies', () => {
    expect(BRACKET_ORDER.length).toBe(70);
    const seeds = new Set(BRACKET_ORDER.map(m => m.seed));
    expect(seeds.size).toBe(70);
  });

  it('all movies have non-empty imdb fields', () => {
    [...MAIN, ...PLAYIN].forEach(m => { expect(m.imdb.length).toBeGreaterThan(0); });
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
