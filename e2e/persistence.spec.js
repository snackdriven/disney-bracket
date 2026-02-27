import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

test('picks survive a hard reload', async ({ page }) => {
  // Make 2 play-in picks
  for (let i = 0; i < 2; i++) {
    await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
  }

  // Should be at match 3
  await expect(page.getByText('Match 3 of 6')).toBeVisible();

  // Hard reload
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Picks should be restored
  await expect(page.getByText('Match 3 of 6')).toBeVisible({ timeout: 5000 });
});

test('URL hash is updated after first pick', async ({ page }) => {
  const initialUrl = page.url();

  // Make a pick
  await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
  await page.waitForTimeout(400);

  // URL should now have a hash
  const newUrl = page.url();
  expect(newUrl).toContain('#');
  expect(newUrl).not.toBe(initialUrl);
});

test('loading a share URL restores the bracket state', async ({ page }) => {
  // Make some picks and capture the URL
  for (let i = 0; i < 3; i++) {
    await page.locator('button').filter({ hasText: /^\s*#\d+/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
  }

  const shareUrl = page.url();
  expect(shareUrl).toContain('#');

  // Open a new page with the hash URL
  const page2 = await page.context().newPage();
  await page2.goto(shareUrl);
  await page2.waitForLoadState('networkidle');

  // Should show the correct match position
  await expect(page2.getByText('Match 4 of 6')).toBeVisible({ timeout: 5000 });
  await page2.close();
});

test('hash not overwritten when access_token is in URL', async ({ page }) => {
  // Simulate a magic link URL with access_token in hash
  const authUrl = page.url() + '#access_token=fake_token_here&type=magiclink';
  await page.goto(authUrl);
  await page.waitForLoadState('networkidle');

  // The hash should still contain the access_token (not overwritten by bracket state)
  // At minimum, the page should not crash
  await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });

  // After a brief wait, the access_token hash should not be replaced with bracket state
  await page.waitForTimeout(500);
  const currentUrl = page.url();
  // Either hash is gone (auth consumed it) or it wasn't overwritten with bracket JSON
  // The key assertion: no btoa'd bracket state should have replaced the access_token
  if (currentUrl.includes('#')) {
    expect(currentUrl).not.toMatch(/#eyJ/); // btoa'd JSON starts with eyJ
  }
});
