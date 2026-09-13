# Historia projektu

Użytkownik chce mieć możliwość powrotu do wcześniejszych wersji projektu.
Po każdej ukończonej, zweryfikowanej zmianie wykonaj lokalny commit Git
z opisem rzeczywistej zmiany, chyba że użytkownik poprosi inaczej.
Przed commitem sprawdź diff oraz wykonaj odpowiednie testy (`npm test`).
Nie dołączaj sekretów, plików tymczasowych ani niezwiązanych zmian użytkownika.
Nie przepisuj istniejącej historii (amend, reset, force push) bez wyraźnego
polecenia. Nie publikuj repozytorium ani nie wykonuj push bez prośby użytkownika.
Do cofania zapisanych zmian preferuj `git revert`, zachowujący historię.
