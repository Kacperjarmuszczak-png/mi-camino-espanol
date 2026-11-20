// Poziomy czasowników (pozostałe z listy w odmiana.js trafiają na A2) i czasy dostępne na danym poziomie.
const lista = s => new Set(s.trim().split(/\s+/));

export const CZASOWNIKI_A1 = lista(`
ser estar tener hacer ir venir decir poder querer saber poner salir dar ver hablar trabajar estudiar llamar llegar
vivir comer beber leer escribir abrir comprar tomar buscar mirar escuchar necesitar gustar pagar cocinar viajar
aprender comprender correr vender creer recibir subir pensar cerrar empezar dormir pedir jugar volver entender
preferir levantarse llamarse ducharse acostarse esperar entrar ayudar desayunar cenar lavar descansar`);

export const CZASOWNIKI_B1 = lista(`
suponer proponer traducir conducir reconocer aparecer desaparecer agradecer ofrecer crecer nacer construir incluir
corregir elegir repetir servir seguir conseguir medir despedir vestir morir divertir convertir mentir prohibir reunir
resolver devolver mover defender atender encender recomendar negar fregar calentar despertar colgar aprobar soñar
volar sonar confiar actuar continuar enviar proteger recoger escoger romper cubrir descubrir describir imprimir
insistir dividir unir partir añadir sufrir discutir cumplir ocurrir existir permitir quejarse equivocarse enamorarse
preocuparse enfadarse cansarse relajarse acordarse probarse reírse sonreír reír vestirse divertirse sentirse dormirse
ponerse irse casarse quedarse despertarse sentarse maquillarse afeitarse peinarse bañarse lavarse odiar apoyar`);

export const CZASOWNIKI_B2 = lista(`
sostener entretener convenir prevenir intervenir componer disponer exponer imponer deshacer rehacer atraer distraer
introducir reducir producir caber valer oler contener detener obtener mantener establecer pertenecer obedecer merecer
vencer convencer advertir sugerir hervir competir impedir distinguir distribuir contribuir concluir huir destruir
apostar apretar morder soler exigir fingir dirigir admitir asustar arrancar aconsejar adivinar poseer temer toser
barrer nevar llover doler`);

export function poziomCzasownika(inf) {
  if (CZASOWNIKI_A1.has(inf)) return 'A1';
  if (CZASOWNIKI_B2.has(inf)) return 'B2';
  if (CZASOWNIKI_B1.has(inf)) return 'B1';
  return 'A2';
}

// Czasy (klucze z odmiana.js) wprowadzane na kolejnych poziomach; wyższy poziom zawiera wcześniejsze.
export const CZASY_POZIOMU = {
  A1: ['presente'],
  A2: ['presente', 'perfecto', 'indefinido', 'imperfecto', 'futuro', 'imperativo'],
  B1: ['presente', 'perfecto', 'indefinido', 'imperfecto', 'futuro', 'condicional', 'subjuntivo', 'imperativo', 'imperativoNeg'],
};
export const czasyNaPoziomie = p => CZASY_POZIOMU[p] || CZASY_POZIOMU.B1;

// Szablony zdań do drillu: ___ = luka, {S} = podmiot (osoba). Szablony są neutralne znaczeniowo,
// więc pasują do każdego czasownika (oprócz bezosobowych – te pomija BEZ_DRILLU).
export const ZDANIA = {
  presente: [['Normalmente {S} ___.', 'Zwykle'], ['Todos los días {S} ___.', 'Codziennie'], ['Ahora {S} no ___.', 'Teraz … nie'], ['Los fines de semana {S} ___.', 'W weekendy']],
  perfecto: [['Hoy {S} ya ___.', 'Dziś … już'], ['Esta semana {S} no ___.', 'W tym tygodniu … nie'], ['{S} nunca ___ en un sitio así.', 'nigdy (w takim miejscu)']],
  indefinido: [['Ayer {S} ___.', 'Wczoraj'], ['El año pasado {S} ___ en Madrid.', 'W zeszłym roku'], ['La semana pasada {S} no ___.', 'W zeszłym tygodniu … nie']],
  imperfecto: [['Antes {S} ___ todos los veranos.', 'Kiedyś … co lato'], ['En aquella época {S} ___ a menudo.', 'W tamtych czasach … często'], ['Hace años {S} siempre ___.', 'Przed laty zawsze']],
  futuro: [['Mañana {S} ___.', 'Jutro'], ['El próximo año {S} ___ en España.', 'W przyszłym roku'], ['Dentro de un mes {S} ___.', 'Za miesiąc']],
  condicional: [['Con más tiempo, {S} ___.', 'Mając więcej czasu … by'], ['En tu lugar, {S} no ___.', 'Na twoim miejscu … by nie'], ['Con más dinero, {S} ___ más.', 'Mając więcej pieniędzy … by więcej']],
  subjuntivo: [['Es importante que {S} ___.', 'Ważne, żeby'], ['Ojalá {S} ___ pronto.', 'Oby wkrótce'], ['Mi madre quiere que {S} ___ hoy.', 'Mama chce, żeby … dziś']],
  imperativo: [['¡___ ahora, por favor!', 'Polecenie'], ['___, que es tarde.', 'Polecenie (późno już)']],
  imperativoNeg: [['¡___ ahora, por favor!', 'Zakaz'], ['___, que es peligroso.', 'Zakaz (to niebezpieczne)']],
};
export const PODMIOTY = ['yo', 'tú', 'ella', 'nosotros', 'vosotros', 'ellos'];
export const BEZ_DRILLU = new Set(['haber', 'soler', 'llover', 'nevar', 'doler', 'gustar', 'ocurrir', 'faltar', 'importar', 'caber', 'existir', 'pertenecer', 'nacer', 'morir', 'parecer']);
