import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planNauki, sugerowanyCel } from '../js/plan.js';
import { nowyStanAplikacji, dzien } from '../js/stan.js';

test('plan nauki: pozostałe, dni, tempo i prognoza', () => {
  const teraz = new Date(2026, 10, 21, 12).getTime();
  const s = nowyStanAplikacji();
  const el = [...Array(100)].map((_, i) => ({ id: 'w' + i, p: i < 60 ? 'A1' : 'A2' })).concat([{ id: 'x', p: 'B1' }]);
  for (let i = 0; i < 10; i++) s.srs['w' + i] = { n: 5, ok: 5, zle: 0, ef: 2.5, iv: 30, due: teraz + 30 * 864e5, last: teraz };
  s.hist[dzien(teraz - 20 * 864e5)] = 0; s.hist[dzien(teraz - 14 * 864e5)] = 2; s.hist[dzien(teraz)] = 10;
  const p = planNauki(s, el, { poziom: 'A2', data: dzien(teraz + 44 * 864e5) }, teraz);
  assert.equal(p.razem, 100); assert.equal(p.opanowane, 10); assert.equal(p.pozostale, 90);
  assert.equal(p.dni, 45); assert.equal(p.naDzien, 2);
  assert.ok(Math.abs(p.tempo - 0.6) < 0.01);
  assert.equal(p.naKursie, false);
  assert.ok(p.prognoza > dzien(teraz + 100 * 864e5));
  assert.equal(sugerowanyCel(2), 10); assert.equal(sugerowanyCel(9), 30); assert.equal(sugerowanyCel(40), 60);
});
