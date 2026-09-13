# Borowy — Leśny Strażnik 0.7

Grywalny prototyp mobilnej gry fantasy top-down z proceduralnym otwartym światem. Mały bohater 16×16 px, bez wygładzania i ze wspólną siatką pikseli wszystkich elementów świata. Działa w przeglądarce; nie wymaga bibliotek ani kompilacji.

## Uruchomienie

W katalogu projektu uruchom `npm start` (Python 3), następnie otwórz http://localhost:4174. Można użyć dowolnego serwera statycznego obsługującego moduły JavaScript.

Na telefonie w tej samej sieci: uruchom `python3 -m http.server 4174 --bind 0.0.0.0`, a następnie otwórz adres IP komputera z portem 4174.

## Rzadkie zamki (0.7)

Około 4% kandydatów na osadę jest zamienianych w zamek, z wyłączeniem osady startowej. Losowanie zależy od ziarna i współrzędnych; warownie są znacznie rzadsze od wiosek i są odtwarzane po powrocie. Każda ma cztery kamienne wieże z czerwonymi dachami, główną basztę, mury, brukowany dziedziniec, studnię, fosę oraz cztery mosty i bramy. Dziedziniec jest dostępny, a woda, ściany i baszty blokują ruch. Nie ma jeszcze wnętrz ani mieszkańców zamku.

Minimapa oznacza wieże na złoto, HUD wyświetla nazwę warowni. `src/castles.js` zawiera układ, teren fosy i rysowanie na wspólnej siatce pikseli. Zamki korzystają z istniejącego strumieniowania fragmentów mapy. 19 testów przeszło, w tym częstość występowania, powtarzalność, brak zamku na starcie, unikalność obiektów w fragmentach oraz przejezdność wszystkich mostów i bram.

## Obrócone budynki i skupiska (0.6)

Domy mają teraz różne rzeczywiste kąty, także ukośne, dobierane względem drogi lub dziedzińca. Generator losuje 5–8 domów oraz oberżę i stajnię w trzech rodzajach układu: wzdłuż traktu, wokół bocznych dziedzińców i w luźnych skupiskach. Nie korzysta już ze stałej listy pozycji domów. Odrzuca pozycje z nakładającymi się obrysami i rezerwuje wolne główne ulice. Ścieżki wyznacza wyszukiwaniem przejścia do obróconych wejść oraz bramy wybiegu, z uwzględnieniem ścian i płotów.

`src/geometry.js` definiuje obrócone obrysy, kolizje i pozycje drzwi. Grafika budynków jest obracana na bazowej siatce pikseli i zapamiętywana w ograniczonej pamięci podręcznej; nie używa rozmywającej rotacji CSS. Kamera, postać i wspólna skala pikseli pozostają bez zmian.

16 testów przeszło, w tym dostępność drzwi i różnorodność kątów dla 30 ziaren, kolizje obróconych ścian, brak nakładania budynków oraz rysowanie na całkowitych pikselach. Układ sprawdzono też w podglądzie przeglądarkowym.

## Swobodniejsze wioski (0.5)

Generator wybiera trzy asymetryczne rozkłady zabudowy: wydłużony, rozproszony wokół placu i skupiska boczne. Pozycje domów, ich rozmiary i palety dachów zależą od ziarna. Ulice mają łagodne zakręty, a węższe odnogi prowadzą pod drzwi. Wybieg i wyposażenie stajni podążają za jej położeniem. Zieleń wraca w niezabudowane przestrzenie, bez zablokowania wejść. Test dla 30 ziaren sprawdza różnorodność, odstępy budynków i osiągalność wszystkich wejść z placu.

Projekt znajduje się teraz w katalogu `orcfall`, a lokalny podgląd działa na porcie 4174.

## Oprawa RPG (0.4)

Nowa referencja wyznacza ciemniejszą, bardziej szczegółową paletę: teksturowana trawa, postrzępione brzegi traktów, duże iglaste i liściaste korony drzew, cieniowane kamienie oraz ciemniejsze drewno. Osady mają też beczki i skrzynie. Wszystko pozostaje rysowane na bazowej siatce pikseli, bez interpolacji obrazu.

