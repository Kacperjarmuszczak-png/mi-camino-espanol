// Generator pytań egzaminacyjnych (bez DOM). Pytanie: { typ, p, tytul, tekst, kontekst?, opcje, odp, wyj, id?, mow? }
import { SLOWKA, CZAS, ZWROTY_LISTA, POZIOMY } from './dane/index.js';
import { GRAMATYKA } from './dane/gramatyka.js';
import { CZYTANIE } from './dane/czytanie.js';
import { czasyNaPoziomie, ZDANIA, PODMIOTY, BEZ_DRILLU } from './dane/czasowniki.js';
import { CZASY, OSOBY, OSOBY_ROZKAZ, formy, regula } from './odmiana.js';
import { tasuj, losowy, czysc } from './tekst.js';

export const TYPY = { slowo: 'Słownictwo', zwrot: 'Zwroty', czasownik: 'Czasowniki w zdaniu', gramatyka: 'Gramatyka', luka: 'Luka w zdaniu', czytanie: 'Rozumienie tekstu' };
const bez = s => s.replace(/\*/g, '');
const unikalne = (odp, kand, n = 3) => { const w = [], u = new Set([czysc(odp)]); for (const k of tasuj(kand)) { const c = czysc(k); if (!u.has(c)) { u.add(c); w.push(k); } if (w.length === n) break; } return w; };

function pSlowo(p, pula = SLOWKA.filter(w => w.p === p)) {
  if (pula.length < 4) return null;
  const w = losowy(pula), doPl = Math.random() < 0.5;
  const odp = doPl ? w.pl : w.es;
  const tem = pula.filter(x => x.t === w.t && x.id !== w.id);
  const inne = unikalne(odp, (tem.length >= 3 ? tem : pula).filter(x => x.id !== w.id).map(x => doPl ? x.pl : x.es));
  if (inne.length < 3) return null;
  return { typ: 'slowo', p, tytul: doPl ? 'Co to znaczy?' : 'Jak to powiedzieć po hiszpańsku?', tekst: doPl ? w.es : w.pl, opcje: tasuj([odp, ...inne]), odp,
    wyj: `${w.es} = ${w.pl}.${w.przyklad ? ' Przykład: ' + bez(w.przyklad.es) + ' – ' + bez(w.przyklad.pl) : ''}`, id: w.id, mow: w.es };
}
function pLuka(p, pula = SLOWKA.filter(w => w.p === p && w.przyklad)) {
  if (pula.length < 4) return null;
  const w = losowy(pula);
  const cel = (w.przyklad.es.match(/\*([^*]+)\*/) || [])[1];
  if (!cel) return null;
  const inne = unikalne(cel, pula.filter(x => x.id !== w.id).map(x => (x.przyklad.es.match(/\*([^*]+)\*/) || [])[1]).filter(Boolean));
  if (inne.length < 3) return null;
  return { typ: 'luka', p, tytul: 'Uzupełnij zdanie', tekst: w.przyklad.es.replace(/\*[^*]+\*/, '_____'), opcje: tasuj([cel, ...inne]), odp: cel,
    wyj: `${bez(w.przyklad.es)} – ${bez(w.przyklad.pl)}`, id: w.id, mow: bez(w.przyklad.es) };
}
function pZwrot(p) {
  const i = POZIOMY.indexOf(p);
  let pula = ZWROTY_LISTA.filter(z => z.p === p);
  for (let k = i; pula.length < 4 && k >= 0; k--) pula = ZWROTY_LISTA.filter(z => POZIOMY.indexOf(z.p) >= k && POZIOMY.indexOf(z.p) <= i);
  if (pula.length < 4) return null;
  const z = losowy(pula);
  const inne = unikalne(z.pl, pula.filter(x => x.id !== z.id).map(x => x.pl));
  return { typ: 'zwrot', p, tytul: 'Co znaczy ten zwrot?', tekst: z.es, opcje: tasuj([z.pl, ...inne]), odp: z.pl,
    wyj: `${z.es} – ${z.pl}.${z.kiedy ? ' Kiedy: ' + z.kiedy : ''}`, id: z.id, mow: z.es };
}
function pCzasownik(p, bezVosotros = false) {
  const i = POZIOMY.indexOf(p);
  const pula = CZAS.filter(v => POZIOMY.indexOf(v.p) <= i && !BEZ_DRILLU.has(v.inf));
  const v = losowy(pula), czas = losowy(czasyNaPoziomie(p)), f = formy(v)[czas];
  if (!f) return null;
  const osoby = [0, 1, 2, 3, 4, 5].filter(o => f[o] && !(bezVosotros && o === 4));
  const o = losowy(osoby), odp = f[o];
  const wzor = losowy(ZDANIA[czas]);
  const pod = czas.startsWith('imperativo') ? '' : PODMIOTY[o];
  let zd = wzor[0].replace('{S}', pod).replace(/\s+/g, ' ').trim();
  if (zd[0] !== '¡') zd = zd[0].toUpperCase() + zd.slice(1);
  const kand = [];
  for (const k of czasyNaPoziomie(p)) { const ff = formy(v)[k]; if (ff) ff.forEach((x, j) => { if (x && !(bezVosotros && j === 4)) kand.push(x); }); }
  const inne = unikalne(odp, kand);
  if (inne.length < 3) return null;
  const nazwa = CZASY.find(c => c.k === czas).n, os = (czas.startsWith('imperativo') ? OSOBY_ROZKAZ : OSOBY)[o][0];
  return { typ: 'czasownik', p, tytul: `${v.inf} (${v.pl.split(',')[0]}) · ${nazwa} · ${os}`, tekst: zd, opcje: tasuj([odp, ...inne]), odp,
    wyj: `${zd.replace('___', odp)} ${regula(v, czas)}`, id: v.id, mow: zd.replace('___', odp) };
}
function pGramatyka(p, uzyte) {
  const pula = GRAMATYKA.filter(g => g[0] === p && !uzyte.has(g[2]));
  if (!pula.length) return null;
  const g = losowy(pula); uzyte.add(g[2]);
  return { typ: 'gramatyka', p, tytul: `Gramatyka: ${g[1]}`, tekst: g[2], opcje: tasuj(g[3]), odp: g[3][0], wyj: g[4] };
}
function pCzytanie(p, uzyte) {
  const teksty = CZYTANIE.filter(t => t.p === p);
  const wolne = [];
  teksty.forEach(t => t.q.forEach((q, i) => { const k = t.tekst.slice(0, 20) + i; if (!uzyte.has(k)) wolne.push([t, q, k]); }));
  if (!wolne.length) return null;
  const [t, q, k] = losowy(wolne); uzyte.add(k);
  return { typ: 'czytanie', p, tytul: 'Przeczytaj i odpowiedz', kontekst: t.tekst, tekst: q[0], opcje: tasuj(q[1]), odp: q[1][0], wyj: q[2], mow: t.tekst };
}

