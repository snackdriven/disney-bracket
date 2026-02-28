import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

test('unauthenticated state: sync button visible, sign-out not visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Sync across devices/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Sign out/i })).not.toBeVisible();
});

test('auth modal opens when sync button clicked', async ({ page }) => {
  await page.getByRole('button', { name: /Sync across devices/i }).click();

  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test('auth modal closes on escape key', async ({ page }) => {
  await page.getByRole('button', { name: /Sync across devices/i }).click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});

test.describe('with injected session', () => {

  test('injected session hides sync button and shows sign-out', async ({ page }) => {
    const testEmail = 'test@example.com';

    await page.evaluate(({ email }) => {
      const fakeSession = {
        access_token: 'fake_access_token',
        refresh_token: 'fake_refresh_token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: 'test-user-id', email },
      };
      localStorage.setItem('disney-bracket-auth', JSON.stringify(fakeSession));
    }, { email: testEmail });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Sync button should be gone and sign-out should be visible
    await expect(page.getByRole('button', { name: /Sync across devices/i })).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Sign out/i })).toBeVisible({ timeout: 5000 });
  });

  test('make a pick triggers sync network request', async ({ page }) => {
    const syncRequests = [];
    await page.route('**/disney_bracket**', (route) => {
      syncRequests.push(route.request().url());
      route.continue();
    });

    await page.evaluate(({ email }) => {
      localStorage.setItem('disney-bracket-auth', JSON.stringify({
        access_token: 'fake_access_token',
        refresh_token: 'fake_refresh_token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: 'test-user-id', email },
      }));
    }, { email: 'test@example.com' });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Set up request waiter before clicking — the 2s debounce means the request fires ~2s after the pick
    const syncRequestPromise = page.waitForRequest('**/disney_bracket**', { timeout: 5000 });
    await page.locator('[data-testid="movie-card"]').first().click();

    // With a valid (even fake) session token, a sync attempt fires after the debounce
    // We can't guarantee the request succeeds (fake token), but we can verify it was attempted
    await syncRequestPromise;
    expect(syncRequests.length).toBeGreaterThan(0);
  });
});

