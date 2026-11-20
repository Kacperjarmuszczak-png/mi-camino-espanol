// Odmiana polskich czasowników (tryb dla hiszpańskojęzycznych). Czyste funkcje, bez DOM.
// Czas teraźniejszy / przyszły prosty wyprowadzamy z 1. i 2. osoby liczby pojedynczej:
//   -ę / -esz, -isz, -ysz: robię, robisz → robi, robimy, robicie, robią (3. os. l. mn. od tematu 1. osoby)
//   -m / -sz:               czytam, czytasz → czyta, czytamy, czytacie, czytają
// Czas przeszły z bezokolicznika (-ć → -ł, -eć → -ał/-eli, -ąć → -ął/-ęła), nieregularne podane w danych.
// Format danych: bezokolicznik|1 os.|2 os.|rozkaz. 2 os. (- = brak)|znaczenie po hiszpańsku|poziom|aspekt n/d|para aspektowa|przeszły m,ż,mos (opcj.)|3 os. l. mn. (opcj.)
const DANE = `być|-|-|bądź|ser, estar|A1|n|||
mieć|mam|masz|miej|tener|A1|n|||
robić|robię|robisz|rób|hacer|A1|n|zrobić||
iść|idę|idziesz|idź|ir (a pie, ahora)|A1|n|pójść|szedł,szła,szli|
jechać|jadę|jedziesz|jedź|ir (en vehículo, ahora)|A1|n|pojechać||
chodzić|chodzę|chodzisz|chodź|ir, andar (habitualmente)|A1|n|||
mówić|mówię|mówisz|mów|hablar, decir|A1|n|powiedzieć||
pisać|piszę|piszesz|pisz|escribir|A1|n|napisać||
czytać|czytam|czytasz|czytaj|leer|A1|n|przeczytać||
jeść|jem|jesz|jedz|comer|A1|n|zjeść|jadł,jadła,jedli|jedzą
pić|piję|pijesz|pij|beber|A1|n|wypić||
spać|śpię|śpisz|śpij|dormir|A1|n|||
lubić|lubię|lubisz|-|gustar (algo a alguien)|A1|n|||
kochać|kocham|kochasz|kochaj|amar, querer (a alguien)|A1|n|||
chcieć|chcę|chcesz|-|querer|A1|n|||
móc|mogę|możesz|-|poder|A1|n||mógł,mogła,mogli|
wiedzieć|wiem|wiesz|wiedz|saber|A1|n|||wiedzą
znać|znam|znasz|znaj|conocer|A1|n|||
rozumieć|rozumiem|rozumiesz|-|entender|A1|n|zrozumieć||
mieszkać|mieszkam|mieszkasz|mieszkaj|vivir (residir)|A1|n|||
pracować|pracuję|pracujesz|pracuj|trabajar|A1|n|||
uczyć się|uczę|uczysz|ucz|aprender, estudiar|A1|n|||
słuchać|słucham|słuchasz|słuchaj|escuchar|A1|n|||
patrzeć|patrzę|patrzysz|patrz|mirar|A1|n||patrzył,patrzyła,patrzyli|
widzieć|widzę|widzisz|-|ver|A1|n|zobaczyć||
kupować|kupuję|kupujesz|kupuj|comprar|A1|n|kupić||
płacić|płacę|płacisz|płać|pagar|A1|n|zapłacić||
gotować|gotuję|gotujesz|gotuj|cocinar|A1|n|||
grać|gram|grasz|graj|jugar, tocar (un instrumento)|A1|n|||
pytać|pytam|pytasz|pytaj|preguntar|A1|n|||
dawać|daję|dajesz|dawaj|dar|A1|n|dać||
brać|biorę|bierzesz|bierz|tomar, coger|A1|n|wziąć||
otwierać|otwieram|otwierasz|otwieraj|abrir|A1|n|otworzyć||
zamykać|zamykam|zamykasz|zamykaj|cerrar|A1|n|zamknąć||
czekać|czekam|czekasz|czekaj|esperar|A1|n|||
szukać|szukam|szukasz|szukaj|buscar|A1|n|||
musieć|muszę|musisz|-|deber, tener que|A1|n|||
potrzebować|potrzebuję|potrzebujesz|-|necesitar|A1|n|||
nazywać się|nazywam|nazywasz|-|llamarse|A1|n|||
rozmawiać|rozmawiam|rozmawiasz|rozmawiaj|conversar, hablar con alguien|A1|n|||
myśleć|myślę|myślisz|myśl|pensar|A1|n|||
pomagać|pomagam|pomagasz|pomagaj|ayudar|A1|n|pomóc||
prosić|proszę|prosisz|proś|pedir|A1|n|||
dziękować|dziękuję|dziękujesz|dziękuj|dar las gracias|A1|n|||
wracać|wracam|wracasz|wracaj|volver|A1|n|wrócić||
dzwonić|dzwonię|dzwonisz|dzwoń|llamar (por teléfono)|A1|n|zadzwonić||
stać|stoję|stoisz|stój|estar de pie|A1|n|||
siedzieć|siedzę|siedzisz|siedź|estar sentado|A1|n|||
tańczyć|tańczę|tańczysz|tańcz|bailar|A1|n|||
śpiewać|śpiewam|śpiewasz|śpiewaj|cantar|A1|n|||
pływać|pływam|pływasz|pływaj|nadar|A1|n|||
biegać|biegam|biegasz|biegaj|correr (hacer footing)|A1|n|||
myć|myję|myjesz|myj|lavar|A1|n|umyć||
wstawać|wstaję|wstajesz|wstawaj|levantarse|A1|n|wstać||
kosztować|kosztuję|kosztujesz|-|costar|A1|n|||
odpowiadać|odpowiadam|odpowiadasz|odpowiadaj|responder|A2|n|odpowiedzieć||
jeździć|jeżdżę|jeździsz|jeźdź|ir en vehículo (habitualmente), montar|A2|n|||
przychodzić|przychodzę|przychodzisz|przychodź|venir, llegar|A2|n|przyjść||
lecieć|lecę|lecisz|leć|volar, ir en avión (ahora)|A2|n|polecieć||
latać|latam|latasz|lataj|volar (habitualmente)|A2|n|||
podróżować|podróżuję|podróżujesz|podróżuj|viajar|A2|n|||
pamiętać|pamiętam|pamiętasz|pamiętaj|recordar|A2|n|||
zapominać|zapominam|zapominasz|zapominaj|olvidar|A2|n|zapomnieć||
sprzedawać|sprzedaję|sprzedajesz|sprzedawaj|vender|A2|n|sprzedać||
ubierać się|ubieram|ubierasz|ubieraj|vestirse|A2|n|||
zaczynać|zaczynam|zaczynasz|zaczynaj|empezar|A2|n|zacząć||
kończyć|kończę|kończysz|kończ|terminar|A2|n|skończyć||
uczyć|uczę|uczysz|ucz|enseñar|A2|n|||
spotykać się|spotykam|spotykasz|spotykaj|quedar, verse con alguien|A2|n|spotkać się||
bać się|boję|boisz|nie bój|tener miedo|A2|n|||
śmiać się|śmieję|śmiejesz|śmiej|reír|A2|n|||
umieć|umiem|umiesz|-|saber (hacer algo)|A2|n|||
woleć|wolę|wolisz|-|preferir|A2|n|||
żyć|żyję|żyjesz|żyj|vivir (estar vivo)|A2|n|||
czuć się|czuję|czujesz|czuj|sentirse|A2|n|||
próbować|próbuję|próbujesz|próbuj|intentar, probar|A2|n|spróbować||
wysyłać|wysyłam|wysyłasz|wysyłaj|enviar|A2|n|wysłać||
odpoczywać|odpoczywam|odpoczywasz|odpoczywaj|descansar|A2|n|odpocząć||
zrobić|zrobię|zrobisz|zrób|hacer (perfectivo)|A2|d|robić||
pójść|pójdę|pójdziesz|pójdź|ir (perfectivo)|A2|d|iść|poszedł,poszła,poszli|
pojechać|pojadę|pojedziesz|pojedź|ir en vehículo (perfectivo)|A2|d|jechać||
powiedzieć|powiem|powiesz|powiedz|decir (perfectivo)|A2|d|mówić||powiedzą
napisać|napiszę|napiszesz|napisz|escribir (perfectivo)|A2|d|pisać||
przeczytać|przeczytam|przeczytasz|przeczytaj|leer (perfectivo)|A2|d|czytać||
zjeść|zjem|zjesz|zjedz|comer (perfectivo)|A2|d|jeść|zjadł,zjadła,zjedli|zjedzą
wypić|wypiję|wypijesz|wypij|beber (perfectivo)|A2|d|pić||
kupić|kupię|kupisz|kup|comprar (perfectivo)|A2|d|kupować||
zapłacić|zapłacę|zapłacisz|zapłać|pagar (perfectivo)|A2|d|płacić||
zobaczyć|zobaczę|zobaczysz|zobacz|ver (perfectivo)|A2|d|widzieć||
dać|dam|dasz|daj|dar (perfectivo)|A2|d|dawać||dadzą
wziąć|wezmę|weźmiesz|weź|tomar, coger (perfectivo)|A2|d|brać||
otworzyć|otworzę|otworzysz|otwórz|abrir (perfectivo)|A2|d|otwierać||
zamknąć|zamknę|zamkniesz|zamknij|cerrar (perfectivo)|A2|d|zamykać||
wrócić|wrócę|wrócisz|wróć|volver (perfectivo)|A2|d|wracać||
przyjść|przyjdę|przyjdziesz|przyjdź|venir, llegar (perfectivo)|A2|d|przychodzić|przyszedł,przyszła,przyszli|
zadzwonić|zadzwonię|zadzwonisz|zadzwoń|llamar por teléfono (perfectivo)|A2|d|dzwonić||
pomóc|pomogę|pomożesz|pomóż|ayudar (perfectivo)|A2|d|pomagać|pomógł,pomogła,pomogli|
wstać|wstanę|wstaniesz|wstań|levantarse (perfectivo)|A2|d|wstawać||
zapomnieć|zapomnę|zapomnisz|zapomnij|olvidar (perfectivo)|A2|d|zapominać||
umyć|umyję|umyjesz|umyj|lavar (perfectivo)|A2|d|myć||
zrozumieć|zrozumiem|zrozumiesz|zrozum|entender (perfectivo)|B1|d|rozumieć||
odpowiedzieć|odpowiem|odpowiesz|odpowiedz|responder (perfectivo)|B1|d|odpowiadać||odpowiedzą
sprzedać|sprzedam|sprzedasz|sprzedaj|vender (perfectivo)|B1|d|sprzedawać||sprzedadzą
zacząć|zacznę|zaczniesz|zacznij|empezar (perfectivo)|B1|d|zaczynać||
skończyć|skończę|skończysz|skończ|terminar (perfectivo)|B1|d|kończyć||
spotkać się|spotkam|spotkasz|spotkaj|quedar, verse (perfectivo)|B1|d|spotykać się||
spróbować|spróbuję|spróbujesz|spróbuj|intentar, probar (perfectivo)|B1|d|próbować||
wysłać|wyślę|wyślesz|wyślij|enviar (perfectivo)|B1|d|wysyłać||
odpocząć|odpocznę|odpoczniesz|odpocznij|descansar (perfectivo)|B1|d|odpoczywać||
polecieć|polecę|polecisz|poleć|volar (perfectivo)|B1|d|lecieć||
zostawać|zostaję|zostajesz|zostawaj|quedarse|B1|n|zostać||
zostać|zostanę|zostaniesz|zostań|quedarse (perfectivo)|B1|d|zostawać||
dostawać|dostaję|dostajesz|-|recibir|B1|n|dostać||
dostać|dostanę|dostaniesz|-|recibir (perfectivo)|B1|d|dostawać||
wybierać|wybieram|wybierasz|wybieraj|elegir|B1|n|wybrać||
wybrać|wybiorę|wybierzesz|wybierz|elegir (perfectivo)|B1|d|wybierać||
decydować|decyduję|decydujesz|decyduj|decidir|B1|n|zdecydować||
zdecydować|zdecyduję|zdecydujesz|zdecyduj|decidir (perfectivo)|B1|d|decydować||
zmieniać|zmieniam|zmieniasz|zmieniaj|cambiar|B1|n|zmienić||
zmienić|zmienię|zmienisz|zmień|cambiar (perfectivo)|B1|d|zmieniać||
pokazywać|pokazuję|pokazujesz|pokazuj|mostrar|B1|n|pokazać||
pokazać|pokażę|pokażesz|pokaż|mostrar (perfectivo)|B1|d|pokazywać||
wierzyć|wierzę|wierzysz|wierz|creer|B1|n|||
płakać|płaczę|płaczesz|płacz|llorar|B1|n|||
nieść|niosę|niesiesz|nieś|llevar (en la mano, ahora)|B1|n||niósł,niosła,nieśli|
rosnąć|rosnę|rośniesz|rośnij|crecer|B1|n||rósł,rosła,rośli|
tłumaczyć|tłumaczę|tłumaczysz|tłumacz|traducir, explicar|B1|n|||
budować|buduję|budujesz|buduj|construir|B1|n|||
martwić się|martwię|martwisz|nie martw|preocuparse|B1|n|||
cieszyć się|cieszę|cieszysz|ciesz|alegrarse|B1|n|||
denerwować się|denerwuję|denerwujesz|nie denerwuj|ponerse nervioso|B1|n|||
wydawać|wydaję|wydajesz|wydawaj|gastar (dinero)|B1|n|||
oszczędzać|oszczędzam|oszczędzasz|oszczędzaj|ahorrar|B1|n|||
pożyczać|pożyczam|pożyczasz|pożyczaj|prestar, pedir prestado|B1|n|||
zgadzać się|zgadzam|zgadzasz|zgadzaj|estar de acuerdo|B1|n|zgodzić się||
zgodzić się|zgodzę|zgodzisz|zgódź|aceptar, ponerse de acuerdo (perfectivo)|B2|d|zgadzać się||
przekonywać|przekonuję|przekonujesz|przekonuj|convencer|B2|n|przekonać||
przekonać|przekonam|przekonasz|przekonaj|convencer (perfectivo)|B2|d|przekonywać||
osiągać|osiągam|osiągasz|osiągaj|alcanzar, lograr|B2|n|osiągnąć||
osiągnąć|osiągnę|osiągniesz|osiągnij|lograr (perfectivo)|B2|d|osiągać||
rozwiązywać|rozwiązuję|rozwiązujesz|rozwiązuj|resolver|B2|n|rozwiązać||
rozwiązać|rozwiążę|rozwiążesz|rozwiąż|resolver (perfectivo)|B2|d|rozwiązywać||
unikać|unikam|unikasz|unikaj|evitar|B2|n|uniknąć||
uniknąć|uniknę|unikniesz|uniknij|evitar (perfectivo)|B2|d|unikać||
wyjaśniać|wyjaśniam|wyjaśniasz|wyjaśniaj|aclarar|B2|n|||
porównywać|porównuję|porównujesz|porównuj|comparar|B2|n|||
wpływać|wpływam|wpływasz|wpływaj|influir|B2|n|||
rozwijać|rozwijam|rozwijasz|rozwijaj|desarrollar|B2|n|||
twierdzić|twierdzę|twierdzisz|twierdź|afirmar, sostener|B2|n|||
spodziewać się|spodziewam|spodziewasz|spodziewaj|esperar (prever)|B2|n|||
przyznawać|przyznaję|przyznajesz|przyznawaj|admitir, reconocer|C1|n|||
podejrzewać|podejrzewam|podejrzewasz|podejrzewaj|sospechar|C1|n|||
zaniedbywać|zaniedbuję|zaniedbujesz|zaniedbuj|descuidar|C1|n|||
wahać się|waham|wahasz|nie wahaj|dudar, vacilar|C1|n|||
uzasadniać|uzasadniam|uzasadniasz|uzasadniaj|justificar|C1|n|||
dążyć|dążę|dążysz|dąż|aspirar a, tender a|C1|n|||
lekceważyć|lekceważę|lekceważysz|nie lekceważ|menospreciar, subestimar|C2|n|||
wzbraniać się|wzbraniam|wzbraniasz|nie wzbraniaj|resistirse a, negarse a|C2|n|||
pobłażać|pobłażam|pobłażasz|pobłażaj|ser indulgente|C2|n|||
roztrząsać|roztrząsam|roztrząsasz|roztrząsaj|darle vueltas a algo|C2|n|||`;

