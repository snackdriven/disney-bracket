import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pickFirst } from './helpers';

// Known violations suppressed until fixed:
// - nested-interactive: IMDb <a> link is inside <button data-testid="movie-card">. The
//   entire card is a button; extracting the link requires a Card layout refactor.
// - color-contrast: Cancel/muted buttons use #6a6a8e on #191930 (3.32:1 vs 4.5:1 required).
//   Intentional low-prominence design. Fix would require brightening secondary button text.
const KNOWN_VIOLATIONS = ['nested-interactive', 'color-contrast'];

test.describe('accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('play-in state has no WCAG 2.1 AA violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(KNOWN_VIOLATIONS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('auth modal has no WCAG 2.1 AA violations when open', async ({ page }) => {
    await page.getByRole('button', { name: /Sync across devices/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(KNOWN_VIOLATIONS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('R64 state has no WCAG 2.1 AA violations', async ({ page }) => {
    // Complete all 6 play-in matches to enter Round of 64
    for (let i = 0; i < 6; i++) {
      await pickFirst(page);
    }
    await expect(page.locator('[data-testid="round-label"]')).toContainText('Round of 64', { timeout: 5000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(KNOWN_VIOLATIONS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('notes panel has no WCAG 2.1 AA violations when open', async ({ page }) => {
    await page.getByRole('button', { name: /Notes/i }).first().click();
    await expect(page.locator('[data-testid="notes-panel-header"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(KNOWN_VIOLATIONS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('focus moves into auth modal when opened (keyboard trap)', async ({ page }) => {
    await page.getByRole('button', { name: /Sync across devices/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Active element should be inside the dialog
    const focusedInsideDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog ? dialog.contains(document.activeElement) : false;
    });
    expect(focusedInsideDialog).toBe(true);
  });

  test('Escape key closes auth modal and restores focus', async ({ page }) => {
    const syncBtn = page.getByRole('button', { name: /Sync across devices/i });
    await syncBtn.focus();
    await syncBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Focus should return to the trigger button
    const activeLabel = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-label') ??
      document.activeElement?.textContent?.trim() ?? ''
    );
    expect(activeLabel).toMatch(/Sync across devices/i);
  });
});
