// Zakładka „Słówka”: wybór tematu, sesja kart (4 tryby) i lista słów z filtrami.
import { $, esc } from './wspolne.js';
import { silnikKart } from './karty.js';
import { utworzListe } from './lista.js';
import { SLOWKA, tematy, wWariancie } from '../dane/index.js';

export function zakladkaSlowka(root, app) {
  const ui = app.stan.ui;
  root.innerHTML = `
    <div class="wiersz">
      <label class="wybor"><span>Temat</span><select class="pole" id="s-temat" aria-label="Temat słówek"></select></label>
    </div>
    <div id="s-karty"></div>
    <div id="s-lista"></div>`;
  const sel = $('#s-temat', root);
  const pulaPoziomu = () => SLOWKA.filter(w => w.p === ui.poziom);
  const pula = () => pulaPoziomu().filter(w => !ui.temat || w.t === ui.temat);
  const silnik = silnikKart($('#s-karty', root), { app, rodzaj: 'slowka', pula, pelnaPula: pulaPoziomu });
  const lista = utworzListe($('#s-lista', root), {
    id: 's-lista-szuflada', app, tytul: 'Lista słów', pobierz: pula,
    opis: w => esc(w.pl) + (w.latam ? ` <i>· LATAM: ${esc(w.latam.es)}</i>` : ''),
    mow: w => wWariancie(w, app.stan.ust.wariant),
    cwicz: w => { silnik.cwiczJeden(w); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  });
  function rysujTematy() {
    const t = tematy(SLOWKA, ui.poziom);
    if (ui.temat && !t.includes(ui.temat)) ui.temat = '';
    sel.innerHTML = `<option value="">Wszystkie tematy (${pulaPoziomu().length})</option>` +
      t.map(x => `<option value="${esc(x)}"${x === ui.temat ? ' selected' : ''}>${esc(x)} (${pulaPoziomu().filter(w => w.t === x).length})</option>`).join('');
  }
  sel.addEventListener('change', () => { ui.temat = sel.value; app.zapisz(); silnik.start(); lista.rysuj(); });
  return {
    poziom() { rysujTematy(); silnik.start(); lista.rysuj(); },
    odswiezListe: () => lista.rysuj(),
    klawisz: e => silnik.klawisz(e),
  };
}