export const OSOBY_PL = [['ja', 'yo'], ['ty', 'tú'], ['on / ona / ono', 'él / ella'], ['my', 'nosotros'], ['wy', 'vosotros'], ['oni / one', 'ellos / ellas']];
export const CZASY_PL = [
  { k: 'ter', n: 'Presente', o: 'Acciones actuales o habituales. Solo los verbos imperfectivos tienen presente.' },
  { k: 'prz', n: 'Pasado', o: 'Se forma con -ł-; la forma cambia según el género: robiłem (él) / robiłam (ella).' },
  { k: 'przysz', n: 'Futuro', o: 'Imperfectivos: będę + infinitivo (proceso). Perfectivos: se conjugan como el presente (resultado).' },
  { k: 'war', n: 'Condicional', o: 'Pasado + by: robiłbym / robiłabym (yo haría).' },
  { k: 'rozk', n: 'Imperativo', o: 'Órdenes y peticiones: rób, róbmy, róbcie; niech + 3.ª persona.' },
];
export const POZIOM_CZASOW = { A1: ['ter', 'rozk'], A2: ['ter', 'prz', 'przysz', 'rozk'], B1: ['ter', 'prz', 'przysz', 'war', 'rozk'] };
export const czasyNaPoziomiePl = p => POZIOM_CZASOW[p] || POZIOM_CZASOW.B1;