Gra wypełnia ekran. Portret, pasek zdrowia (nadal treningowy), niebieski wskaźnik odnowienia uniku oraz panel eksploracji są nałożone na świat. Minimapę okolicy odświeża generator terenu; pokazuje trakty, lasy, zabudowę i pozycję bohatera. Przyciski ekranowe i joystick są dostępne również myszą. Nowa oprawa nie dodaje jeszcze walki z orkami ani rzeki z referencji.

`src/scenery.js` przechowuje generator i pamięć sprite’ów drzew oraz skał. HUD minimapy jest częścią `src/game.js`.

## Miasteczka i spójne piksele (0.3)

- Pierwsza osada znajduje się przy starcie. Kolejne powstają przy wybranych skrzyżowaniach odległych traktów: kandydaci są rozstawieni co 1280 jednostek świata, a generator obsadza około 72% tych miejsc. Pomiędzy nimi pozostają dzikie tereny.
- Osada ma od pięciu do ośmiu domów, oberżę z szyldem, stajnię, ogrodzony wybieg z koniem, poidło, studnię i drogowskaz. Nazwa pojawia się w HUD; przy zbliżeniu widać nazwę wybranego obiektu.
- Plac, główne ulice i brama wybiegu są dostępne dla bohatera. Budynki oraz płoty mają kolizje. Drzewa i skały mogą rosnąć w wolnych przestrzeniach osady, z zachowaniem odstępu od zabudowy i ścieżek. Runy pojawiają się poza osadą. Układ pozostaje taki sam po oddaleniu i powrocie.
- Budynki są na razie obiektami zewnętrznymi: wnętrza, handel, noclegi i jazda konna nie są jeszcze zaimplementowane. Miasteczka losują jeden z trzech układów, przesunięcia domów, rozmiary oraz kolory dachów.
- Każdy widoczny detal korzysta z tej samej bazowej siatki 1×1 px co bohater 16×16. Teren ma ograniczoną paletę oraz krawędzie rysowane co jeden piksel; nie miesza już dużych bloków terenu z drobnymi detalami sprite’ów.
- Canvas skaluje obraz dokładnie ×2 lub ×3 zależnie od szerokości miejsca na grę. Zmiana rozmiaru okna zmienia zasięg kamery, zamiast ułamkowo rozciągać piksele. Interfejs poza światem pozostaje zwykłym tekstem HTML.

## Świat proceduralny

- Mapa nie ma zamkniętej granicy planszy. Kolejne fragmenty 128×128 px generują się wokół kamery we wszystkich kierunkach, również przy ujemnych współrzędnych.
- Globalne pole wysokości tworzy pagórki: warstwowe kolory, kontury i cieniowanie pokazują zbocza w widoku pionowo z góry. Podejście pod górę spowalnia bohatera maksymalnie o 18%. To wysokość terenu 2D, bez perspektywy 3D, skakania i pionowych ścian.
- Pole gęstości lasu tworzy lasy i otwarte łąki. Kamienie występują częściej w wyższych partiach terenu. Przedmioty mają kolizje, a pobliskie korony drzew stają się częściowo przezroczyste.
- Sieć wijących się traktów łączy dalsze okolice. Generator zostawia wokół ścieżek odstęp od przeszkód. Plac startowy jest wolny od przeszkód.
- Każdy fragment zależy tylko od globalnych współrzędnych i ziarna. Kolejność odkrywania nie zmienia mapy. Powrót odtwarza ten sam krajobraz.
- Maksymalnie 64 fragmenty wraz z teksturami pozostają w pamięci podręcznej (same tekstury to ok. 4 MiB). Dalszy teren jest usuwany i odtwarzany na żądanie. Lista odwiedzonych obszarów i zebranych run pozostaje w pamięci bieżącej wyprawy.
- Runy pojawiają się proceduralnie na otwartym terenie. Zebrana runa nie wraca podczas tej samej wyprawy, nawet po usunięciu fragmentu z pamięci podręcznej.

