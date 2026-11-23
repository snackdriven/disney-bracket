import { test, expect, type Page } from '@playwright/test';
import { applyPick, resetState } from '../src/lib/bracket';
import { serializeBracketState } from '../src/lib/bracketSerialization';

function fixture(picks: number) {
  let state = resetState();
  for (let i = 0; i < picks; i++) {
    const match = state.phase === 'pi' ? state.playInMatches[state.playInIndex] : state.rounds[state.currentRound][state.currentMatch];
    state = applyPick(state, match.players[i % 2]);
  }
  return serializeBracketState(state);
}

type Saved = ReturnType<typeof fixture>;
const saved = (page: Page): Promise<Saved> => page.evaluate(() => JSON.parse(localStorage.getItem('dbk-state') || '{}'));

async function seed(page: Page, picks: number) {
  const state = fixture(picks);
  await page.addInitScript(({ state }) => {
    if (sessionStorage.getItem('reroll-test-seeded')) return;
    sessionStorage.setItem('reroll-test-seeded', 'yes');
    localStorage.setItem('dbk-state', JSON.stringify(state));
    localStorage.setItem('dbk-notes', '{"1":"Keep this note"}');
  }, { state });
  await page.goto('./');
  return state;
}

test('finished bracket can preview, cancel, restart, and reload the exact saved Sweet 16 draw', async ({ page }) => {
  const original = await seed(page, 69);
  await page.getByRole('button', { name: 'Reroll Sweet 16', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Reroll Sweet 16' });
  await expect(dialog.getByRole('listitem')).toHaveCount(8);
  await expect(dialog).toContainText('15 Sweet 16 and later picks will be cleared.');
  expect((await saved(page)).champion).toEqual(original.champion);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByTestId('champion-label')).toBeVisible();
  await page.getByRole('button', { name: 'Reroll Sweet 16', exact: true }).click();
  await dialog.getByRole('button', { name: 'Shuffle again' }).click();
  const preview = await dialog.getByRole('listitem').allTextContents();
  await dialog.getByRole('button', { name: 'Apply reroll & restart Sweet 16' }).click();
  await expect(dialog).toHaveCount(0);
  const after = await saved(page);
  expect(after.history).toHaveLength(54);
  expect(after.champion).toBeNull();
  expect(after.rounds.slice(0, 2)).toEqual(original.rounds.slice(0, 2));
  expect(after.rounds[2].map(m => `${m.p[0].name}vs${m.p[1].name}`)).toEqual(preview);
  expect(after.rounds[2].flatMap(m => m.p.map(p => p.seed)).sort((a, b) => a - b))
    .toEqual(original.rounds[1].map(m => m.w!.seed).sort((a, b) => a - b));
  const backup = await page.evaluate(() => JSON.parse(localStorage.getItem('dbk-pre-reroll')!));
  expect(backup.bracket.champion).toEqual(original.champion);
  expect(backup.notes).toEqual({ 1: 'Keep this note' });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Reroll Sweet 16', exact: true })).toBeVisible();
  expect((await saved(page)).rounds[2]).toEqual(after.rounds[2]);
  expect((await saved(page)).sweet16Rerolled).toBe(true);
});

test('first Sweet 16 draw can be rerolled without clearing completed picks', async ({ page }) => {
  await seed(page, 54);
  await page.getByRole('button', { name: 'Reroll Sweet 16', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('No completed picks will be cleared.');
  await dialog.getByRole('button', { name: 'Apply reroll', exact: true }).click();
  expect((await saved(page)).history).toHaveLength(54);
  await expect(page.getByRole('status')).toContainText('rerolled');
});

test('a rejected saved bracket is preserved and offers a recovery export', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dbk-state', '{bad saved data'));
  await page.goto('./');
  await expect(page.getByRole('alert')).toContainText('Saving is paused');
  await expect(page.getByRole('button', { name: 'Export recovery copy' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('dbk-state'))).toBe('{bad saved data');
});
