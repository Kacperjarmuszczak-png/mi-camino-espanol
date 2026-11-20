// Polskie przypadki (deklinacja rzeczowników) dla osób hiszpańskojęzycznych. Czyste dane i funkcje.
// Format: mianownik|dopełniacz|celownik|biernik|narzędnik|miejscownik|znaczenie (ES)|rodzaj|grupa (o: osoba, r: rzecz, m: miejsce)|przyimek miejsca
const DANE = `brat|brata|bratu|brata|bratem|bracie|el hermano|m|o
siostra|siostry|siostrze|siostrę|siostrą|siostrze|la hermana|f|o
mama|mamy|mamie|mamę|mamą|mamie|la mamá|f|o
tata|taty|tacie|tatę|tatą|tacie|el papá|m|o
przyjaciel|przyjaciela|przyjacielowi|przyjaciela|przyjacielem|przyjacielu|el amigo|m|o
koleżanka|koleżanki|koleżance|koleżankę|koleżanką|koleżance|la compañera, la amiga|f|o
nauczyciel|nauczyciela|nauczycielowi|nauczyciela|nauczycielem|nauczycielu|el profesor|m|o
lekarz|lekarza|lekarzowi|lekarza|lekarzem|lekarzu|el médico|m|o
dziecko|dziecka|dziecku|dziecko|dzieckiem|dziecku|el niño, la niña|n|o
kot|kota|kotu|kota|kotem|kocie|el gato|m|o
pies|psa|psu|psa|psem|psie|el perro|m|o
dom|domu|domowi|dom|domem|domu|la casa|m|r
samochód|samochodu|samochodowi|samochód|samochodem|samochodzie|el coche|m|r
książka|książki|książce|książkę|książką|książce|el libro|f|r
kawa|kawy|kawie|kawę|kawą|kawie|el café|f|r
herbata|herbaty|herbacie|herbatę|herbatą|herbacie|el té|f|r
mleko|mleka|mleku|mleko|mlekiem|mleku|la leche|n|r
chleb|chleba|chlebowi|chleb|chlebem|chlebie|el pan|m|r
telefon|telefonu|telefonowi|telefon|telefonem|telefonie|el teléfono|m|r
komputer|komputera|komputerowi|komputer|komputerem|komputerze|el ordenador|m|r
rower|roweru|rowerowi|rower|rowerem|rowerze|la bicicleta|m|r
klucz|klucza|kluczowi|klucz|kluczem|kluczu|la llave|m|r
okno|okna|oknu|okno|oknem|oknie|la ventana|n|r
muzyka|muzyki|muzyce|muzykę|muzyką|muzyce|la música|f|r
praca|pracy|pracy|pracę|pracą|pracy|el trabajo|f|r
woda|wody|wodzie|wodę|wodą|wodzie|el agua|f|r
kino|kina|kinu|kino|kinem|kinie|el cine|n|m|w
szkoła|szkoły|szkole|szkołę|szkołą|szkole|la escuela|f|m|w
sklep|sklepu|sklepowi|sklep|sklepem|sklepie|la tienda|m|m|w
restauracja|restauracji|restauracji|restaurację|restauracją|restauracji|el restaurante|f|m|w
biuro|biura|biuru|biuro|biurem|biurze|la oficina|n|m|w
miasto|miasta|miastu|miasto|miastem|mieście|la ciudad|n|m|w
park|parku|parkowi|park|parkiem|parku|el parque|m|m|w
kuchnia|kuchni|kuchni|kuchnię|kuchnią|kuchni|la cocina|f|m|w
poczta|poczty|poczcie|pocztę|pocztą|poczcie|correos|f|m|na
dworzec|dworca|dworcowi|dworzec|dworcem|dworcu|la estación|m|m|na
plaża|plaży|plaży|plażę|plażą|plaży|la playa|f|m|na
uniwersytet|uniwersytetu|uniwersytetowi|uniwersytet|uniwersytetem|uniwersytecie|la universidad|m|m|na
Polska|Polski|Polsce|Polskę|Polską|Polsce|Polonia|f|m|w
Hiszpania|Hiszpanii|Hiszpanii|Hiszpanię|Hiszpanią|Hiszpanii|España|f|m|w
Warszawa|Warszawy|Warszawie|Warszawę|Warszawą|Warszawie|Varsovia|f|m|w
Kraków|Krakowa|Krakowowi|Kraków|Krakowem|Krakowie|Cracovia|m|m|w`;

