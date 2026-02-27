import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadLS, saveLS, extractImdbId, serMatch, desMatch } from '../utils.js';

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
    // v = 'null' (truthy string) → JSON.parse('null') = null
    // The ternary checks v, not the parsed result, so null is returned
    expect(loadLS('null-key', 'default')).toBeNull();
  });
});

describe('saveLS', () => {
  it('writes serialized value to localStorage', () => {
    saveLS('save-test', { a: 1 });
    expect(localStorage.getItem('save-test')).toBe('{"a":1}');
  });

  it('silently swallows storage errors', () => {
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => { throw new Error('quota exceeded'); };
    expect(() => saveLS('any', 'val')).not.toThrow();
    localStorage.setItem = origSetItem;
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
  it('preserves winner correctly', () => {
    const movie1 = { seed: 1, name: 'The Lion King' };
    const movie2 = { seed: 2, name: 'Toy Story' };
    const match = [movie1, movie2];
    match.winner = movie1;
    const matches = [match];

    const serialized = serMatch(matches);
    const restored = desMatch(serialized);

    expect(restored[0][0]).toEqual(movie1);
    expect(restored[0][1]).toEqual(movie2);
    expect(restored[0].winner).toEqual(movie1);
  });

  it('preserves winner-less match', () => {
    const movie1 = { seed: 3, name: 'Finding Nemo' };
    const movie2 = { seed: 4, name: 'Beauty and the Beast' };
    const match = [movie1, movie2];
    const matches = [match];

    const serialized = serMatch(matches);
    const restored = desMatch(serialized);

    expect(restored[0][0]).toEqual(movie1);
    expect(restored[0][1]).toEqual(movie2);
    expect(restored[0].winner).toBeUndefined();
  });

  it('handles multiple matches correctly', () => {
    const m1 = [{ seed: 1 }, { seed: 2 }];
    m1.winner = m1[0];
    const m2 = [{ seed: 3 }, { seed: 4 }];
    // no winner on m2

    const serialized = serMatch([m1, m2]);
    const restored = desMatch(serialized);

    expect(restored[0].winner).toEqual({ seed: 1 });
    expect(restored[1].winner).toBeUndefined();
  });
});
