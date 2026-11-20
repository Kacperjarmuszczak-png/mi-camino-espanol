import { test } from 'node:test';
import assert from 'node:assert/strict';
import { porownajDyktando, tokeny, sprawdzKolejnosc, tasujInaczej, pulaZdan, wybierzNaDzien } from '../js/cwiczenia-logika.js';

test('dyktando: bezbłędnie, akcent, brak i literówka', () => {
  assert.equal(porownajDyktando('¿Dónde está el baño?', 'donde está el baño').akcenty, 1);
  assert.equal(porownajDyktando('Hola, ¿qué tal?', 'hola qué tal').proc, 100);
  const r = porownajDyktando('Me gusta el café', 'me gusta café');
  assert.ok(r.segmenty.some(s => s.k === 'brak' && s.t.includes('el')));
  assert.ok(porownajDyktando('Tengo dos hermanos', 'tengo dos hermános').proc >= 90);
  assert.ok(porownajDyktando('Tengo dos hermanos', 'xyz').proc < 30);
});
test('układanie zdań', () => {
  assert.deepEqual(tokeny('¿Dónde está el baño?'), ['Dónde', 'está', 'el', 'baño']);
  assert.ok(sprawdzKolejnosc(['Dónde', 'está', 'el', 'baño'], '¿Dónde está el baño?'));
  assert.ok(!sprawdzKolejnosc(['está', 'Dónde', 'el', 'baño'], '¿Dónde está el baño?'));
  const t = ['a', 'b', 'c', 'd'];
  assert.notDeepEqual(tasujInaczej(t), t);
});
test('pula zdań i wybór na dzień', () => {
  const p = pulaZdan([{ p: 'A1', przyklad: { es: '*Hola*, ¿qué tal estás?', pl: 'Cześć' } }, { p: 'A1', przyklad: { es: 'Sí.', pl: 'Tak.' } }]);
  assert.equal(p.length, 1); assert.equal(p[0].es, 'Hola, ¿qué tal estás?');
  assert.equal(wybierzNaDzien([1, 2, 3], '2026-11-20'), wybierzNaDzien([1, 2, 3], '2026-11-20'));
});
