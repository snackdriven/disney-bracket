import { test, expect } from '@playwright/test';
import { pickFirst, saved, seed, undo } from './fixtures';

test('[P0][UI] reroll a finished bracket without losing the original winners, notes, or recovery', async ({ page }) => {
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
});

test('[P1][UI] a fresh Sweet 16 draw supports keyboard confirmation and Undo preserves it', async ({ page }, testInfo) => {
  await seed(page, 54);
  await page.getByRole('button', { name: 'Reroll Sweet 16', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('No completed picks will be cleared.');
  await dialog.getByRole('button', { name: 'Shuffle again' }).click();
  await expect(dialog.getByRole('heading', { name: 'Reroll Sweet 16' })).toBeInViewport({ ratio: 1 });
  await dialog.getByRole('list').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Apply reroll', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  const draw = (await saved(page)).rounds[2];
  expect((await saved(page)).history).toHaveLength(54);
  await pickFirst(page);
  await undo(page, testInfo.project.name === 'mobile');
  await expect.poll(async () => (await saved(page)).history.length).toBe(54);
  expect((await saved(page)).rounds[2]).toEqual(draw);
});

test('[P0][UI] solo picks and notes survive reload, Undo, and a confirmed reset', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name === 'mobile';
  await seed(page, 2);
  const toggleNotes = async () => {
    if (mobile) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await page.getByRole('button', { name: /Notes/i }).first().click();
  };
  await toggleNotes();
  await page.getByTestId('notes-panel-item').first().click();
  await page.getByRole('textbox').last().fill('Keep my reasoning');
  await toggleNotes();
  await pickFirst(page);
  await page.reload();
  await expect.poll(async () => (await saved(page)).history.length).toBe(3);
  expect(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('dbk-notes')!)))).toContain('Keep my reasoning');
  await undo(page, mobile);
  await expect.poll(async () => (await saved(page)).history.length).toBe(2);
  if (mobile) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  page.once('dialog', dialog => { void dialog.accept(); });
  await page.getByRole('button', { name: mobile ? 'Reset Entire Bracket' : 'Reset Bracket', exact: true }).click();
  await expect.poll(async () => (await saved(page)).history.length).toBe(0);
  expect((await saved(page)).phase).toBe('pi');
  expect(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('dbk-notes')!)))).toContain('Keep my reasoning');
});
