import { expect, type Page } from '@playwright/test';
import { applyPick, resetState } from '../src/lib/bracket';
import { serializeBracketState } from '../src/lib/bracketSerialization';

export function bracket(picks: number) {
  let state = resetState();
  for (let i = 0; i < picks; i++) {
    const match = state.phase === 'pi' ? state.playInMatches[state.playInIndex] : state.rounds[state.currentRound][state.currentMatch];
    state = applyPick(state, match.players[i % 2]);
  }
  return serializeBracketState(state);
}

export const saved = (page: Page): Promise<ReturnType<typeof bracket>> => page.evaluate(() => JSON.parse(localStorage.getItem('dbk-state') || '{}'));

export async function seedDevice(page: Page, picks: number) {
  const state = bracket(picks);
  await page.addInitScript(({ state }) => {
    if (sessionStorage.getItem('critical-fixture')) return;
    sessionStorage.setItem('critical-fixture', 'yes');
    localStorage.setItem('dbk-state', JSON.stringify(state));
    localStorage.setItem('dbk-notes', '{"1":"Keep this note"}');
  }, { state });
  return state;
}

export async function seed(page: Page, picks: number) {
  const state = await seedDevice(page, picks);
  await page.goto('./');
  return state;
}

export async function pickFirst(page: Page) {
  const count = (await saved(page)).history.length;
  await page.getByTestId('movie-card').first().click();
  await expect.poll(async () => (await saved(page)).history.length).toBe(count + 1);
}

export async function undo(page: Page, mobile: boolean) {
  await page.getByRole('button', { name: mobile ? '↩' : /Undo/i, exact: mobile }).click();
}
