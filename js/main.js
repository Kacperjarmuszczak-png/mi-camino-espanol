// Punkt startowy: stan, poziomy A1–C2 z postępem, zakładki, nagłówek z aktywnością, statystyki, ustawienia, skróty.
import { wczytaj, zapisz as zapiszStan, dodajAktywnosc, seria, seriaSzczegoly, dzien, eksportuj, importuj, nowyStanAplikacji } from './stan.js';
import { ocen, postep, status, doPowtorki } from './srs.js';
import { utworzMowe } from './mowa.js';
import { POZIOMY, OPIS_POZIOMU, SLOWKA, CZAS, ZWROTY_LISTA, POD_ID, tematy } from './dane/index.js';
import { $, $$, esc, IKONY, otworzModal, zamknijModal, modalOtwarty, toast, przyciskGlosu, sygnalModalu, zainicjujZnaki, zainicjujPolysk, zainicjujArkusz, arkuszZElementem, suwakZakres, podlaczZakres } from './ui/wspolne.js';
import { zakladkaSlowka } from './ui/slowka.js';
import { zakladkaEgzamin } from './ui/egzamin.js';
import { zakladkaCzasowniki } from './ui/czasowniki.js';
import { zakladkaZwroty } from './ui/zwroty.js';
import { zakladkaTlumacz } from './ui/tlumacz.js';
import { zainicjujSuwaki } from './ui/suwak.js';
import { zainicjujWyspe } from './ui/wyspa.js';
import { zakladkaCzasownikiPl } from './ui/czasowniki-pl.js';
import { zakladkaTlumaczPl } from './ui/tlumacz-pl.js';
import { zakladkaCwiczenia } from './ui/cwiczenia.js';
import { widokGramatyki } from './ui/gramatyka.js';
import { widokMoich } from './ui/moje.js';
import { pasekXp, widokOdznak, widokTygodnia, htmlTygodnia } from './ui/motywacja.js';
import { widokDyktanda } from './ui/dyktando.js';
import { widokUkladania } from './ui/uloz.js';
import { widokWyzwan } from './ui/wyzwania.js';
import { widokLekcjiDnia } from './ui/lekcja-dnia.js';
import { widokRozmowy } from './ui/rozmowa.js';
import { xpZaOcene, poziomGracza, noweOdznaki } from './postep.js';
import { HISP, t as T, ustawJezyk } from './jezyk.js';
import { kalendarz, najdluzszaSeria, liczOpanowane, seriaOpanowanych, najczesciejMylone } from './statystyki.js';
import { plikIcs, pobierzIcs, plakietkaDostepna, wlaczPlakietke, ustawPlakietke } from './przypomnienia.js';

const stan = wczytaj();
const ZAKLADKI = ['slowka', 'egzamin', 'czasowniki', 'zwroty', 'tlumacz', 'cwiczenia'];
if (!POZIOMY.includes(stan.ui.poziom)) stan.ui.poziom = 'A1';
if (!ZAKLADKI.includes(stan.ui.zakladka)) stan.ui.zakladka = 'slowka';

let czasZapisu, wyspa = null;
const app = {
  stan,
  dane: POD_ID,
  mowa: utworzMowe(stan.ust),
  zapisz() { clearTimeout(czasZapisu); czasZapisu = setTimeout(() => { if (!zapiszStan(stan)) toast(T('Nie udało się zapisać postępu (pamięć przeglądarki jest niedostępna).', 'No se pudo guardar el progreso (el almacenamiento del navegador no está disponible).')); }, 150); },
  ocen(id, ocena, { bezAktywnosci = false } = {}) {
    stan.srs[id] = ocen(stan.srs[id], ocena);
    stan.hist[dzien()] = liczOpanowane(stan.srs);
    dodajXp(xpZaOcene(ocena));
    if (!bezAktywnosci) dodajAktywnosc(stan, 1);
    sprawdzOdznaki();
    app.zapisz(); rysujNaglowek(); rysujPoziomy();
    return stan.srs[id];
  },
  dodajAktywnosc(n) { if (n > 0) { dodajAktywnosc(stan, n); dodajXp(5 * n); app.zapisz(); rysujNaglowek(); sprawdzOdznaki(); } },
  licz(k, n = 1) { stan.licz[k] = (stan.licz[k] || 0) + n; app.zapisz(); sprawdzOdznaki(); },
  rekord(k, v) { if (v > (stan.rekordy[k] || 0)) { stan.rekordy[k] = v; app.zapisz(); sprawdzOdznaki(); return true; } return false; },
  odswiez() { rysujNaglowek(); rysujPoziomy(); rysujInfo(); Object.values(moduly).forEach(m => m.odswiezListe && m.odswiezListe()); },
};
// --- XP i odznaki ---
function dodajXp(n) {
  const przed = poziomGracza(stan.xp || 0).poziom;
  stan.xp = (stan.xp || 0) + n; const d = dzien(); stan.xpDni[d] = (stan.xpDni[d] || 0) + n;
  const po = poziomGracza(stan.xp).poziom;
  if (po > przed) setTimeout(() => toast(T(`⭐ Poziom gracza ${po}!`, `⭐ ¡Nivel de jugador ${po}!`)), 300);
}
let czasOdznak = 0;
function sprawdzOdznaki() {
  clearTimeout(czasOdznak);
  czasOdznak = setTimeout(() => {
    const zest = { odp: Object.values(stan.dni).reduce((a, b) => a + b, 0), najdl: Math.max(najdluzszaSeria(stan.dni, stan.ust.cel), seria(stan)), opan: liczOpanowane(stan.srs),
      egz: stan.egz, licz: stan.licz, rekordy: stan.rekordy, poziom: poziomGracza(stan.xp || 0).poziom };
    const nowe = noweOdznaki(zest, stan.odznaki);
    if (!nowe.length) return;
    nowe.forEach(o => { stan.odznaki[o.id] = dzien(); });
    app.zapisz();
    toast(T(`🏅 Nowa odznaka: ${nowe[0].ik} ${nowe[0].n}`, `🏅 Nueva insignia: ${nowe[0].ik} ${nowe[0].n}`) + (nowe.length > 1 ? ` (+${nowe.length - 1})` : ''));
  }, 400);
}
window.addEventListener('pagehide', () => zapiszStan(stan));
document.addEventListener('visibilitychange', () => { if (document.hidden) zapiszStan(stan); });

