# Story 2.11: Neuen An- und Abpfiff abspielen

Status: Am 26.11.2026 nach der Praxisprüfung abgenommen. Das gemeinsame
Deployment mit Story 2.12 steht aus.
Epic: [Epic 2](./epic-2-DONE.md).
Lieferpaket 6 – Pfiff und Konfetti: eigener Story-Test und eigene Abnahme;
gemeinsamer Praxislauf und gemeinsames Deployment mit
[Story 2.12](./story-2_12-DONE.md), wenn die freigegebene Audiodatei vorliegt.
Startbedingung: [Story 2.10](./story-2_10-DONE.md) ist abgenommen. Die
Audiodatei muss mit Nutzungsfreigabe für die öffentliche App vorliegen.

Als spielende Person möchte ich am Kickertisch den Start und das Ende
einer Partie auch hören, ohne den Countdown beobachten zu müssen.

**Audioquelle:** Der Entwickler stellt die Aufnahme aus der
[YouTube-Referenz](https://www.youtube.com/watch?v=OzPkiXq7lzM) als
Audiodatei mit Nutzungsfreigabe bereit. Die App liefert die Datei lokal
mit aus und ruft YouTube weder zum Laden noch zum Abspielen auf.
Die öffentliche Auslieferung der bereitgestellten MP3 wurde am
26.11.2026 freigegeben.

## Akzeptanzszenarien

- **Anpfiff:** Gegeben ist eine startbereite Vorrunden- oder K.-o.-Partie
  mit erlaubter Audiowiedergabe. Wenn ich sie erfolgreich starte, beginnen
  der Countdown und der neue Pfiff; der Pfiff ertönt genau einmal. Ein
  Doppelklick, ein fehlgeschlagener Start oder das Wiederöffnen einer
  bereits laufenden Partie löst keinen zusätzlichen Anpfiff aus.
- **Abpfiff bei Zeitablauf:** Gegeben ist eine laufende Partie im aktiven
  Browser. Wenn die Spielzeit abläuft, ertönt dieselbe Aufnahme einmal
  und der sichtbare Ablaufhinweis erscheint. Die spätere
  Ergebnisspeicherung löst keinen zweiten Pfiff aus, auch nicht nach
  einem Entscheidungstor bei Gleichstand.
- **Vorzeitiges Ende:** Gegeben ist eine Partie vor Zeitablauf. Wenn
  ich ein gültiges Ergebnis mit zehn Toren für das Siegerteam erfolgreich
  speichere, ertönt einmal derselbe Abpfiff. Das Öffnen der Eingabe, eine
  ungültige Eingabe oder eine fehlgeschlagene Speicherung löst keinen
  vorzeitigen Pfiff aus. Beim ursprünglichen Endzeitpunkt folgt nach
  erfolgreicher Speicherung kein weiterer Pfiff. Beim Abbruch ertönt kein
  Abpfiff.
- **Audio nicht verfügbar:** Gegeben ist blockierte Audiowiedergabe oder
  eine nicht ladbare Datei. Wenn die App den Pfiff nicht abspielen kann,
  zeigt sie einen Hinweis; Countdown, sichtbare Ablaufanzeige und
  Ergebniseingabe bleiben nutzbar. Eine nach Zeitablauf neu geöffnete
  Partie zeigt den Ablaufhinweis ohne nachträglichen Pfiff.

## Prüfnachweis

- 29 betroffene Tests bestanden, einschließlich gesperrter Aktivierung,
  fehlender Datei, Doppelklick, Schreibfehler, vorzeitigem Ergebnis,
  Zeitablauf und erneutem Öffnen. TypeScript, Linter und Build sind
  erfolgreich; der Build enthält die unveränderte Aufnahme.
- Der lokale Browser hat die MP3 dekodiert und im Vorrundendurchlauf
  genau einmal nach dem Start und genau einmal nach gültigem vorzeitigem
  Speichern abgespielt. Beim Öffnen der Eingabe und beim ungültigen
  Speicherversuch wurde keine Wiedergabe gestartet. Der hörbare Pfiff
  am Turnierlaptop ist Teil der Praxisabnahme.
