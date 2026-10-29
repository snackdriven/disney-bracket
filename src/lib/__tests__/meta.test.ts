import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { fetchSingleMovieMeta } from '../meta.js';
import type { Movie } from '../../types.js';

describe('fetchSingleMovieMeta', () => {
  const mockMovie: Movie = {
    seed: 1,
    name: "Test Movie",
    year: 1999,
    studio: "Disney",
    imdb: "https://www.imdb.com/title/tt1234567/"
  };

  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('silently returns initial result if fetch throws an error', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    // Call fetchSingleMovieMeta with tmdbKey to trigger the fetch
    const result = await fetchSingleMovieMeta(mockMovie, 'dummy_tmdb_key', null);

    // It should catch the error and return an empty object, not throw
    expect(result).toEqual({});
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
