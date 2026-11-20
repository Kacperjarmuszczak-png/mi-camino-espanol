// Akcenty świata: ten sam tekst czytany głosami z różnych krajów (jeśli telefon je ma) + opis różnic w wymowie.
import { esc } from './wspolne.js';

const KRAJE = [
  { kod: 'ES', f: '🇪🇸', n: 'Hiszpania', o: '„z” i „c” przed e/i wymawia się jak angielskie „th” (ceceo/distinción): gracias [graθias]. „j” twarde, gardłowe. Używa się vosotros.' },
  { kod: 'MX', f: '🇲🇽', n: 'Meksyk', o: 'Seseo: „z” i „c” jak „s”. Wyraźne samogłoski, melodyjna intonacja. Zamiast vosotros – ustedes. Typowe: ¿mande?, ahorita, padre (super).' },
  { kod: 'AR', f: '🇦🇷', n: 'Argentyna', o: '„ll” i „y” jak „sz/ż” (sheísmo): calle [kasze], yo [szo]. Voseo: vos tenés, vos sos. Intonacja podobna do włoskiej.' },
  { kod: 'CO', f: '🇨🇴', n: 'Kolumbia', o: 'Bogota słynie z bardzo wyraźnej, „czystej” wymowy. Częste usted nawet wśród przyjaciół. Seseo.' },
  { kod: 'CL', f: '🇨🇱', n: 'Chile', o: 'Szybkie tempo, „s” na końcu sylaby słabnie lub znika (los amigos → loh amigo). Typowe: ¿cachai?, po (pues).' },
  { kod: 'US', f: '🇺🇸', n: 'USA (hiszpański)', o: 'Mieszanka akcentów latynoskich, zwykle meksykański. Zapożyczenia z angielskiego: parquear, la troca.' },
];
const TEKST = 'Hola, me llamo Lucía. Vivo en una ciudad grande con mucha gente. Por las mañanas tomo un café y luego voy a trabajar en autobús.';

export function widokAkcentow(el, app) {
  function rysuj() {
    const glosy = app.mowa.glosyJezyka('es');
    el.innerHTML = `<p class="etykieta">Akcenty świata</p>
      <p class="male">Posłuchaj tego samego tekstu w różnych odmianach hiszpańskiego. Dostępne są głosy zainstalowane w telefonie – na iPhonie więcej dodasz w: Ustawienia → Dostępność → Treść mówiona → Głosy → Hiszpański.</p>
      <div class="przyklad"><p class="przyklad-es">${esc(TEKST)}</p></div>
      ${KRAJE.map(k => {
        const g = glosy.filter(v => new RegExp(`^es[-_]${k.kod}`, 'i').test(v.lang));
        return `<article class="ak-kraj"><div class="ak-gora"><span class="ku-flaga">${k.f}</span><b>${k.n}</b>
          ${g.length ? g.slice(0, 3).map(v => `<button type="button" class="btn btn--male" data-ak="${esc(v.voiceURI)}">▶ ${esc(v.name.split(' ')[0])}</button>`).join('') : '<span class="male">brak głosu w telefonie</span>'}</div>
          <p class="male">${esc(k.o)}</p></article>`;
      }).join('')}`;
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-ak]'); if (!b) return;
    const v = app.mowa.glosyJezyka('es').find(x => x.voiceURI === b.dataset.ak);
    app.mowa.powiedz(TEKST, { glos: v });
  });
  return { pokaz: rysuj };
}
