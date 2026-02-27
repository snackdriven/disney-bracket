import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

// Helper: click the first available movie card and wait for the next match to render
async function pickFirst(page) {
  const counter = page.locator('[data-testid="match-counter"]');
  const before = await counter.textContent();
  await page.locator('[data-testid="movie-card"]').first().click();
  // Wait until the match counter changes, meaning the next match has loaded
  await page.waitForFunction(
    (prev) => {
      const el = document.querySelector('[data-testid="match-counter"]');
      return !el || el.textContent !== prev;
    },
    before,
    { timeout: 3000 }
  );
}

test('play-in round loads on fresh start', async ({ page }) => {
  await expect(page.getByText('Play-In Round', { exact: false }).first()).toBeVisible();
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
  await expect(page.getByText('Round of 64', { exact: false })).toBeVisible({ timeout: 3000 });
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 1 of 32');
});

test('match counter shows correct value after play-in completes', async ({ page }) => {
  for (let i = 0; i < 6; i++) {
    await pickFirst(page);
  }
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 1 of 32');
});

test('VS divider visible during a match', async ({ page }) => {
  await expect(page.locator('[data-testid="vs-divider"]').first()).toBeVisible();
});

test('undo button reverts last pick', async ({ page }) => {
  await pickFirst(page);
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 2 of 6');

  await page.getByRole('button', { name: /Undo/i }).click();
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 1 of 6');
});

test('reset button clears all picks back to play-in', async ({ page }) => {
  for (let i = 0; i < 3; i++) {
    await pickFirst(page);
  }
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 4 of 6');

  await page.getByRole('button', { name: /Reset/i }).click();
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 1 of 6');
  await expect(page.getByText('Play-In Round', { exact: false }).first()).toBeVisible();
});

test('progress bar increases with picks', async ({ page }) => {
  const progressBar = page.getByRole('progressbar');
  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');

  await pickFirst(page);

  const valuenow = await progressBar.getAttribute('aria-valuenow');
  // 1 pick out of 69 = ~1.45%, so value should be 1
  expect(parseInt(valuenow)).toBeGreaterThanOrEqual(1);
});
