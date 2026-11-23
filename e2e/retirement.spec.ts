import { test, expect } from '@playwright/test';
import { applyPick, resetState } from '../src/lib/bracket';
import { serMatch } from '../src/lib/utils';

test('legacy rooms never load a bracket until explicit solo continuation', async ({ page }) => {
  let state = resetState();
  state = applyPick(state, state.playInMatches[0].players[0]);
  state = applyPick(state, state.playInMatches[1].players[0]);
  const saved = JSON.stringify({ ...state, _v: 2, playInMatches: serMatch(state.playInMatches), rounds: state.rounds.map(serMatch) });
  await page.addInitScript(({ saved }) => {
    localStorage.setItem('dbk-state', saved);
    localStorage.setItem('dbk-notes', '{"59":"keep my note"}');
    localStorage.setItem('dbk-backup-123', 'keep my backup');
    localStorage.setItem('dbk-recent-rooms', '["old-room"]');
  }, { saved });
  const requests: string[] = [];
  page.on('request', request => { requests.push(request.url()); });
  await page.goto('./?room=old&keep=yes&room=second#unselected-room-state');
  await expect(page.getByRole('heading', { name: /co-op rooms have been retired/i })).toBeVisible();
  await expect(page.getByTestId('movie-card')).toHaveCount(0);
  expect(requests.filter(url => /firebase|(?:identitytoolkit|securetoken)\.googleapis|\/src\/App\.tsx/.test(url))).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('dbk-state'))).toBe(saved);
  expect(await page.evaluate(() => localStorage.getItem('dbk-notes'))).toBe('{"59":"keep my note"}');
  expect(await page.evaluate(() => localStorage.getItem('dbk-backup-123'))).toBe('keep my backup');
  await page.reload();
  await expect(page.getByRole('heading', { name: /co-op rooms have been retired/i })).toBeVisible();
  await page.getByRole('button', { name: /continue solo/i }).click();
  await expect(page.getByTestId('movie-card')).toHaveCount(2);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dbk-state') || '{}').playInIndex)).toBe(2);
  expect(new URL(page.url()).search).toBe('?keep=yes');
  expect(await page.evaluate(() => localStorage.getItem('dbk-retired-room-link'))).toContain('#unselected-room-state');
  expect(await page.evaluate(() => localStorage.getItem('dbk-recent-rooms'))).toBe('["old-room"]');
  await expect(page.getByRole('button', { name: /create room|join room|leave room/i })).toHaveCount(0);
});
