// Scenki rozmowy z lektorem. Każda kwestia: lektor mówi (es), podpowiedź co odpowiedzieć (pl), akceptowane odpowiedzi (es).
export const ROZMOWY = [
  { id: 'kawiarnia', p: 'A1', t: 'W kawiarni', ik: '☕', o: 'Zamawiasz kawę i płacisz.', kwestie: [
    { bot: '¡Hola! Buenos días. ¿Qué te pongo?', pl: 'Poproś o kawę z mlekiem.', odp: ['un café con leche, por favor', 'quiero un café con leche', 'me pone un café con leche', 'un café con leche'] },
    { bot: '¿Lo quieres grande o pequeño?', pl: 'Powiedz, że duży.', odp: ['grande, por favor', 'grande', 'lo quiero grande'] },
    { bot: '¿Algo más? Tenemos cruasanes muy buenos.', pl: 'Poproś też o rogalik (un cruasán).', odp: ['sí, un cruasán', 'un cruasán, por favor', 'sí, un cruasán, por favor', 'también un cruasán'] },
    { bot: 'Muy bien. Son cuatro euros con cincuenta.', pl: 'Zapytaj, czy możesz zapłacić kartą.', odp: ['¿puedo pagar con tarjeta?', 'con tarjeta, por favor', '¿se puede pagar con tarjeta?'] },
    { bot: 'Sí, claro. Aquí tienes. ¡Que aproveche!', pl: 'Podziękuj i pożegnaj się.', odp: ['muchas gracias, adiós', 'gracias, hasta luego', 'gracias, adiós', 'muchas gracias, hasta luego'] } ] },
  { id: 'droga', p: 'A1', t: 'Pytanie o drogę', ik: '🧭', o: 'Szukasz stacji metra.', kwestie: [
    { bot: 'Hola, ¿te puedo ayudar? Pareces perdido.', pl: 'Zapytaj, gdzie jest stacja metra.', odp: ['¿dónde está la estación de metro?', '¿dónde está el metro?', 'busco la estación de metro', '¿hay una estación de metro cerca?'] },
    { bot: 'Está cerca. Sigue todo recto y gira a la derecha.', pl: 'Zapytaj, czy to daleko.', odp: ['¿está lejos?', '¿está muy lejos?', '¿es lejos?'] },
    { bot: 'No, está a cinco minutos andando.', pl: 'Upewnij się: prosto i w prawo?', odp: ['todo recto y a la derecha', '¿todo recto y a la derecha?', 'recto y a la derecha'] },
    { bot: 'Exacto. No tiene pérdida.', pl: 'Podziękuj bardzo.', odp: ['muchas gracias', 'gracias', 'muchísimas gracias', 'muchas gracias por su ayuda'] } ] },
  { id: 'restauracja', p: 'A2', t: 'W restauracji', ik: '🍽️', o: 'Rezerwacja, zamówienie i rachunek.', kwestie: [
    { bot: 'Buenas noches. ¿Tienen reserva?', pl: 'Powiedz, że masz rezerwację na dwie osoby.', odp: ['sí, tenemos una reserva para dos', 'sí, una reserva para dos personas', 'tengo una reserva para dos', 'sí, para dos personas'] },
    { bot: 'Perfecto, pasen por aquí. ¿Qué van a tomar de primero?', pl: 'Zamów zupę dnia.', odp: ['la sopa del día', 'de primero, la sopa del día', 'quiero la sopa del día', 'para mí, la sopa del día'] },
    { bot: '¿Y de segundo?', pl: 'Zamów rybę z warzywami.', odp: ['pescado con verduras', 'de segundo, pescado con verduras', 'el pescado con verduras', 'quiero pescado con verduras'] },
    { bot: '¿Y para beber?', pl: 'Poproś o butelkę wody.', odp: ['una botella de agua', 'agua, por favor', 'una botella de agua, por favor'] },
    { bot: '¿Desean algo de postre?', pl: 'Podziękuj i poproś o rachunek.', odp: ['no, gracias. la cuenta, por favor', 'la cuenta, por favor', 'no, gracias, ¿nos trae la cuenta?', 'nada más, la cuenta por favor'] } ] },
  { id: 'hotel', p: 'A2', t: 'Zameldowanie w hotelu', ik: '🏨', o: 'Przyjazd do hotelu i pytania o pokój.', kwestie: [
    { bot: 'Bienvenido al hotel Sol. ¿En qué puedo ayudarle?', pl: 'Powiedz, że masz rezerwację na swoje nazwisko.', odp: ['tengo una reserva a mi nombre', 'tengo una reserva', 'hola, tengo una reserva a nombre de', 'tengo una habitación reservada'] },
    { bot: '¿Me deja su pasaporte, por favor?', pl: 'Powiedz „oczywiście, proszę”.', odp: ['claro, aquí tiene', 'sí, aquí tiene', 'por supuesto, aquí lo tiene', 'aquí tiene'] },
    { bot: 'Su habitación es la 305. ¿Necesita algo más?', pl: 'Zapytaj, o której jest śniadanie.', odp: ['¿a qué hora es el desayuno?', '¿cuándo es el desayuno?', '¿a qué hora se sirve el desayuno?'] },
    { bot: 'De siete a diez, en el comedor.', pl: 'Zapytaj, czy jest wifi.', odp: ['¿hay wifi?', '¿tienen wifi?', '¿cuál es la contraseña del wifi?', '¿hay wifi en la habitación?'] },
    { bot: 'Sí, la contraseña está en la tarjeta. ¡Que disfrute su estancia!', pl: 'Podziękuj.', odp: ['muchas gracias', 'gracias', 'muy amable, gracias'] } ] },
  { id: 'lekarz', p: 'B1', t: 'U lekarza', ik: '🩺', o: 'Opisujesz objawy.', kwestie: [
    { bot: 'Buenos días. Cuénteme, ¿qué le pasa?', pl: 'Powiedz, że od dwóch dni boli cię głowa.', odp: ['me duele la cabeza desde hace dos días', 'me duele la cabeza', 'tengo dolor de cabeza desde hace dos días', 'llevo dos días con dolor de cabeza'] },
    { bot: '¿Tiene fiebre?', pl: 'Powiedz, że trochę, 38 stopni.', odp: ['sí, un poco, treinta y ocho grados', 'un poco, treinta y ocho', 'sí, tengo treinta y ocho de fiebre', 'tengo un poco de fiebre'] },
    { bot: '¿Es alérgico a algún medicamento?', pl: 'Powiedz, że nie, nie masz alergii.', odp: ['no, no soy alérgico', 'no tengo alergias', 'no, a ninguno', 'no soy alérgica'] },
    { bot: 'Le voy a recetar un antiinflamatorio. Una pastilla cada ocho horas.', pl: 'Zapytaj, czy możesz iść do pracy.', odp: ['¿puedo ir a trabajar?', '¿puedo trabajar?', '¿puedo ir al trabajo?'] },
    { bot: 'Mejor descanse un par de días.', pl: 'Podziękuj lekarzowi.', odp: ['muchas gracias, doctor', 'gracias, doctor', 'muchas gracias', 'gracias, doctora'] } ] },
  { id: 'mieszkanie', p: 'B1', t: 'Wynajem mieszkania', ik: '🔑', o: 'Rozmowa z właścicielem mieszkania.', kwestie: [
    { bot: '¡Hola! ¿Llamas por el piso del anuncio?', pl: 'Potwierdź i zapytaj, czy jest jeszcze wolne.', odp: ['sí, ¿todavía está disponible?', 'sí, ¿sigue libre?', 'sí, ¿está libre todavía?', 'sí, ¿todavía está libre?'] },
    { bot: 'Sí, todavía está libre. Son ochocientos euros al mes.', pl: 'Zapytaj, czy w cenie są rachunki (gastos).', odp: ['¿los gastos están incluidos?', '¿están incluidos los gastos?', '¿el precio incluye los gastos?'] },
    { bot: 'El agua sí, la luz y el gas no.', pl: 'Zapytaj, kiedy możesz zobaczyć mieszkanie.', odp: ['¿cuándo puedo ver el piso?', '¿cuándo podría verlo?', '¿puedo verlo mañana?', '¿cuándo puedo verlo?'] },
    { bot: '¿Te viene bien mañana a las seis?', pl: 'Zgódź się: jutro o szóstej pasuje.', odp: ['sí, mañana a las seis me viene bien', 'perfecto, mañana a las seis', 'sí, me viene bien', 'vale, mañana a las seis'] } ] },
];