// --- postęp poziomu: opanowanie słówek, czasowników i zwrotów (85%) + najlepszy egzamin (15%) ---
const elementyPoziomu = p => [...SLOWKA, ...CZAS, ...ZWROTY_LISTA].filter(x => x.p === p);
function statystyki(p) {
  const el = elementyPoziomu(p);
  const s = { razem: el.length, opanowane: 0, utrwalane: 0, nauka: 0, nowe: 0, powtorka: 0, suma: 0 };
  const teraz = Date.now();
  for (const x of el) { const st = stan.srs[x.id]; s[status(st)]++; s.suma += postep(st); if (doPowtorki(st, teraz)) s.powtorka++; }
  const egz = stan.egz[p] || 0;
  s.procent = el.length ? Math.round(100 * (0.85 * s.suma / el.length + 0.15 * egz / 100)) : 0;
  s.egz = stan.egz[p];
  return s;
}
const czesc = (lista, p) => { const el = lista.filter(x => x.p === p); return [el.filter(x => status(stan.srs[x.id]) === 'opanowane').length, el.length]; };

function rysujPoziomy() {
  $('#poziomy').innerHTML = POZIOMY.map(p => {
    const s = statystyki(p);
    return `<button type="button" class="poziom" data-p="${p}" aria-pressed="${p === stan.ui.poziom}" aria-label="${T('Poziom', 'Nivel')} ${p}: ${s.procent}% ${T('postępu', 'de progreso')}">
      <b>${p}${stan.egz[p] >= 70 ? `<i class="zdany" title="${T('Egzamin zdany', 'Examen aprobado')}">✓</i>` : ''}</b><small>${s.procent}%</small></button>`;
  }).join('');
}
function rysujInfo() {
  const p = stan.ui.poziom, s = statystyki(p), o = OPIS_POZIOMU[p];
  const [so, sr] = czesc(SLOWKA, p);
  $('#poziom-info').innerHTML = `<span><b>${p}</b> · ${esc(o.n)}</span><span class="linia-liczby">${so}/${sr} ${T('słówek', 'palabras')}${s.powtorka ? ` · <b class="akcent">${s.powtorka} ${T('do powtórki', 'para repasar')}</b>` : ''}${s.egz != null ? ` · ${T('egzamin', 'examen')} ${s.egz}%` : ''}</span><span class="linia-i" aria-hidden="true">ⓘ</span>`;
}
function modalStatystyk() {
  const p = stan.ui.poziom, s = statystyki(p);
  const tem = tematy(SLOWKA, p).map(t => {
    const el = SLOWKA.filter(w => w.p === p && w.t === t);
    const v = Math.round(100 * el.reduce((a, w) => a + postep(stan.srs[w.id]), 0) / el.length);
    return `<div class="typ"><span>${esc(t)}</span><div class="postep"><i style="width:${v}%"></i></div><small>${v}%</small></div>`;
  }).join('');
  otworzModal(T(`Poziom ${p} – statystyki`, `Nivel ${p} – estadísticas`), `
    <p><b>${esc(OPIS_POZIOMU[p].n)}.</b> ${esc(OPIS_POZIOMU[p].o)}</p>
    <div class="liczby">
      <div><b>${s.procent}%</b><span>${T('postęp poziomu', 'progreso del nivel')}</span></div><div><b>${s.opanowane}</b><span>${T('opanowane', 'dominadas')}</span></div>
      <div><b>${s.utrwalane}</b><span>${T('utrwalane', 'afianzando')}</span></div><div><b>${s.nauka}</b><span>${T('w nauce', 'aprendiendo')}</span></div>
      <div><b>${s.nowe}</b><span>${T('jeszcze nowe', 'nuevas')}</span></div><div><b>${s.powtorka}</b><span>${T('do powtórki dziś', 'para repasar hoy')}</span></div>
    </div>
    <p class="male">${T('Postęp = opanowanie słówek, czasowników i zwrotów z tego poziomu (85%) + najlepszy wynik egzaminu (15%). Element jest opanowany, gdy następna powtórka wypada za co najmniej 7 dni.', 'Progreso = dominio de las palabras, verbos y frases del nivel (85 %) + mejor resultado del examen (15 %). Un elemento está dominado cuando el siguiente repaso es dentro de 7 días o más.')}</p>
    <p class="etykieta">${T('Tematy słówek', 'Temas de vocabulario')}</p><div class="typy">${tem}</div>`);
}

