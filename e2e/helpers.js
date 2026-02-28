import { expect } from '@playwright/test';

export async function pickFirst(page) {
  const counter = page.locator('[data-testid="match-counter"]');
  await expect(counter).toBeVisible({ timeout: 5000 });
  const before = await counter.textContent();
  const card = page.locator('[data-testid="movie-card"]').first();
  await expect(card).toBeVisible({ timeout: 5000 });
  await card.click();
  await page.waitForFunction(
    (prev) => {
      const el = document.querySelector('[data-testid="match-counter"]');
      // !el handles the champion screen where the counter is removed after the final pick
      return !el || el.textContent !== prev;
    },
    before,
    { timeout: 5000 }
  );
}
