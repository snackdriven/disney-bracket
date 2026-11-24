import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppRouter } from '../AppRouter';

const imports = vi.hoisted(() => ({ app: vi.fn(), admin: vi.fn() }));
vi.mock('../App', () => {
  imports.app();
  return { default: () => <div data-testid="solo-app">Solo bracket</div> };
});
vi.mock('../components/AdminPage', () => {
  imports.admin();
  return { AdminPage: () => <div data-testid="admin-page">Metadata admin</div> };
});

beforeEach(() => {
  window.history.replaceState(null, '', '/disney-bracket/');
  localStorage.setItem('dbk-state', 'saved bracket');
  localStorage.setItem('dbk-notes', 'saved notes');
  localStorage.setItem('dbk-backup-1', 'old backup');
  sessionStorage.clear();
});
afterEach(() => { vi.restoreAllMocks(); });

describe('retired room routing', () => {
  it.each(['?room=SIMB-12', '?room=', '?room=a&room=b', '?room=bad%2Fpath'])('gates %s before importing the bracket app', (query) => {
    window.history.replaceState(null, '', `/disney-bracket/${query}#old-room-state`);
    const importCount = imports.app.mock.calls.length;
    const localWrite = vi.spyOn(Storage.prototype, 'setItem');
    render(<AppRouter />);
    expect(screen.getByRole('heading', { name: /co-op rooms have been retired/i })).toBeInTheDocument();
    expect(screen.queryByTestId('solo-app')).not.toBeInTheDocument();
    expect(imports.app).toHaveBeenCalledTimes(importCount);
    expect(localWrite).not.toHaveBeenCalled();
    expect(localStorage.getItem('dbk-state')).toBe('saved bracket');
    expect(localStorage.getItem('dbk-notes')).toBe('saved notes');
    expect(localStorage.getItem('dbk-backup-1')).toBe('old backup');
  });

  it('preserves the original link and removes room parameters and unselected hash only on explicit continuation', async () => {
    window.history.replaceState(null, '', '/disney-bracket/?room=a&other=keep&room=b#old-room-state');
    const original = window.location.href;
    render(<AppRouter />);
    fireEvent.click(screen.getByRole('button', { name: /continue solo/i }));
    await screen.findByTestId('solo-app');
    expect(window.location.search).toBe('?other=keep');
    expect(window.location.hash).toBe('');
    expect(localStorage.getItem('dbk-retired-room-link')).toBe(original);
    expect(localStorage.getItem('dbk-state')).toBe('saved bracket');
  });

  it.each(['#access_token=private&token_type=bearer', '#token_hash=private', '#id_token=private'])('preserves auth callback %s without storing its credentials in recovery', async (hash) => {
    window.history.replaceState(null, '', `/disney-bracket/?room=a&other=keep${hash}`);
    render(<AppRouter />);
    fireEvent.click(screen.getByRole('button', { name: /continue solo/i }));
    await screen.findByTestId('solo-app');
    expect(window.location.hash).toBe(hash);
    expect(localStorage.getItem('dbk-retired-room-link')).not.toContain('private');
    expect(window.location.search).toBe('?other=keep');
  });

  it('keeps the retirement gate and original URL when recovery storage is unavailable', () => {
    window.history.replaceState(null, '', '/disney-bracket/?room=a#old-room-state');
    const original = window.location.href;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    render(<AppRouter />);
    fireEvent.click(screen.getByRole('button', { name: /continue solo/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/copy.*link/i);
    expect(screen.queryByTestId('solo-app')).not.toBeInTheDocument();
    expect(window.location.href).toBe(original);
  });

  it('offers selectable link text when clipboard is unavailable', async () => {
    window.history.replaceState(null, '', '/disney-bracket/?room=a#old-room-state');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    render(<AppRouter />);
    fireEvent.click(screen.getByRole('button', { name: /copy room link/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/select.*copy/i));
    expect(screen.getByLabelText(/original room link/i)).toHaveValue(window.location.href);
  });

  it('leaves ordinary solo share hashes intact', async () => {
    window.history.replaceState(null, '', '/disney-bracket/?other=keep#solo-state');
    render(<AppRouter />);
    await screen.findByTestId('solo-app');
    expect(window.location.hash).toBe('#solo-state');
  });

  it('does not display or copy credentials from a legacy room auth callback', async () => {
    window.history.replaceState(null, '', '/disney-bracket/?room=old#access_token=private-token&refresh_token=private-refresh');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<AppRouter />);
    expect(screen.getByRole('textbox', { name: 'Original room link' })).toHaveValue('http://localhost:3000/disney-bracket/?room=old');
    fireEvent.click(screen.getByRole('button', { name: 'Copy room link' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('http://localhost:3000/disney-bracket/?room=old'));
    expect(window.location.hash).toContain('access_token=private-token');
  });

  it('preserves the existing admin route precedence', async () => {
    window.history.replaceState(null, '', '/disney-bracket/?admin=1&room=a');
    render(<AppRouter />);
    await screen.findByTestId('admin-page');
    expect(screen.queryByText(/co-op rooms have been retired/i)).not.toBeInTheDocument();
  });

  it('gates legacy room URLs reached through back navigation', async () => {
    render(<AppRouter />);
    await screen.findByTestId('solo-app');
    window.history.pushState(null, '', '?room=old#old-room-state');
    fireEvent.popState(window);
    expect(screen.getByRole('heading', { name: /co-op rooms have been retired/i })).toBeInTheDocument();
    expect(screen.queryByTestId('solo-app')).not.toBeInTheDocument();
  });
});
