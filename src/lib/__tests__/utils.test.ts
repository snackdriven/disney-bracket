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

});

describe('serMatch / desMatch roundtrip', () => {
  const movie1 = { seed: 1, name: 'The Lion King', year: 1994, studio: 'Disney' as const, imdb: '' };
  const movie2 = { seed: 2, name: 'Toy Story', year: 1995, studio: 'Pixar' as const, imdb: '' };

  it('preserves winner correctly', () => {
    const match: Match = { players: [movie1, movie2], winner: movie1 };
    const serialized = serMatch([match]);
    const restored = desMatch(serialized);

    expect(restored[0].players[0]).toEqual(movie1);
    expect(restored[0].players[1]).toEqual(movie2);
    expect(restored[0].winner).toEqual(movie1);
  });

  it('preserves winner-less match', () => {
    const m1 = { seed: 3, name: 'Finding Nemo', year: 2003, studio: 'Pixar' as const, imdb: '' };
    const m2 = { seed: 4, name: 'Beauty and the Beast', year: 1991, studio: 'Disney' as const, imdb: '' };
    const match: Match = { players: [m1, m2] };
    const serialized = serMatch([match]);
    const restored = desMatch(serialized);

    expect(restored[0].players[0]).toEqual(m1);
    expect(restored[0].players[1]).toEqual(m2);
    expect(restored[0].winner).toBeUndefined();
  });

  it('handles serialized null winner (w: null)', () => {
    const serialized = [{ p: [movie1, movie2], w: null }] as SerializedMatch[];
    const restored = desMatch(serialized);
    expect(restored[0].winner).toBeUndefined();
  });
});

describe('desMatch isMovie validation', () => {
  const movie1 = { seed: 1, name: 'The Lion King', year: 1994, studio: 'Disney' as const, imdb: '' };
  const movie2 = { seed: 2, name: 'Toy Story', year: 1995, studio: 'Pixar' as const, imdb: '' };

  it('returns [] when p[0] is a malformed movie object', () => {
    // Missing required fields — should fail isMovie check
    const malformed = [{ p: [{ seed: 1 }, movie2], w: null }];
    expect(desMatch(malformed)).toEqual([]);
  });

  it('returns match without winner when winner is invalid', () => {
    const invalidWinner = { seed: 99, name: 'Fake', year: 0, studio: 'Unknown' };
    const serialized = [{ p: [movie1, movie2], w: invalidWinner }];
    const restored = desMatch(serialized);
    expect(restored).toHaveLength(1);
    expect(restored[0].players[0]).toEqual(movie1);
    expect(restored[0].players[1]).toEqual(movie2);
    expect(restored[0].winner).toBeUndefined();
  });
});

describe('desMatch edge cases', () => {
  it('returns [] for non-array input', () => {
    expect(desMatch(null)).toEqual([]);
    expect(desMatch('string')).toEqual([]);
    expect(desMatch({})).toEqual([]);
  });

  it('skips null entries gracefully', () => {
    expect(desMatch([null])).toEqual([]);
  });

  it('skips entries with null participants gracefully', () => {
    expect(desMatch([{ p: null, w: null }])).toEqual([]);
  });
});
