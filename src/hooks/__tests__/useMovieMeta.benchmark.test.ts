import { renderHook, act } from '@testing-library/react';
import { useMovieMeta } from '../useMovieMeta.js';
import { describe, it, expect } from 'vitest';

describe('useMovieMeta Performance', () => {
  it('benchmarks updates', () => {
    const { result } = renderHook(() => useMovieMeta());

    const start = performance.now();
    act(() => {
      for (let i = 1; i <= 1000; i++) {
        result.current.updateSingleMeta(i, { posterPath: `/poster-${i}.jpg` });
      }
    });
    const end = performance.now();

    console.log(`Time taken for 1000 synchronous updates: ${(end - start).toFixed(2)} ms`);
    expect(true).toBe(true);
  });
});
