// Zakładka „Słówka”: wybór tematu, sesja kart (4 tryby) i lista słów z filtrami.
import { $, esc } from './wspolne.js';
import { silnikKart } from './karty.js';
import { utworzListe } from './lista.js';
import { SLOWKA, tematy, wWariancie } from '../dane/index.js';

export function zakladkaSlowka(root, app) {
  const ui = app.stan.ui;
  root.innerHTML = `
    <div id="s-karty"></div>
    <div id="s-lista"></div>`;
  const pulaPoziomu = () => SLOWKA.filter(w => w.p === ui.poziom);
  const pula = () => pulaPoziomu().filter(w => !ui.temat || w.t === ui.temat);
  const opcjeTematu = () => {
    const t = tematy(SLOWKA, ui.poziom);
    if (ui.temat && !t.includes(ui.temat)) ui.temat = '';
    return `<p class="etykieta">Temat</p><select class="pole" id="s-temat" aria-label="Temat słówek"><option value="">Wszystkie tematy (${pulaPoziomu().length})</option>${t.map(x => `<option value="${esc(x)}"${x === ui.temat ? ' selected' : ''}>${esc(x)} (${pulaPoziomu().filter(w => w.t === x).length})</option>`).join('')}</select>`;
  };
  const silnik = silnikKart($('#s-karty', root), {
    app, rodzaj: 'slowka', pula, pelnaPula: pulaPoziomu,
    etykietaZakresu: () => ui.temat || 'wszystkie tematy',
    opcjeHtml: opcjeTematu,
    podlaczOpcje: (el, sygnal, poZmianie) => el.addEventListener('change', e => {
      if (e.target.id !== 's-temat') return;
      ui.temat = e.target.value; app.zapisz(); poZmianie(); lista.rysuj();
    }, sygnal),
  });
  const lista = utworzListe($('#s-lista', root), {
    id: 's-lista-szuflada', app, tytul: 'Lista słów', pobierz: pula,
    opis: w => esc(w.pl) + (w.latam ? ` <i>· LATAM: ${esc(w.latam.es)}</i>` : ''),
    mow: w => wWariancie(w, app.stan.ust.wariant),
    cwicz: w => { silnik.cwiczJeden(w); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  });
  return {
    poziom() { if (ui.temat && !tematy(SLOWKA, ui.poziom).includes(ui.temat)) ui.temat = ''; silnik.odswiezOpcje(); silnik.start(); lista.rysuj(); },
    odswiezListe: () => lista.rysuj(),
    klawisz: e => silnik.klawisz(e),
  };
}
