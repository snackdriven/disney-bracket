import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadLS, saveLS, extractImdbId, serMatch, desMatch } from '../utils.js';
import type { Match, SerializedMatch } from '../../types.js';

afterEach(() => localStorage.clear());

describe('loadLS', () => {
  it('returns fallback when key missing', () => {
    expect(loadLS('nonexistent-key', 'default')).toBe('default');
  });

  it('returns parsed value when present', () => {
    localStorage.setItem('test-key', JSON.stringify({ x: 42 }));
    expect(loadLS('test-key', null)).toEqual({ x: 42 });
  });

  it('returns fallback on corrupt JSON', () => {
    localStorage.setItem('bad-key', 'not{json}');
    expect(loadLS('bad-key', 'fallback')).toBe('fallback');
  });

  it('returns null (not fallback) when stored value is "null"', () => {
    localStorage.setItem('null-key', 'null');
    // Intentional: storing explicit null returns null, not fallback. Callers must handle null explicitly.
    expect(loadLS('null-key', 'default')).toBeNull();
  });

  it('returns fallback when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('storage unavailable');
    });
    expect(loadLS('any-key', 'fallback')).toBe('fallback');
  });
});

describe('saveLS', () => {
  it('writes serialized value to localStorage', () => {
    saveLS('save-test', { a: 1 });
    expect(localStorage.getItem('save-test')).toBe('{"a":1}');
  });

  it('saveLS then loadLS roundtrips the value', () => {
    saveLS('roundtrip-key', { x: 42 });
    expect(loadLS('roundtrip-key', null)).toEqual({ x: 42 });
  });

  it('silently swallows storage errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota exceeded');
    });
    expect(() => saveLS('any', 'val')).not.toThrow();
  });
});

describe('extractImdbId', () => {
  it('extracts tt-id from full IMDB URL', () => {
    expect(extractImdbId('https://www.imdb.com/title/tt0110357/')).toBe('tt0110357');
  });

  it('extracts from bare ID string', () => {
    expect(extractImdbId('tt0114709')).toBe('tt0114709');
  });

  it('returns null for undefined', () => {
    expect(extractImdbId(undefined)).toBeNull();
  });

  it('returns null for non-matching string', () => {
    expect(extractImdbId('https://example.com/no-id-here')).toBeNull();
  });
});

describe('serMatch / desMatch roundtrip', () => {
  const movie1 = { seed: 1, name: 'The Lion King', year: 1994, studio: 'Disney' as const, imdb: '' };
  const movie2 = { seed: 2, name: 'Toy Story', year: 1995, studio: 'Pixar' as const, imdb: '' };

  it('preserves winner correctly', () => {
    const match = [movie1, movie2] as Match;
    match.winner = movie1;
    const matches: Match[] = [match];

    const serialized = serMatch(matches);
    const restored = desMatch(serialized);

    expect(restored[0][0]).toEqual(movie1);
    expect(restored[0][1]).toEqual(movie2);
    expect(restored[0].winner).toEqual(movie1);
  });

  it('preserves winner-less match', () => {
    const movie1 = { seed: 3, name: 'Finding Nemo', year: 2003, studio: 'Pixar' as const, imdb: '' };
    const movie2 = { seed: 4, name: 'Beauty and the Beast', year: 1991, studio: 'Disney' as const, imdb: '' };
    const match = [movie1, movie2] as Match;
    const matches: Match[] = [match];

    const serialized = serMatch(matches);
    const restored = desMatch(serialized);

    expect(restored[0][0]).toEqual(movie1);
    expect(restored[0][1]).toEqual(movie2);
    expect(restored[0].winner).toBeUndefined();
  });

  it('handles multiple matches correctly', () => {
    const m1 = [{ seed: 1, name: '', year: 0, studio: 'Disney' as const, imdb: '' }, { seed: 2, name: '', year: 0, studio: 'Pixar' as const, imdb: '' }] as Match;
    m1.winner = m1[0];
    const m2 = [{ seed: 3, name: '', year: 0, studio: 'Disney' as const, imdb: '' }, { seed: 4, name: '', year: 0, studio: 'Pixar' as const, imdb: '' }] as Match;
    // no winner on m2

    const serialized = serMatch([m1, m2]);
    const restored = desMatch(serialized);

    expect(restored[0].winner?.seed).toBe(1);
    expect(restored[1].winner).toBeUndefined();
  });

  it('handles serialized null winner (w: null)', () => {
    const serialized = [{ p: [movie1, movie2], w: null }] as SerializedMatch[];
    const restored = desMatch(serialized);
    expect(restored[0].winner).toBeUndefined();
  });
});

describe('desMatch edge cases', () => {
  it('returns [] for null', () => {
    expect(desMatch(null)).toEqual([]);
  });

  it('returns [] for a string', () => {
    expect(desMatch('string')).toEqual([]);
  });

  it('returns [] for a plain object', () => {
    expect(desMatch({})).toEqual([]);
  });

  it('returns [] for an empty array', () => {
    expect(desMatch([])).toEqual([]);
  });

  it('throws TypeError on array with null entry — known gap: no per-element guard', () => {
    expect(() => desMatch([null])).toThrow(TypeError);
  });

  it('throws TypeError on entry with null participants — known gap: no inner validation', () => {
    expect(() => desMatch([{ p: null, w: null }])).toThrow(TypeError);
  });
});