// --- nagłówek: dzisiejszy cel i seria ---
function rysujNaglowek() {
  const ile = stan.dni[dzien()] || 0, cel = stan.ust.cel, sr = seria(stan);
  $('#dzis-ile').textContent = ile; $('#dzis-cel').textContent = '/' + cel;
  const obw = 2 * Math.PI * 15;
  $('#dzis-luk').style.strokeDasharray = `${obw * Math.min(1, ile / cel)} ${obw}`;
  $('#dzis').classList.toggle('cel-osiagniety', ile >= cel);
  $('#seria').innerHTML = `${IKONY.ogien}<b>${sr}</b>`;
  $('#dzis').setAttribute('aria-label', T(`Dziś ${ile} z ${cel} pozycji, seria ${sr} dni`, `Hoy ${ile} de ${cel}, racha de ${sr} días`));
  $('#wyspa-luk').style.strokeDasharray = `${obw * Math.min(1, ile / cel)} ${obw}`;
  $('#wyspa').classList.toggle('cel-osiagniety', ile >= cel);
  $('#wyspa-poziom').textContent = stan.ui.poziom;
  if (stan.ust.plakietka) { const t0 = Date.now(); ustawPlakietke(Object.values(stan.srs).filter(x => doPowtorki(x, t0)).length); }
  $('#wyspa-btn').setAttribute('aria-label', T(`Poziom ${stan.ui.poziom}, dziś ${ile} z ${cel}. Rozwiń, aby zobaczyć statystyki i opcje`, `Nivel ${stan.ui.poziom}, hoy ${ile} de ${cel}. Despliega para ver estadísticas y opciones`));
}
function modalDnia() {
  const cel = stan.ust.cel;
  const kal = kalendarz(stan.dni, cel);
  const miesiace = T(['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'], ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']);
  const etyk = kal.map((kol, i) => { const d = kol.find(Boolean); if (!d) return ''; const m = +d.k.slice(5, 7) - 1; const prev = i && kal[i - 1].find(Boolean); return !prev || +prev.k.slice(5, 7) - 1 !== m ? miesiace[m] : ''; });
  const pkt = seriaOpanowanych(stan.hist, 30);
  const maxN = Math.max(5, ...pkt.map(p => p.n));
  const W = 300, H = 90;
  const xy = pkt.map((p, i) => [Math.round(i * W / (pkt.length - 1)), Math.round(H - 6 - (H - 12) * p.n / maxN)]);
  const linia = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const mylone = najczesciejMylone(stan.srs, 10, id => { const x = POD_ID.get(id); return x && (x.typ === 'slowo' || x.typ === 'zwrot'); }).map(m => ({ ...m, x: POD_ID.get(m.id) }));
  const suma = Object.values(stan.dni).reduce((a, b) => a + b, 0), aktywne = Object.values(stan.dni).filter(n => n > 0).length;
  const el = otworzModal(T('Statystyki', 'Estadísticas'), `
    <div class="liczby liczby--4"><div><b>${stan.dni[dzien()] || 0}</b><span>${T('dziś', 'hoy')}</span></div><div><b>${seria(stan)}</b><span>${T('dni serii', 'días de racha')}</span></div>
      <div><b>${najdluzszaSeria(stan.dni, cel)}</b><span>${T('najdłuższa seria', 'racha más larga')}</span></div><div><b>${liczOpanowane(stan.srs)}</b><span>${T('opanowane', 'dominadas')}</span></div></div>
    ${pasekXp(stan)}
    ${(() => { const z = seriaSzczegoly(stan).zamrozone; return z.length ? `<p class="male">❄️ ${T('Zamrożenie serii uratowało dzień', 'La congelación de racha salvó el día')} ${z.map(k => k.split('-').reverse().join('.')).join(', ')}. ${T('Jeden opuszczony dzień na 7 nie przerywa serii.', 'Un día sin practicar cada 7 no rompe la racha.')}</p>` : `<p class="male">❄️ ${T('Zamrożenie serii: jeden opuszczony dzień na 7 nie przerywa serii.', 'Congelación de racha: un día sin practicar cada 7 no rompe la racha.')}</p>`; })()}
    <p class="etykieta">${T('Ten tydzień', 'Esta semana')}</p>${htmlTygodnia(stan)}
    <p class="etykieta">${T('Kalendarz aktywności', 'Calendario de actividad')}</p>
    <div class="kalendarz" role="img" aria-label="${T(`Aktywność: ${aktywne} dni nauki, łącznie ${suma} odpowiedzi`, `Actividad: ${aktywne} días de práctica, ${suma} respuestas en total`)}">
      <div class="kal-mies">${etyk.map(m => `<span>${m}</span>`).join('')}</div>
      <div class="kal-siatka">${kal.map(kol => `<div class="kal-kol">${kol.map(d => d ? `<i class="kal-d p${d.poziom}" title="${d.k}: ${d.n}"></i>` : '<i class="kal-d pusty"></i>').join('')}</div>`).join('')}</div>
      <div class="kal-legenda"><span>${T('mniej', 'menos')}</span>${[0, 1, 2, 3, 4].map(p => `<i class="kal-d p${p}"></i>`).join('')}<span>${T('więcej', 'más')}</span></div>
    </div>
    <p class="male">${T(`Odpowiedzi: ${suma} · dni nauki: ${aktywne}. Pełny kolor = cel dzienny osiągnięty.`, `Respuestas: ${suma} · días de práctica: ${aktywne}. Color intenso = meta diaria alcanzada.`)}</p>
    <p class="etykieta">${T('Opanowane w ostatnich 30 dniach', 'Dominadas en los últimos 30 días')}</p>
    <svg class="wykres" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${T('Wykres opanowanych pozycji', 'Gráfico de elementos dominados')}">
      <path class="wykres-pole" d="${linia} L${W} ${H} L0 ${H} Z"/><path class="wykres-linia" d="${linia}"/>
      <circle cx="${xy[xy.length - 1][0] - 3}" cy="${xy[xy.length - 1][1]}" r="3.5" class="wykres-pkt"/></svg>
    <div class="wykres-os"><span>${pkt[0].k.slice(5).split('-').reverse().join('.')}</span><span>${T('dziś', 'hoy')}: ${pkt[pkt.length - 1].n}</span></div>
    <p class="etykieta">${T('Najczęściej mylone', 'Las que más fallas')}</p>
    ${mylone.length ? `<ul class="lista lista--zwarta">${mylone.map(m => `<li><div class="lista-tekst"><b>${esc(m.x.es)}</b><span>${esc(m.x.pl)}</span></div><span class="znacznik znacznik--nauka">${m.zle}× ${T('błąd', 'error')}</span>${przyciskGlosu(m.x.es)}</li>`).join('')}</ul>
      <button type="button" class="btn btn--akcent btn--szeroki" data-cwicz-mylone>${T('Ćwicz te słowa', 'Practicar estas palabras')}</button>` : `<p class="male">${T('Jeszcze nic – błędy pojawią się tutaj, gdy coś Ci nie wyjdzie.', 'Todavía nada: aquí aparecerán tus errores.')}</p>`}
    <p class="etykieta">${T('Cel dzienny', 'Meta diaria')}</p>
    <div class="seg" role="group" aria-label="${T('Cel dzienny', 'Meta diaria')}">${[10, 20, 30, 50].map(n => `<button type="button" data-cel="${n}" aria-pressed="${stan.ust.cel === n}">${n}</button>`).join('')}</div>`);
  el.addEventListener('click', e => {
    const cw = e.target.closest('[data-cwk]');
    if (cw) { zamknijModal(); pokazZakladke('cwiczenia', { przewin: true }); moduly.cwiczenia.otworz(cw.dataset.cwk); return; }
    if (!e.target.closest('[data-cwicz-mylone]')) return;
    zamknijModal();
    pokazZakladke('slowka', { przewin: true });
    moduly.slowka.cwiczListe(mylone.map(m => m.x));
  }, { signal: sygnalModalu() });
}

// --- zakładki z przesuwaną szklaną kapsułą ---
const moduly = {
  slowka: zakladkaSlowka($('#z-slowka'), app),
  egzamin: zakladkaEgzamin($('#z-egzamin'), app),
  czasowniki: (HISP ? zakladkaCzasownikiPl : zakladkaCzasowniki)($('#z-czasowniki'), app),
  zwroty: zakladkaZwroty($('#z-zwroty'), app),
  tlumacz: (HISP ? zakladkaTlumaczPl : zakladkaTlumacz)($('#z-tlumacz'), app),
};
// --- dział Ćwiczenia (z górnej kapsuły) ---
const IK = d => `<svg viewBox="0 0 24 24">${d}</svg>`;
const cwiczListe = lista => { if (!lista.length) return; pokazZakladke('slowka', { przewin: true }); moduly.slowka.cwiczListe(lista); };
const otworzTekst = i => { stan.ui.czTekst = i; stan.ui.zWidok = 'czytanie'; zainicjowane.delete('zwroty'); pokazZakladke('zwroty', { przewin: true }); };
const KAFELKI = [
  { id: 'lekcja', ikona: IK('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'), n: T('Lekcja dnia', 'Lección del día'), o: T('Słowo, zwrot, reguła i quiz – 3 minuty', 'Palabra, frase, regla y test: 3 minutos'), widok: widokLekcjiDnia },
  { id: 'gramatyka', ukryj: HISP, ikona: IK('<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8 12h8M8 16h5"/>'), n: 'Gramatyka', o: '16 lekcji: reguła, przykłady, ćwiczenie', widok: widokGramatyki },
  { id: 'czytanie', ikona: IK('<path d="M4 6c3-1 5-1 8 1 3-2 5-2 8-1v12c-3-1-5-1-8 1-3-2-5-2-8-1z"/><path d="M12 7v12"/>'), n: T('Czytanie', 'Lectura'), o: T('Teksty z tłumaczeniem słów', 'Textos con traducción de palabras'), akcja: () => otworzTekst(stan.ui.czTekst ?? 0) },
  { id: 'dyktando', ikona: IK('<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>'), n: T('Dyktando', 'Dictado'), o: T('Słuchasz i wpisujesz całe zdanie', 'Escuchas y escribes la frase'), widok: widokDyktanda },
  { id: 'uloz', ikona: IK('<rect x="3" y="5" width="7" height="5" rx="1.5"/><rect x="14" y="5" width="7" height="5" rx="1.5"/><rect x="7" y="14" width="10" height="5" rx="1.5"/>'), n: T('Ułóż zdanie', 'Ordena la frase'), o: T('Słowa w dobrej kolejności', 'Palabras en el orden correcto'), widok: widokUkladania },
  { id: 'rozmowa', ukryj: HISP, ikona: IK('<path d="M4 5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-3-3h-4"/>'), n: 'Rozmowa', o: 'Scenki z lektorem: kawiarnia, hotel, lekarz…', widok: widokRozmowy },
  { id: 'wyzwania', ikona: IK('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'), n: T('Wyzwania', 'Retos'), o: T('Ekspres 60 s i bez błędu', 'Exprés 60 s y sin fallar'), widok: widokWyzwan },
  { id: 'moje', ikona: IK('<path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z"/>'), n: T('Moje słowa', 'Mis palabras'), o: T('Ulubione i ćwiczenie z nich', 'Favoritas y práctica'), widok: widokMoich },
  { id: 'odznaki', ukryj: true, n: T('Odznaki', 'Insignias'), widok: widokOdznak },
  { id: 'tydzien', ukryj: true, n: T('Twój tydzień', 'Tu semana'), widok: widokTygodnia },
  { id: 'egzamin', ikona: IK('<path d="M9 4h6m-7 2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm1 7 2 2 4-4"/>'), n: T('Egzamin', 'Examen'), o: T('Poziom, test poziomujący, temat', 'Nivel, prueba de nivel, tema'), akcja: () => pokazZakladke('egzamin', { przewin: true }) },
];
moduly.cwiczenia = zakladkaCwiczenia($('#z-cwiczenia'), app, { kafelki: KAFELKI, pasekXp: () => pasekXp(stan), cwicz: cwiczListe, otworzTekst });
app.otworzCzasownik = inf => {
  stan.ui.cWidok = 'tabela';
  zainicjowane.add('czasowniki');
  pokazZakladke('czasowniki', { przewin: true });
  moduly.czasowniki.poziom();
  moduly.czasowniki.pokaz(inf);
};
const zainicjowane = new Set();
function pokazZakladke(z, { przewin = false } = {}) {
  if (document.body.classList.contains('skupienie') && z !== stan.ui.zakladka) skupienie(false);
  stan.ui.zakladka = z; app.zapisz();
  $$('#zakladki [data-z]').forEach(b => { const a = b.dataset.z === z; b.setAttribute('aria-selected', a); b.setAttribute('aria-current', a ? 'page' : 'false'); });
  ZAKLADKI.forEach(k => { $('#z-' + k).hidden = k !== z; });
  if (!zainicjowane.has(z)) { zainicjowane.add(z); moduly[z].poziom(); }
  app.mowa.stop();
  if (wyspa) wyspa.odswiez();
  if (przewin) scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function zmienPoziom(p) {
  stan.ui.poziom = p; app.zapisz();
  rysujPoziomy(); rysujInfo(); rysujNaglowek();
  zainicjowane.clear(); zainicjowane.add(stan.ui.zakladka);
  moduly[stan.ui.zakladka].poziom();
  if (wyspa) wyspa.odswiez();
}

// --- akcje z górnej kapsuły: opcje sekcji, słowniczek (lista), egzamin ---
const LISTY = { slowka: ['#s-lista', T('Słowniczek – słówka', 'Diccionario – palabras')], zwroty: ['#z-lista', T('Słowniczek – zwroty', 'Diccionario – frases')], czasowniki: ['#c-lista', T('Słowniczek – czasowniki', 'Diccionario – verbos')] };
function opcjeSekcji() {
  const z = stan.ui.zakladka;
  const klik = sel => { const b = $(sel); if (b) b.click(); };
  if (z === 'slowka') klik('#slowka-opcje');
  else if (z === 'zwroty') { if ((stan.ui.zWidok || 'przeglad') === 'fiszki' && $('#zwroty-opcje')) klik('#zwroty-opcje'); else klik('#z-kat-kapsula'); }
  else if (z === 'czasowniki') { if ((stan.ui.cWidok || 'tabela') === 'drill' && $('#d-opcje')) klik('#d-opcje'); else klik('#c-grupa-kapsula'); }
  else if (z === 'tlumacz') arkuszZElementem(T('Opcje tłumacza', 'Opciones del traductor'), $('#t-opcje'));
}
function slowniczek() {
  const l = LISTY[stan.ui.zakladka]; if (!l) return;
  const el = $(l[0]); if (!el) return;
  arkuszZElementem(l[1], el);
  const d = el.querySelector('details'); if (d && !d.open) d.open = true;
}
function akcjaWyspy(k) {
  if (k === 'opcje') opcjeSekcji();
  else if (k === 'lista') slowniczek();
  else if (k === 'egzamin') pokazZakladke('egzamin', { przewin: true });
  else if (k === 'cwiczenia') { if (stan.ui.zakladka === 'cwiczenia') moduly.cwiczenia.wroc(); else pokazZakladke('cwiczenia', { przewin: true }); }
}

// --- ustawienia ---
let ustawieniaAC = null;
function modalUstawien() {
  if (ustawieniaAC) ustawieniaAC.abort();     // jedno zestawienie słuchaczy na otwarte okno
  ustawieniaAC = new AbortController();
  const sygnal = { signal: ustawieniaAC.signal };
  const u = stan.ust, m = app.mowa;
  const glosy = m.glosy;
  const fTempo = v => String(Math.round(v * 100) / 100).replace('.', ',') + '×';
  const fCel = v => T(`${v} dziennie`, `${v} al día`);
  const tresc = otworzModal(T('Szybkie ustawienia', 'Ajustes rápidos'), `<div class="cc">
    <div class="cc-blok"><p class="etykieta">${T('Czego się uczysz', 'Qué aprendes')}</p>
      <div class="seg seg--pelny" role="group" aria-label="${T('Język nauki', 'Idioma de estudio')}"><button type="button" data-jezyk="pl" aria-pressed="${!HISP}">🇪🇸 ${T('Hiszpański (dla Polaków)', 'Español (para polacos)')}</button><button type="button" data-jezyk="es" aria-pressed="${HISP}">🇵🇱 ${T('Polski (dla Hiszpanów)', 'Polaco (para hispanohablantes)')}</button></div></div>
    ${navigator.standalone || matchMedia('(display-mode: standalone)').matches ? '' : `<div class="cc-blok cc-instal"><p class="etykieta">${T('Aplikacja na ekranie głównym', 'App en la pantalla de inicio')}</p>
      <p class="male">${T('W Safari stuknij <b>Udostępnij</b> → <b>Do ekranu początkowego</b>. Strona otworzy się jak aplikacja: na pełnym ekranie, bez paska Safari i także bez internetu.', 'En Safari toca <b>Compartir</b> → <b>Añadir a pantalla de inicio</b>. Se abrirá como una app: a pantalla completa, sin la barra de Safari y también sin internet.')}</p></div>`}
    <div class="cc-kafle">
      <label class="cc-kafel"><input type="checkbox" id="u-auto" ${u.auto ? 'checked' : ''}><span class="tgl" aria-hidden="true"></span><b>${T('Auto-wymowa', 'Pronunciación automática')}</b><small>${T('nowa karta i odpowiedź', 'tarjeta nueva y respuesta')}</small></label>
      ${HISP ? '' : `<label class="cc-kafel"><input type="checkbox" id="u-vosotros" ${u.bezVosotros ? 'checked' : ''}><span class="tgl" aria-hidden="true"></span><b>Bez „vosotros”</b><small>odmiana jak w Ameryce</small></label>`}
    </div>
    ${suwakZakres({ id: 'u-tempo', min: 0.6, max: 1.4, krok: 0.05, wartosc: u.tempo || 1, format: fTempo, etykieta: T('Tempo lektora', 'Velocidad de la voz') })}
    ${suwakZakres({ id: 'u-cel', min: 10, max: 60, krok: 5, wartosc: u.cel, format: fCel, etykieta: T('Cel dzienny', 'Meta diaria') })}
    ${HISP ? '' : `<div class="cc-blok"><p class="etykieta">Wariant hiszpańskiego</p>
      <div class="seg seg--pelny" role="group" aria-label="Wariant">${[['es', 'Hiszpania'], ['latam', 'Ameryka Łac.'], ['neutral', 'Neutralny']].map(([k, n]) => `<button type="button" data-wariant="${k}" aria-pressed="${u.wariant === k}">${n}</button>`).join('')}</div></div>`}
    <div class="cc-blok"><p class="etykieta">${T('Ocena kart', 'Evaluación de tarjetas')}</p>
      <div class="seg seg--pelny" role="group" aria-label="${T('Skala oceny', 'Escala')}"><button type="button" data-skala="2" aria-pressed="${u.skala !== 4}">${T('Nie wiem · Umiem', 'No lo sé · Lo sé')}</button><button type="button" data-skala="4" aria-pressed="${u.skala === 4}">${T('4 stopnie', '4 niveles')}</button></div></div>
    <div class="cc-blok"><p class="etykieta">${T('Głos lektora', 'Voz')}</p>
      ${m.dostepna ? (glosy.length ? `<div class="szukaj"><select class="pole" id="u-glos" aria-label="${T('Głos', 'Voz')}">${glosy.map(v => `<option value="${esc(v.voiceURI)}"${m.wybrany && v.voiceURI === m.wybrany.voiceURI ? ' selected' : ''}>${esc(m.opisGlosu(v))}</option>`).join('')}</select><button type="button" class="btn btn--male" id="u-test">${T('Posłuchaj', 'Escuchar')}</button></div>
        <p class="male">${T('Nie słychać głosu? Na iPhonie wyłącz tryb cichy (przełącznik z boku telefonu) i podgłośnij.', '¿No se oye la voz? En el iPhone desactiva el modo silencio (interruptor lateral) y sube el volumen.')}</p>
        ${glosy.some(v => m.jakoscGlosu(v) > 0) ? '' : `<p class="male">${T('Najlepiej brzmią głosy Premium. iPhone: Ustawienia → Dostępność → Treść mówiona → Głosy → Hiszpański → Mónica (Premium).', 'Las voces Premium suenan mejor. iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Polaco → Zosia (Premium).')}</p>`}`
        : `<p class="ostrzezenie">${T('Ta przeglądarka nie ma hiszpańskiego głosu. iPhone: Ustawienia → Dostępność → Treść mówiona → Głosy → Hiszpański. Android: Ustawienia → Zamiana tekstu na mowę → hiszpański.', 'Este navegador no tiene voz en polaco. iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Polaco. Android: Ajustes → Síntesis de voz → polaco.')}</p>`)
        : `<p class="ostrzezenie">${T('Ta przeglądarka nie obsługuje syntezy mowy.', 'Este navegador no admite síntesis de voz.')}</p>`}</div>
    <div class="cc-blok"><p class="etykieta">${T('Codzienne przypomnienie', 'Recordatorio diario')}</p>
      <div class="szukaj"><input class="pole" type="time" id="u-godz" value="${esc(u.przyp || '19:00')}" aria-label="${T('Godzina przypomnienia', 'Hora del recordatorio')}"><button type="button" class="btn btn--male" id="u-kal">${T('Dodaj do Kalendarza', 'Añadir al Calendario')}</button></div>
      <p class="male">${T('iPhone będzie codziennie o tej godzinie przypominał o nauce (wydarzenie z alarmem i linkiem do aplikacji).', 'El iPhone te lo recordará cada día a esta hora (evento con alarma y enlace a la app).')}</p>
      ${plakietkaDostepna() ? `<label class="cc-kafel cc-kafel--szeroki"><input type="checkbox" id="u-plak" ${u.plakietka ? 'checked' : ''}><span class="tgl" aria-hidden="true"></span><b>${T('Plakietka na ikonie', 'Globo en el icono')}</b><small>${T('liczba słów do powtórki na ikonie aplikacji', 'número de palabras para repasar en el icono de la app')}</small></label>` : ''}</div>
    <details class="zwin cc-blok"><summary>${T('Styl Liquid Glass', 'Estilo Liquid Glass')}</summary>
      <div class="style-siatka" id="u-style">${window.STYLE.lista.map(s => `<button type="button" data-styl="${s.id}" aria-pressed="${document.documentElement.dataset.styl === s.id}" style="background:radial-gradient(70% 70% at 20% 20%, ${s.plamy[0]}, transparent 70%), radial-gradient(70% 70% at 90% 35%, ${s.plamy[1]}, transparent 70%), radial-gradient(80% 80% at 50% 100%, ${s.plamy[2]}, transparent 70%), ${s.tlo}"><span style="color:${s.tx};background:${s.t === 'd' ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.55)'}">${esc(s.n)}</span></button>`).join('')}</div></details>
    <details class="zwin cc-blok"><summary>${T('Kopia zapasowa i reset', 'Copia de seguridad y reinicio')}</summary>
      <div class="akcje-poziom">
        <button type="button" class="btn" id="u-eksport">${T('Eksportuj do pliku', 'Exportar a un archivo')}</button>
        <label class="btn" for="u-import-plik">${T('Importuj z pliku', 'Importar desde un archivo')}</label><input type="file" id="u-import-plik" accept="application/json,.json" hidden>
        <button type="button" class="btn btn--niebezpieczny" id="u-reset">${T('Wyzeruj postępy', 'Borrar el progreso')}</button>
      </div>
      <div id="u-reset-potw" hidden class="ostrzezenie"><p>${T('<b>Na pewno?</b> Usuniesz wszystkie powtórki, wyniki egzaminów i serię dni. Tego nie da się cofnąć (chyba że masz eksport).', '<b>¿Seguro?</b> Se borrarán todos los repasos, resultados de exámenes y la racha. No se puede deshacer (salvo que tengas una copia).')}</p>
        <div class="akcje-poziom"><button type="button" class="btn btn--niebezpieczny" id="u-reset-tak">${T('Tak, wyzeruj', 'Sí, borrar')}</button><button type="button" class="btn" id="u-reset-nie">${T('Anuluj', 'Cancelar')}</button></div></div></details>
    <p class="male srodek">${T('Postęp zapisuje się tylko na tym urządzeniu. Skróty: spacja, 1–4, Enter, ← →, ? (pomoc).', 'El progreso se guarda solo en este dispositivo. Atajos: espacio, 1–4, Enter, ← →, ? (ayuda).')}</p>
  </div>`);
  podlaczZakres($('#u-tempo', tresc), fTempo, (v, koniec) => { u.tempo = v; app.zapisz(); if (koniec) app.mowa.powiedz(T('Esta es la velocidad de lectura.', 'Tak brzmi to tempo czytania.')); });
  podlaczZakres($('#u-cel', tresc), fCel, v => { u.cel = v; app.zapisz(); rysujNaglowek(); });
  tresc.addEventListener('change', e => {
    if (e.target.id === 'u-vosotros') { u.bezVosotros = e.target.checked; app.zapisz(); odswiezModuly(); }
    if (e.target.id === 'u-auto') { u.auto = e.target.checked; app.zapisz(); }
    if (e.target.id === 'u-godz' && e.target.value) { u.przyp = e.target.value; app.zapisz(); }
    if (e.target.id === 'u-plak') {
      const pole = e.target;
      if (!pole.checked) { u.plakietka = false; app.zapisz(); ustawPlakietke(0); return; }
      wlaczPlakietke().then(w => {
        if (w === 'ok') { u.plakietka = true; app.zapisz(); rysujNaglowek(); toast(T('Plakietka włączona.', 'Globo activado.')); }
        else { pole.checked = false; toast(w === 'odmowa' ? T('Bez zgody na powiadomienia plakietka nie zadziała.', 'Sin permiso de notificaciones el globo no funciona.') : T('Plakietka działa po dodaniu aplikacji do ekranu głównego.', 'El globo funciona al añadir la app a la pantalla de inicio.')); }
      });
    }
    if (e.target.id === 'u-glos') { u.glos = e.target.value; app.zapisz(); app.mowa.odswiez(); app.mowa.powiedz(T('Hola, ¿qué tal? Vamos a practicar.', 'Cześć! Poćwiczymy trochę polski?')); }
    if (e.target.id === 'u-import-plik' && e.target.files[0]) {
      e.target.files[0].text().then(t => {
        const nowy = importuj(t);
        Object.keys(stan).forEach(k => delete stan[k]); Object.assign(stan, nowy);
        zapiszStan(stan); toast(T('Zaimportowano postępy.', 'Progreso importado.')); zamknijModal(); location.reload();
      }).catch(err => toast(T('Nie udało się zaimportować: ', 'No se pudo importar: ') + err.message));
    }
  }, sygnal);
  tresc.addEventListener('click', e => {
    const t = e.target;
    const jz = t.closest('[data-jezyk]');
    if (jz) { if ((jz.dataset.jezyk === 'es') !== HISP) { zapiszStan(stan); ustawJezyk(jz.dataset.jezyk); } return; }
    const w = t.closest('[data-wariant]');
    if (w) {
      u.wariant = w.dataset.wariant;
      if (u.wariant === 'latam') u.bezVosotros = true;
      app.zapisz(); app.mowa.odswiez(); modalUstawien(); odswiezModuly();
      toast(u.wariant === 'latam' ? 'Wariant: Ameryka Łacińska (vosotros ukryte).' : u.wariant === 'es' ? 'Wariant: Hiszpania.' : 'Wariant neutralny.');
      return;
    }
    if (t.closest('#u-test')) { app.mowa.powiedz(HISP ? 'Dzień dobry! Ćwiczymy razem język polski?' : 'Hola, me llamo Mónica. ¿Practicamos un poco de español?'); return; }
    const sk = t.closest('[data-skala]'); if (sk) { u.skala = +sk.dataset.skala; app.zapisz(); $$('[data-skala]', tresc).forEach(b => b.setAttribute('aria-pressed', b === sk)); odswiezModuly(); return; }
    const st = t.closest('button[data-styl]'); if (st) { u.styl = window.STYLE.zastosuj(st.dataset.styl).id; app.zapisz(); $$('button[data-styl]', tresc).forEach(b => b.setAttribute('aria-pressed', b === st)); return; }
    if (t.closest('#u-eksport')) {
      const blob = new Blob([eksportuj(stan)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = HISP ? `polaco-progreso-${dzien()}.json` : `espanol-postepy-${dzien()}.json`;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast(HISP ? 'Archivo de progreso guardado.' : 'Zapisano plik z postępami.'); return;
    }
    if (t.closest('#u-kal')) {
      const godz = $('#u-godz', tresc).value || u.przyp || '19:00';
      u.przyp = godz; app.zapisz();
      const url = location.href.split('#')[0].split('?')[0];
      pobierzIcs(plikIcs({ godzina: godz, url,
        tytul: T(`Hiszpański: ${u.cel} pozycji na dziś`, `Polaco: ${u.cel} tarjetas para hoy`),
        opis: T('Codzienna nauka – utrzymaj serię dni.', 'Práctica diaria: mantén tu racha.') }), T('nauka-hiszpanskiego.ics', 'aprender-polaco.ics'));
      toast(T('Otwórz pobrany plik i stuknij „Dodaj wszystko”.', 'Abre el archivo descargado y toca «Añadir todo».'));
      return;
    }
    if (t.closest('#u-reset')) { $('#u-reset-potw', tresc).hidden = false; return; }
    if (t.closest('#u-reset-nie')) { $('#u-reset-potw', tresc).hidden = true; return; }
    if (t.closest('#u-reset-tak')) {
      const ust = { ...stan.ust }, nowy = nowyStanAplikacji();
      Object.keys(stan).forEach(k => delete stan[k]); Object.assign(stan, nowy, { ust });
      zapiszStan(stan); zamknijModal(); toast(HISP ? 'Progreso borrado.' : 'Postępy wyzerowane.'); setTimeout(() => location.reload(), 600);
    }
  }, sygnal);
}
function odswiezModuly() { zainicjowane.clear(); zainicjowane.add(stan.ui.zakladka); moduly[stan.ui.zakladka].poziom(); }

// --- tryb skupienia: sama karta, bez kapsuły i docka ---
function skupienie(wl) {
  document.body.classList.toggle('skupienie', wl);
  let b = $('#skupienie-wyjdz');
  if (wl && !b) {
    document.body.insertAdjacentHTML('beforeend', `<button type="button" class="skupienie-wyjdz szklo" id="skupienie-wyjdz" data-skupienie>${T('Zakończ skupienie', 'Salir del modo concentración')} ✕</button>`);
  } else if (!wl && b) b.remove();
  if (wl) toast(T('Tryb skupienia. Esc albo przycisk u góry, żeby wyjść.', 'Modo concentración. Esc o el botón de arriba para salir.'));
}

// --- zdarzenia globalne ---
document.addEventListener('click', e => {
  const t = e.target;
  const mow = t.closest('[data-mow]'); if (mow) { if (!app.mowa.powiedz(mow.dataset.mow)) toast(T('Brak hiszpańskiego głosu w tej przeglądarce (szczegóły w Ustawieniach).', 'No hay voz en polaco en este navegador (más información en Ajustes).')); return; }
  const ul = t.closest('[data-ulub]');
  if (ul) {
    const id = ul.dataset.ulub;
    if (stan.ulub[id]) delete stan.ulub[id]; else stan.ulub[id] = 1;
    app.zapisz();
    $$(`[data-ulub="${CSS.escape(id)}"]`).forEach(b => { b.classList.toggle('on', !!stan.ulub[id]); b.setAttribute('aria-pressed', !!stan.ulub[id]); });
    toast(stan.ulub[id] ? T('Dodano do ulubionych ★', 'Añadido a favoritos ★') : T('Usunięto z ulubionych', 'Quitado de favoritos'));
    return;
  }
  if (t.closest('[data-zamknij]')) return zamknijModal();
  if (t.closest('[data-skupienie]')) return skupienie(!document.body.classList.contains('skupienie'));
  const cel = t.closest('[data-cel]');
  if (cel) { stan.ust.cel = +cel.dataset.cel; app.zapisz(); $$('[data-cel]').forEach(b => b.setAttribute('aria-pressed', b === cel)); rysujNaglowek(); return; }
});
$('#poziomy').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b && b.dataset.p !== stan.ui.poziom) zmienPoziom(b.dataset.p); });
$('#zakladki').addEventListener('click', e => { const b = e.target.closest('[data-z]'); if (b) pokazZakladke(b.dataset.z); });
$('#poziom-info').addEventListener('click', modalStatystyk);
$('#dzis').addEventListener('click', modalDnia);
$('#ustawienia-btn').addEventListener('click', modalUstawien);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOtwarty()) { zamknijModal(); return; }
  if (e.key === 'Escape' && document.body.classList.contains('skupienie')) { skupienie(false); return; }
  if (modalOtwarty() || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t.matches && t.matches('input, select, textarea, [contenteditable]')) return;
  if (t.matches && t.matches('button, summary, a') && (e.key === ' ' || e.key === 'Enter') && !t.closest('[data-obszar], .opcje, .egz, #c-drill, #z-tresc')) return;
  const m = moduly[stan.ui.zakladka];
  if (m.klawisz && m.klawisz(e)) { e.preventDefault(); return; }
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const i = ZAKLADKI.indexOf(stan.ui.zakladka) + (e.key === 'ArrowRight' ? 1 : -1);
    pokazZakladke(ZAKLADKI[(i + ZAKLADKI.length) % ZAKLADKI.length]); e.preventDefault(); return;
  }
  if (e.key === '?') {
    otworzModal(T('Skróty klawiszowe', 'Atajos de teclado'), T(`<ul class="skroty">
      <li><kbd>spacja</kbd> odkryj fiszkę / odsłuchaj wymowę</li><li><kbd>1</kbd>–<kbd>4</kbd> ocena karty albo wybór odpowiedzi</li>
      <li><kbd>Enter</kbd> zatwierdź / dalej / zacznij</li><li><kbd>←</kbd> <kbd>→</kbd> poprzednia / następna zakładka (w egzaminie ← to poprzednie pytanie)</li>
      <li><kbd>Esc</kbd> zamknij okno</li></ul>`, `<ul class="skroty">
      <li><kbd>espacio</kbd> girar la tarjeta / escuchar</li><li><kbd>1</kbd>–<kbd>4</kbd> evaluar la tarjeta o elegir respuesta</li>
      <li><kbd>Enter</kbd> confirmar / siguiente / empezar</li><li><kbd>←</kbd> <kbd>→</kbd> sección anterior / siguiente (en el examen ← es la pregunta anterior)</li>
      <li><kbd>Esc</kbd> cerrar la ventana</li></ul>`));
  }
});