## Sterowanie

WASD / strzałki: ruch. Spacja: miecz. Shift: unik (odnowienie 1,1 s). Escape: pauza. Na telefonie joystick oraz przyciski ataku i uniku obsługują jednoczesny dotyk. Utrata aktywności okna pauzuje grę. Dźwięk jest opcjonalny.

**Nowy świat** losuje nowe ziarno i rozpoczyna wyprawę od początku. **Restart wyprawy** zachowuje obecne ziarno, cofa do osady startowej i zeruje odkrycia oraz runy. Ziarno jest widoczne w prawym górnym rogu. W tej wersji nie ma trwałego zapisu: przeładowanie strony przywraca domyślne ziarno 8431.

## Struktura projektu

- `index.html` — interfejs i HUD.
- `src/style.css` — responsywny układ i przyciski dotykowe.
- `src/world.js` — deterministyczny szum, wysokość, lasy, trakty, obiekty, runy i pamięć fragmentów. Czysty JavaScript, niezależny od DOM.
- `src/settlements.js` — układ osad i pixel art budynków, studni, ogrodzeń oraz wyposażenia.
- `src/terrain.js` — renderowanie i pamięć tekstur terenu w Canvas 2D.
- `src/hero.js` — sprite, animacja, ruch i kolizje. Ruch w podkrokach chroni przed przechodzeniem przez skały podczas uniku.
- `src/game.js` — kamera, pętla gry, sterowanie, eksploracja, zbieranie run, walka z kukłą i audio.
- `tests/` — testy generatora, ruchu oraz pętli gry.

Uruchom `npm test` (Node.js 18+). Dziewiętnaście testów obejmuje m.in. wielofragmentową wędrówkę, współrzędne ujemne, powtarzalność po usunięciu z pamięci, ciągłość wysokości, różnorodność terenu, przejezdność traktów przy generowanych obiektach, ruch i kolizje, pauzę oraz zmianę ziarna. Dodatkowe testy osad sprawdzają ich odstępy, odtwarzanie, jednokrotne przypisanie do fragmentów, drożne ulice i bramę, kolizje ścian oraz całkowite współrzędne pikseli. Wygląd mapy i przycisk losowania sprawdzono także w przeglądarce; testy pętli korzystają z zastępczego Canvas.

## Zakres prototypu

Nie ma jeszcze orków, obrażeń, ekwipunku ani zapisu gry. Kukła przy osadzie pozwala ćwiczyć atak; serca są elementem docelowego HUD. To projekt przeglądarkowy, nie APK/IPA. Grafika powstaje bez zewnętrznych assetów. Opcjonalne fonty interfejsu z Google Fonts mają lokalne zamienniki systemowe.

### 0.8 — mieszkańcy i orki
Osady zamieszkują spacerujący ludzie. W dziczy pojawiają się orki: ścigają bohatera i sygnalizują cios. Miecz zabija orka po trzech trafieniach; ściany blokują ataki, a mieszkańcy są nietykalni. Bohater ma 6 punktów zdrowia, unik chroni przed trafieniem. Po śmierci można odrodzić się w początkowej osadzie, zachowując odkrycia i pokonanych przeciwników podczas tej rozgrywki. Minimapa pokazuje ludzi i orki.

### Krajobraz wiejski
Pola uprawne przy osadach, proceduralne rzeki i drewniane mosty na przecięciach z traktami. Woda blokuje ruch bohatera i NPC. Nad brzegami pojawiają się chaty rybackie z sieciami, beczką i łódką. Rzeki i mosty widać na minimapie.

## Historia wersji w Git

Obecny stan gry został zapisany jako punkt startowy `baseline-2026-09-13`.
Kolejne ukończone i sprawdzone zmiany zapisujemy w lokalnych commitach.
Repozytorium jest lokalne; kopia zdalna nie została skonfigurowana w ramach tej zmiany.

