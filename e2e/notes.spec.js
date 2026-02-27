import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  await page.reload();
});

test('card notes toggle opens textarea', async ({ page }) => {
  const notesToggle = page.getByRole('button', { name: /Add notes for/i }).first();
  await expect(notesToggle).toBeVisible();
  await notesToggle.click();

  await expect(page.locator('textarea').first()).toBeVisible();
});

test('note typed in card persists after reload', async ({ page }) => {
  await page.getByRole('button', { name: /Add notes for/i }).first().click();

  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible();
  await textarea.fill('This is my test note');

  await page.reload();
  await page.waitForLoadState('networkidle');

  // Re-open notes
  await page.getByRole('button', { name: /Add notes for/i }).first().click();
  const restoredTextarea = page.locator('textarea').first();
  await expect(restoredTextarea).toBeVisible();
  await expect(restoredTextarea).toHaveValue('This is my test note');

  const stored = await page.evaluate(() => localStorage.getItem('dbk-notes'));
  expect(stored).not.toBeNull();
  expect(stored).toContain('This is my test note');
});

test('purple dot indicator appears after note added', async ({ page }) => {
  await page.getByRole('button', { name: /Add notes for/i }).first().click();
  const textarea = page.locator('textarea').first();
  await textarea.fill('Added a note here');
  await page.waitForTimeout(100);

  await page.getByRole('button', { name: /Hide notes for/i }).first().click();

  // dot renders via data-testid
  await expect(page.locator('[data-testid="notes-dot"]').first()).toBeVisible({ timeout: 3000 });
});

test('global notes panel opens and shows movies', async ({ page }) => {
  await page.getByRole('button', { name: /Notes/i }).first().click();

  await expect(page.getByText('Movie Notes')).toBeVisible();
  await expect(page.locator('input[placeholder="Search movies..."]')).toBeVisible();
});

test('global notes panel search filters movies', async ({ page }) => {
  await page.getByRole('button', { name: /Notes/i }).first().click();
  await expect(page.getByText('Movie Notes')).toBeVisible();

  const searchInput = page.locator('input[placeholder="Search movies..."]');
  await searchInput.fill('Lion King');

  await expect(page.getByText('The Lion King')).toBeVisible();
});

test('note added from global panel is saved', async ({ page }) => {
  await page.getByRole('button', { name: /Notes/i }).first().click();

  await page.locator('[data-testid="notes-panel-item"]').first().click();

  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible({ timeout: 3000 });
  await textarea.fill('Global panel note');

  const stored = await page.evaluate(() => localStorage.getItem('dbk-notes'));
  expect(stored).not.toBeNull();
  expect(stored).toContain('Global panel note');
});
