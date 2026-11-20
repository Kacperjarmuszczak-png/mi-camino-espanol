// Nauka hiszpańskiego: fiszki, quiz, odmiana czasowników z ćwiczeniem, słownik, zwroty, wymowa.
// Dane: slowa.js (SLOWA), czasowniki.js (CZASOWNIKI, odmiana, CZASY, OSOBY), zwroty.js (ZWROTY).
// Postęp tylko w tej przeglądarce (localStorage „jkf-es”).
(() => {
  const $ = s => document.querySelector(s);
  const rozbij = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.split(';').map(p => p.split('|'))]));
  const TEMATY = rozbij(window.SLOWA), ZDANIA = rozbij(window.ZWROTY);
  const WSZYSTKIE = Object.entries(TEMATY).flatMap(([k, l]) => l.map(([es, pl]) => ({ es, pl, k })));
  const tasuj = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const bezAkc = s => s.normalize('NFD').replace(/[̀-̂̄-ͯ]/g, '').normalize('NFC');   // ñ zostaje (U+0303)
  const czysc = s => s.toLowerCase().replace(/[¿?¡!.,;:"„”]/g, '').replace(/\s+/g, ' ').trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // --- pamięć ---
  const KLUCZ = 'jkf-es';
  let stan = { znane: {}, quiz: null, seria: 0, najlepsza: 0 };
  try { Object.assign(stan, JSON.parse(localStorage.getItem(KLUCZ)) || {}); } catch (e) { /* tryb prywatny */ }
  const zapisz = () => { try { localStorage.setItem(KLUCZ, JSON.stringify(stan)); } catch (e) { /* tryb prywatny */ } };

  // liczby w „O nauce”
  const setki = n => Math.floor(n / 10) * 10 + '+';
  $('#ile-slow').textContent = setki(WSZYSTKIE.length);
  $('#ile-czas').textContent = setki(CZASOWNIKI.length);

  // --- wymowa (głos przeglądarki) ---
  const mowa = 'speechSynthesis' in window ? speechSynthesis : null;
  let glos = null;
  const wybierzGlos = () => { if (!mowa) return; const g = mowa.getVoices(); glos = g.find(v => /^es[-_]ES/i.test(v.lang)) || g.find(v => /^es/i.test(v.lang)) || null; };
  if (mowa) { wybierzGlos(); mowa.onvoiceschanged = wybierzGlos; }
  function powiedz(t) {
    if (!mowa) return;
    try { mowa.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'es-ES'; u.rate = .88; if (glos) u.voice = glos; mowa.speak(u); } catch (e) { /* brak głosu */ }
  }
  const IK_GLOS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
  const przyciskGlosu = (tekst, etykieta) => mowa ? `<button type="button" class="nk-glos" data-mow="${esc(tekst)}" aria-label="${esc(etykieta || 'Posłuchaj: ' + tekst)}">${IK_GLOS}</button>` : '';
  document.addEventListener('click', e => { const b = e.target.closest('[data-mow]'); if (b && b.tagName === 'BUTTON') powiedz(b.dataset.mow); });
  const fGlos = $('#f-glos'); fGlos.innerHTML = IK_GLOS; fGlos.hidden = !mowa;

  // --- listy tematów ---
  function wypelnij(sel, nazwy, pierwsza) {
    sel.innerHTML = (pierwsza ? `<option value="">${esc(pierwsza)}</option>` : '') + nazwy.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  }
  // przełącznik ES → PL / PL → ES jako suwak z soczewką (jak filtry galerii na stronie fotografii)
  function przelacznik(root, zmiana) {
    const op = () => [...root.querySelectorAll('button')];
    let akt = 0;
    const wybierz = i => { akt = i; op().forEach((b, j) => b.classList.toggle('is-active', j === i)); if (s) s.odswiez(); zmiana(op()[i].dataset.k); };
    const s = window.JKFSuwak ? JKFSuwak(root, op, () => akt, wybierz) : null;
    if (!s) op().forEach((b, i) => b.addEventListener('click', () => wybierz(i)));
  }

  // ================= FISZKI =================
  const F = { temat: Object.keys(TEMATY)[0], kier: 'es', talia: [], powtorka: false };
  const fiszka = $('#fiszka'), fSel = $('#f-temat');
  const fNazwy = () => Object.keys(TEMATY).map(t => `${t} (${TEMATY[t].filter(([es]) => stan.znane[es]).length}/${TEMATY[t].length})`);
  function fListaTematow() {
    const v = F.temat; const n = fNazwy();
    fSel.innerHTML = Object.keys(TEMATY).map((t, i) => `<option value="${esc(t)}">${esc(n[i])}</option>`).join('');
    fSel.value = v;
  }
  function fStart() {
    const sl = TEMATY[F.temat], nie = sl.filter(([es]) => !stan.znane[es]);
    F.powtorka = !nie.length; F.talia = tasuj(nie.length ? nie : sl);
    fPokaz();
  }
  function fPokaz() {
    fiszka.classList.remove('is-tyl');
    const sl = TEMATY[F.temat], umiem = sl.filter(([es]) => stan.znane[es]).length;
    $('#f-pasek').style.width = (umiem / sl.length * 100) + '%';
    const k = F.talia[0];
    $('#f-tak').disabled = $('#f-nie').disabled = !k;
    if (!k) {
      fiszka.dataset.koniec = '1';
      $('#f-podp1').textContent = 'gotowe'; $('#f-przod').textContent = '¡Muy bien!';
      fiszka.querySelector('.nk-podpowiedz').textContent = 'Umiesz cały temat. Stuknij, żeby powtórzyć.';
      $('#f-licznik').textContent = `umiesz ${umiem} z ${sl.length}`;
      return;
    }
    delete fiszka.dataset.koniec;
    fiszka.querySelector('.nk-podpowiedz').textContent = 'stuknij, żeby odwrócić';
    const [es, pl] = k, przodEs = F.kier === 'es';
    $('#f-podp1').textContent = przodEs ? 'po hiszpańsku' : 'po polsku';
    $('#f-przod').textContent = przodEs ? es : pl;
    // tył podmieniany po połowie obrotu, żeby odpowiedź nie mignęła
    setTimeout(() => { $('#f-podp2').textContent = przodEs ? 'po polsku' : 'po hiszpańsku'; $('#f-tyl').textContent = przodEs ? pl : es; }, 250);
    $('#f-licznik').textContent = `${F.powtorka ? 'powtórka · ' : ''}zostało ${F.talia.length} · umiesz ${umiem}/${sl.length}`;
  }
  function fObroc() {
    if (fiszka.dataset.koniec) { F.talia = tasuj(TEMATY[F.temat]); F.powtorka = true; fPokaz(); return; }
    fiszka.classList.toggle('is-tyl');
    if (fiszka.classList.contains('is-tyl') && F.kier === 'pl') powiedz(F.talia[0][0]);
  }
  fiszka.addEventListener('click', fObroc);
  fiszka.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fObroc(); } });
  $('#f-tak').addEventListener('click', () => { const k = F.talia.shift(); if (k) stan.znane[k[0]] = 1; zapisz(); fListaTematow(); fPokaz(); slRysuj(); });
  $('#f-nie').addEventListener('click', () => { const k = F.talia.shift(); if (k) { delete stan.znane[k[0]]; F.talia.push(k); } zapisz(); fListaTematow(); fPokaz(); slRysuj(); });
  fGlos.addEventListener('click', () => { const k = F.talia[0]; if (k) powiedz(k[0]); });
  fSel.addEventListener('change', () => { F.temat = fSel.value; fStart(); });
  przelacznik($('#f-kier'), k => { F.kier = k; fPokaz(); });

  // ================= QUIZ =================
  const Q = { temat: '', kier: 'es' }, qSel = $('#q-temat'), qBox = $('#q-tresc');
  wypelnij(qSel, Object.keys(TEMATY), 'Wszystkie tematy');
  const qPula = () => Q.temat ? TEMATY[Q.temat].map(([es, pl]) => ({ es, pl })) : WSZYSTKIE;
  function qStart() { Q.pyt = tasuj(qPula()).slice(0, 10); Q.nr = 0; Q.wynik = 0; Q.bledy = []; qPytanie(); }
  function qPytanie() {
    const { es, pl } = Q.pyt[Q.nr], odp = Q.kier === 'es' ? pl : es, pyt = Q.kier === 'es' ? es : pl;
    const pole = Q.kier === 'es' ? 'pl' : 'es';
    const inne = tasuj([...new Set(qPula().map(x => x[pole]).filter(x => x !== odp))]).slice(0, 3);
    qBox.innerHTML = `<p class="nk-licznik">Pytanie ${Q.nr + 1} z ${Q.pyt.length} · dobrze ${Q.wynik}</p>
      <p class="nk-pytanie">${esc(pyt)}</p><div class="nk-opcje">${tasuj([odp, ...inne]).map(o => `<button type="button" class="nk-opcja">${esc(o)}</button>`).join('')}</div>`;
    qBox.querySelectorAll('.nk-opcja').forEach(b => b.addEventListener('click', () => {
      const dobrze = b.textContent === odp;
      qBox.querySelectorAll('.nk-opcja').forEach(x => { x.disabled = true; if (x.textContent === odp) x.classList.add('is-dobra'); });
      if (dobrze) Q.wynik++; else { b.classList.add('is-zla'); Q.bledy.push([es, pl]); }
      powiedz(es);
      setTimeout(() => { Q.nr++; Q.nr < Q.pyt.length ? qPytanie() : qKoniec(); }, dobrze ? 800 : 1700);
    }));
  }
  function qKoniec() {
    const n = Q.pyt.length;
    if (stan.quiz == null || Q.wynik > stan.quiz) stan.quiz = Q.wynik;
    zapisz();
    const ocena = Q.wynik === n ? '¡Perfecto! Bez jednego błędu.' : Q.wynik >= n * .7 ? '¡Muy bien! Jeszcze trochę i będzie komplet.' : Q.wynik >= n * .4 ? 'Nieźle. Przejrzyj pomyłki i spróbuj jeszcze raz.' : 'Dopiero początek. Zacznij od fiszek z tego tematu.';
    qBox.innerHTML = `<div class="nk-wynik"><p class="eyebrow">Wynik</p><strong>${Q.wynik}<small> / ${n}</small></strong><p class="nk-male">${ocena} Najlepszy wynik: ${stan.quiz}/10.</p>
      ${Q.bledy.length ? `<ul class="nk-bledy">${Q.bledy.map(([es, pl]) => `<li><b>${esc(es)}</b><span>${esc(pl)}</span></li>`).join('')}</ul>` : ''}
      <button type="button" class="btn btn--gold" id="q-nowy">Nowy quiz</button></div>`;
    $('#q-nowy').addEventListener('click', qStart);
  }
  qSel.addEventListener('change', () => { Q.temat = qSel.value; qStart(); });
  przelacznik($('#q-kier'), k => { Q.kier = k; qStart(); });

  // ================= ODMIANA =================
  const O = { v: null, czas: 'presente' };
  const poInf = Object.fromEntries(CZASOWNIKI.map(c => [c.inf, c]));
  $('#o-lista').innerHTML = CZASOWNIKI.map(c => `<option value="${esc(c.inf)}">${esc(c.pl)}</option>`).join('');
  const czasyBox = $('#o-czasy');
  czasyBox.innerHTML = CZASY.map(c => `<button type="button" role="tab" data-c="${c.k}" aria-selected="${c.k === O.czas}">${esc(c.n)}</button>`).join('');
  czasyBox.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; O.czas = b.dataset.c; oRysuj(); });
  function znajdz(q) {
    q = bezAkc(czysc(q)); if (!q) return null;
    return CZASOWNIKI.find(c => bezAkc(c.inf) === q)
      || CZASOWNIKI.find(c => c.pl.split(/[,(]/).some(p => bezAkc(czysc(p)) === q))
      || CZASOWNIKI.find(c => bezAkc(c.inf).startsWith(q))
      || CZASOWNIKI.find(c => bezAkc(czysc(c.pl)).includes(q));
  }
  function oUstaw(c) { O.v = c; O.f = odmiana(c.inf, c.f); oRysuj(); }
  function oRysuj() {
    const c = O.v, f = O.f, cz = CZASY.find(x => x.k === O.czas);
    $('#o-bezok').textContent = c.inf;
    $('#o-znaczenie').textContent = c.pl + (c.f.startsWith('=') || ['ie', 'ue', 'i', 'u', 'zc', 'z'].includes(c.f) ? ' · nieregularny' : ' · regularny');
    $('#o-formy').innerHTML = `gerundio: <b>${esc(f.ger)}</b> · participio: <b>${esc(f.part)}</b>`;
    czasyBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.c === O.czas));
    $('#o-opis').textContent = `${cz.n} (${cz.pl}). ${cz.o}`;
    $('#o-tabela').innerHTML = OSOBY.map(([es, pl], i) => `<tr><td>${esc(es)}<small>${esc(pl)}</small></td><td class="f">${esc(f[O.czas][i])}</td><td class="g">${przyciskGlosu(f[O.czas][i])}</td></tr>`).join('');
  }
  const oSzukaj = $('#o-szukaj');
  const oSzukajTeraz = () => { const c = znajdz(oSzukaj.value); if (c) oUstaw(c); };
  oSzukaj.addEventListener('change', oSzukajTeraz);
  oSzukaj.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); oSzukajTeraz(); oSzukaj.blur(); } });
  oSzukaj.addEventListener('input', () => { if (poInf[oSzukaj.value.trim().toLowerCase()]) oSzukajTeraz(); });
  $('#o-losuj').addEventListener('click', () => { const c = CZASOWNIKI[Math.floor(Math.random() * CZASOWNIKI.length)]; oSzukaj.value = ''; oUstaw(c); });

  // ćwiczenie: losowy czasownik, czas i osoba; wpisujesz formę
  const C = {};
  const CZESTE = CZASOWNIKI.slice(0, 120);   // na początku listy są najczęstsze i nieregularne
  function cNowe() {
    const c = Math.random() < .6 ? CZESTE[Math.floor(Math.random() * CZESTE.length)] : CZASOWNIKI[Math.floor(Math.random() * CZASOWNIKI.length)];
    const cz = CZASY[Math.floor(Math.random() * CZASY.length)], os = Math.floor(Math.random() * 6);
    Object.assign(C, { c, cz, os, odp: odmiana(c.inf, c.f)[cz.k][os], gotowe: false });
    $('#c-zadanie').innerHTML = `<b>${esc(c.inf)}</b> <span class="nk-male">(${esc(c.pl)})</span><br><span>${esc(cz.n)}</span><span class="os">${esc(OSOBY[os][0])} · ${esc(OSOBY[os][1])}</span>`;
    const w = $('#c-wpis'); w.value = ''; w.className = '';
    const k = $('#c-komunikat'); k.textContent = ''; k.className = 'nk-komunikat';
    $('#c-sprawdz').textContent = 'Sprawdź';
  }
  function cSeria() { $('#c-seria').textContent = stan.seria; $('#c-najlepsza').textContent = stan.najlepsza; }
  $('#c-form').addEventListener('submit', e => {
    e.preventDefault();
    if (C.gotowe) { cNowe(); $('#c-wpis').focus({ preventScroll: true }); return; }
    const w = $('#c-wpis'), k = $('#c-komunikat');
    // zaimek zwrotny i osobowy na początku można wpisać albo pominąć
    const zaimek = /^(yo|tú|tu|él|el|ella|usted|nosotros|nosotras|vosotros|vosotras|ellos|ellas|ustedes)\s+/;
    const wpis = czysc(w.value).replace(zaimek, '');
    if (!wpis) { w.focus(); return; }
    const odp = czysc(C.odp);
    if (wpis === odp) { w.className = 'is-ok'; k.className = 'nk-komunikat is-ok'; k.textContent = `¡Correcto! ${C.odp}`; stan.seria++; }
    else if (bezAkc(wpis) === bezAkc(odp)) { w.className = 'is-ok'; k.className = 'nk-komunikat is-uwaga'; k.textContent = `Prawie: pisze się „${C.odp}”, z akcentem.`; stan.seria++; }
    else { w.className = 'is-zle'; k.className = 'nk-komunikat is-zle'; k.textContent = `Poprawnie: ${C.odp}`; stan.seria = 0; }
    stan.najlepsza = Math.max(stan.najlepsza, stan.seria); zapisz(); cSeria();
    powiedz(C.odp);
    C.gotowe = true; $('#c-sprawdz').textContent = 'Dalej';
  });
  'á é í ó ú ñ ü ¿ ¡'.split(' ').forEach(z => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = z; b.setAttribute('aria-label', 'Wstaw ' + z);
    b.addEventListener('mousedown', e => e.preventDefault());
    b.addEventListener('click', () => {
      const w = $('#c-wpis'), s = w.selectionStart ?? w.value.length, e = w.selectionEnd ?? s;
      w.value = w.value.slice(0, s) + z + w.value.slice(e); w.focus({ preventScroll: true }); w.setSelectionRange(s + 1, s + 1);
    });
    $('#c-klawisze').append(b);
  });

  // ================= SŁOWNIK =================
  const sSel = $('#s-temat'), sLista = $('#s-lista'), sSzukaj = $('#s-szukaj'), sWiecej = $('#s-wiecej');
  wypelnij(sSel, Object.keys(TEMATY), 'Wszystkie tematy');
  sSel.value = Object.keys(TEMATY)[0];
  let sLimit = 60;
  function slRysuj() {
    const q = bezAkc(czysc(sSzukaj.value)), t = sSel.value;
    let lista = WSZYSTKIE.filter(w => (!t || w.k === t) && (!q || bezAkc(czysc(w.es + ' ' + w.pl)).includes(q)));
    $('#s-ile').textContent = `${lista.length} ${lista.length === 1 ? 'słowo' : 'słów'}`;
    const widac = lista.slice(0, sLimit);
    sLista.innerHTML = widac.length ? widac.map(w => `<li class="${stan.znane[w.es] ? 'is-znane' : ''}"><div><span class="es" lang="es">${esc(w.es)}</span><span class="pl">${esc(w.pl)}</span>${!t ? `<span class="kat">${esc(w.k)}</span>` : ''}</div>${przyciskGlosu(w.es)}</li>`).join('')
      : '<li class="nk-pusto">Nie ma takiego słowa. Spróbuj krócej albo w innym temacie.</li>';
    sWiecej.hidden = lista.length <= sLimit;
  }
  sSel.addEventListener('change', () => { sLimit = 60; slRysuj(); });
  sSzukaj.addEventListener('input', () => { sLimit = 60; if (sSzukaj.value.trim() && sSel.value) sSel.value = ''; slRysuj(); });
  sWiecej.addEventListener('click', () => { sLimit += 120; slRysuj(); });

  // ================= ZWROTY =================
  const zSel = $('#z-temat');
  wypelnij(zSel, Object.keys(ZDANIA), 'Wszystkie sytuacje');
  zSel.value = Object.keys(ZDANIA)[0];
  function zRysuj() {
    const t = zSel.value, lista = Object.entries(ZDANIA).filter(([k]) => !t || k === t).flatMap(([k, l]) => l.map(([es, pl]) => ({ es, pl, k })));
    $('#z-ile').textContent = `${lista.length} zdań`;
    $('#z-lista').innerHTML = lista.map(z => `<li><div><span class="es" lang="es">${esc(z.es)}</span><span class="pl">${esc(z.pl)}</span>${!t ? `<span class="kat">${esc(z.k)}</span>` : ''}</div>${przyciskGlosu(z.es)}</li>`).join('');
  }
  zSel.addEventListener('change', zRysuj);

  // ================= WYMOWA =================
  document.querySelectorAll('#wymowa-lista li').forEach(li => li.addEventListener('click', () => powiedz(li.querySelector('[data-mow]').dataset.mow)));

  // ================= RESET =================
  $('#reset').addEventListener('click', () => { $('#reset-pyt').hidden = false; });
  $('#reset-tak').addEventListener('click', () => {
    stan = { znane: {}, quiz: null, seria: 0, najlepsza: 0 }; zapisz();
    $('#reset-pyt').hidden = true; fListaTematow(); fStart(); slRysuj(); cSeria();
  });

  // start
  fListaTematow(); fStart(); qStart(); oUstaw(poInf.tener); cNowe(); cSeria(); slRysuj(); zRysuj();
})();