export const PRZYPADKI = [
  { k: 'mian', n: 'Nominativo', pl: 'mianownik', pyt: 'kto? co?', o: 'Sujeto de la frase: To jest brat.' },
  { k: 'dop', n: 'Genitivo', pl: 'dopełniacz', pyt: 'kogo? czego?', o: 'Negación (nie mam…), cantidad, posesión y preposiciones do, z (de), bez, u, dla.' },
  { k: 'cel', n: 'Dativo', pl: 'celownik', pyt: 'komu? czemu?', o: 'Destinatario: dar algo a alguien (daję bratu).' },
  { k: 'bier', n: 'Acusativo', pl: 'biernik', pyt: 'kogo? co?', o: 'Objeto directo: widzę, mam, lubię, kupuję + acusativo.' },
  { k: 'narz', n: 'Instrumental', pl: 'narzędnik', pyt: 'z kim? z czym?', o: 'Con (z + instrumental), profesión con być (jestem lekarzem) e interesować się.' },
  { k: 'miej', n: 'Locativo', pl: 'miejscownik', pyt: 'o kim? o czym?', o: 'Siempre con preposición: w, na, o, przy, po (jestem w kinie, mówię o pracy).' },
];
const KLUCZE = ['mian', 'dop', 'cel', 'bier', 'narz', 'miej'];

export const RZECZOWNIKI = DANE.trim().split('\n').map(l => {
  const c = l.split('|');
  const formy = Object.fromEntries(KLUCZE.map((k, i) => [k, c[i]]));
  return { id: 'pn:' + c[0], formy, es: c[6], rodzaj: c[7], grupa: c[8], przyimek: c[9] || '' };
});

// ramki zdań: przypadek → grupa → szablon (___ = rzeczownik) i tłumaczenie
const RAMKI = {
  dop: { o: ['Nie mam ___.', 'No tengo …'], r: ['Potrzebuję ___.', 'Necesito …'], m: ['Wracam z ___.', 'Vuelvo de …'] },
  cel: { o: ['Daję prezent ___.', 'Le doy un regalo a …'], r: ['Przyglądam się ___.', 'Observo …'], m: ['Przyglądam się ___.', 'Observo …'] },
  bier: { o: ['Widzę ___.', 'Veo a …'], r: ['Lubię ___.', 'Me gusta …'], m: ['Lubię ___.', 'Me gusta …'] },
  narz: { o: ['Rozmawiam z ___.', 'Hablo con …'], r: ['Co zrobić z ___?', '¿Qué hago con …?'], m: ['Interesuję się ___.', 'Me intereso por …'] },
  miej: { o: ['Myślę o ___.', 'Pienso en …'], r: ['Mówię o ___.', 'Hablo de …'], m: [null, 'Estoy en …'] },
};

/** Zadanie: { r, przypadek, zdanie, tlum, odp } */
export function zadanie(r, przypadek) {
  const [szablon, tlum] = RAMKI[przypadek][r.grupa];
  const zdanie = szablon || `Jestem ${r.przyimek} ___.`;
  const slowo = r.es.split(',')[0].trim();
  const bezRodz = /^(No tengo|Necesito)/.test(tlum) ? slowo.replace(/^(el|la|los|las) /, '') : slowo;
  const zdanieEs = tlum.replace('…', bezRodz).replace(/\ba el\b/g, 'al').replace(/\bde el\b/g, 'del');
  return { r, przypadek, zdanie, tlum: zdanieEs, odp: r.formy[przypadek] };
}