// --- start ---
if (HISP) {
  // statyczne napisy z index.html po hiszpańsku
  document.title = 'Polaco JKF';
  const napisy = { slowka: 'Palabras', zwroty: 'Frases', czasowniki: 'Verbos', tlumacz: 'Traductor' };
  $$('#zakladki [data-z]').forEach(b => { $('span', b).textContent = napisy[b.dataset.z]; });
  const akcje = { opcje: 'Opciones', lista: 'Diccionario', cwiczenia: 'Práctica' };
  $$('#wyspa [data-wa]').forEach(b => { $('span', b).textContent = akcje[b.dataset.wa]; });
  $('#ustawienia-btn span').textContent = 'Ajustes';
  $('#zakladki').setAttribute('aria-label', 'Secciones');
  $('#poziomy').setAttribute('aria-label', 'Nivel');
  $('.pomin').textContent = 'Ir al contenido';
  $('#modal-zamknij').setAttribute('aria-label', 'Cerrar');
  $('#znaki').setAttribute('aria-label', 'Letras polacas');
  [['#z-cwiczenia', 'Práctica'], ['#z-slowka', 'Palabras'], ['#z-egzamin', 'Examen'], ['#z-czasowniki', 'Verbos'], ['#z-zwroty', 'Frases'], ['#z-tlumacz', 'Traductor']].forEach(([s, n]) => $(s).setAttribute('aria-label', n));
}
zainicjujZnaki();
zainicjujPolysk();
stan.hist[dzien()] = liczOpanowane(stan.srs);
rysujNaglowek(); rysujPoziomy(); rysujInfo();
pokazZakladke(stan.ui.zakladka);
app.mowa.naZmiane(() => {});
zainicjujSuwaki();
zainicjujArkusz();
wyspa = zainicjujWyspe({
  sekcja: () => stan.ui.zakladka,
  akcja: akcjaWyspy,
  maAkcje: k => k === 'cwiczenia' || (k === 'lista' ? !!LISTY[stan.ui.zakladka] : !['egzamin', 'cwiczenia'].includes(stan.ui.zakladka)),
});
requestAnimationFrame(() => document.body.classList.add('gotowe'));
// aplikacja na ekranie głównym i praca offline
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
