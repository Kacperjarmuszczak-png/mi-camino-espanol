# mi-camino-espanol

Strona do nauki hiszpańskiego „Español JKF”. Wygląd skopiowany ze strony Fotografia JKF
(ciemna zieleń ze złotem, wyspa „Menu”, dolna kula). Czysty HTML, CSS i JS, bez serwera.

## Co jest na stronie

- **Fiszki** i **quiz** ze słownika (`slowa.js`: ponad 880 słów w 25 tematach).
- **Odmiana czasowników** (`czasowniki.js`: 338 czasowników, odmiana liczona regułami w 7 czasach,
  gerundio i participio) z ćwiczeniem wpisywania formy.
- **Słownik**, **zwroty** (`zwroty.js`: 154 zdania), **gramatyka** i **wymowa** (głos przeglądarki).
- Postęp tylko w przeglądarce (`localStorage`, klucz `jkf-es`).

Nowy czasownik: dopisz wiersz `bezokolicznik:znaczenie:znaczniki` w `czasowniki.js`
(znaczniki opisane na początku pliku). Nowe słowo: `hiszpański|polski` w odpowiednim temacie w `slowa.js`.

## Uruchomienie

```bash
python -m http.server 5510
```

Potem `http://localhost:5510/` (na telefonie `http://<IP-komputera>:5510/`).
Publikacja (np. Cloudflare Pages): cały folder, bez kroku budowania.
