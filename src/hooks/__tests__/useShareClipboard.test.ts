import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useShareClipboard } from '../useShareClipboard';

beforeEach(() => { window.history.replaceState(null, '', '/#old-draw'); });

describe('sharing current draw', () => {
  it('copies the current serialized state instead of a stale address-bar hash', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: write } });
    const state = { _v: 2, sweet16Rerolled: true, currentMatch: 0 };
    const { result } = renderHook(() => useShareClipboard([], [], null, state));
    await act(async () => result.current.copyLink());
    const copied = new URL(write.mock.calls[0][0]);
    expect(JSON.parse(atob(copied.hash.slice(1)))).toEqual(state);
    expect(result.current.copiedLink).toBe(true);
  });

  it('does not copy an old draw when the new draw exceeds the link policy', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: write } });
    const { result } = renderHook(() => useShareClipboard([], [], null, { content: 'x'.repeat(9000) }));
    await act(async () => result.current.copyLink());
    expect(write).not.toHaveBeenCalled();
    expect(result.current.copiedLink).toBe(false);
    expect(result.current.shareError).toMatch(/too large|export/i);
  });

  it('reports failed clipboard writes instead of claiming a copied link', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    const { result } = renderHook(() => useShareClipboard([], [], null, { _v: 2 }));
    await act(async () => result.current.copyLink());
    expect(result.current.copiedLink).toBe(false);
    expect(result.current.shareError).toBeTruthy();
  });
});
