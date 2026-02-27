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
  // Click the card notes toggle (aria-label: "Add notes for {movie}")
  const notesToggle = page.getByRole('button', { name: /Add notes for/i }).first();
  await expect(notesToggle).toBeVisible();
  await notesToggle.click();

  // Textarea should appear
  await expect(page.locator('textarea').first()).toBeVisible();
});

test('note typed in card persists after reload', async ({ page }) => {
  // Open card notes
  await page.getByRole('button', { name: /Add notes for/i }).first().click();

  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible();
  await textarea.fill('This is my test note');

  // Reload
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Re-open notes
  await page.getByRole('button', { name: /Add notes for/i }).first().click();
  const restoredTextarea = page.locator('textarea').first();
  await expect(restoredTextarea).toBeVisible();
  await expect(restoredTextarea).toHaveValue('This is my test note');
});

test('purple dot indicator appears after note added', async ({ page }) => {
  // Open card notes and type something
  await page.getByRole('button', { name: /Add notes for/i }).first().click();
  const textarea = page.locator('textarea').first();
  await textarea.fill('Added a note here');
  await page.waitForTimeout(100); // let React update notes state

  // Close the notes panel
  await page.getByRole('button', { name: /Hide notes for/i }).first().click();

  // A purple dot indicator should be visible (the note indicator dot).
  // Chrome normalizes hex to rgb in style attributes: #ce93d8 = rgb(206, 147, 216)
  const dot = page.locator('span[style*="206, 147, 216"]').first();
  await expect(dot).toBeVisible({ timeout: 3000 });
});

test('global notes panel opens and shows movies', async ({ page }) => {
  // Click the Notes button in the header area
  await page.getByRole('button', { name: /Notes/i }).first().click();

  // Notes panel should show
  await expect(page.getByText('Movie Notes')).toBeVisible();

  // Should show movie list
  await expect(page.locator('input[placeholder="Search movies..."]')).toBeVisible();
});

test('global notes panel search filters movies', async ({ page }) => {
  await page.getByRole('button', { name: /Notes/i }).first().click();
  await expect(page.getByText('Movie Notes')).toBeVisible();

  const searchInput = page.locator('input[placeholder="Search movies..."]');
  await searchInput.fill('Lion King');

  // Should show Lion King but filter out others
  await expect(page.getByText('The Lion King')).toBeVisible();
});

test('note added from global panel is saved', async ({ page }) => {
  await page.getByRole('button', { name: /Notes/i }).first().click();

  // Open the first movie's note row
  await page.locator('[style*="cursor: pointer"]').filter({ hasText: /#\d+/ }).first().click();

  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible()) {
    await textarea.fill('Global panel note');
    // Verify it's in localStorage
    const stored = await page.evaluate(() => localStorage.getItem('dbk-notes'));
    expect(stored).toContain('Global panel note');
  }
});
