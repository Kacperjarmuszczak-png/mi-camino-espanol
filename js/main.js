// Punkt startowy: stan, poziomy A1–C2 z postępem, zakładki, nagłówek z aktywnością, statystyki, ustawienia, skróty.
import { wczytaj, zapisz as zapiszStan, dodajAktywnosc, seria, dzien, eksportuj, importuj, nowyStanAplikacji } from './stan.js';
import { ocen, postep, status, doPowtorki } from './srs.js';
import { utworzMowe } from './mowa.js';
import { POZIOMY, OPIS_POZIOMU, SLOWKA, CZAS, ZWROTY_LISTA, POD_ID, tematy } from './dane/index.js';
import { $, $$, esc, IKONY, otworzModal, zamknijModal, modalOtwarty, toast, zainicjujZnaki, zainicjujPolysk, zainicjujArkusz, arkuszZElementem, suwakZakres, podlaczZakres } from './ui/wspolne.js';
import { zakladkaSlowka } from './ui/slowka.js';
import { zakladkaEgzamin } from './ui/egzamin.js';
import { zakladkaCzasowniki } from './ui/czasowniki.js';
import { zakladkaZwroty } from './ui/zwroty.js';
import { zakladkaTlumacz } from './ui/tlumacz.js';
import { zainicjujSuwaki } from './ui/suwak.js';
import { zainicjujWyspe } from './ui/wyspa.js';

const stan = wczytaj();
const ZAKLADKI = ['slowka', 'egzamin', 'czasowniki', 'zwroty', 'tlumacz'];
if (!POZIOMY.includes(stan.ui.poziom)) stan.ui.poziom = 'A1';
if (!ZAKLADKI.includes(stan.ui.zakladka)) stan.ui.zakladka = 'slowka';

let czasZapisu, wyspa = null;
const app = {
  stan,
  dane: POD_ID,
  mowa: utworzMowe(stan.ust),
  zapisz() { clearTimeout(czasZapisu); czasZapisu = setTimeout(() => { if (!zapiszStan(stan)) toast('Nie udało się zapisać postępu (pamięć przeglądarki jest niedostępna).'); }, 150); },
  ocen(id, ocena, { bezAktywnosci = false } = {}) {
    stan.srs[id] = ocen(stan.srs[id], ocena);
    if (!bezAktywnosci) dodajAktywnosc(stan, 1);
    app.zapisz(); rysujNaglowek(); rysujPoziomy();
    return stan.srs[id];
  },
  dodajAktywnosc(n) { if (n > 0) { dodajAktywnosc(stan, n); app.zapisz(); rysujNaglowek(); } },
  odswiez() { rysujNaglowek(); rysujPoziomy(); rysujInfo(); Object.values(moduly).forEach(m => m.odswiezListe && m.odswiezListe()); },
};
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
    return `<button type="button" class="poziom" data-p="${p}" aria-pressed="${p === stan.ui.poziom}" aria-label="Poziom ${p}: ${s.procent}% postępu">
      <b>${p}${stan.egz[p] >= 70 ? '<i class="zdany" title="Egzamin zdany">✓</i>' : ''}</b><small>${s.procent}%</small></button>`;
  }).join('');
}
function rysujInfo() {
  const p = stan.ui.poziom, s = statystyki(p), o = OPIS_POZIOMU[p];
  const [so, sr] = czesc(SLOWKA, p);
  $('#poziom-info').innerHTML = `<span><b>${p}</b> · ${esc(o.n)}</span><span class="linia-liczby">${so}/${sr} słówek${s.powtorka ? ` · <b class="akcent">${s.powtorka} do powtórki</b>` : ''}${s.egz != null ? ` · egzamin ${s.egz}%` : ''}</span><span class="linia-i" aria-hidden="true">ⓘ</span>`;
}
function modalStatystyk() {
  const p = stan.ui.poziom, s = statystyki(p);
  const tem = tematy(SLOWKA, p).map(t => {
    const el = SLOWKA.filter(w => w.p === p && w.t === t);
    const v = Math.round(100 * el.reduce((a, w) => a + postep(stan.srs[w.id]), 0) / el.length);
    return `<div class="typ"><span>${esc(t)}</span><div class="postep"><i style="width:${v}%"></i></div><small>${v}%</small></div>`;
  }).join('');
  otworzModal(`Poziom ${p} – statystyki`, `
    <p><b>${esc(OPIS_POZIOMU[p].n)}.</b> ${esc(OPIS_POZIOMU[p].o)}</p>
    <div class="liczby">
      <div><b>${s.procent}%</b><span>postęp poziomu</span></div><div><b>${s.opanowane}</b><span>opanowane</span></div>
      <div><b>${s.utrwalane}</b><span>utrwalane</span></div><div><b>${s.nauka}</b><span>w nauce</span></div>
      <div><b>${s.nowe}</b><span>jeszcze nowe</span></div><div><b>${s.powtorka}</b><span>do powtórki dziś</span></div>
    </div>
    <p class="male">Postęp = opanowanie słówek, czasowników i zwrotów z tego poziomu (85%) + najlepszy wynik egzaminu (15%). Element jest opanowany, gdy następna powtórka wypada za co najmniej 7 dni.</p>
    <p class="etykieta">Tematy słówek</p><div class="typy">${tem}</div>`);
}

