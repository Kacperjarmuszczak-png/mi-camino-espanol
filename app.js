// Español JKF: poziomy A1–C2, fiszki, egzamin, odmiana czasowników, zwroty.
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tasuj = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const losowy = a => a[Math.random() * a.length | 0];
  const bezAkc = s => s.normalize('NFD').replace(/[̀-̂̄-ͯ]/g, '').normalize('NFC');   // ñ zostaje
  const czysc = s => s.toLowerCase().replace(/[¿?¡!.,;:"„”]/g, '').replace(/\s+/g, ' ').trim();

  // --- stan (tylko w tej przeglądarce) ---
  const KLUCZ = 'es-nauka';
  let stan = { poziom: 'A1', zakladka: 'slowka', kier: 'es', umiem: {}, egz: {}, seria: 0, najlepsza: 0 };
  try { Object.assign(stan, JSON.parse(localStorage.getItem(KLUCZ) || '{}')); } catch (e) { /* brak dostępu */ }
  const zapisz = () => { try { localStorage.setItem(KLUCZ, JSON.stringify(stan)); } catch (e) { /* brak dostępu */ } };

  // --- dane ---
  const POZIOMY = {
    A1: 'Początkujący: powitania, liczby, rodzina, jedzenie, dom. Czas teraźniejszy.',
    A2: 'Podstawowy: miasto, podróże, zakupy, zdrowie. Czasy przeszłe i przyszły.',
    B1: 'Średnio zaawansowany: praca, relacje, media, wyrażanie opinii. Tryb łączący.',
    B2: 'Wyższy średni: społeczeństwo, gospodarka, nauka, mowa potoczna.',
    C1: 'Zaawansowany: argumentacja, urzędy i prawo, pojęcia abstrakcyjne.',
    C2: 'Biegły: idiomy, język literacki i książkowy, precyzyjne czasowniki.',
  };
  const SLOWA = {};
  for (const [p, tematy] of Object.entries(window.SLOWA)) {
    SLOWA[p] = [];
    for (const [t, lista] of Object.entries(tematy)) for (const w of lista.split(';')) { const [es, pl] = w.split('|'); SLOWA[p].push({ es, pl, t }); }
  }
  const CZASY_POZIOMU = { A1: ['presente'], A2: ['presente', 'perfecto', 'indefinido', 'imperfecto', 'futuro'] };
  const czasyPoziomu = p => (CZASY_POZIOMU[p] || CZASY.map(c => c.k)).map(k => CZASY.find(c => c.k === k));
  const A1_CZAS = new Set('ser estar tener hacer ir venir decir poder querer saber poner salir dar ver hablar trabajar estudiar llamar llegar vivir comer beber leer escribir abrir comprar tomar buscar mirar escuchar necesitar gustar pagar cocinar viajar aprender comprender correr vender creer recibir subir pensar cerrar empezar dormir pedir jugar volver entender preferir levantarse llamarse ducharse acostarse'.split(' '));
  const czasownikiPoziomu = p => p === 'A1' ? CZASOWNIKI.filter(v => A1_CZAS.has(v.inf)) : CZASOWNIKI;
  const odmianaCache = {};
  const odm = v => odmianaCache[v.inf] || (odmianaCache[v.inf] = odmiana(v.inf, v.f));

  // --- wymowa (głos przeglądarki) ---
  const mowa = 'speechSynthesis' in window ? speechSynthesis : null;
  let glos = null;
  const wybierzGlos = () => { if (!mowa) return; const g = mowa.getVoices(); glos = g.find(v => /^es[-_]ES/i.test(v.lang)) || g.find(v => /^es/i.test(v.lang)) || null; };
  if (mowa) { wybierzGlos(); mowa.onvoiceschanged = wybierzGlos; }
  const powiedz = t => { if (!mowa) return; try { mowa.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'es-ES'; u.rate = .9; if (glos) u.voice = glos; mowa.speak(u); } catch (e) { /* brak głosu */ } };
  const IK_GLOS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  const przyciskGlosu = t => mowa ? `<button type="button" class="glos" data-mow="${esc(t)}" aria-label="Posłuchaj: ${esc(t)}">${IK_GLOS}</button>` : '';
  document.addEventListener('click', e => { const b = e.target.closest('[data-mow]'); if (b) powiedz(b.dataset.mow); });

  // --- motyw ---
  $('#motyw').addEventListener('click', () => {
    const ciemny = matchMedia('(prefers-color-scheme: dark)').matches;
    const teraz = document.documentElement.dataset.theme || (ciemny ? 'dark' : 'light');
    stan.motyw = teraz === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = stan.motyw; zapisz();
  });

  // --- poziomy i zakładki ---
  const procent = p => { const s = SLOWA[p]; return Math.round(100 * s.filter(w => stan.umiem[w.es]).length / s.length); };
  function rysujPoziomy() {
    $('#poziomy').innerHTML = Object.keys(POZIOMY).map(p => `<button type="button" data-p="${p}" aria-pressed="${p === stan.poziom}"><b>${p}</b><small>${stan.egz[p] >= 70 ? '✓ zdany' : procent(p) + '%'}</small></button>`).join('');
    $('#opis').textContent = POZIOMY[stan.poziom];
  }
  $('#poziomy').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.dataset.p === stan.poziom) return;
    stan.poziom = b.dataset.p; zapisz(); rysujPoziomy(); fStart(); sRysuj(); eStart(); oPoziom(); cNowe();
  });
  function pokazZakladke(z) {
    stan.zakladka = z; zapisz();
    document.querySelectorAll('#zakladki button').forEach(b => b.setAttribute('aria-selected', b.dataset.z === z));
    document.querySelectorAll('main > section').forEach(s => { s.hidden = s.id !== 'z-' + z; });
  }
  $('#zakladki').addEventListener('click', e => { const b = e.target.closest('button'); if (b) pokazZakladke(b.dataset.z); });

  // --- SŁÓWKA: fiszki ---
  const F = { kolejka: [], temat: '' };
  const fTemat = $('#f-temat'), fiszka = $('#fiszka');
  const fPula = () => SLOWA[stan.poziom].filter(w => !F.temat || w.t === F.temat);
  function fStart() {
    const tematy = [...new Set(SLOWA[stan.poziom].map(w => w.t))];
    if (!tematy.includes(F.temat)) F.temat = '';
    fTemat.innerHTML = `<option value="">Wszystkie tematy</option>` + tematy.map(t => `<option${t === F.temat ? ' selected' : ''}>${esc(t)}</option>`).join('');
    F.kolejka = tasuj(fPula().filter(w => !stan.umiem[w.es]));
    fRysuj();
  }
  function fRysuj() {
    const pula = fPula(), umiem = pula.filter(w => stan.umiem[w.es]).length, w = F.kolejka[0];
    $('#f-pasek').style.width = (100 * umiem / pula.length) + '%';
    $('#f-licznik').textContent = `umiesz ${umiem} z ${pula.length}`;
    fiszka.classList.remove('pokaz');
    $('#f-przyciski').hidden = !w;
    $('#f-glos').hidden = !w || !mowa;
    if (!w) {
      $('#f-podp').textContent = 'Brawo!'; $('#f-slowo').textContent = 'Umiesz wszystkie'; $('#f-odp').textContent = '';
      $('#f-hint').textContent = 'stuknij, żeby zacząć od nowa'; return;
    }
    const es = stan.kier === 'es';
    $('#f-podp').textContent = es ? 'po hiszpańsku' : 'po polsku';
    $('#f-slowo').textContent = es ? w.es : w.pl;
    $('#f-odp').textContent = es ? w.pl : w.es;
    $('#f-hint').textContent = 'stuknij, żeby zobaczyć tłumaczenie';
  }
  fiszka.addEventListener('click', () => {
    if (!F.kolejka.length) { fPula().forEach(w => delete stan.umiem[w.es]); zapisz(); rysujPoziomy(); fStart(); sRysuj(); return; }
    fiszka.classList.add('pokaz');
    if (stan.kier === 'pl') powiedz(F.kolejka[0].es);
  });
  $('#f-glos').innerHTML = IK_GLOS;
  $('#f-glos').addEventListener('click', () => F.kolejka[0] && powiedz(F.kolejka[0].es));
  $('#f-tak').addEventListener('click', () => { const w = F.kolejka.shift(); if (!w) return; stan.umiem[w.es] = 1; zapisz(); rysujPoziomy(); fRysuj(); sRysuj(); });
  $('#f-nie').addEventListener('click', () => { const w = F.kolejka.shift(); if (!w) return; F.kolejka.splice(Math.min(F.kolejka.length, 3 + (Math.random() * 5 | 0)), 0, w); fRysuj(); });
  fTemat.addEventListener('change', () => { F.temat = fTemat.value; F.kolejka = tasuj(fPula().filter(w => !stan.umiem[w.es])); fRysuj(); sRysuj(); });
  const fKier = $('#f-kier');
  const fKierRysuj = () => fKier.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === stan.kier));
  fKier.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; stan.kier = b.dataset.k; zapisz(); fKierRysuj(); fRysuj(); });

  // --- SŁÓWKA: lista ---
  const sSzukaj = $('#s-szukaj');
  function sRysuj() {
    const q = bezAkc(czysc(sSzukaj.value));
    const lista = fPula().filter(w => !q || bezAkc(czysc(w.es)).includes(q) || bezAkc(czysc(w.pl)).includes(q));
    $('#s-lista').innerHTML = lista.map(w => `<li${stan.umiem[w.es] ? ' class="umiem"' : ''}><div><b>${esc(w.es)}</b><span>${esc(w.pl)}</span></div>${przyciskGlosu(w.es)}</li>`).join('') || '<li><div><span>Nic nie znaleziono.</span></div></li>';
  }
  sSzukaj.addEventListener('input', sRysuj);

  // --- EGZAMIN ---
  const E = {}, eBox = $('#e-tresc');
  const ILE = 20;
  function pytanieSlowo(p) {
    const s = SLOWA[p], w = losowy(s), doPl = Math.random() < .5;
    const odp = doPl ? w.pl : w.es, klucz = doPl ? 'pl' : 'es';
    const inne = tasuj(s.filter(x => x.es !== w.es && x.pl !== w.pl && x[klucz] !== odp)).map(x => x[klucz]);
    const opcje = [...new Set(inne)].slice(0, 3);
    return { tytul: doPl ? 'Co to znaczy?' : 'Jak to powiedzieć po hiszpańsku?', tekst: doPl ? w.es : w.pl, odp, opcje: tasuj([odp, ...opcje]), mow: w.es };
  }
  function pytanieCzasownik(p) {
    const v = losowy(czasownikiPoziomu(p)), czasy = czasyPoziomu(p), c = losowy(czasy), o = Math.random() * 6 | 0;
    const formy = odm(v), odp = formy[c.k][o];
    const pule = [];
    czasy.forEach(cz => formy[cz.k].forEach(f => { if (f !== odp) pule.push(f); }));
    return { tytul: `${c.n} · ${OSOBY[o][0]}`, tekst: `${v.inf} (${v.pl.split(',')[0]})`, odp, opcje: tasuj([odp, ...tasuj([...new Set(pule)]).slice(0, 3)]), mow: odp };
  }
  function eStart() {
    const p = stan.poziom, best = stan.egz[p];
    eBox.innerHTML = `<div class="start"><p class="etykieta">Egzamin ${p}</p><h2>${ILE} pytań</h2>
      <p>Słówka z poziomu ${p} i formy czasowników. Zdajesz od 70%.</p>
      ${best != null ? `<p>Najlepszy wynik: <b class="${best >= 70 ? 'zdany' : 'niezdany'}">${best}%</b></p>` : ''}
      <button type="button" class="btn btn--zloty" id="e-start">Zacznij egzamin</button></div>`;
  }
  function eNowy() {
    const p = stan.poziom, czas = p <= 'B1' ? 6 : 4;
    E.pyt = tasuj([...Array.from({ length: ILE - czas }, () => pytanieSlowo(p)), ...Array.from({ length: czas }, () => pytanieCzasownik(p))]);
    E.nr = 0; E.dobrze = 0; E.bledy = []; ePytanie();
  }
  function ePytanie() {
    const q = E.pyt[E.nr];
    eBox.innerHTML = `<p class="male">Pytanie ${E.nr + 1} z ${E.pyt.length} · dobrze ${E.dobrze}</p>
      <div class="pasek"><i style="width:${100 * E.nr / E.pyt.length}%"></i></div>
      <p class="pytanie"><small>${esc(q.tytul)}</small>${esc(q.tekst)}</p>
      <div class="opcje">${q.opcje.map(o => `<button type="button">${esc(o)}</button>`).join('')}</div>`;
  }
  eBox.addEventListener('click', e => {
    if (e.target.closest('#e-start') || e.target.closest('#e-znowu')) return eNowy();
    if (e.target.closest('#e-wroc')) return eStart();
    const b = e.target.closest('.opcje button'); if (!b || b.disabled) return;
    const q = E.pyt[E.nr], dobrze = b.textContent === q.odp;
    eBox.querySelectorAll('.opcje button').forEach(x => { x.disabled = true; if (x.textContent === q.odp) x.classList.add('ok'); });
    if (dobrze) E.dobrze++; else { b.classList.add('zle'); E.bledy.push(q); }
    powiedz(q.mow);
    setTimeout(() => { E.nr++; E.nr < E.pyt.length ? ePytanie() : eKoniec(); }, dobrze ? 700 : 1600);
  });
  function eKoniec() {
    const p = stan.poziom, wynik = Math.round(100 * E.dobrze / E.pyt.length), zdany = wynik >= 70;
    stan.egz[p] = Math.max(stan.egz[p] || 0, wynik); zapisz(); rysujPoziomy();
    eBox.innerHTML = `<div class="start"><p class="etykieta">Egzamin ${p}</p><div class="wynik">${wynik}%</div>
      <p class="${zdany ? 'zdany' : 'niezdany'}">${zdany ? 'Zdany! Możesz iść dalej.' : 'Jeszcze nie. Powtórz słówka i spróbuj znowu.'}</p>
      <p>${E.dobrze} z ${E.pyt.length} dobrze</p>
      ${E.bledy.length ? `<ul class="lista bledy">${E.bledy.map(q => `<li><div><b>${esc(q.tekst)}</b><span>poprawnie: ${esc(q.odp)}</span></div></li>`).join('')}</ul>` : ''}
      <button type="button" class="btn btn--zloty" id="e-znowu">Jeszcze raz</button></div>`;
  }

  // --- CZASOWNIKI ---
  const O = { v: null, czas: 'presente' };
  const poInf = {}; CZASOWNIKI.forEach(v => { poInf[v.inf] = v; });
  $('#o-lista').innerHTML = CZASOWNIKI.map(v => `<option value="${esc(v.inf)}">${esc(v.pl)}</option>`).join('');
  const czasyBox = $('#o-czasy'), oSzukaj = $('#o-szukaj');
  function oPoziom() {
    const czasy = czasyPoziomu(stan.poziom);
    if (!czasy.some(c => c.k === O.czas)) O.czas = 'presente';
    czasyBox.innerHTML = czasy.map(c => `<button type="button" role="tab" data-c="${c.k}">${esc(c.n)}</button>`).join('');
    if (!O.v) O.v = poInf.tener;
    oRysuj();
  }
  function oRysuj() {
    const v = O.v, f = odm(v), c = CZASY.find(x => x.k === O.czas);
    czasyBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.c === O.czas));
    $('#o-bezok').textContent = v.inf;
    $('#o-info').innerHTML = `${esc(v.pl)}${v.f.startsWith('=') ? ' · nieregularny' : ''}<br>gerundio: <b>${esc(f.ger)}</b> · participio: <b>${esc(f.part)}</b>`;
    $('#o-opis').textContent = `${c.n} (${c.pl}). ${c.o}`;
    $('#o-tabela').innerHTML = f[O.czas].map((x, i) => `<tr><td>${esc(OSOBY[i][0])}<small>${esc(OSOBY[i][1])}</small></td><td>${esc(x)}</td><td>${przyciskGlosu(x)}</td></tr>`).join('');
  }
  czasyBox.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; O.czas = b.dataset.c; oRysuj(); });
  function oSzukajTeraz() {
    const q = czysc(oSzukaj.value); if (!q) return;
    const v = poInf[q] || CZASOWNIKI.find(x => bezAkc(x.inf) === bezAkc(q)) || CZASOWNIKI.find(x => x.pl.split(/[,(]/).some(p => czysc(p) === q)) || CZASOWNIKI.find(x => bezAkc(czysc(x.pl)).includes(bezAkc(q)));
    if (v) { O.v = v; oRysuj(); oSzukaj.blur(); }
  }
  oSzukaj.addEventListener('change', oSzukajTeraz);
  oSzukaj.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); oSzukajTeraz(); } });
  $('#o-losuj').addEventListener('click', () => { O.v = losowy(czasownikiPoziomu(stan.poziom)); oSzukaj.value = ''; oRysuj(); });

  // ćwiczenie
  const C = {}, cWpis = $('#c-wpis'), cKom = $('#c-komunikat');
  const cSeria = () => { $('#c-seria').textContent = stan.seria; $('#c-najlepsza').textContent = stan.najlepsza; };
  function cNowe() {
    const v = losowy(czasownikiPoziomu(stan.poziom)), c = losowy(czasyPoziomu(stan.poziom)), o = Math.random() * 6 | 0;
    Object.assign(C, { v, c, o, odp: odm(v)[c.k][o], gotowe: false });
    $('#c-zadanie').innerHTML = `<b>${esc(v.inf)}</b> (${esc(v.pl.split(',')[0])})<br>${esc(c.n)} · ${esc(OSOBY[o][0])} (${esc(OSOBY[o][1])})`;
    cWpis.value = ''; cWpis.className = ''; cKom.textContent = ''; cKom.className = 'komunikat';
    $('#c-sprawdz').textContent = 'Sprawdź';
  }
  $('#c-form').addEventListener('submit', e => {
    e.preventDefault();
    if (C.gotowe) { cNowe(); cWpis.focus(); return; }
    const zaimek = /^(yo|tú|tu|él|el|ella|usted|nosotros|nosotras|vosotros|vosotras|ellos|ellas|ustedes)\s+/;
    const wpis = czysc(cWpis.value).replace(zaimek, '');
    if (!wpis) { cWpis.focus(); return; }
    const odp = czysc(C.odp);
    if (wpis === odp) { cWpis.className = 'ok'; cKom.className = 'komunikat ok'; cKom.textContent = `¡Correcto! ${C.odp}`; stan.seria++; }
    else if (bezAkc(wpis) === bezAkc(odp)) { cWpis.className = 'ok'; cKom.className = 'komunikat uwaga'; cKom.textContent = `Prawie: pisze się „${C.odp}”, z akcentem.`; stan.seria++; }
    else { cWpis.className = 'zle'; cKom.className = 'komunikat zle'; cKom.textContent = `Poprawnie: ${C.odp}`; stan.seria = 0; }
    stan.najlepsza = Math.max(stan.najlepsza, stan.seria); zapisz(); cSeria();
    powiedz(C.odp);
    C.gotowe = true; $('#c-sprawdz').textContent = 'Dalej';
  });
  'á é í ó ú ñ ü'.split(' ').forEach(z => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = z; b.setAttribute('aria-label', 'Wstaw ' + z);
    b.addEventListener('mousedown', e => e.preventDefault());
    b.addEventListener('click', () => {
      const s = cWpis.selectionStart ?? cWpis.value.length, k = cWpis.selectionEnd ?? s;
      cWpis.value = cWpis.value.slice(0, s) + z + cWpis.value.slice(k); cWpis.focus(); cWpis.setSelectionRange(s + 1, s + 1);
    });
    $('#c-klawisze').appendChild(b);
  });

  // --- ZWROTY ---
  const zTemat = $('#z-temat');
  zTemat.innerHTML = Object.keys(ZWROTY).map(t => `<option>${esc(t)}</option>`).join('');
  const zRysuj = () => {
    $('#z-lista').innerHTML = ZWROTY[zTemat.value].split(';').map(w => { const [es, pl] = w.split('|'); return `<li><div><b>${esc(es)}</b><span>${esc(pl)}</span></div>${przyciskGlosu(es.replace(/…/g, ''))}</li>`; }).join('');
  };
  zTemat.addEventListener('change', zRysuj);

  // --- start ---
  if (!POZIOMY[stan.poziom]) stan.poziom = 'A1';
  rysujPoziomy(); fKierRysuj(); fStart(); sRysuj(); eStart(); oPoziom(); cNowe(); cSeria(); zRysuj();
  pokazZakladke(['slowka', 'egzamin', 'czasowniki', 'zwroty'].includes(stan.zakladka) ? stan.zakladka : 'slowka');
})();
