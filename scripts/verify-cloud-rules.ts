// Codex (GPT-6 AI agent), November 23, 2026.
// Explicit, opt-in live rules probe. Never reads or writes a real user's record.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const database = 'https://disney-bracket1-default-rtdb.firebaseio.com';
const token = execFileSync(process.platform === 'win32' ? 'gcloud.cmd' : 'gcloud',
  ['auth', 'print-access-token'], { encoding: 'utf8', shell: process.platform === 'win32' }).trim();
const uid = `codex-rules-probe-${randomUUID()}`;
const ownPath = `users/${uid}`;
const expired = process.argv.includes('--expect-expired');

async function request(path: string, auth: { uid: string } | null, method = 'GET', body?: unknown) {
  const url = new URL(`${database}/${path}.json`);
  // Firebase Admin SDK's limited-privilege override: evaluate the live rules as this identity.
  url.searchParams.set('auth_variable_override', JSON.stringify(auth));
  return fetch(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

async function denied(path: string, auth: { uid: string } | null, method = 'GET') {
  const response = await request(path, auth, method, method === 'PUT' ? { probe: true } : undefined);
  assert.equal(response.status, 401, `Expected permission denial for ${method} ${path}`);
  assert.match(await response.text(), /permission denied/i);
}

if (expired) {
  await denied(ownPath, { uid });
  console.log('Confirmed: an owner-scoped read is denied by the expired live rules.');
} else {
  let created = false;
  try {
    const initial = await request(ownPath, { uid });
    assert.equal(initial.status, 200);
    assert.equal(await initial.json(), null, 'Probe path must be empty');
    const payload = { state: { probe: true }, notes: { 1: 'temporary rules verification' }, updated_at: new Date().toISOString() };
    const write = await request(ownPath, { uid }, 'PUT', payload);
    assert.equal(write.status, 200);
    created = true;
    const read = await request(ownPath, { uid });
    assert.equal(read.status, 200);
    const restored = await read.json();
    assert.deepEqual(restored.state, payload.state);
    // RTDB returns dense integer-keyed objects as arrays, as the client normalizer expects.
    assert.equal(restored.notes[1], payload.notes[1]);
    assert.equal(restored.updated_at, payload.updated_at);
    console.log('P0: owner can save and reload their own record.');

    await denied(ownPath, { uid: `${uid}-other` });
    await denied(ownPath, { uid: `${uid}-other` }, 'PUT');
    await denied(ownPath, null);
    await denied(ownPath, null, 'PUT');
    console.log('P0: another identity and an unauthenticated identity cannot read or overwrite the record.');

    await denied('', { uid });
    await denied('users', { uid });
    await denied(`rooms/${uid}`, { uid });
    await denied(`rooms/${uid}`, { uid }, 'PUT');
    console.log('P1: root/user listing and retired rooms remain blocked.');
  } finally {
    if (created) {
      const removed = await request(ownPath, { uid }, 'DELETE');
      assert.equal(removed.status, 200, 'Temporary probe cleanup failed');
      const check = await request(ownPath, { uid });
      assert.equal(check.status, 200);
      assert.equal(await check.json(), null);
      console.log('Temporary probe record removed.');
    }
  }
}
