import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SyncStatusPanel } from '../SyncStatusPanel.js';

afterEach(cleanup);

const defaults = {
  authReady: true, signedIn: true, syncReady: true, syncStatus: 'synced',
  syncError: null, syncConflict: null,
  retrySync: vi.fn(), resolveSyncConflict: vi.fn().mockResolvedValue(true),
};

describe('SyncStatusPanel', () => {
  it('distinguishes restoring sign-in from loading a signed-in user’s saved bracket', () => {
    const { rerender } = render(<SyncStatusPanel {...defaults} authReady={false} signedIn={false} />);
    expect(screen.getByRole('status')).toHaveTextContent(/checking sign-in/i);
    rerender(<SyncStatusPanel {...defaults} syncReady={false} syncStatus="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading your saved bracket/i);
  });

  it('shows an error and a retry action rather than claiming the save succeeded', () => {
    const retrySync = vi.fn();
    render(<SyncStatusPanel {...defaults} syncStatus="error" syncError="Permission denied" retrySync={retrySync} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Permission denied');
    expect(screen.queryByText(/all changes saved/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry cloud save/i }));
    expect(retrySync).toHaveBeenCalledOnce();
  });

  it('explains the pick, note, and champion impact before choosing a differing version', () => {
    const resolveSyncConflict = vi.fn().mockResolvedValue(true);
    render(<SyncStatusPanel {...defaults} syncStatus="conflict" syncReady={false}
      syncConflict={{
        local: { state: { history: [{}, {}], champion: null }, notes: { 1: 'local note' } },
        cloud: { state: { history: [{}], champion: { name: 'Coco' } }, notes: {} },
      }} resolveSyncConflict={resolveSyncConflict} />);
    expect(screen.getByText(/this device: 2 picks, 1 movie note, no champion/i)).toBeInTheDocument();
    expect(screen.getByText(/cloud: 1 pick, 0 movie notes, champion Coco/i)).toBeInTheDocument();
    expect(screen.getByText(/both versions.*recovery/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /use cloud bracket/i }));
    expect(resolveSyncConflict).toHaveBeenCalledWith('cloud');
  });

  it('keeps recovery export available after a conflict is resolved', () => {
    render(<SyncStatusPanel {...defaults} syncRecovery={{
      local: { state: { history: [{}, {}] }, notes: {} },
      cloud: { state: { history: [{}] }, notes: {} },
    }} />);
    expect(screen.getByRole('link', { name: /download both recovered versions/i })).toHaveAttribute('download', 'disney-bracket-sync-recovery.json');
    const href = screen.getByRole('link', { name: /download both recovered versions/i }).getAttribute('href')!;
    const exported = JSON.parse(decodeURIComponent(href.split(',')[1]));
    expect(exported.local.state.history).toHaveLength(2);
    expect(exported.cloud.state.history).toHaveLength(1);
  });

  it('does not show cloud loading or conflict actions for signed-out solo play', () => {
    const { container } = render(<SyncStatusPanel {...defaults} signedIn={false} syncReady={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
