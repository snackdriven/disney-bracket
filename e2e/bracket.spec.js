import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Clear all local storage before each test
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

test('play-in round loads on fresh start', async ({ page }) => {
  await expect(page.getByText('Play-In Round', { exact: false })).toBeVisible();
  await expect(page.getByText('Match 1 of 6')).toBeVisible();
});

test('progress bar starts at 0%', async ({ page }) => {
  const progressBar = page.getByRole('progressbar');
  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
});

test('complete all 6 play-in matches, then R64 loads', async ({ page }) => {
  // Pick winners for all 6 play-in matches
  for (let i = 0; i < 6; i++) {
    // Click the first card (left movie)
    const cards = page.locator('button.mob-card, button[style*="cursor"]').filter({ hasText: /\d{4}/ });
    await cards.first().click();
    // Wait for animation
    await page.waitForTimeout(400);
  }

  // After 6 play-in picks, should show Round of 64
  await expect(page.getByText('Round of 64', { exact: false })).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('Match 1 of 32')).toBeVisible();
});

test('match counter shows correct values in R64', async ({ page }) => {
  // Complete play-in
  for (let i = 0; i < 6; i++) {
    const cards = page.locator('button').filter({ hasText: /\d{4}/ }).filter({ has: page.locator('[style*="cursor"]') });
    // Click first visible movie card
    await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(async () => {
      // Fallback: find cards by their structure
      await page.locator('[style*="cursor: pointer"]').first().click();
    });
    await page.waitForTimeout(400);
  }

  // Verify R64 match counter
  await expect(page.getByText(/Match \d+ of 32/)).toBeVisible({ timeout: 3000 });
});

test('VS divider visible during a match', async ({ page }) => {
  // Both play-in and main bracket show VS between the two cards
  await expect(page.getByText('VS').first()).toBeVisible({ timeout: 3000 });
});

test('undo button reverts last pick', async ({ page }) => {
  // Make one play-in pick
  const firstCard = page.locator('button').filter({ hasText: /^\s*#\d+/ }).first();
  await firstCard.click();
  await page.waitForTimeout(400);

  // Verify we moved to match 2
  await expect(page.getByText('Match 2 of 6')).toBeVisible();

  // Click undo
  await page.getByRole('button', { name: /Undo/i }).click();
  await page.waitForTimeout(200);

  // Should be back on match 1
  await expect(page.getByText('Match 1 of 6')).toBeVisible();
});

test('reset button clears all picks back to play-in', async ({ page }) => {
  // Make a few picks
  for (let i = 0; i < 3; i++) {
    await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
  }

  // Should be at match 4
  await expect(page.getByText('Match 4 of 6')).toBeVisible();

  // Reset
  await page.getByRole('button', { name: /Reset/i }).click();
  await page.waitForTimeout(200);

  // Should be back at match 1 of play-in
  await expect(page.getByText('Match 1 of 6')).toBeVisible();
  await expect(page.getByText('Play-In Round', { exact: false })).toBeVisible();
});

test('progress bar increases with picks', async ({ page }) => {
  const progressBar = page.getByRole('progressbar');
  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');

  // Make a pick
  await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
  await page.waitForTimeout(400);

  const valuenow = await progressBar.getAttribute('aria-valuenow');
  expect(parseInt(valuenow)).toBeGreaterThan(0);
});
