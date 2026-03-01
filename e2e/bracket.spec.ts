import { test, expect } from '@playwright/test';
import { pickFirst } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

test('play-in round loads on fresh start', async ({ page }) => {
  await expect(page.locator('[data-testid="round-label"]')).toContainText('Play-In Round');
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 1 of 6');
});

test('progress bar starts at 0%', async ({ page }) => {
  const progressBar = page.getByRole('progressbar');
  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
});

test('complete all 6 play-in matches, then R64 loads', async ({ page }) => {
  for (let i = 0; i < 6; i++) {
    await pickFirst(page);
  }
  await expect(page.locator('[data-testid="round-label"]')).toContainText('Round of 64', { timeout: 3000 });
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 1 of 32');
});

test('VS divider visible during a match', async ({ page }) => {
  await expect(page.locator('[data-testid="vs-divider"]')).toBeVisible();
});

test('undo button reverts last pick', async ({ page }) => {
  await pickFirst(page);
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 2 of 6');

  await page.getByRole('button', { name: /Undo/i }).click();
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 1 of 6');
  // Both candidates for match 1 should be present again
  await expect(page.locator('[data-testid="movie-card"]')).toHaveCount(2);
});

test('reset button clears all picks back to play-in', async ({ page }) => {
  for (let i = 0; i < 3; i++) {
    await pickFirst(page);
  }
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 4 of 6');

  await page.getByRole('button', { name: /Reset/i }).click();
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 1 of 6');
  await expect(page.locator('[data-testid="round-label"]')).toContainText('Play-In Round');
});

test('undo at play-in to main bracket boundary reverts phase', async ({ page }) => {
  // Complete all 6 play-in matches — transitions to R64
  for (let i = 0; i < 6; i++) {
    await pickFirst(page);
  }
  await expect(page.locator('[data-testid="round-label"]')).toContainText('Round of 64', { timeout: 3000 });

  // Undo should step back into play-in
  await page.getByRole('button', { name: /Undo/i }).click();
  await expect(page.locator('[data-testid="round-label"]')).toContainText('Play-In Round', { timeout: 3000 });
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 6 of 6');
});

test('progress bar increases with picks', async ({ page }) => {
  const progressBar = page.getByRole('progressbar');
  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');

  await pickFirst(page);

  const valuenow = await progressBar.getAttribute('aria-valuenow');
  // 1 pick out of 69 = ~1.45%, so value should be 1
  expect(parseInt(valuenow, 10)).toBe(1);
});
