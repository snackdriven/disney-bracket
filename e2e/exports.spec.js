import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

// Click first card and wait for the match counter to change, or disappear (champion reached).
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
    { timeout: 5000 }
  );
}

async function completeFullBracket(page) {
  for (let i = 0; i < 69; i++) {
    await pickFirst(page);
  }
}

test('share URL button copies URL to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await pickFirst(page);

  const shareBtn = page.getByRole('button', { name: /Share/i }).first();
  await expect(shareBtn).toBeVisible();
  await shareBtn.click();

  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain('#');
  expect(clipText).toContain('disney-bracket');
  const hash = new URL(clipText).hash.slice(1);
  expect(hash).toMatch(/^eyJ/);
});

test('share URL clipboard content loads same bracket in new page', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await pickFirst(page);
  await pickFirst(page);

  // Wait for the URL hash to encode 2 picks (piI >= 2)
  await page.waitForFunction(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return false;
    try { return JSON.parse(atob(hash)).piI >= 2; } catch { return false; }
  }, { timeout: 5000 });

  const shareUrl = page.url();
  expect(shareUrl).toContain('#');

  const page2 = await context.newPage();
  await page2.goto(shareUrl);
  await page2.waitForLoadState('networkidle');

  await expect(page2.locator('[data-testid="match-counter"]')).toHaveText('Match 3 of 6', { timeout: 5000 });
  await page2.close();
});

test('export text button copies bracket text with correct content', async ({ page, context }) => {
  test.setTimeout(120000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await completeFullBracket(page);
  await expect(page.getByText('Your Champion')).toBeVisible({ timeout: 10000 });

  const exportBtn = page.getByRole('button', { name: /Export|Copy|Copied/i }).first();
  await expect(exportBtn).toBeVisible({ timeout: 3000 });
  await exportBtn.click();

  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain('🎬');
  expect(clipText).toContain('def.');
  expect(clipText).toContain('PLAY-IN');
});

test('champion view shows after completing bracket', async ({ page }) => {
  test.setTimeout(120000);

  await completeFullBracket(page);

  await expect(page.getByText('Your Champion')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=👑')).toBeVisible();
});

test('PNG download triggered from champion view', async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Download events not reliable on mobile');
  test.setTimeout(120000);

  await completeFullBracket(page);
  await expect(page.getByText('Your Champion')).toBeVisible({ timeout: 10000 });

  // Set up download listener immediately before clicking so the 30s timeout is fresh
  const pngBtn = page.getByRole('button', { name: /PNG/i });
  await expect(pngBtn).toBeVisible({ timeout: 3000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
  await pngBtn.click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('disney-and-pixar-bracket.png');
  const downloadPath = await download.path();
  const buf = fs.readFileSync(downloadPath);
  expect(buf[0]).toBe(0x89);
  expect(buf.slice(1, 4).toString('ascii')).toBe('PNG');
});
