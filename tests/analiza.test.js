import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizuj, tokenizuj, podzielNaZdania, slownikPl } from '../js/analiza.js';
import { tlumaczOnline, kawalki, BladTlumaczenia } from '../js/tlumaczenie.js';
import { SLOWKA, CZAS } from '../js/dane/index.js';

const z = t => analizuj(t).zdania[0];
const slowo = (t, s) => z(t).slowa.find(w => w.t === s);
const bledy = t => z(t).uwagi.filter(u => u.typ === 'blad').map(u => u.tytul);

test('słownictwo: co najmniej 4000 unikalnych słów (słówka + czasowniki)', () => {
  const es = new Set(SLOWKA.map(w => w.es.replace(/^(el|la|los|las) /, '')));
  const unikalne = SLOWKA.length + CZAS.filter(v => !es.has(v.inf)).length;
  assert.ok(unikalne >= 4000, `jest ${unikalne}`);
});

test('tokenizacja i podział na zdania', () => {
  assert.deepEqual(tokenizuj('¿Qué tal?').map(t => t.t), ['¿', 'Qué', 'tal', '?']);
  assert.deepEqual(podzielNaZdania('Hola. ¿Qué tal? Bien.'), ['Hola.', '¿Qué tal?', 'Bien.']);
});

test('rozpoznaje formy czasowników: lemat, czas, osoba', () => {
  const w = slowo('Quiero que vengas conmigo.', 'vengas');
  assert.equal(w.lemat, 'venir');
  assert.equal(w.czasownik.czas, 'subjuntivo');
  assert.equal(w.czasownik.os, 1);
  assert.equal(slowo('Ayer fui al cine.', 'fui').lemat, 'ir');
  assert.equal(slowo('Fui médico.', 'Fui').lemat, 'ser');
  assert.ok(slowo('Hoy he comido paella.', 'comido').opis.includes('Pretérito perfecto'));
  assert.ok(slowo('Me levanto temprano.', 'levanto').lemat.startsWith('levantar'));
});

test('rozpoznaje rzeczowniki z rodzajem i liczbą oraz formy przymiotników', () => {
  const w = slowo('Los perros ladran.', 'perros');
  assert.equal(w.lemat, 'el perro');
  assert.ok(w.opis.includes('mnoga'));
  assert.equal(slowo('La casa es grande.', 'casa').typ, 'rzeczownik');
  assert.equal(slowo('El agua está fría.', 'fría').lemat, 'frío');
});

test('wyrażenia wielowyrazowe i wyrazy funkcyjne', () => {
  assert.ok(z('Trabajo por la mañana.').slowa.some(w => w.t === 'por la mañana'));
  assert.equal(slowo('Voy al cine.', 'al').typ, 'ściągnięcie');
  assert.equal(slowo('Ven conmigo.', 'conmigo').pl, 'ze mną');
});

test('wykrywa typowe błędy z wyjaśnieniem', () => {
  assert.ok(bledy('Donde esta el baño?').some(t => t.includes('¿')));
  assert.ok(bledy('Donde esta el baño?').some(t => t.includes('está')));
  assert.ok(bledy('Yo tiene un perro.').some(t => t.includes('Yo tengo')));
  assert.ok(bledy('Tengo la gato.').some(t => t.includes('el gato')));
  assert.ok(bledy('Voy a el mercado.').some(t => t.includes('al')));
  assert.ok(bledy('Me gusta los perros.').some(t => t.includes('gustan')));
  assert.ok(bledy('Ojalá viene pronto.').some(t => t.includes('venga')));
  assert.ok(bledy('La casa blanco es bonita.').some(t => t.includes('blanca')));
  assert.ok(bledy('Nos vemos el Lunes.').some(t => t.includes('małą literą')));
  assert.ok(bledy('Si, claro.').some(t => t.includes('sí')));
  assert.ok(bledy('¿Que haces?').some(t => t.includes('akcentem')));
});

test('poprawne zdania nie mają błędów, a dostają wyjaśnienia', () => {
  for (const t of ['¿Dónde está la estación de tren?', 'Me gustan los perros.', 'Quiero que vengas conmigo.', 'El agua está fría.', 'Tengo que trabajar mañana.']) {
    assert.deepEqual(bledy(t), [], t);
    assert.ok(z(t).uwagi.length > 0, t);
  }
  assert.ok(z('Tengo que trabajar mañana.').uwagi.some(u => u.tytul.includes('tener que')));
  assert.ok(z('El agua está fría.').uwagi.some(u => u.tytul.includes('el agua')));
  assert.ok(z('Estoy cansado.').uwagi.some(u => u.tytul.includes('Ser czy estar')));
});

test('tłumaczenie dosłowne słowo po słowie', () => {
  assert.equal(z('Tengo que trabajar mañana.').doslownie, 'musieć (yo) pracować jutro');
});

test('słownik polski → hiszpański bez internetu', () => {
  const s = slownikPl('kot pies');
  assert.ok(s[0].propozycje.some(p => p.es === 'el gato'));
  assert.ok(s[1].propozycje.some(p => p.es === 'el perro'));
});

test('tłumaczenie online: dzielenie tekstu, wynik, limit i brak sieci', async () => {
  const dlugi = Array.from({ length: 30 }, (_, i) => `Esta es la frase número ${i}.`).join(' ');
  assert.ok(kawalki(dlugi).every(k => k.length <= 450));
  assert.ok(kawalki(dlugi).length > 1);
  const ok = async url => ({ json: async () => ({ responseStatus: 200, responseData: { translatedText: 'To jest &quot;test&quot; – ' + new URL(url).searchParams.get('langpair') } }) });
  assert.equal(await tlumaczOnline('Hola', 'es', 'pl', { pobierz: ok }), 'To jest "test" – es|pl');
  const limit = async () => ({ json: async () => ({ responseStatus: 429, responseData: { translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.' } }) });
  await assert.rejects(tlumaczOnline('Adiós amigo', 'es', 'pl', { pobierz: limit }), e => e instanceof BladTlumaczenia && e.rodzaj === 'limit');
  const brakSieci = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(tlumaczOnline('Buenas noches', 'es', 'pl', { pobierz: brakSieci }), e => e.rodzaj === 'siec');
});
