import { test, expect } from '@playwright/test';
import { pickFirst } from './helpers';

// Visual regression tests use Playwright's built-in screenshot comparison.
//
// SETUP: Run `npx playwright test e2e/visual.spec.ts --update-snapshots` locally
// (on Linux, matching the CI environment) to generate baseline screenshots, then
// commit the generated `e2e/visual.spec.ts-snapshots/` directory.
//
// Subsequent runs compare against those baselines. Diffs appear in the HTML report.
// To update baselines after intentional UI changes: re-run with --update-snapshots.
//
// maxDiffPixelRatio: 0.02 — Playwright's animations:'disabled' is supplemented by
// an addStyleTag (animation:none) and --disable-lcd-text / --disable-font-subpixel-positioning
// Chromium launch flags. Together these make font rendering deterministic across runs,
// allowing a tight 2% threshold. At this threshold, removing a single card (~3%)
// or any substantial UI section would fail the test.

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    // Seed Math.random before the page loads so the background dot positions are
    // deterministic across runs. Without this, 110 randomly-positioned dots
    // produce pixel diffs every time even with animations disabled.
    await page.addInitScript(() => {
      let seed = 42;
      Math.random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    });

    // Block all external requests so STATIC_META poster images (image.tmdb.org)
    // don't cause non-deterministic pixel diffs when CDN responses vary between runs.
    await page.route('https://**', (route) => route.abort());

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      window.history.replaceState(null, '', window.location.pathname);
    });
    await page.reload();
    // Wait for the app to fully paint before snapshotting
    await expect(page.locator('[data-testid="match-counter"]')).toBeVisible();
    // Eliminate all CSS animations and transitions so dot animation-delay values
    // (0–5 s) don't produce different visual states across runs. Playwright's
    // animations:'disabled' option only zeroes duration, not delay.
    await page.addStyleTag({
      content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });
    // Wait two RAF cycles so the browser fully repaints after the animation removal.
    // Without this, the screenshot can race the repaint and capture partial rendering.
    await page.evaluate(() => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
    // Park the mouse in a corner so hover states don't bleed into screenshots
    await page.mouse.move(0, 0);
  });

  test('play-in initial state', async ({ page }) => {
    await expect(page).toHaveScreenshot('play-in-initial.png', {
      fullPage: false,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('play-in after first pick', async ({ page }) => {
    await pickFirst(page);
    await expect(page.locator('[data-testid="match-counter"]')).toHaveText('Match 2 of 6');
    // Park mouse so the clicked card's hover lift doesn't persist into the screenshot
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot('play-in-after-first-pick.png', {
      fullPage: false,
      animations: 'disabled',
      // 0.04: WSL and native Linux (GitHub Actions) render this post-pick state
      // ~3% differently due to GPU/font-metric differences after a card click.
      // The tighter 0.02 threshold applies to all other static states.
      maxDiffPixelRatio: 0.04,
    });
  });

  test('auth modal open', async ({ page }) => {
    await page.getByRole('button', { name: /Sync across devices/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page).toHaveScreenshot('auth-modal-open.png', {
      fullPage: false,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('notes panel open', async ({ page }) => {
    await page.getByRole('button', { name: /Notes/i }).first().click();
    await expect(page.locator('[data-testid="notes-panel-header"]')).toBeVisible();
    await expect(page).toHaveScreenshot('notes-panel-open.png', {
      fullPage: false,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('R64 initial state', async ({ page }) => {
    for (let i = 0; i < 6; i++) {
      await pickFirst(page);
    }
    await expect(page.locator('[data-testid="round-label"]')).toContainText('Round of 64');
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot('r64-initial.png', {
      fullPage: false,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
