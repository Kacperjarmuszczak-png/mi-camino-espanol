// Dziennik: codziennie kilka zdań o swoim dniu; analizator wskazuje błędy (akcenty, zgodność, ser/estar…) i nieznane słowa.
import { $, esc } from './wspolne.js';
import { analizuj } from '../analiza.js';
import { utworzAnalizatorPl } from '../analiza-pl.js';
import { SLOWKA } from '../dane/index.js';
import { dzien } from '../stan.js';
import { HISP, t as tr, CEL } from '../jezyk.js';

let analizatorPl = null;
function sprawdzTekst(tekst) {
  if (HISP) {
    analizatorPl = analizatorPl || utworzAnalizatorPl(SLOWKA);
    const a = analizatorPl(tekst);
    return { bledy: [], uwagi: [], nieznane: a.slowa.filter(s => !s.znany).map(s => s.t) };
  }
  const a = analizuj(tekst);
  const uwagi = a.zdania.flatMap(z => z.uwagi);
  return { bledy: uwagi.filter(u => u.typ === 'blad'), uwagi: uwagi.filter(u => u.typ !== 'blad'), nieznane: a.nieznane };
}

export function widokDziennika(el, app) {
  const st = app.stan;
  const PODPOWIEDZI = HISP ? ['¿Qué has hecho hoy? → Dzisiaj…', '¿Qué vas a hacer mañana? → Jutro…', '¿Cómo te sientes? → Czuję się…']
    : ['Co dziś robiłeś? → Hoy he…', 'Co zjadłeś? → He comido…', 'Plany na jutro → Mañana voy a…', 'Jak się czujesz? → Me siento… / Estoy…'];
  function rysuj(wynik = null, dzienWidok = dzien()) {
    if (!st.dziennik) st.dziennik = {};
    const wpis = st.dziennik[dzienWidok];
    const dni = Object.keys(st.dziennik).sort().reverse();
    const dzis = dzienWidok === dzien();
    el.innerHTML = `<p class="etykieta">${tr('Dziennik', 'Diario')} · ${dzienWidok.split('-').reverse().join('.')}</p>
      ${dzis ? `<p class="male">${tr('Napisz 2–3 zdania po hiszpańsku o swoim dniu.', 'Escribe 2 o 3 frases en polaco sobre tu día.')} ${PODPOWIEDZI.map(p => `<span class="chip">${esc(p)}</span>`).join(' ')}</p>
        <textarea class="pole pole--tekst" data-dz-tekst rows="5" lang="${CEL}" data-znaki spellcheck="false" aria-label="${tr('Wpis', 'Entrada')}">${esc(wpis ? wpis.tekst : '')}</textarea>
        <button type="button" class="btn btn--akcent btn--szeroki" data-dz-zapisz>${tr('Sprawdź i zapisz', 'Comprobar y guardar')}</button>`
        : `<div class="przyklad"><p class="przyklad-es">${esc(wpis.tekst)}</p></div><button type="button" class="btn btn--male" data-dz-dzien="${dzien()}">${tr('← Dzisiejszy wpis', '← Entrada de hoy')}</button>`}
      <div data-dz-wynik>${wynik || (wpis && wpis.wynik ? wpis.wynik : '')}</div>
      ${dni.length ? `<p class="etykieta">${tr('Poprzednie wpisy', 'Entradas anteriores')} (${dni.length})</p><ul class="lista lista--zwarta">${dni.map(d => `<li><button type="button" class="lista-tekst" data-dz-dzien="${d}"><b>${d.split('-').reverse().join('.')}</b><span>${esc(st.dziennik[d].tekst.slice(0, 80))}${st.dziennik[d].tekst.length > 80 ? '…' : ''}</span></button></li>`).join('')}</ul>` : ''}`;
  }
  function zapisz() {
    const tekst = $('[data-dz-tekst]', el).value.trim();
    if (!tekst) return;
    const r = sprawdzTekst(tekst), d = dzien();
    const html = `<div class="wynik wynik--${r.bledy.length ? 'uwaga' : 'ok'}">
      <p><b>${r.bledy.length ? tr(`Możliwe błędy: ${r.bledy.length}`, `Posibles errores: ${r.bledy.length}`) : tr('Nie znalazłem błędów. ¡Muy bien!', 'No he encontrado errores. Świetnie!')}</b></p>
      ${r.bledy.map(u => `<p>✗ <b>${esc(u.tytul)}</b> – ${esc(u.tekst)}</p>`).join('')}
      ${r.uwagi.length ? `<details class="zwin"><summary>${tr('Wskazówki', 'Consejos')} (${r.uwagi.length})</summary>${r.uwagi.map(u => `<p class="male"><b>${esc(u.tytul)}</b> – ${esc(u.tekst)}</p>`).join('')}</details>` : ''}
      ${r.nieznane.length ? `<p class="male">${tr('Słowa spoza słownika aplikacji (sprawdź pisownię)', 'Palabras fuera del diccionario (revisa la ortografía)')}: ${r.nieznane.map(esc).join(', ')}</p>` : ''}
      <p class="male">${tr('Analiza automatyczna wyłapuje typowe błędy, ale nie wszystkie – to pomoc, nie nauczyciel.', 'El análisis automático detecta errores típicos, pero no todos.')}</p></div>`;
    const nowy = !st.dziennik[d];
    st.dziennik[d] = { tekst, wynik: html };
    if (nowy) { app.licz('dziennik'); app.dodajAktywnosc(3); } else app.zapisz();
    rysuj(html);
  }
  el.addEventListener('click', e => {
    if (e.target.closest('[data-dz-zapisz]')) return zapisz();
    const d = e.target.closest('[data-dz-dzien]'); if (d) rysuj(null, d.dataset.dzDzien);
  });
  return { pokaz: () => rysuj() };
}