// --- nagłówek: dzisiejszy cel i seria ---
function rysujNaglowek() {
  const ile = stan.dni[dzien()] || 0, cel = stan.ust.cel, sr = seria(stan);
  $('#dzis-ile').textContent = ile; $('#dzis-cel').textContent = '/' + cel;
  const obw = 2 * Math.PI * 15;
  $('#dzis-luk').style.strokeDasharray = `${obw * Math.min(1, ile / cel)} ${obw}`;
  $('#dzis').classList.toggle('cel-osiagniety', ile >= cel);
  $('#seria').innerHTML = `${IKONY.ogien}<b>${sr}</b>`;
  $('#dzis').setAttribute('aria-label', `Dziś ${ile} z ${cel} pozycji, seria ${sr} dni`);
  $('#wyspa-luk').style.strokeDasharray = `${obw * Math.min(1, ile / cel)} ${obw}`;
  $('#wyspa').classList.toggle('cel-osiagniety', ile >= cel);
  $('#wyspa-poziom').textContent = stan.ui.poziom;
  $('#wyspa-btn').setAttribute('aria-label', `Poziom ${stan.ui.poziom}, dziś ${ile} z ${cel}. Rozwiń, aby zobaczyć statystyki i opcje`);
}
function modalDnia() {
  const dni = [];
  for (let i = 13; i >= 0; i--) { const t = Date.now() - i * 864e5; dni.push([dzien(t), stan.dni[dzien(t)] || 0, new Date(t)]); }
  const max = Math.max(stan.ust.cel, ...dni.map(d => d[1]));
  otworzModal('Twoja aktywność', `
    <div class="liczby"><div><b>${stan.dni[dzien()] || 0}</b><span>dziś</span></div><div><b>${seria(stan)}</b><span>dni serii</span></div><div><b>${Object.values(stan.dni).reduce((a, b) => a + b, 0)}</b><span>łącznie</span></div></div>
    <div class="slupki slupki--dni">${dni.map(([k, n, d]) => `<div class="slupek${n >= stan.ust.cel ? ' cel' : ''}" title="${k}: ${n}"><span style="height:${Math.max(3, 100 * n / max)}%"></span><small>${'ndwścpsn'[d.getDay()] || ''}${d.getDate()}</small></div>`).join('')}</div>
    <p class="male">Seria rośnie każdego dnia, w którym osiągniesz cel dzienny. Licznik obejmuje każdą ocenioną kartę, odpowiedź w drillu, ćwiczeniu i egzaminie.</p>
    <p class="etykieta">Cel dzienny</p>
    <div class="seg" role="group" aria-label="Cel dzienny">${[10, 20, 30, 50].map(n => `<button type="button" data-cel="${n}" aria-pressed="${stan.ust.cel === n}">${n}</button>`).join('')}</div>`);
}

