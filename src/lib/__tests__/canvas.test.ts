import { describe, it, expect, vi } from 'vitest';
import { clx, crx, cps, cmty, CW, CSW, drawBracket } from '../canvas.js';
import { resetState, applyPick } from '../bracket.js';
import { PIP, PLAYIN } from '../data.js';

describe('canvas position math', () => {
  it('clx(0) returns left column x for round 0', () => {
    expect(clx(0)).toBe(10);
  });

  it('clx increases with each round', () => {
    expect(clx(1)).toBeGreaterThan(clx(0));
    expect(clx(2)).toBeGreaterThan(clx(1));
    expect(clx(3)).toBeGreaterThan(clx(2));
    expect(clx(4)).toBeGreaterThan(clx(3));
  });

  it('crx(0) returns right column x for round 0', () => {
    expect(crx(0)).toBe(CW - 10 - CSW);
  });

  it('crx decreases with each round (columns move inward)', () => {
    expect(crx(1)).toBeLessThan(crx(0));
    expect(crx(2)).toBeLessThan(crx(1));
    expect(crx(3)).toBeLessThan(crx(2));
    expect(crx(4)).toBeLessThan(crx(3));
  });

  it('cps(0) returns 16 matches per side for R64', () => {
    expect(cps(0)).toBe(16);
  });

  it('cps halves each round', () => {
    expect(cps(1)).toBe(8);
    expect(cps(2)).toBe(4);
    expect(cps(3)).toBe(2);
    expect(cps(4)).toBe(1);
  });

  it('cmty(0, 0) equals 60', () => {
    // CBT=60, CBH=900, cps(0)=16, CMH=56: Math.round(60 + (900/16)*0.5 - 28) = 60
    expect(cmty(0, 0)).toBe(60);
  });

  it('cmty increases with position index', () => {
    expect(cmty(0, 1)).toBeGreaterThan(cmty(0, 0));
    expect(cmty(0, 7)).toBeGreaterThan(cmty(0, 3));
  });
});

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
      rds: state.rds, piM: state.piM, ch: null, upsets: [], imgs: {}
    });
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalled();
  });
});
