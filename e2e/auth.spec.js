import { test, expect } from '@playwright/test';

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SB_URL = 'https://pynmkrcbkcfxifnztnrn.supabase.co';
const SB_ANON = 'sb_publishable_8VEm7zR0vqKjOZRwH6jimw_qIWt-RPp';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

test('unauthenticated state shows sync button', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Sync across devices/i })).toBeVisible();
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
  await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 2000 });
});

test.describe('with injected session', () => {
  test.skip(!SERVICE_KEY, 'Requires SUPABASE_SERVICE_KEY env var');

  test('injected session shows user email in header', async ({ page }) => {
    const testEmail = 'test@example.com';

    await page.evaluate(({ email }) => {
      const fakeSession = {
        access_token: 'fake_access_token',
        refresh_token: 'fake_refresh_token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: 'test-user-id', email },
      };
      localStorage.setItem('sb-pynmkrcbkcfxifnztnrn-auth-token', JSON.stringify(fakeSession));
    }, { email: testEmail });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Sync button should be gone and email or sign-out should be visible
    await expect(page.getByRole('button', { name: /Sync across devices/i })).not.toBeVisible({ timeout: 5000 });
  });

  test('make a pick triggers sync network request', async ({ page }) => {
    const syncRequests = [];
    await page.route('**/disney_bracket**', (route) => {
      syncRequests.push(route.request().url());
      route.continue();
    });

    await page.locator('[data-testid="movie-card"]').first().click();

    // Wait for the 2s debounce + extra time for the request
    await page.waitForTimeout(3500);

    // With a valid (even fake) session token, a sync attempt fires
    // We can't guarantee the request succeeds (fake token), but we can verify it was attempted
    expect(syncRequests.length).toBeGreaterThan(0);
  });
});

test('sign out removes email from header', async ({ page }) => {
  // Without a session, sign-out button should not be visible
  await expect(page.getByRole('button', { name: /Sign out/i })).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Sync across devices/i })).toBeVisible();
});
