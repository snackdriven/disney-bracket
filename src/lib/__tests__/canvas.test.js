import { describe, it, expect } from 'vitest';
import { clx, crx, cps, cmty, CW, CSW, CSTEP, CBT, CBH, CMH } from '../canvas.js';
import { buildDisplayRds, resetState, applyPick } from '../bracket.js';
import { PIP, PLAYIN } from '../data.js';

// Canvas constants for expected value calculations
const expectedClx = r => 10 + r * CSTEP;
const expectedCrx = r => CW - 10 - CSW - r * CSTEP;
const expectedCps = r => Math.round(16 / Math.pow(2, r));
const expectedCmty = (r, i) => {
  const sp = CBH / expectedCps(r);
  return Math.round(CBT + sp * (i + 0.5) - CMH / 2);
};

describe('canvas position math', () => {
  it('clx(0) returns left column x for round 0', () => {
    expect(clx(0)).toBe(expectedClx(0));
    expect(clx(0)).toBe(10);
  });

  it('clx increases with each round', () => {
    expect(clx(1)).toBeGreaterThan(clx(0));
    expect(clx(2)).toBeGreaterThan(clx(1));
  });

  it('crx(0) returns right column x for round 0', () => {
    expect(crx(0)).toBe(expectedCrx(0));
    expect(crx(0)).toBe(CW - 10 - CSW);
  });

  it('crx decreases with each round (columns move inward)', () => {
    expect(crx(1)).toBeLessThan(crx(0));
    expect(crx(2)).toBeLessThan(crx(1));
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

  it('cmty(0, 0) returns a positive Y coordinate', () => {
    expect(cmty(0, 0)).toBeGreaterThan(0);
  });

  it('cmty(0, 0) matches expected calculation', () => {
    expect(cmty(0, 0)).toBe(expectedCmty(0, 0));
  });

  it('cmty increases with position index', () => {
    expect(cmty(0, 1)).toBeGreaterThan(cmty(0, 0));
    expect(cmty(0, 7)).toBeGreaterThan(cmty(0, 3));
  });
});

describe('buildDisplayRds with partial bracket state', () => {
  it('synthesizes R64 from empty rounds', () => {
    const state = resetState();
    const display = buildDisplayRds(state.rds, state.piM);
    expect(display[0]).toBeDefined();
    expect(display[0].length).toBe(32);
  });

  it('all R64 slots have two entries', () => {
    const state = resetState();
    const display = buildDisplayRds(state.rds, state.piM);
    display[0].forEach(match => {
      expect(match.length).toBe(2);
    });
  });

  it('projects partial R32 from R64 winners', () => {
    let state = resetState();
    // Complete all 6 play-in picks
    PIP.forEach(([a]) => { state = applyPick(state, PLAYIN[a]); });
    // Pick first 2 R64 matches
    state = applyPick(state, state.rds[0][0][0]);
    state = applyPick(state, state.rds[0][1][0]);
    const display = buildDisplayRds(state.rds, state.piM);
    // R32 should be projected
    expect(display[1]).toBeDefined();
    // First R32 match should have the two R64 winners
    expect(display[1][0][0]).toBeDefined();
    expect(display[1][0][1]).toBeDefined();
  });

  it('returns existing rounds unchanged', () => {
    let state = resetState();
    PIP.forEach(([a]) => { state = applyPick(state, PLAYIN[a]); });
    const winner = state.rds[0][0][0];
    state = applyPick(state, winner);
    const display = buildDisplayRds(state.rds, state.piM);
    expect(display[0][0].winner).toBe(winner);
  });
});