// --- zakładki z przesuwaną szklaną kapsułą ---
const moduly = {
  slowka: zakladkaSlowka($('#z-slowka'), app),
  egzamin: zakladkaEgzamin($('#z-egzamin'), app),
  czasowniki: zakladkaCzasowniki($('#z-czasowniki'), app),
  zwroty: zakladkaZwroty($('#z-zwroty'), app),
  tlumacz: zakladkaTlumacz($('#z-tlumacz'), app),
};
app.otworzCzasownik = inf => {
  stan.ui.cWidok = 'tabela';
  zainicjowane.add('czasowniki');
  pokazZakladke('czasowniki', { przewin: true });
  moduly.czasowniki.poziom();
  moduly.czasowniki.pokaz(inf);
};
const zainicjowane = new Set();
function pokazZakladke(z, { przewin = false } = {}) {
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
const LISTY = { slowka: ['#s-lista', 'Słowniczek – słówka'], zwroty: ['#z-lista', 'Słowniczek – zwroty'], czasowniki: ['#c-lista', 'Słowniczek – czasowniki'] };
function opcjeSekcji() {
  const z = stan.ui.zakladka;
  const klik = sel => { const b = $(sel); if (b) b.click(); };
  if (z === 'slowka') klik('#slowka-opcje');
  else if (z === 'zwroty') { if ((stan.ui.zWidok || 'przeglad') === 'fiszki' && $('#zwroty-opcje')) klik('#zwroty-opcje'); else klik('#z-kat-kapsula'); }
  else if (z === 'czasowniki') { if ((stan.ui.cWidok || 'tabela') === 'drill' && $('#d-opcje')) klik('#d-opcje'); else klik('#c-grupa-kapsula'); }
  else if (z === 'tlumacz') arkuszZElementem('Opcje tłumacza', $('#t-opcje'));
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
  const fCel = v => `${v} dziennie`;
  const tresc = otworzModal('Szybkie ustawienia', `<div class="cc">
    <div class="cc-kafle">
      <label class="cc-kafel"><input type="checkbox" id="u-auto" ${u.auto ? 'checked' : ''}><span class="tgl" aria-hidden="true"></span><b>Auto-wymowa</b><small>nowa karta i odpowiedź</small></label>
      <label class="cc-kafel"><input type="checkbox" id="u-vosotros" ${u.bezVosotros ? 'checked' : ''}><span class="tgl" aria-hidden="true"></span><b>Bez „vosotros”</b><small>odmiana jak w Ameryce</small></label>
    </div>
    ${suwakZakres({ id: 'u-tempo', min: 0.6, max: 1.4, krok: 0.05, wartosc: u.tempo || 1, format: fTempo, etykieta: 'Tempo lektora' })}
    ${suwakZakres({ id: 'u-cel', min: 10, max: 60, krok: 5, wartosc: u.cel, format: fCel, etykieta: 'Cel dzienny' })}
    <div class="cc-blok"><p class="etykieta">Wariant hiszpańskiego</p>
      <div class="seg seg--pelny" role="group" aria-label="Wariant">${[['es', 'Hiszpania'], ['latam', 'Ameryka Łac.'], ['neutral', 'Neutralny']].map(([k, n]) => `<button type="button" data-wariant="${k}" aria-pressed="${u.wariant === k}">${n}</button>`).join('')}</div></div>
    <div class="cc-blok"><p class="etykieta">Ocena kart</p>
      <div class="seg seg--pelny" role="group" aria-label="Skala oceny"><button type="button" data-skala="2" aria-pressed="${u.skala !== 4}">Nie wiem · Umiem</button><button type="button" data-skala="4" aria-pressed="${u.skala === 4}">4 stopnie</button></div></div>
    <div class="cc-blok"><p class="etykieta">Głos lektora</p>
      ${m.dostepna ? (glosy.length ? `<div class="szukaj"><select class="pole" id="u-glos" aria-label="Głos">${glosy.map(v => `<option value="${esc(v.voiceURI)}"${m.wybrany && v.voiceURI === m.wybrany.voiceURI ? ' selected' : ''}>${esc(m.opisGlosu(v))}</option>`).join('')}</select><button type="button" class="btn btn--male" id="u-test">Posłuchaj</button></div>
        ${glosy.some(v => m.jakoscGlosu(v) > 0) ? '' : '<p class="male">Najlepiej brzmią głosy Premium. iPhone: Ustawienia → Dostępność → Treść mówiona → Głosy → Hiszpański → Mónica (Premium).</p>'}`
        : '<p class="ostrzezenie">Ta przeglądarka nie ma hiszpańskiego głosu. iPhone: Ustawienia → Dostępność → Treść mówiona → Głosy → Hiszpański. Android: Ustawienia → Zamiana tekstu na mowę → hiszpański.</p>')
        : '<p class="ostrzezenie">Ta przeglądarka nie obsługuje syntezy mowy.</p>'}</div>
    <details class="zwin cc-blok"><summary>Styl Liquid Glass</summary>
      <div class="style-siatka" id="u-style">${window.STYLE.lista.map(s => `<button type="button" data-styl="${s.id}" aria-pressed="${document.documentElement.dataset.styl === s.id}" style="background:radial-gradient(70% 70% at 20% 20%, ${s.plamy[0]}, transparent 70%), radial-gradient(70% 70% at 90% 35%, ${s.plamy[1]}, transparent 70%), radial-gradient(80% 80% at 50% 100%, ${s.plamy[2]}, transparent 70%), ${s.tlo}"><span style="color:${s.tx};background:${s.t === 'd' ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.55)'}">${esc(s.n)}</span></button>`).join('')}</div></details>
    <details class="zwin cc-blok"><summary>Kopia zapasowa i reset</summary>
      <div class="akcje-poziom">
        <button type="button" class="btn" id="u-eksport">Eksportuj do pliku</button>
        <label class="btn" for="u-import-plik">Importuj z pliku</label><input type="file" id="u-import-plik" accept="application/json,.json" hidden>
        <button type="button" class="btn btn--niebezpieczny" id="u-reset">Wyzeruj postępy</button>
      </div>
      <div id="u-reset-potw" hidden class="ostrzezenie"><p><b>Na pewno?</b> Usuniesz wszystkie powtórki, wyniki egzaminów i serię dni. Tego nie da się cofnąć (chyba że masz eksport).</p>
        <div class="akcje-poziom"><button type="button" class="btn btn--niebezpieczny" id="u-reset-tak">Tak, wyzeruj</button><button type="button" class="btn" id="u-reset-nie">Anuluj</button></div></div></details>
    <p class="male srodek">Postęp zapisuje się tylko na tym urządzeniu. Skróty: spacja, 1–4, Enter, ← →, ? (pomoc).</p>
  </div>`);
  podlaczZakres($('#u-tempo', tresc), fTempo, (v, koniec) => { u.tempo = v; app.zapisz(); if (koniec) app.mowa.powiedz('Esta es la velocidad de lectura.'); });
  podlaczZakres($('#u-cel', tresc), fCel, v => { u.cel = v; app.zapisz(); rysujNaglowek(); });
  tresc.addEventListener('change', e => {
    if (e.target.id === 'u-vosotros') { u.bezVosotros = e.target.checked; app.zapisz(); odswiezModuly(); }
    if (e.target.id === 'u-auto') { u.auto = e.target.checked; app.zapisz(); }
    if (e.target.id === 'u-glos') { u.glos = e.target.value; app.zapisz(); app.mowa.odswiez(); app.mowa.powiedz('Hola, ¿qué tal? Vamos a practicar.'); }
    if (e.target.id === 'u-import-plik' && e.target.files[0]) {
      e.target.files[0].text().then(t => {
        const nowy = importuj(t);
        Object.keys(stan).forEach(k => delete stan[k]); Object.assign(stan, nowy);
        zapiszStan(stan); toast('Zaimportowano postępy.'); zamknijModal(); location.reload();
      }).catch(err => toast('Nie udało się zaimportować: ' + err.message));
    }
  }, sygnal);
  tresc.addEventListener('click', e => {
    const t = e.target;
    const w = t.closest('[data-wariant]');
    if (w) {
      u.wariant = w.dataset.wariant;
      if (u.wariant === 'latam') u.bezVosotros = true;
      app.zapisz(); app.mowa.odswiez(); modalUstawien(); odswiezModuly();
      toast(u.wariant === 'latam' ? 'Wariant: Ameryka Łacińska (vosotros ukryte).' : u.wariant === 'es' ? 'Wariant: Hiszpania.' : 'Wariant neutralny.');
      return;
    }
    if (t.closest('#u-test')) { app.mowa.powiedz('Hola, me llamo Mónica. ¿Practicamos un poco de español?'); return; }
    const sk = t.closest('[data-skala]'); if (sk) { u.skala = +sk.dataset.skala; app.zapisz(); $$('[data-skala]', tresc).forEach(b => b.setAttribute('aria-pressed', b === sk)); odswiezModuly(); return; }
    const st = t.closest('button[data-styl]'); if (st) { u.styl = window.STYLE.zastosuj(st.dataset.styl).id; app.zapisz(); $$('button[data-styl]', tresc).forEach(b => b.setAttribute('aria-pressed', b === st)); return; }
    if (t.closest('#u-eksport')) {
      const blob = new Blob([eksportuj(stan)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `espanol-postepy-${dzien()}.json`;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast('Zapisano plik z postępami.'); return;
    }
    if (t.closest('#u-reset')) { $('#u-reset-potw', tresc).hidden = false; return; }
    if (t.closest('#u-reset-nie')) { $('#u-reset-potw', tresc).hidden = true; return; }
    if (t.closest('#u-reset-tak')) {
      const ust = { ...stan.ust }, nowy = nowyStanAplikacji();
      Object.keys(stan).forEach(k => delete stan[k]); Object.assign(stan, nowy, { ust });
      zapiszStan(stan); zamknijModal(); toast('Postępy wyzerowane.'); setTimeout(() => location.reload(), 600);
    }
  }, sygnal);
}
function odswiezModuly() { zainicjowane.clear(); zainicjowane.add(stan.ui.zakladka); moduly[stan.ui.zakladka].poziom(); }

// --- zdarzenia globalne ---
document.addEventListener('click', e => {
  const t = e.target;
  const mow = t.closest('[data-mow]'); if (mow) { if (!app.mowa.powiedz(mow.dataset.mow)) toast('Brak hiszpańskiego głosu w tej przeglądarce (szczegóły w Ustawieniach).'); return; }
  const ul = t.closest('[data-ulub]');
  if (ul) {
    const id = ul.dataset.ulub;
    if (stan.ulub[id]) delete stan.ulub[id]; else stan.ulub[id] = 1;
    app.zapisz();
    $$(`[data-ulub="${CSS.escape(id)}"]`).forEach(b => { b.classList.toggle('on', !!stan.ulub[id]); b.setAttribute('aria-pressed', !!stan.ulub[id]); });
    toast(stan.ulub[id] ? 'Dodano do ulubionych ★' : 'Usunięto z ulubionych');
    return;
  }
  if (t.closest('[data-zamknij]')) return zamknijModal();
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
    otworzModal('Skróty klawiszowe', `<ul class="skroty">
      <li><kbd>spacja</kbd> odkryj fiszkę / odsłuchaj wymowę</li><li><kbd>1</kbd>–<kbd>4</kbd> ocena karty albo wybór odpowiedzi</li>
      <li><kbd>Enter</kbd> zatwierdź / dalej / zacznij</li><li><kbd>←</kbd> <kbd>→</kbd> poprzednia / następna zakładka (w egzaminie ← to poprzednie pytanie)</li>
      <li><kbd>Esc</kbd> zamknij okno</li></ul>`);
  }
});

// --- start ---
zainicjujZnaki();
zainicjujPolysk();
rysujNaglowek(); rysujPoziomy(); rysujInfo();
pokazZakladke(stan.ui.zakladka);
app.mowa.naZmiane(() => {});
zainicjujSuwaki();
zainicjujArkusz();
wyspa = zainicjujWyspe({
  sekcja: () => stan.ui.zakladka,
  akcja: akcjaWyspy,
  maAkcje: k => k === 'egzamin' || (k === 'lista' ? !!LISTY[stan.ui.zakladka] : stan.ui.zakladka !== 'egzamin'),
});
requestAnimationFrame(() => document.body.classList.add('gotowe'));
