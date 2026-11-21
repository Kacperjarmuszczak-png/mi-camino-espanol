// Rozmówki podróżne: [po polsku, po hiszpańsku]. W trybie dla Hiszpanów pokazywana jest strona polska jako język nauki.
export const ROZMOWKI = [
  { id: 'podstawy', ik: '👋', pl: 'Podstawy', es: 'Lo básico', z: [
    ['Dzień dobry.', 'Buenos días.'], ['Dziękuję bardzo.', 'Muchas gracias.'], ['Przepraszam.', 'Perdón. / Disculpe.'], ['Nie rozumiem.', 'No entiendo.'],
    ['Czy mówi Pan(i) po angielsku?', '¿Habla usted inglés?'], ['Proszę mówić wolniej.', 'Más despacio, por favor.'], ['Ile to kosztuje?', '¿Cuánto cuesta?'], ['Gdzie jest toaleta?', '¿Dónde está el baño?'] ] },
  { id: 'lotnisko', ik: '✈️', pl: 'Lotnisko', es: 'Aeropuerto', z: [
    ['Gdzie jest odprawa?', '¿Dónde está la facturación?'], ['Mój lot jest opóźniony.', 'Mi vuelo tiene retraso.'], ['Zgubiłem bagaż.', 'He perdido mi equipaje.'], ['Która to bramka?', '¿Cuál es la puerta de embarque?'],
    ['Mam tylko bagaż podręczny.', 'Solo llevo equipaje de mano.'], ['Gdzie jest postój taksówek?', '¿Dónde está la parada de taxis?'], ['Ile kosztuje taksówka do centrum?', '¿Cuánto cuesta un taxi al centro?'], ['Czy jest autobus do miasta?', '¿Hay un autobús a la ciudad?'] ] },
  { id: 'hotel', ik: '🏨', pl: 'Hotel', es: 'Hotel', z: [
    ['Mam rezerwację.', 'Tengo una reserva.'], ['Czy macie wolny pokój?', '¿Tienen una habitación libre?'], ['Na dwie noce.', 'Para dos noches.'], ['O której jest śniadanie?', '¿A qué hora es el desayuno?'],
    ['Jakie jest hasło do wifi?', '¿Cuál es la contraseña del wifi?'], ['Klimatyzacja nie działa.', 'El aire acondicionado no funciona.'], ['Czy mogę zostawić bagaż?', '¿Puedo dejar el equipaje?'], ['Do której trzeba się wymeldować?', '¿A qué hora hay que dejar la habitación?'] ] },
  { id: 'restauracja', ik: '🍽️', pl: 'Restauracja', es: 'Restaurante', z: [
    ['Stolik dla dwóch osób, proszę.', 'Una mesa para dos, por favor.'], ['Poproszę kartę.', 'La carta, por favor.'], ['Co Pan(i) poleca?', '¿Qué me recomienda?'], ['Jestem wegetarianinem.', 'Soy vegetariano.'],
    ['Mam alergię na orzechy.', 'Tengo alergia a los frutos secos.'], ['Poproszę wodę bez gazu.', 'Agua sin gas, por favor.'], ['Rachunek, proszę.', 'La cuenta, por favor.'], ['Czy mogę zapłacić kartą?', '¿Puedo pagar con tarjeta?'] ] },
  { id: 'transport', ik: '🚌', pl: 'Transport', es: 'Transporte', z: [
    ['Jak dojść do centrum?', '¿Cómo llego al centro?'], ['Gdzie jest stacja metra?', '¿Dónde está la estación de metro?'], ['Bilet do Madrytu, proszę.', 'Un billete a Madrid, por favor.'], ['W jedną stronę czy w obie?', '¿Solo ida o ida y vuelta?'],
    ['Na którym przystanku mam wysiąść?', '¿En qué parada me bajo?'], ['Czy to daleko?', '¿Está lejos?'], ['Proszę mnie zawieźć na ten adres.', 'Lléveme a esta dirección, por favor.'], ['Chcę wypożyczyć samochód.', 'Quiero alquilar un coche.'] ] },
  { id: 'zakupy', ik: '🛍️', pl: 'Zakupy', es: 'Compras', z: [
    ['Tylko się rozglądam.', 'Solo estoy mirando.'], ['Czy macie to w innym rozmiarze?', '¿Lo tienen en otra talla?'], ['Mogę to przymierzyć?', '¿Me lo puedo probar?'], ['Gdzie jest przymierzalnia?', '¿Dónde está el probador?'],
    ['To za drogie.', 'Es demasiado caro.'], ['Wezmę to.', 'Me lo llevo.'], ['Czy mogę dostać paragon?', '¿Me da el tique, por favor?'], ['O której zamykacie?', '¿A qué hora cierran?'] ] },
  { id: 'apteka', ik: '💊', pl: 'Apteka i lekarz', es: 'Farmacia y médico', z: [
    ['Źle się czuję.', 'Me encuentro mal.'], ['Boli mnie głowa.', 'Me duele la cabeza.'], ['Mam gorączkę.', 'Tengo fiebre.'], ['Potrzebuję czegoś na kaszel.', 'Necesito algo para la tos.'],
    ['Jestem uczulony na penicylinę.', 'Soy alérgico a la penicilina.'], ['Gdzie jest najbliższa apteka?', '¿Dónde está la farmacia más cercana?'], ['Potrzebuję lekarza.', 'Necesito un médico.'], ['Mam ubezpieczenie.', 'Tengo seguro médico.'] ] },
  { id: 'nagle', ik: '🆘', pl: 'Nagłe wypadki', es: 'Emergencias', z: [
    ['Pomocy!', '¡Socorro! / ¡Ayuda!'], ['Proszę wezwać karetkę!', '¡Llame a una ambulancia!'], ['Proszę wezwać policję!', '¡Llame a la policía!'], ['Ukradli mi portfel.', 'Me han robado la cartera.'],
    ['Zgubiłem paszport.', 'He perdido el pasaporte.'], ['Miałem wypadek.', 'He tenido un accidente.'], ['Gdzie jest szpital?', '¿Dónde está el hospital?'], ['Numer alarmowy to 112.', 'El número de emergencias es el 112.'] ] },
];
