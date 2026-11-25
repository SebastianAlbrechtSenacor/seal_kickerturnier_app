# Epic 2: Kickerturnier nach dem MVP optimieren

Status: Spezifikation für Stories 2.1 bis 2.12 am 25.11.2026 freigegeben.
Umsetzung noch nicht begonnen. Baut auf [Epic 1](./epic-1-DONE.md) auf.

## Ziel

Am Turnierlaptop sollen Teilnehmende mit weniger Klicks zur nächsten Partie
gelangen, Ergebnisse direkt erfassen und den Spielstand im Querformat im
Blick behalten. Die Gestaltung unterscheidet Vorrunde und K.-o.-Phase klar
und orientiert sich an den vorhandenen Werbeplakaten.

## Bestätigter Umfang

- Master-Code einmal je browserweiter Sitzung, auch tabübergreifend und
  nach Neuladen; kein Button **Anwendung sperren**.
- Kein Turnier-Code mehr beim Anlegen, Öffnen und Importieren. Turniere
  bleiben wie bisher lokal über Browser-Neustarts erhalten; alte
  JSON-Sicherungen lassen sich ohne Turnier-Code importieren.
- Kein Scrollen der Hauptanwendung ab der Referenzgröße von
  **1920 × 1080 CSS-Pixeln im Browser-Viewport bei 100 % Zoom** im
  Querformat. Umfangreiche Inhalte dürfen in eigenen Bereichen scrollen.
- Partievorbereitung als Standardansicht der laufenden Vorrunde, mit
  Turniername, **Turnier verlassen**, vollständiger Tabelle im Overlay und
  **K.O. Runde starten**. Kompakte Zeilen in beiden Tabellenversionen.
- Stabil dimensionierter Kickertisch mit seitlich herausragenden Stangen
  und eine vielfältigere Emoji-Palette.
- Direktes Speichern von Ergebnissen ohne Prüfansicht. Korrektur oder
  Löschung nur für die letzten drei Vorrundenspiele und nur bis zum
  K.-o.-Start. Der eingefrorene Qualifikationsstand bleibt unverändert.
- [Plakat 2](./design/werbeplakat-2.png) liefert das helle Standardschema,
  [Plakat 1](./design/werbeplakat-1.png) das dunklere K.-o.-Schema.
  Der Design-Feinschliff in Story 2.10 erfolgt erst nach Abnahme aller
  neun vorangehenden Stories.

## Freigegebene Ergänzung: Sound und Siegerehrung

- Derselbe neue Schiedsrichterpfiff ersetzt den bisherigen Sound und
  signalisiert Spielstart und Spielende. Die Aufnahme wird als Datei
  mit Freigabe für die Veröffentlichung in der App bereitgestellt.
- Die Siegerehrung erhält Konfetti-Kanonen von links, rechts und unten.
  Der Regen füllt den Viewport, dauert etwa 20 Sekunden und klingt mit
  einzelnen Konfettiteilen um Sekunde 60 aus. Er ist jederzeit stoppbar
  und endet spätestens nach 65 Sekunden.

## Ergänzende freigegebene Details

- Die browserweite Freigabe gilt im selben Browserprofil und für dieselbe
  App-Adresse. Test für das Sitzungsende ist ein vollständiger Neustart
  ohne Sitzungswiederherstellung; beim Wiederherstellen kann der Browser
  auch Sitzungsdaten wiederherstellen. Der Master-Code bleibt eine
  Frontend-Zugangshürde, keine sichere Anmeldung.
- Das K.-o.-Schema bleibt auf der Siegerehrung aktiv, bis das Turnier
  verlassen wird. Kleine Viewports, Hochformat oder stärkerer Zoom dürfen
  übersichtlich scrollen, statt Inhalte abzuschneiden.
- Weitere freigegebene Bedien- und Randfalldetails stehen
  in den jeweiligen Stories. Nicht ausdrücklich geänderte Turnierregeln,
  JSON-Sicherungsfunktionen und bestehende Schutzmechanismen bleiben erhalten.

## Stories und geplante Reihenfolge

1. [Master-Zugang für die Browsersitzung merken](./story-2_1.md)
2. [Turnier-Code vollständig entfernen](./story-2_2.md)
3. [Hauptansichten ohne Seitenscrollen im Querformat](./story-2_3.md)
4. [Partievorbereitung als Standardansicht](./story-2_4.md)
5. [Vorrundentabellen verdichten](./story-2_5.md)
6. [Kickertisch stabil darstellen und Stangen ergänzen](./story-2_6.md)
7. [Emoji-Avatare vielfältiger gestalten](./story-2_7.md)
8. [Ergebnisse direkt speichern und jüngste Vorrundenspiele korrigieren](./story-2_8.md)
9. [Farbschema mit Turnierphase wechseln](./story-2_9.md)
10. [Anwendung durch Design-Fachperson prüfen und verfeinern](./story-2_10.md)
11. [Neuen An- und Abpfiff abspielen](./story-2_11.md)
12. [Konfetti-Kanonen für die Siegerehrung](./story-2_12.md)

Nach Freigabe werden die Stories einzeln umgesetzt, geprüft und abgenommen.
Spätere Layoutänderungen müssen die bereits abgenommenen
Querformat-Kriterien weiterhin erfüllen.