const BEDE = ['będę', 'będziesz', 'będzie', 'będziemy', 'będziecie', 'będą'];

export const CZASOWNIKI_PL = DANE.trim().split('\n').map(l => {
  const [inf, s1, s2, imp, es, p, asp, para, prz, l3] = l.split('|');
  const zwrotny = / się$/.test(inf);
  return { inf, rdzen: inf.replace(/ się$/, ''), s1, s2, imp: imp === '-' ? '' : imp, es, p, asp: asp === 'd' ? 'dk' : 'ndk', para: para || '', prz: prz || '', l3: l3 || '', zwrotny };
});

// formy „prostego” czasu (teraźniejszy dla ndk, przyszły dla dk) bez „się”
function proste(v) {
  if (v.rdzen === 'być') return ['jestem', 'jesteś', 'jest', 'jesteśmy', 'jesteście', 'są'];
  const { s1, s2 } = v, b = s2.slice(0, -2);
  if (s1.endsWith('m')) return [s1, s2, b, b + 'my', b + 'cie', v.l3 || b + 'ją'];
  return [s1, s2, b, b + 'my', b + 'cie', v.l3 || s1.slice(0, -1) + 'ą'];
}
// temat czasu przeszłego: [męski 3 os., żeński 3 os., męskoosobowy l. mn.]
export function tematPrzeszly(v) {
  if (v.prz) return v.prz.split(',');
  const inf = v.rdzen;
  if (/eć$/.test(inf)) { const s = inf.slice(0, -2); return [s + 'ał', s + 'ała', s + 'eli']; }
  if (/ąć$/.test(inf)) { const s = inf.slice(0, -2); return [s + 'ął', s + 'ęła', s + 'ęli']; }
  const s = inf.slice(0, -1);
  return [s + 'ł', s + 'ła', s + 'li'];
}

