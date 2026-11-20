import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liczbaEs, cenaEs, godzinaEs, liczbaPl, cenaPl } from '../js/liczby.js';

test('liczebniki hiszpańskie', () => {
  const t = { 0: 'cero', 16: 'dieciséis', 21: 'veintiuno', 22: 'veintidós', 31: 'treinta y uno', 99: 'noventa y nueve', 100: 'cien', 101: 'ciento uno',
    115: 'ciento quince', 200: 'doscientos', 555: 'quinientos cincuenta y cinco', 1000: 'mil', 1001: 'mil uno', 2024: 'dos mil veinticuatro',
    21000: 'veintiún mil', 9999: 'nueve mil novecientos noventa y nueve', 700: 'setecientos' };
  for (const [n, w] of Object.entries(t)) assert.equal(liczbaEs(+n), w, n);
  assert.equal(cenaEs(1, 0), 'un euro');
  assert.equal(cenaEs(21, 50), 'veintiún euros con cincuenta');
  assert.equal(cenaEs(31, 5), 'treinta y un euros con cinco');
});
test('godziny po hiszpańsku', () => {
  assert.equal(godzinaEs(1, 0), 'Es la una en punto');
  assert.equal(godzinaEs(4, 15), 'Son las cuatro y cuarto');
  assert.equal(godzinaEs(7, 30), 'Son las siete y media');
  assert.equal(godzinaEs(3, 45), 'Son las cuatro menos cuarto');
  assert.equal(godzinaEs(12, 40), 'Es la una menos veinte');
  assert.equal(godzinaEs(10, 25), 'Son las diez y veinticinco');
});
test('liczebniki polskie i ceny', () => {
  const t = { 0: 'zero', 12: 'dwanaście', 22: 'dwadzieścia dwa', 100: 'sto', 245: 'dwieście czterdzieści pięć', 1000: 'tysiąc', 2000: 'dwa tysiące',
    5000: 'pięć tysięcy', 12000: 'dwanaście tysięcy', 22000: 'dwadzieścia dwa tysiące', 1999: 'tysiąc dziewięćset dziewięćdziesiąt dziewięć' };
  for (const [n, w] of Object.entries(t)) assert.equal(liczbaPl(+n), w, n);
  assert.equal(cenaPl(1, 0), 'jeden złoty');
  assert.equal(cenaPl(23, 50), 'dwadzieścia trzy złote pięćdziesiąt groszy');
  assert.equal(cenaPl(12, 2), 'dwanaście złotych dwa grosze');
  assert.equal(cenaPl(5, 1), 'pięć złotych jeden grosz');
});
