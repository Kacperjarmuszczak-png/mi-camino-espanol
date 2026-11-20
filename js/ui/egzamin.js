// Zakładka „Egzamin”: wybór zakresu, pytania z limitem czasu lub bez, raport z wyjaśnieniami i ćwiczenie błędów.
import { $, esc, przyciskGlosu, toast } from './wspolne.js';
import { utworzEgzamin, szacujPoziom, ocenaSlowna, TYPY } from '../egzamin.js';
import { SLOWKA, tematy, POZIOMY } from '../dane/index.js';
import { tasuj } from '../tekst.js';
import { t as tr } from '../jezyk.js';

export function zakladkaEgzamin(root, app) {
  const ui = app.stan.ui;
  const E = { pyt: [], odp: [], nr: 0, start: 0, limit: 0, timer: null, zakres: null, trwa: false };
  const zakres = () => ui.eZakres || 'poziom';

  function ekranStartu() {
    clearInterval(E.timer); E.trwa = false;
    const best = app.stan.egz[ui.poziom];
    const t = tematy(SLOWKA);
    root.innerHTML = `<div class="egz-start">
      <p class="etykieta">${tr('Egzamin', 'Examen')}</p>
      <div class="seg seg--pelny" role="group" aria-label="${tr('Zakres', 'Alcance')}">
        <button type="button" data-ez="poziom" aria-pressed="${zakres() === 'poziom'}">${tr('Poziom', 'Nivel')} ${ui.poziom}</button>
        <button type="button" data-ez="poziomujacy" aria-pressed="${zakres() === 'poziomujacy'}">${tr('Test poziomujący', 'Prueba de nivel')}</button>
        <button type="button" data-ez="temat" aria-pressed="${zakres() === 'temat'}">${tr('Z tematu', 'Por tema')}</button>
      </div>
      ${zakres() === 'temat' ? `<label class="wybor"><span>${tr('Temat', 'Tema')}</span><select class="pole" id="e-temat">${t.map(x => `<option${x === ui.eTemat ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>` : ''}
      <p class="male">${zakres() === 'poziom' ? tr(`Słownictwo, luki w zdaniach, czasowniki, gramatyka, zwroty i czytanie z poziomu ${ui.poziom}. Zdajesz od 70%.`, `Vocabulario, conjugación y frases del nivel ${ui.poziom}. Se aprueba con un 70 %.`)
        : zakres() === 'poziomujacy' ? tr('24 pytania od A1 do C2. Na koniec dostaniesz szacowany poziom.', '24 preguntas de A1 a C2. Al final verás tu nivel estimado.') : tr('Słówka i luki w zdaniach z wybranego tematu.', 'Palabras del tema elegido.')}</p>
      ${zakres() !== 'poziomujacy' ? `<div class="wiersz"><span class="male">${tr('Liczba pytań', 'Preguntas')}</span><div class="seg" role="group" aria-label="${tr('Liczba pytań', 'Número de preguntas')}">${[10, 20, 30].map(n => `<button type="button" data-eile="${n}" aria-pressed="${(ui.eIle || 20) === n}">${n}</button>`).join('')}</div></div>` : ''}
      <div class="wiersz"><span class="male">${tr('Czas', 'Tiempo')}</span><div class="seg" role="group" aria-label="${tr('Limit czasu', 'Límite de tiempo')}">
        <button type="button" data-eczas="0" aria-pressed="${!ui.eCzas}">${tr('Swobodnie', 'Sin prisa')}</button><button type="button" data-eczas="1" aria-pressed="${!!ui.eCzas}">${tr('Na czas (45 s / pytanie)', 'Con tiempo (45 s / pregunta)')}</button></div></div>
      ${best != null && zakres() === 'poziom' ? `<p>${tr('Najlepszy wynik z', 'Mejor resultado de')} ${ui.poziom}: <b class="${best >= 70 ? 'tekst-ok' : 'tekst-zle'}">${best}%</b></p>` : ''}
      <button type="button" class="btn btn--akcent btn--szeroki btn--duzy" data-estart>${tr('Zacznij egzamin', 'Empezar el examen')} <kbd>Enter</kbd></button>
    </div>`;
  }

  function start(gotowe = null) {
    const o = { zakres: zakres(), p: ui.poziom, temat: ui.eTemat || tematy(SLOWKA)[0], ile: ui.eIle || 20 };
    E.zakres = o;
    E.pyt = gotowe || utworzEgzamin(o, app.stan.ust);
    if (!E.pyt.length) { toast(tr('Za mało materiału do egzaminu w tym zakresie.', 'No hay suficiente material para este examen.')); return; }
    E.odp = new Array(E.pyt.length).fill(null); E.nr = 0; E.trwa = true; E.start = Date.now();
    E.limit = ui.eCzas ? E.pyt.length * 45 : 0;
    clearInterval(E.timer);
    if (E.limit) E.timer = setInterval(tik, 1000);
    pytanie();
  }
  function tik() {
    const zostalo = E.limit - Math.floor((Date.now() - E.start) / 1000);
    const el = $('[data-zegar]', root);
    if (el) { el.textContent = `${Math.floor(Math.max(0, zostalo) / 60)}:${String(Math.max(0, zostalo) % 60).padStart(2, '0')}`; el.classList.toggle('malo', zostalo <= 30); }
    if (zostalo <= 0) { clearInterval(E.timer); toast(tr('Koniec czasu.', 'Se acabó el tiempo.')); raport(); }
  }
  function pytanie() {
    const q = E.pyt[E.nr], wybr = E.odp[E.nr];
    root.innerHTML = `<div class="egz">
      <div class="sesja-pasek"><div class="postep"><i style="width:${100 * E.nr / E.pyt.length}%"></i></div>
        <span>${tr('Pytanie', 'Pregunta')} ${E.nr + 1} ${tr('z', 'de')} ${E.pyt.length} · ${q.p} · ${TYPY[q.typ]}</span>${E.limit ? '<span class="zegar" data-zegar></span>' : ''}</div>
      ${q.kontekst ? `<div class="kontekst"><p>${esc(q.kontekst)}</p>${przyciskGlosu(q.kontekst, tr('Posłuchaj tekstu', 'Escuchar el texto'))}</div>` : ''}
      <p class="egz-tytul">${esc(q.tytul)}</p>
      <p class="egz-tekst">${esc(q.tekst).replace('_____', '<span class="luka">_____</span>').replace('___', '<span class="luka">___</span>')}</p>
      <div class="opcje">${q.opcje.map((o, i) => `<button type="button" class="opcja${wybr === o ? ' wybrana' : ''}" data-eo="${i}" aria-pressed="${wybr === o}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="wiersz egz-nawig">
        <button type="button" class="btn" data-ewstecz ${E.nr ? '' : 'disabled'}>${tr('Wstecz', 'Atrás')}</button>
        <button type="button" class="btn btn--akcent" data-edalej ${wybr == null ? 'disabled' : ''}>${E.nr + 1 === E.pyt.length ? tr('Zakończ', 'Terminar') : tr('Dalej', 'Siguiente')} <kbd>Enter</kbd></button>
      </div>
      <button type="button" class="btn btn--cichy btn--male" data-ekoniec>${tr('Zakończ teraz', 'Terminar ahora')}</button></div>`;
    if (E.limit) tik();
  }
  function wybierz(i) {
    if (!E.trwa) return;
    E.odp[E.nr] = E.pyt[E.nr].opcje[i];
    root.querySelectorAll('[data-eo]').forEach((b, j) => { b.classList.toggle('wybrana', j === i); b.setAttribute('aria-pressed', j === i); });
    $('[data-edalej]', root).disabled = false;
  }
  function dalej() {
    if (E.odp[E.nr] == null) return;
    if (E.nr + 1 >= E.pyt.length) return raport();
    E.nr++; pytanie();
  }

  function raport() {
    clearInterval(E.timer); E.trwa = false;
    const ok = E.pyt.map((q, i) => E.odp[i] === q.odp);
    const dobrze = ok.filter(Boolean).length, proc = Math.round(100 * dobrze / E.pyt.length);
    const czas = Math.round((Date.now() - E.start) / 1000);
    // SRS: błędne pozycje wracają do powtórki; aktywność dzienna za każdą odpowiedź
    E.pyt.forEach((q, i) => { if (q.id && E.odp[i] != null && !ok[i]) app.ocen(q.id, 1, { bezAktywnosci: true }); });
    app.dodajAktywnosc(E.odp.filter(x => x != null).length);
    let naglowek = '';
    if (E.zakres.zakres === 'poziom') {
      const stary = app.stan.egz[E.zakres.p] || 0;
      app.stan.egz[E.zakres.p] = Math.max(stary, proc); app.zapisz();
      naglowek = `<p class="${proc >= 70 ? 'tekst-ok' : 'tekst-zle'}"><b>${proc >= 70 ? tr(`Zdany! Poziom ${E.zakres.p} zaliczony.`, `¡Aprobado! Nivel ${E.zakres.p} superado.`) : tr('Jeszcze nie zdany (próg 70%).', 'Todavía no aprobado (mínimo 70 %).')}</b>${proc > stary ? tr(' Nowy rekord.', ' Nuevo récord.') : ''}</p>`;
    } else if (E.zakres.zakres === 'poziomujacy') {
      const sz = szacujPoziom(E.pyt, E.odp);
      const naPoz = POZIOMY.map(p => { const idx = E.pyt.map((q, i) => i).filter(i => E.pyt[i].p === p); const d = idx.filter(i => ok[i]).length; return [p, idx.length ? Math.round(100 * d / idx.length) : 0]; });
      naglowek = `<p>${tr('Szacowany poziom', 'Nivel estimado')}: <b class="duzy-poziom">${sz}</b></p>
        <div class="slupki">${naPoz.map(([p, v]) => `<div class="slupek"><span style="height:${Math.max(4, v)}%"></span><b>${p}</b><small>${v}%</small></div>`).join('')}</div>`;
    }
    const typy = Object.keys(TYPY).map(t => { const idx = E.pyt.map((q, i) => i).filter(i => E.pyt[i].typ === t); return idx.length ? [t, idx.filter(i => ok[i]).length, idx.length] : null; }).filter(Boolean);
    const bledy = E.pyt.map((q, i) => [q, i]).filter(([, i]) => !ok[i]);
    root.innerHTML = `<div class="podsumowanie">
      <p class="etykieta">${tr('Raport z egzaminu', 'Informe del examen')}</p>
      <div class="wynik-egz"><b>${proc}%</b><span>${ocenaSlowna(proc)} · ${dobrze} ${tr('z', 'de')} ${E.pyt.length} · ${Math.floor(czas / 60)} min ${czas % 60} s</span></div>
      ${naglowek}
      <div class="typy">${typy.map(([t, d, n]) => `<div class="typ"><span>${TYPY[t]}</span><div class="postep"><i style="width:${100 * d / n}%"></i></div><small>${d}/${n}</small></div>`).join('')}</div>
      ${bledy.length ? `<p class="etykieta">${tr('Błędy i wyjaśnienia', 'Errores y explicaciones')}</p><ol class="bledy">${bledy.map(([q, i]) => `<li>
        ${q.kontekst ? `<p class="male">${esc(q.kontekst.slice(0, 120))}${q.kontekst.length > 120 ? '…' : ''}</p>` : ''}
        <p><b>${esc(q.tekst)}</b> <span class="male">(${esc(q.tytul)})</span></p>
        <p>${tr('Twoja odpowiedź', 'Tu respuesta')}: <span class="tekst-zle">${esc(E.odp[i] == null ? tr('brak', 'ninguna') : E.odp[i])}</span> · ${tr('poprawnie', 'correcta')}: <span class="tekst-ok">${esc(q.odp)}</span></p>
        <p class="wyj">${esc(q.wyj)}</p>${q.mow ? przyciskGlosu(q.mow) : ''}</li>`).join('')}</ol>` : `<p class="srodek">${tr('Bez błędów. ¡Excelente!', 'Sin errores. Świetnie!')}</p>`}
      <div class="akcje-pion">
        ${bledy.length ? `<button type="button" class="btn btn--akcent btn--szeroki" data-ebledne>${tr('Przećwicz tylko błędne', 'Practicar solo los errores')}</button>` : ''}
        <button type="button" class="btn btn--szeroki" data-enowy>${tr('Nowy egzamin', 'Nuevo examen')}</button>
      </div></div>`;
    E.bledne = bledy.map(([q]) => ({ ...q, opcje: tasuj(q.opcje) }));
    app.odswiez();
  }

  root.addEventListener('click', e => {
    const t = e.target;
    const z = t.closest('[data-ez]'); if (z) { ui.eZakres = z.dataset.ez; app.zapisz(); return ekranStartu(); }
    const il = t.closest('[data-eile]'); if (il) { ui.eIle = +il.dataset.eile; app.zapisz(); return ekranStartu(); }
    const cz = t.closest('[data-eczas]'); if (cz) { ui.eCzas = cz.dataset.eczas === '1'; app.zapisz(); return ekranStartu(); }
    if (t.closest('[data-estart]')) return start();
    const o = t.closest('[data-eo]'); if (o) return wybierz(+o.dataset.eo);
    if (t.closest('[data-edalej]')) return dalej();
    if (t.closest('[data-ewstecz]')) { if (E.nr) { E.nr--; pytanie(); } return; }
    if (t.closest('[data-ekoniec]')) return raport();
    if (t.closest('[data-ebledne]')) return start(E.bledne);
    if (t.closest('[data-enowy]')) return ekranStartu();
  });
  root.addEventListener('change', e => { if (e.target.id === 'e-temat') { ui.eTemat = e.target.value; app.zapisz(); } });

  return {
    poziom() { if (!E.trwa) ekranStartu(); },
    odswiezListe() {},
    klawisz(e) {
      const n = parseInt(e.key, 10);
      if (E.trwa) {
        if (n >= 1 && n <= 4) { wybierz(n - 1); return true; }
        if (e.key === 'Enter') { dalej(); return true; }
        if (e.key === 'ArrowLeft' && E.nr) { E.nr--; pytanie(); return true; }
        return false;
      }
      if (e.key === 'Enter' && $('[data-estart]', root)) { start(); return true; }
      return false;
    },
  };
}
