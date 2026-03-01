import { expect, type Page } from '@playwright/test';

export async function pickFirst(page: Page): Promise<void> {
  const counter = page.locator('[data-testid="match-counter"]');
  await expect(counter).toBeVisible({ timeout: 5000 });
  const before = await counter.textContent();
  const card = page.locator('[data-testid="movie-card"]').first();
  await expect(card).toBeVisible({ timeout: 5000 });
  await card.click();
  // Wait for the counter to show a different match number.
  // The pick() function in App.tsx delays state updates by 320ms (animation window),
  // so this retries until the counter text actually changes.
  await expect(async () => {
    const current = await counter.textContent();
    expect(current).not.toBe(before);
  }).toPass({ timeout: 5000 });
}