const GEN = { slowo: pSlowo, luka: pLuka, zwrot: pZwrot, czasownik: pCzasownik, gramatyka: pGramatyka, czytanie: pCzytanie };
const UDZIALY = [['slowo', 0.28], ['luka', 0.14], ['czasownik', 0.2], ['gramatyka', 0.2], ['zwrot', 0.08], ['czytanie', 0.1]];

function pytanieTypu(typ, p, uzyte, ust) {
  for (let proba = 0; proba < 12; proba++) {
    const q = typ === 'gramatyka' || typ === 'czytanie' ? GEN[typ](p, uzyte) : typ === 'czasownik' ? pCzasownik(p, ust.bezVosotros) : GEN[typ](p);
    if (q && !uzyte.has('q:' + q.tekst)) { uzyte.add('q:' + q.tekst); return q; }
  }
  return null;
}

/**
 * @param {{zakres: 'poziom'|'poziomujacy'|'temat', p: string, temat?: string, ile: number}} o
 */
export function utworzEgzamin(o, ust = {}) {
  const uzyte = new Set(), pyt = [];
  if (o.zakres === 'poziomujacy') {
    for (const p of POZIOMY) {
      for (const typ of ['gramatyka', 'gramatyka', 'slowo', p === 'A1' || p === 'A2' ? 'luka' : 'czytanie']) {
        const q = pytanieTypu(typ, p, uzyte, ust) || pytanieTypu('slowo', p, uzyte, ust);
        if (q) pyt.push(q);
      }
    }
    return pyt;
  }
  if (o.zakres === 'temat') {
    const pula = SLOWKA.filter(w => w.t === o.temat);
    for (let i = 0; i < o.ile * 3 && pyt.length < o.ile; i++) {
      const zLuka = Math.random() < 0.3;
      const q = zLuka ? pLuka(o.p, pula.filter(w => w.przyklad)) : pSlowo(o.p, pula);
      if (q && !uzyte.has(q.tekst)) { uzyte.add(q.tekst); pyt.push(q); }
    }
    return pyt;
  }
  // egzamin z poziomu: typy wg udziałów
  const plan = [];
  for (const [typ, u] of UDZIALY) for (let i = 0; i < Math.round(o.ile * u); i++) plan.push(typ);
  while (plan.length < o.ile) plan.push('slowo');
  for (const typ of tasuj(plan).slice(0, o.ile)) {
    const q = pytanieTypu(typ, o.p, uzyte, ust) || pytanieTypu('slowo', o.p, uzyte, ust);
    if (q) pyt.push(q);
  }
  return pyt;
}

// Szacowany poziom z testu poziomującego: najwyższy poziom, do którego każdy kolejny ma ≥ 60% poprawnych.
export function szacujPoziom(pytania, odpowiedzi) {
  let wynik = 'poniżej A1';
  for (const p of POZIOMY) {
    const idx = pytania.map((q, i) => [q, i]).filter(([q]) => q.p === p);
    if (!idx.length) continue;
    const ok = idx.filter(([q, i]) => odpowiedzi[i] === q.odp).length;
    if (ok / idx.length >= 0.6) wynik = p; else break;
  }
  return wynik;
}

export function ocenaSlowna(proc) {
  if (proc >= 90) return 'Celujący';
  if (proc >= 75) return 'Bardzo dobry';
  if (proc >= 60) return 'Dobry';
  if (proc >= 45) return 'Dostateczny';
  return 'Do powtórki';
}
