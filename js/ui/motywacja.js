// Widoki motywacji: pasek poziomu gracza (XP), odznaki, podsumowanie tygodnia.
import { esc } from './wspolne.js';
import { ODZNAKI, poziomGracza, tydzien } from '../postep.js';
import { t as tr, HISP } from '../jezyk.js';

export function pasekXp(stan) {
  const g = poziomGracza(stan.xp || 0), zd = Object.keys(stan.odznaki || {}).length;
  return `<div class="xp-pasek">
    <div class="xp-gora"><b>${tr('Poziom gracza', 'Nivel de jugador')} ${g.poziom}</b><span>${g.xp} XP · ${tr('do następnego', 'para el siguiente')} ${g.do - g.xp}</span></div>
    <div class="postep"><i style="width:${g.proc}%"></i></div>
    <div class="xp-dol"><button type="button" class="link" data-cwk="odznaki">🏅 ${tr('Odznaki', 'Insignias')} ${zd}/${ODZNAKI.length}</button><button type="button" class="link" data-cwk="tydzien">📈 ${tr('Twój tydzień', 'Tu semana')}</button></div></div>`;
}

export function widokOdznak(el, app) {
  return {
    pokaz() {
      const z = app.stan.odznaki || {};
      el.innerHTML = `<p class="etykieta">${tr('Odznaki', 'Insignias')} <span class="male">(${Object.keys(z).length}/${ODZNAKI.length})</span></p>
        <div class="odznaki">${ODZNAKI.map(o => `<div class="odznaka${z[o.id] ? ' zdobyta' : ''}"><span class="odz-ik" aria-hidden="true">${o.ik}</span><b>${esc(o.n)}</b><small>${esc(o.o)}</small>${z[o.id] ? `<i>${z[o.id].split('-').reverse().join('.')}</i>` : ''}</div>`).join('')}</div>
        <p class="male">${tr('XP: 10 za dobrą odpowiedź, 6 za „prawie”, 2 za próbę, 5 za każde ćwiczenie w egzaminie, dyktandzie i lekcji.', 'XP: 10 por respuesta correcta, 6 por «casi», 2 por intentarlo y 5 por cada ejercicio de examen, dictado y lección.')}</p>`;
    },
  };
}

export function htmlTygodnia(stan) {
  const t = tydzien(stan);
  const dniN = tr(['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz'], ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']);
  const max = Math.max(stan.ust.cel, ...t.dni.map(k => stan.dni[k] || 0));
  const roznica = (a, b) => (b ? `${a >= b ? '▲' : '▼'} ${Math.abs(Math.round(100 * (a - b) / b))}%` : a ? '▲' : '–');
  return `<div class="liczby liczby--4">
      <div><b>${t.odp}</b><span>${tr('odpowiedzi', 'respuestas')} · ${roznica(t.odp, t.odpPoprz)}</span></div>
      <div><b>${t.xp}</b><span>XP · ${roznica(t.xp, t.xpPoprz)}</span></div>
      <div><b>${t.aktywne}/${t.dni.length}</b><span>${tr('dni nauki', 'días de práctica')}</span></div>
      <div><b>${t.noweOpan > 0 ? '+' : ''}${t.noweOpan}</b><span>${tr('nowo opanowane', 'nuevas dominadas')}</span></div></div>
    <div class="slupki slupki--tydz">${Array.from({ length: 7 }, (_, i) => { const k = t.dni[i]; const n = k ? stan.dni[k] || 0 : 0; return `<div class="slupek${n >= stan.ust.cel ? ' cel' : ''}"><span style="height:${k ? Math.max(3, 100 * n / max) : 0}%"></span><small>${dniN[i]}</small></div>`; }).join('')}</div>
    <p class="male">${t.najlepszy ? tr(`Najlepszy dzień: ${t.najlepszy.k.split('-').reverse().join('.')} (${t.najlepszy.n} odpowiedzi). Cel osiągnięty w ${t.celOsiagniety} z ${t.dni.length} dni. Porównanie z tymi samymi dniami poprzedniego tygodnia.`, `Mejor día: ${t.najlepszy.k.split('-').reverse().join('.')} (${t.najlepszy.n} respuestas). Meta alcanzada ${t.celOsiagniety} de ${t.dni.length} días. Comparación con los mismos días de la semana pasada.`) : tr('W tym tygodniu jeszcze nic – czas zacząć!', 'Esta semana todavía nada: ¡a empezar!')}</p>`;
}

export function widokTygodnia(el, app) {
  return { pokaz() { el.innerHTML = `<p class="etykieta">${tr('Twój tydzień', 'Tu semana')}</p>${htmlTygodnia(app.stan)}`; } };
}
export { HISP };
