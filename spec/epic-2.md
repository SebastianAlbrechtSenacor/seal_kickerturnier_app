# Epic 2: Kickerturnier nach dem MVP optimieren

Status: Spezifikation für Stories 2.1 bis 2.12 am 25.11.2026 freigegeben.
Paket 1: Stories 2.1 und 2.2 sind abgenommen. Lokaler Browser-
Regressionstest und Produktions-Build sind bestanden; das Deployment
steht aus. Baut auf [Epic 1](./epic-1-DONE.md) auf.
Paket 2 läuft: Story 2.3 wurde am 26.11.2026 nach erfolgreicher
Praxisprüfung einschließlich der Design-Ergänzung abgenommen.
Als Nächstes folgt Story 2.4.

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
- Überarbeitetes Layoutziel vom 26.11.2026: Kein Scrollen der
  Hauptanwendung ab **1280 × 720 CSS-Pixeln im Browser-Viewport bei
  100 % Zoom** im Querformat. Zusätzliche Praxisprüfung im normalen
  Firefox-Fenster am Turnierlaptop, gemessen bei **1485 × 871 CSS-Pixeln**.
  Kernaufgaben bleiben ohne Seitenscrollen bedienbar; Details sind auf
  Abruf erreichbar und umfangreiche Inhalte scrollen nur intern.
- Abgenommene Ergänzung in [Story 2.3](./story-2_3-DONE.md): mehr helle Arbeitsfläche,
  kompaktere Tabellen und Ergebnislisten, kontextbezogene Navigation
  und Export im Header sowie zusammengehörige Aktionen nebeneinander.
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

1. [Master-Zugang für die Browsersitzung merken](./story-2_1-DONE.md)
2. [Turnier-Code vollständig entfernen](./story-2_2-DONE.md)
3. [Hauptansichten ohne Seitenscrollen im Querformat](./story-2_3-DONE.md)
4. [Partievorbereitung als Standardansicht](./story-2_4.md)
5. [Vorrundentabellen verdichten](./story-2_5.md)
6. [Kickertisch stabil darstellen und Stangen ergänzen](./story-2_6.md)
7. [Emoji-Avatare vielfältiger gestalten](./story-2_7.md)
8. [Ergebnisse direkt speichern und jüngste Vorrundenspiele korrigieren](./story-2_8.md)
9. [Farbschema mit Turnierphase wechseln](./story-2_9.md)
10. [Anwendung durch Design-Fachperson prüfen und verfeinern](./story-2_10.md)
11. [Neuen An- und Abpfiff abspielen](./story-2_11.md)
12. [Konfetti-Kanonen für die Siegerehrung](./story-2_12.md)

## Lieferpakete für Test und Deployment

| Paket | Stories | Gemeinsamer Testschwerpunkt |
|---|---|---|
| 1 – Zugang und Import | 2.1, 2.2 | Master-Freigabe nach Neuladen und im neuen Tab, Browser-Neustart, Import einer alten Sicherung ohne Turnier-Code |
| 2 – Turnieransicht und Aufstellung | 2.3–2.7 | Querformat, Standardansicht, Tabellen-Overlay mit zwölf Spielenden, stabiler Kickertisch und neue Emojis |
| 3 – Ergebnisverwaltung | 2.8 | Direktes Speichern, Korrektur und Löschen, unveränderte K.-o.-Qualifikation nach dem Phasenwechsel |
| 4 – Phasenfarben | 2.9 | Helles Schema bis zum K.-o.-Start, dunkles Schema bis zur Siegerehrung und Rückkehr zum hellen Schema |
| 5 – Design-Feinschliff | 2.10 | Fachreview und visuelle Abnahme nach Abnahme aller Stories 2.1–2.9 |
| 6 – Pfiff und Konfetti | 2.11, 2.12 | Praxislauf vom Anpfiff bis zur Siegerehrung; gemeinsames Deployment bei vorliegender Audiodatei mit Nutzungsfreigabe |

Die Pakete bündeln Testdaten, Browser-Testaufbau und Deployment, nicht die
Abnahme der einzelnen Stories. Nach [agents.md](../agents.md) wird jede
Story einzeln umgesetzt und anhand ihrer Akzeptanzkriterien geprüft. Nach
jeder Story werden die Ergebnisse dokumentiert und wird Feedback eingeholt.
Noch offene Entwicklerprüfungen werden mit Testschritten und erwartetem
Ergebnis benannt. Erst nach Rückmeldung und Abschluss dieser Prüfungen
beginnt die nächste Story, auch innerhalb desselben Pakets.

Nach Abnahme der Paket-Stories folgen ein gemeinsamer Browser-Regressionstest,
ein gemeinsames Deployment und gebündeltes Feedback zum Zusammenspiel. Diese
Paketprüfung ersetzt keine Story-Abnahme. Bereits abgenommene Kriterien,
insbesondere zur Darstellung im Querformat, werden bei späteren Änderungen
erneut geprüft.

Fehlt die freigegebene Audiodatei, kann Paket 6 getrennt ausgeliefert werden.
Damit das Konfetti nicht auf die Datei warten muss, kann Story 2.12 nach
Abnahme von 2.10 mit ausdrücklicher Freigabe einer geänderten Reihenfolge
vorgezogen werden. Bis dahin gilt die festgelegte Reihenfolge.
