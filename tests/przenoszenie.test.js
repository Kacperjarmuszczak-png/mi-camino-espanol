import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spakuj, rozpakuj } from '../js/przenoszenie.js';

test('pakowanie i rozpakowanie stanu (deflate + base64url)', async () => {
  const stan = { v: 2, srs: Object.fromEntries(Array.from({ length: 300 }, (_, i) => ['w:slowo' + i, { n: 2, ok: 2, zle: 1, ef: 2.5, iv: 3, due: 1700000000000 + i }])), ust: { cel: 20 }, dni: { '2026-11-20': 12 }, j: 'pl' };
  const p = await spakuj(stan);
  assert.ok(p.startsWith('z.'));
  assert.ok(/^[A-Za-z0-9_.-]+$/.test(p));
  assert.ok(p.length < JSON.stringify(stan).length / 3);
  assert.deepEqual(await rozpakuj(p), stan);
});
