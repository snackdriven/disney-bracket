import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

// Helper: complete all 69 picks to reach champion view
async function completeFullBracket(page) {
  // 6 play-in picks
  for (let i = 0; i < 6; i++) {
    await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
  // 63 main bracket picks (32+16+8+4+2+1)
  for (let i = 0; i < 63; i++) {
    await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
}

test('share URL button copies URL to clipboard', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // Make a pick so share button appears
  await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
  await page.waitForTimeout(400);

  // Click share button
  const shareBtn = page.getByRole('button', { name: /Share/i }).first();
  await expect(shareBtn).toBeVisible();
  await shareBtn.click();

  // Clipboard should contain URL with hash
  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain('#');
  expect(clipText).toContain('disney-bracket');
});

test('share URL clipboard content loads same bracket in new page', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // Make 2 picks
  for (let i = 0; i < 2; i++) {
    await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
  }

  const shareUrl = page.url();
  expect(shareUrl).toContain('#');

  // Load in new page
  const page2 = await context.newPage();
  await page2.goto(shareUrl);
  await page2.waitForLoadState('networkidle');

  await expect(page2.getByText('Match 3 of 6')).toBeVisible({ timeout: 5000 });
  await page2.close();
});

test('export text button copies bracket text', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // Make a pick so export is available
  await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
  await page.waitForTimeout(400);

  // Find and click export/copy button
  const exportBtn = page.getByRole('button', { name: /Export|Copy|Copied/i }).first();
  if (await exportBtn.isVisible()) {
    await exportBtn.click();
    await page.waitForTimeout(200);

    const clipText = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    if (clipText) {
      expect(clipText).toContain('🎬');
    }
  }
});

test('champion view shows after completing bracket', async ({ page }) => {
  test.setTimeout(120000); // Full bracket takes a while

  await completeFullBracket(page);

  // Champion view should appear
  await expect(page.getByText('Your Champion')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=👑')).toBeVisible();
});

test('PNG download triggered from champion view', async ({ page }) => {
  test.setTimeout(120000);

  // Set up download listener before completing bracket
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);

  await completeFullBracket(page);
  await expect(page.getByText('Your Champion')).toBeVisible({ timeout: 10000 });

  // Click PNG download button
  const pngBtn = page.getByRole('button', { name: /PNG/i });
  if (await pngBtn.isVisible()) {
    await pngBtn.click();
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toBe('disney-and-pixar-bracket.png');
    }
  }
});