/** Wszystkie formy: { ter, prz, przysz, war, rozk } – tablice 6 osób (null = brak formy). Formy rodzajowe rozdzielone „ / ”. */
export function formyPl(v) {
  const sie = v.zwrotny ? ' się' : '';
  const z = a => a.map(x => (x ? x.split(' / ').map(c => c + sie).join(' / ') : x));
  const pr = proste(v);
  const [m, f, mos] = tematPrzeszly(v), fs = f.slice(0, -1);
  const prz = [`${m}em / ${fs}am`, `${m}eś / ${fs}aś`, `${m} / ${f} / ${fs}o`, `${mos}śmy / ${fs}yśmy`, `${mos}ście / ${fs}yście`, `${mos} / ${fs}y`];
  const war = [`${m}bym / ${fs}abym`, `${m}byś / ${fs}abyś`, `${m}by / ${f}by`, `${mos}byśmy / ${fs}ybyśmy`, `${mos}byście / ${fs}ybyście`, `${mos}by / ${fs}yby`];
  const ndk = v.asp === 'ndk';
  const przysz = v.rdzen === 'być' ? BEDE.slice() : ndk ? BEDE.map(b => `${b} ${v.rdzen}`) : pr;
  const trzecia = v.rdzen === 'być' ? ['będzie', 'będą'] : [pr[2], pr[5]];
  const imp = v.imp;
  const niech = imp && imp.startsWith('nie ') ? 'niech nie' : 'niech';
  const rozk = imp ? [null, imp, `${niech} ${trzecia[0]}`, imp + 'my', imp + 'cie', `${niech} ${trzecia[1]}`] : null;
  return { ter: ndk ? z(pr) : null, prz: z(prz), przysz: z(przysz), war: z(war), rozk: rozk && z(rozk) };
}

