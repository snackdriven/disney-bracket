import { describe, it, expect, vi } from 'vitest';
import { drawBracket } from '../canvas.js';
import { resetState, applyPick } from '../bracket.js';
import { PIP, PLAYIN } from '../data.js';

describe('drawBracket', () => {
  it('does not throw on a post-playin state with no imgs', () => {
    // Exhaustive mock of every ctx property/method canvas.ts touches.
    // Wrapped in a Proxy so any new ctx usage in canvas.ts fails loudly instead of silently.
    const mockCtxBase = {
      fillStyle: '' as unknown, strokeStyle: '' as unknown, lineWidth: 1 as unknown,
      font: '' as unknown, textAlign: 'left' as unknown,
      fillRect: vi.fn(), clearRect: vi.fn(), beginPath: vi.fn(),
      moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), fill: vi.fn(),
      fillText: vi.fn(), measureText: vi.fn(() => ({ width: 50 })),
      drawImage: vi.fn(), roundRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      save: vi.fn(), restore: vi.fn(), clip: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(),
    };
    const mockCtx = new Proxy(mockCtxBase, {
      get(target, prop) {
        if (!(prop in target)) throw new Error(`canvas.ts accessed ctx.${String(prop)} — add it to the mock`);
        return target[prop as keyof typeof target];
      },
      set(target, prop, value) {
        if (!(prop in target)) throw new Error(`canvas.ts set ctx.${String(prop)} — add it to the mock`);
        (target as Record<string, unknown>)[String(prop)] = value;
        return true;
      },
    }) as unknown as CanvasRenderingContext2D;
    const mockCanvas = { getContext: vi.fn(() => mockCtx), width: 1920, height: 1080 } as unknown as HTMLCanvasElement;

    let state = resetState();
    PIP.forEach(([a]) => { state = applyPick(state, PLAYIN[a]); });

    drawBracket(mockCanvas, {
      rounds: state.rounds, playInMatches: state.playInMatches, ch: null, upsets: [], imgs: {}
    });
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalled();
  });
});