- Historia: `git log --oneline --decorate`
- Niezapisane zmiany: `git status` oraz `git diff`
- Cofnięcie konkretnego commita z zachowaniem historii: `git revert ID_COMMITA`
- Obejrzenie punktu startowego w osobnym katalogu: `git worktree add --detach ../orcfall-baseline baseline-2026-09-13`

Przed cofaniem zmian należy sprawdzić i zabezpieczyć niezacommitowaną pracę.
Git chroni zapisane wersje; lokalna historia nie zastępuje kopii zapasowej dysku.
Pliki robocze w `work/`, logi i pliki `.env` nie są wersjonowane.

### Rycerze w osadach
Każda wioska ma pięciu przyjaznych rycerzy w stalowych zbrojach, z tarczami i mieczami. Patrolują krótkie odcinki wokół swoich posterunków, respektują budynki i ogrodzenia. Nie można zranić ich mieczem bohatera. Na minimapie mają jasnoniebieskie znaczniki. Reagują na pobliskich orków i gobliny.

### Kupcy
W osadach kupcy jadą konnymi wozami z płóciennym zadaszeniem i towarem. Kursują między wioskami wzdłuż północno-południowych traktów, zatrzymują się na 8 sekund u celu i wracają. Poza wczytanym obszarem podróż jest wstrzymana, a pozycja zachowana do powrotu gracza. Są przyjaźni, a na minimapie mają złoty znacznik. Handel nie jest jeszcze dostępny.

### Wieże strażnicze
Każda wioska ma dwie drewniane wieże przy północnym i południowym podejściu. Mają podesty, drabiny, dachy i chorągwie; widoczny na podeście strażnik jest elementem grafiki. Wieże automatycznie ostrzeliwują najbliższego orka w promieniu 150 pikseli, co 1,3 sekundy. Strzały lecą łukiem ponad ogrodzeniami i zadają punkt obrażeń dopiero przy trafieniu; poruszający się cel może uniknąć pocisku. Ich podstawy blokują ruch, a rozmieszczenie pozostawia wolne drogi i budynki.

### Dzień i noc
Noc zaczyna się co 3 minuty aktywnej gry (3:00, 6:00, 9:00) i trwa minutę: 10 sekund zmierzchu, 40 sekund nocy i 10 sekund świtu. Pauza zatrzymuje cykl, restart wyprawy rozpoczyna nowy dzień. Niebieskie przyciemnienie obejmuje świat, a interfejs pozostaje czytelny.

### Nocne najazdy
Podczas każdej nocy pobliskie wioski otrzymują jedną falę trzynastu orków. Napastnicy podchodzą północnym traktem do centrum, atakują bohatera w zasięgu i są ostrzeliwani przez wieże. Nie niszczą jeszcze budynków ani nie walczą z mieszkańcami. Fala nie powiela się przy ponownym wczytaniu osady; kolejna noc przynosi kolejną trzynastkę. Najazdy odległych, niewczytanych osad nie są symulowane.

### Dodatkowe patrole
Każda wioska ma po pięciu łuczników i włóczników, oprócz pięciu rycerzy. Łucznicy noszą zielone stroje i łuki, włócznicy stalowe hełmy oraz długie włócznie. Są przyjaźni, patrolują posterunki i nie powielają się po powrocie do osady. Wspólnie z rycerzami walczą z pobliskimi orkami i goblinami.

### Walczące patrole i gobliny
Rycerze i włócznicy atakują pobliskich przeciwników wręcz, a łucznicy strzelają widocznymi strzałami. Po walce wracają na posterunki. W dziczy występują też mniejsze gobliny: mają 2 punkty zdrowia i są szybsze od orków. Wieże i żołnierze reagują na oba rodzaje przeciwników. Nocne fale liczą 13 orków.

### Obozy w dziczy
Poza wioskami, rzekami i traktami pojawiają się obozy z dwoma namiotami, ogniskiem i zapasami. Każdy zamieszkują dwa zwykłe orki, trzy gobliny i wielki ork: przywódca ma 10 punktów zdrowia i zadaje 2 punkty obrażeń. Pokonani mieszkańcy obozu nie odradzają się podczas tej samej wyprawy.