// Wyjaśnienie (po hiszpańsku) sposobu tworzenia formy
export function regulaPl(v, czas) {
  if (czas === 'ter') return v.rdzen === 'być' ? 'Być es irregular: jestem, jesteś, jest, jesteśmy, jesteście, są.'
    : v.s1.endsWith('m') ? `Conjugación en -m / -sz: ${v.s1}, ${v.s2}… (3.ª plural: ${proste(v)[5]}).`
      : `Conjugación en -ę / -sz: la 1.ª persona (${v.s1}) y la 3.ª plural (${proste(v)[5]}) comparten la raíz; el resto sale de ${v.s2.slice(0, -2)}-.`;
  if (czas === 'prz') { const [m, f] = tematPrzeszly(v); return `Pasado: raíz ${m} (masc.) / ${f} (fem.) + terminaciones -em/-am, -eś/-aś, -śmy, -ście.${v.prz ? ' Forma irregular.' : ''}`; }
  if (czas === 'przysz') return v.asp === 'ndk' ? `Verbo imperfectivo: futuro compuesto będę + infinitivo (${v.rdzen}).` : `Verbo perfectivo: el futuro se conjuga como un presente (${v.s1}, ${v.s2}…). Par imperfectivo: ${v.para || '—'}.`;
  if (czas === 'war') return 'Condicional: forma del pasado + by + terminación personal (-m, -ś, -śmy, -ście).';
  return v.imp ? `Imperativo: ${v.imp}, ${v.imp}my, ${v.imp}cie; para él/ellos se usa niech + 3.ª persona.` : 'Este verbo casi no se usa en imperativo.';
}

export const ASPEKT = { ndk: 'imperfectivo', dk: 'perfectivo' };
