import { test, expect } from '@playwright/test';
import { pickFirst } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

test('picks survive a hard reload', async ({ page }) => {
  await pickFirst(page);
  await pickFirst(page);
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 3 of 6');

  await page.reload();
  await page.waitForLoadState('networkidle');

  // Counter should be restored
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 3 of 6', { timeout: 5000 });

  const stored = await page.evaluate(() => localStorage.getItem('dbk-state'));
  expect(stored).not.toBeNull();
  const state = JSON.parse(stored);
  // piM is serialized as array of { p, w } objects via serMatch
  const winner = state.piM?.[0]?.w;
  expect(winner).not.toBeNull();
  // The winner of match 1 should no longer appear as a current card
  const currentNames = await page.locator('[data-testid="movie-card"]').allTextContents();
  expect(currentNames.some(n => n.includes(winner.name))).toBe(false);
});

test('URL hash is updated after first pick', async ({ page }) => {
  const initialUrl = page.url();

  await pickFirst(page);

  // Wait for the URL hash to be written (React effect runs after state update)
  await page.waitForFunction(() => window.location.hash.length > 0, { timeout: 5000 });

  const newUrl = page.url();
  expect(newUrl).toContain('#');
  expect(newUrl).not.toBe(initialUrl);
  // Hash should be base64-encoded bracket state, not auth tokens
  const hash = new URL(newUrl).hash.slice(1);
  expect(hash).toMatch(/^eyJ/); // btoa'd JSON starts with eyJ
});

test('loading a share URL restores the bracket state', async ({ page }) => {
  await pickFirst(page);
  await pickFirst(page);
  await pickFirst(page);

  // Wait for the counter to reflect all 3 picks, then wait for the hash effect to fire
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 4 of 6');
  await page.waitForFunction(() => window.location.hash.length > 0, { timeout: 5000 });

  const shareUrl = page.url();
  expect(shareUrl).toContain('#');

  const page2 = await page.context().newPage();
  try {
    await page2.goto(shareUrl);
    await page2.waitForLoadState('networkidle');

    // Match position should be restored
    await expect(page2.locator('[data-testid="match-counter"]')).toHaveText('Match 4 of 6', { timeout: 5000 });

  } finally {
    await page2.close();
  }
});

test('hash not overwritten when access_token is in URL', async ({ page }) => {
  const authUrl = page.url() + '#access_token=fake_token_here&type=magiclink';
  await page.goto(authUrl);
  await page.waitForLoadState('networkidle');

  const hash = new URL(page.url()).hash;
  expect(hash).not.toMatch(/^#eyJ/);
  expect(hash).toContain('access_token');
});
