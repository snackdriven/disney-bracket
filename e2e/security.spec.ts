import { test, expect } from '@playwright/test';
import { bracket, saved, seedDevice } from './fixtures';

test('[P0][SECURITY] corrupt saves cannot replace device work and divergent imports require a choice', async ({ page }) => {
  const device = await seedDevice(page, 69);
  const link = bracket(1);
  await page.goto('./#' + btoa(JSON.stringify(link)));
  await expect(page.getByRole('alert')).toContainText('Saving is paused');
  expect((await saved(page)).history).toHaveLength(69);
  await page.getByRole('button', { name: 'Use link bracket', exact: true }).click();
  expect((await saved(page)).history).toHaveLength(1);
  const recovery = await page.evaluate(() => JSON.parse(localStorage.getItem('dbk-import-recovery')!));
  expect(JSON.parse(recovery.deviceRaw)).toEqual(device);
  expect(JSON.parse(recovery.linkRaw)).toEqual(link);

  const corrupt = JSON.stringify({ ...device, rounds: 'invalid rounds' });
  await page.evaluate(raw => { localStorage.setItem('dbk-state', raw); window.history.replaceState(null, '', window.location.pathname); }, corrupt);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Saving is paused');
  await expect(page.getByRole('button', { name: 'Export recovery copy' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('dbk-state'))).toBe(corrupt);
});

test('[P0][SECURITY] retired room links cannot initialize sync, import room data, or expose auth tokens', async ({ page, context }) => {
  const device = await seedDevice(page, 2);
  const requests: string[] = [];
  page.on('request', request => { requests.push(request.url()); });
  await page.goto('./?room=old&keep=yes&room=second#unselected-room-state');
  await expect(page.getByRole('heading', { name: /co-op rooms have been retired/i })).toBeVisible();
  await expect(page.getByTestId('movie-card')).toHaveCount(0);
  expect(requests.filter(url => /firebase|(?:identitytoolkit|securetoken)\.googleapis|\/src\/App\.tsx/.test(url))).toEqual([]);
  expect(await saved(page)).toEqual(device);
  await page.getByRole('button', { name: /continue solo/i }).click();
  await expect(page.getByTestId('movie-card')).toHaveCount(2);
  expect((await saved(page)).history).toHaveLength(2);
  expect(new URL(page.url()).search).toBe('?keep=yes');
  expect(await page.evaluate(() => localStorage.getItem('dbk-retired-room-link'))).toContain('#unselected-room-state');

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./?room=old#access_token=synthetic-secret&refresh_token=synthetic-refresh');
  await expect(page.getByRole('heading', { name: /co-op rooms have been retired/i })).toBeVisible();
  expect(await page.getByRole('textbox', { name: 'Original room link' }).inputValue()).not.toContain('synthetic-secret');
  await page.getByRole('button', { name: 'Copy room link', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Room link copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).not.toContain('synthetic-secret');
  expect(copied).not.toContain('synthetic-refresh');
  expect(page.url()).toContain('access_token=synthetic-secret');
});
