import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { type Page } from '@playwright/test';
import { pickFirst } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

async function completeFullBracket(page: Page): Promise<void> {
  for (let i = 0; i < 69; i++) {
    await pickFirst(page);
  }
}

test('share URL button copies URL to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await pickFirst(page);
  // Wait for the hash to be written before clicking share — it's a separate React effect
  await page.waitForFunction(() => window.location.hash.length > 0, { timeout: 5000 });

  const shareBtn = page.getByRole('button', { name: /Share/i });
  await expect(shareBtn).toBeVisible();
  await shareBtn.click();

  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  const hash = new URL(clipText).hash.slice(1);
  expect(hash).toMatch(/^eyJ/);
});

test('share URL with hash loads same bracket state in new page', async ({ page, context }) => {
  await pickFirst(page);
  await pickFirst(page);

  // Wait for the counter to reflect both picks, then wait for the hash effect to fire
  await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 3 of 6');
  await page.waitForFunction(() => window.location.hash.length > 0, { timeout: 5000 });

  const shareUrl = page.url();
  expect(shareUrl).toContain('#');

  const page2 = await context.newPage();
  try {
    await page2.goto(shareUrl);
    await page2.waitForLoadState('networkidle');

    await expect(page2.locator('[data-testid="match-counter"]')).toHaveText('Match 3 of 6', { timeout: 5000 });
  } finally {
    await page2.close();
  }
});

test('export text button copies bracket text with correct content', async ({ page, context }) => {
  test.setTimeout(180000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await completeFullBracket(page);
  await expect(page.locator('[data-testid="champion-label"]')).toBeVisible({ timeout: 10000 });

  const exportBtn = page.getByRole('button', { name: /Export|Copy|Copied/i });
  await expect(exportBtn).toBeVisible({ timeout: 3000 });
  await exportBtn.click();

  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain('🎬');
  expect(clipText).toContain('PLAY-IN');
  expect(clipText).toMatch(/\S+ def\. \S+/);
  expect(clipText).toContain('CHAMPION:');
});

test('champion view shows after completing bracket', async ({ page }) => {
  test.setTimeout(180000);

  await completeFullBracket(page);

  await expect(page.locator('[data-testid="champion-label"]')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('👑')).toBeVisible();
});

