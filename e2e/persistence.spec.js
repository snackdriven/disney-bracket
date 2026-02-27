import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

async function pickFirst(page) {
  const counter = page.locator('[data-testid="match-counter"]');
  const before = await counter.textContent();
  await page.locator('[data-testid="movie-card"]').first().click();
  await page.waitForFunction(
    (prev) => {
      const el = document.querySelector('[data-testid="match-counter"]');
      return !el || el.textContent !== prev;
    },
    before,
    { timeout: 3000 }
  );
}

test('picks survive a hard reload', async ({ page }) => {
  // Record which movies are in the first match before picking
  const cards = page.locator('[data-testid="movie-card"]');
  const firstName = await cards.first().textContent();

  await pickFirst(page);
  await pickFirst(page);
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 3 of 6');

  await page.reload();
  await page.waitForLoadState('networkidle');

  // Counter should be restored
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 3 of 6', { timeout: 5000 });
  // The winner of match 1 should no longer appear as a current card
  const currentNames = await page.locator('[data-testid="movie-card"]').allTextContents();
  expect(currentNames.join(' ')).not.toContain(firstName?.trim().slice(0, 10) ?? '');
});

test('URL hash is updated after first pick', async ({ page }) => {
  const initialUrl = page.url();

  await pickFirst(page);

  // Wait for the URL hash to be written (React effect runs after state update)
  await page.waitForFunction(() => window.location.hash.length > 0, { timeout: 3000 });

  const newUrl = page.url();
  expect(newUrl).toContain('#');
  expect(newUrl).not.toBe(initialUrl);
  // Hash should be base64-encoded bracket state, not auth tokens
  const hash = new URL(newUrl).hash.slice(1);
  expect(hash).toMatch(/^eyJ/); // btoa'd JSON starts with eyJ
});

test('loading a share URL restores the bracket state', async ({ page }) => {
  // Pick 3 times and note which movies won
  const winners = [];
  for (let i = 0; i < 3; i++) {
    const firstCard = page.locator('[data-testid="movie-card"]').first();
    const winnerName = await firstCard.textContent();
    winners.push(winnerName?.trim() ?? '');
    await pickFirst(page);
  }

  // Wait for the URL hash to encode all 3 picks (piI >= 3)
  await page.waitForFunction(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return false;
    try { return JSON.parse(atob(hash)).piI >= 3; } catch { return false; }
  }, { timeout: 3000 });

  const shareUrl = page.url();
  expect(shareUrl).toContain('#');

  const page2 = await page.context().newPage();
  await page2.goto(shareUrl);
  await page2.waitForLoadState('networkidle');

  // Match position should be restored
  await expect(page2.locator('[data-testid="match-counter"]')).toHaveText('Match 4 of 6', { timeout: 5000 });

  // Check localStorage has the bracket state (winners encoded in state)
  const stored = await page2.evaluate(() => localStorage.getItem('dbk-state'));
  expect(stored).not.toBeNull();
  const state = JSON.parse(stored);
  // 3 picks means history length of 3
  expect(state.hi?.length ?? state.piI).toBeGreaterThanOrEqual(3);

  await page2.close();
});

test('hash not overwritten when access_token is in URL', async ({ page }) => {
  const authUrl = page.url() + '#access_token=fake_token_here&type=magiclink';
  await page.goto(authUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const currentUrl = page.url();
  // The access_token hash must not have been replaced with bracket state JSON
  if (currentUrl.includes('#')) {
    expect(currentUrl).not.toMatch(/#eyJ/); // btoa'd bracket state starts with eyJ
  }
});
