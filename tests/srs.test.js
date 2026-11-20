import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ocen, status, postep, budujKolejke, poOcenie, doPowtorki, nowyStan, DZIEN, MINUTA, OPANOWANE_OD } from '../js/srs.js';

const T0 = Date.UTC(2026, 0, 10, 12);

test('pierwsza dobra odpowiedź: odstęp 1 dzień, „łatwe” 3 dni', () => {
  assert.equal(ocen(null, 3, T0).iv, 1);
  assert.equal(ocen(null, 3, T0).due, T0 + DZIEN);
  assert.equal(ocen(null, 4, T0).iv, 3);
});

test('kolejne dobre odpowiedzi wydłużają odstęp aż do opanowania', () => {
  let s = null, t = T0;
  for (let i = 0; i < 3; i++) { s = ocen(s, 3, t); t = s.due; }
  assert.ok(s.iv >= OPANOWANE_OD, `odstęp ${s.iv}`);
  assert.equal(status(s), 'opanowane');
  assert.equal(postep(s), 1);
});

test('„nie wiem” zeruje serię, obniża łatwość, wraca za 10 minut i oznacza pomyłkę', () => {
  let s = ocen(ocen(null, 3, T0), 3, T0 + DZIEN);
  const ef = s.ef;
  s = ocen(s, 1, T0 + 2 * DZIEN);
  assert.equal(s.n, 0);
  assert.equal(s.iv, 0);
  assert.equal(s.due, T0 + 2 * DZIEN + 10 * MINUTA);
  assert.ok(s.ef < ef);
  assert.equal(s.myl, true);
  assert.equal(s.zle, 1);
  assert.equal(status(s), 'nauka');
});

test('łatwość nie spada poniżej 1.3', () => {
  let s = null;
  for (let i = 0; i < 20; i++) s = ocen(s, 1, T0);
  assert.equal(s.ef, 1.3);
});

test('„trudne” rośnie wolniej niż „dobrze”, „łatwe” szybciej', () => {
  const baza = ocen(ocen(null, 3, T0), 3, T0 + DZIEN);
  const t = baza.due;
  const [tr, db, la] = [2, 3, 4].map(o => ocen(baza, o, t).iv);
  assert.ok(tr < db && db < la, `${tr} < ${db} < ${la}`);
});

test('status i postęp nowego elementu', () => {
  assert.equal(status(undefined), 'nowe');
  assert.equal(status(nowyStan()), 'nowe');
  assert.equal(postep(undefined), 0);
  assert.equal(doPowtorki(undefined, T0), false);
});

test('kolejka: najpierw zaległe (najstarsze), potem nowe wplatane; limit rozmiaru', () => {
  const stany = {
    a: { ...nowyStan(), ok: 1, n: 1, iv: 1, due: T0 - 3 * DZIEN },
    b: { ...nowyStan(), ok: 1, n: 1, iv: 1, due: T0 - DZIEN },
    c: { ...nowyStan(), ok: 1, n: 1, iv: 5, due: T0 + 2 * DZIEN },   // jeszcze nie
  };
  const k = budujKolejke(['n1', 'a', 'n2', 'b', 'c', 'n3'], stany, { teraz: T0, nowych: 2, rozmiar: 10, los: () => 0.5 });
  assert.deepEqual(k.slice(0, 2), ['a', 'b']);
  assert.ok(!k.includes('c'));
  assert.equal(k.filter(x => x.startsWith('n')).length, 2);
  assert.equal(budujKolejke(['x', 'y', 'z'], {}, { teraz: T0, nowych: 10, rozmiar: 2 }).length, 2);
});

test('kolejka: gdy nic nie czeka, trening najdawniej ćwiczonych', () => {
  const stany = { a: { ...nowyStan(), ok: 1, n: 3, iv: 30, due: T0 + 9 * DZIEN, last: T0 - 5 }, b: { ...nowyStan(), ok: 1, n: 3, iv: 30, due: T0 + 9 * DZIEN, last: T0 - 50 } };
  assert.deepEqual(budujKolejke(['a', 'b'], stany, { teraz: T0 }), ['b', 'a']);
});

test('w sesji: „nie wiem” wraca po 3 kartach, „trudne” na koniec (raz)', () => {
  assert.deepEqual(poOcenie(['b', 'c', 'd', 'e'], 'a', 1), ['b', 'c', 'd', 'a', 'e']);
  assert.deepEqual(poOcenie(['b', 'c'], 'a', 2), ['b', 'c', 'a']);
  assert.deepEqual(poOcenie(['b', 'c'], 'a', 2, { a: 1 }), ['b', 'c']);
  assert.deepEqual(poOcenie(['b'], 'a', 1, { a: 3 }), ['b']);     // limit powrotów
  assert.deepEqual(poOcenie(['b'], 'a', 3), ['b']);
});
