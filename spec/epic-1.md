# Epic 1: Kickerturnier am Office-Kickertisch

Status: Spezifikation freigegeben am 24.11.2026. Story 1.1 einschliesslich
neutraler Zugangsmaske umgesetzt, getestet und am 24.11.2026 abgenommen.
Story 1.2 ist umgesetzt, getestet und vom Entwickler abgenommen.
Story 1.3 ist umgesetzt, getestet und am 24.11.2026 abgenommen.
Story 1.4 ist umgesetzt, getestet und am 24.11.2026 abgenommen.
Story 1.5 ist umgesetzt, getestet und am 25.11.2026 abgenommen.
Story 1.6 ist einschliesslich der UI-Rueckmeldung umgesetzt, getestet
und nach erfolgreichen erneuten Praxispruefungen ausdruecklich abgenommen.
Stories 1.7 bis 1.10 sind noch nicht implementiert;
das Epic bleibt offen.

## Ziel

Kolleg:innen organisieren und spielen ein Kickerturnier an einem gemeinsamen
Laptop. Wechselnde Zweierteams sammeln in der Vorrunde individuelle Punkte.
Die besten acht Personen spielen anschliessend in vier festen Teams die
Plaetze 1 bis 4 aus. Die Bedienung funktioniert mit Maus und Touch.

## Bestaetigter Umfang

- Deutschsprachige React-/TypeScript-Anwendung mit Vite in `app\`.
- Statisches Hosting auf GitHub Pages; Build und Deployment mit GitHub Actions.
- Master-Zugangscode vor der Anwendung, eigener Zugangscode je Turnier.
  Beide sind bewusst nur eine umgehbare Frontend-Zugangshuerde, keine sichere
  Authentifizierung. Es gibt keine Benutzerkonten oder separaten Adminrollen.
- Mehrere getrennte Turniere, automatisch lokal im selben Browser gespeichert.
  Kein Backend, keine Synchronisation zwischen Geraeten.
- Ausschliesslich JSON-Export/-Import als vollstaendige Sicherung;
  kein CSV-Export oder CSV-Import.
- Turnierdaten: Name, Datum/Uhrzeit, Spielort, Beschreibung, Partiedauer,
  Turnier-Zugangscode und Punkte fuer Sieg/Niederlage sowie geplante Dauer
  der Vorrunde und der K.-o.-Phase.
- Standard: 10 Minuten je Partie, 3 Punkte je Siegerperson, 1 Punkt je
  Verliererperson. Die Punkte sind vor Turnierstart konfigurierbar.
- Die geplanten Phasendauern sind vor Turnierstart konfigurierbar:
  standardmaessig 120 Minuten Vorrunde und 60 Minuten K.-o.-Phase.
  Daraus werden voraussichtlicher K.-o.-Beginn und Turnierende angezeigt;
  diese Planung steuert weder Partietimer noch tatsaechliche Phasenwechsel.
- Eindeutige Spitznamen und eindeutige Emoji-Avatare je Turnier.
- Start ab vier Personen; Einstellungen und Spielendenliste danach gesperrt.
- Genau vier verschiedene Personen je Vorrundenpartie, verteilt auf Weiss
  Angriff/Verteidigung und Schwarz Angriff/Verteidigung. Freigegebene
  Bedienkonkretisierung vom 25.11.2026: primaer Drag-and-drop mit Maus/Touch,
  alternativ Position und freie Person per Klick/Touch oder Tastatur auswaehlen.
  Tabelle links, Tisch rechts, Turnierinfos kompakt unten; auf schmalen
  Bildschirmen stehen Tabelle und Tisch untereinander.
  In der Partievorbereitung zeigt die schmalere Tabelle nur Rang, Spielende
  und Punkte. Am Tisch stehen sich Angriff und gegnerische Verteidigung
  gegenueber; besetzte Avatare werden deutlich vergroessert angezeigt.
- Auswahl bis zum Spielstart aenderbar, danach gesperrt. Fuer die naechste
  Partie muessen alle vier Positionen erneut belegt werden. Wiederholte
  Teilnahme derselben Personen ist erlaubt.
- Eine Partie endet nach Zeit oder vorzeitig bei 10 Toren. Bei Gleichstand
  nach Zeit entscheidet das naechste Tor. Unentschieden werden nie gespeichert.
- Grosser Countdown und Schiedsrichterpfiff bei Zeitablauf.
- Ergebnisvorschau und ausdrueckliche Bestaetigung vor Speicherung; danach
  keine Korrektur oder Loeschung gespeicherter Ergebnisse.
- Abbruch einer laufenden Partie nach Bestaetigung ohne Wertung.
- Rangfolge: Gesamtpunkte, Siege, Tordifferenz, erzielte Tore, Spielername.
- Manueller, bestaetigter und unumkehrbarer K.-o.-Start ab acht Personen,
  ohne laufende Partie oder offene Ergebniseingabe.
- Vorrundenstand beim K.-o.-Start einfrieren. A=1+8, B=2+7, C=3+6, D=4+5.
  Halbfinals A gegen D und B gegen C, danach Platz 3, danach Finale.
- K.-o.-Teams bleiben fest; keine Positions- oder Farbauswahl. Ergebnisse
  werden direkt dem jeweiligen Team zugeordnet, ohne Vorrundenpunkte.
- Abschluss zeigt den eingefrorenen Vorrundenstand aller Personen und
  getrennt die vier K.-o.-Teams in ihrer endgueltigen Platzierung.

## Gestaltung

Freigegebene Erweiterung fuer Story 1.1: Vor erfolgreicher Mastercode-Eingabe
erscheint nur eine neutrale Zugangsmaske; die nachfolgend beschriebene
gestaltete Oberflaeche wird erst danach gerendert. Sperren und Neuladen
fuehren zur neutralen Maske zurueck. Dies bleibt eine umgehbare
Frontend-Zugangshuerde mit oeffentlich abrufbaren Dateien, ohne Aussage
zum Entfallen einer Impressumspflicht. Diese Erweiterung ist freigegeben,
umgesetzt und mit Story 1.1 abgenommen.

Die geteilten Werbeplakate dienen als Stilreferenz: Petrol/Tuerkis, Orange/Gelb,
Weiss, dunkle kontrastreiche Flaechen, markante sportliche Ueberschriften und
dynamische Akzente. Die Anwendung bleibt auf schnelle Ergebniseingabe
ausgerichtet. Animationen blockieren keine Aktion; reduzierte Bewegung wird
beruecksichtigt. Kein Nachbau der Teams-Screenshots und keine Uebernahme
der dort sichtbaren personenbezogenen Chatdaten.

### Dauerhafte Designreferenzen

- [Werbeplakat 1: dunkler, dynamischer Turnierstil](./design/werbeplakat-1.png)
- [Werbeplakat 2: heller, einladender Turnierstil](./design/werbeplakat-2.png)

Die Veranstaltungsdaten und Uhrzeiten auf den Plakaten sind keine festen
Anwendungswerte. Datum, Startzeit und Planungsdauern kommen aus dem Turnier.

## Ergaenzende freigegebene Festlegungen

Die folgenden Detailregeln und die ausformulierten Stories wurden am
24.11.2026 ausdruecklich zur Umsetzung freigegeben.

1. Name, Datum/Uhrzeit, Spielort und Zugangscode sind Pflichtfelder;
   Beschreibung ist optional. Namen duerfen Leerzeichen enthalten, aber
   nicht leer sein oder nur aus Leerzeichen bestehen. Dasselbe gilt fuer
   Codes; Codes sind gross-/kleinschreibungsabhaengig.
2. Partiedauer und beide geplanten Phasendauern sind positive ganze
   Minutenzahlen. Punkte sind ganze Zahlen ab null; Siegpunkte muessen
   groesser als Niederlagenpunkte sein.
3. Veranstaltungsdatum/-uhrzeit wird als Eschborner Ortszeit
   (`Europe/Berlin`) verstanden. Es gibt weder einen automatischen Start
   noch einen automatischen Wechsel um 19 Uhr.
4. Namensvergleich erfolgt deutschsprachig, ohne Gross-/Kleinschreibung.
   Fuehrende/nachfolgende Leerzeichen werden entfernt. Beim
   Eindeutigkeitsvergleich gleich behandelte Spitznamen sind nicht erlaubt;
   dadurch bleibt der alphabetische letzte Rangentscheid eindeutig.
5. Speicherung pro Turnier als zusammenhaengender, versionierter JSON-Stand.
   Ergebnisse sind die Quelle fuer Punkte und Statistik, keine getrennt
   hochgezaehlten Punktestaende.
6. JSON-Sicherungen enthalten ein Turnier einschliesslich Partien,
   Phase, laufendem Timer und Zugangscode-Pruefdaten, aber keine
   entsperrte Sitzung und keinen Mastercode. Keine Klartext-Codes speichern
   oder exportieren. Das ist keine Verschluesselung der Turnierdaten.
7. Beim Import einer bereits vorhandenen Turnier-ID ist eine ausdrueckliche
   Ersetzungsbestaetigung erforderlich. Mit offener Partie/Ergebniseingabe
   im Zielturnier ist Ersetzen gesperrt. Kein Zusammenfuehren von Staenden.
8. Ein Tab pro Turnier bearbeitet den Stand; weitere Tabs duerfen nicht
   unbemerkt konkurrierend schreiben. Kein geraeteuebergreifender Livebetrieb.
9. Gespeicherte Resultate sind final. Ein Turnier oder gespeicherte Partien
   zu loeschen sowie Zugangscode-Wiederherstellung gehoeren nicht zum
   ersten Umfang. Vor Start koennen Spielende entfernt und bearbeitet werden.
10. Ein bestaetigter Abbruch eines K.-o.-Spiels laesst dieselbe Begegnung
    ungewertet zum Neustart offen; es wird kein Sieger bestimmt.

## Technische Recherche, Stand 24.11.2026

### GitHub Pages

GitHub Pages liefert statische HTML-, CSS- und JavaScript-Dateien aus.
Es fuehrt keinen eigenen Anwendungsserver und keine eigene Datenbank aus.
Ein externes HTTPS-Backend waere moeglich, ist fuer den bestaetigten
Ein-Laptop-Betrieb aber nicht vorgesehen.

Eine veroeffentlichte CSV- oder JSON-Datei ist nur lesbar. Die Browser-App
kann sie nicht auf Pages zurueckschreiben. Ein GitHub-Schreibtoken darf
nicht in den ausgelieferten Client gelangen. Deshalb sind CSV/JSON
Download-/Importformate und keine Online-Datenbank.

Projektseiten liegen gewoehnlich unter
`https://<owner>.github.io/<repository>/`. Vite benoetigt den passenden
Basispfad. Die App verwendet keine Navigation, die serverseitige
SPA-Umschreibregeln voraussetzt. GitHub Actions baut den statischen
Anwendungsstand und veroeffentlicht nur das Build-Ergebnis.

Relevante Grenzen: maximal 1 GB veroeffentlichte Website, weiches
Bandbreitenlimit von 100 GB/Monat, Deployment-Timeout nach 10 Minuten.
Das weiche Limit von 10 Builds/Stunde gilt laut Dokumentation nicht
fuer eigene GitHub-Actions-Build-/Deployment-Workflows.

Ein Frontend-Code verhindert keinen Zugriff auf die ausgelieferten Dateien
und kann umgangen werden; auch ein eingebauter Pruefhash aendert das nicht.
Keine echten, wiederverwendeten Passwoerter oder vertraulichen Inhalte
verwenden. Echter privater Pages-Zugriff erfordert gemaess GitHub eine
Organisation mit Enterprise Cloud und entsprechender privater
Veroeffentlichung.

### Browsergrenzen

`localStorage` behaelt Daten ueber Browser-Neustarts hinweg, gilt aber nur
fuer diesen Browser/dieses Profil und diese Origin. Es gibt keinen
automatischen Abgleich. Browserdaten-Loeschung kann Turniere entfernen;
Privatmodus und gesperrter Speicher sind ungeeignet. Speicherausfaelle
muessen sichtbar bleiben, statt Erfolg vorzutaueschen.

Audiowiedergabe unterliegt Browserregeln. Der Spielstart aktiviert den
Ton im Rahmen einer Benutzeraktion. Ein sichtbarer Ablaufhinweis ist
immer erforderlich. Rechner-Ruhezustand und geschlossene Seiten erlauben
keinen garantierten Pfiff zum exakten Ablaufzeitpunkt.
Der Timer verwendet einen gespeicherten Endzeitpunkt statt ausschliesslich
heruntergezaehlter Ticks, damit Neuladen und Tabwechsel die Partie nicht
verlaengern.

### Quellen

- [GitHub Pages: Funktionsweise](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages/)
- [GitHub Pages: Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub Pages: private Veroeffentlichung](https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)
- [Vite: Deployment auf GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: Audio-Autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

## Stories und geplante Reihenfolge

Jede Story wird einzeln umgesetzt, getestet und zur Abnahme vorgelegt.
Erst nach Rueckmeldung und ausstehenden Entwicklertests folgt die naechste.

1. [Pages-Grundgeruest und Masterzugang: abgenommen](./story-1_1-DONE.md)
2. [Turniere anlegen, speichern und oeffnen: abgenommen](./story-1_2-DONE.md)
3. [JSON-Sicherung und Wiederherstellung: abgenommen](./story-1_3-DONE.md)
4. [Spielende und Avatare verwalten: abgenommen](./story-1_4-DONE.md)
5. [Vorrunde starten und Tabelle anzeigen: abgenommen](./story-1_5-DONE.md)
6. [Vorrundenpartie besetzen: abgenommen](./story-1_6-DONE.md)
7. [Partie, Countdown und Unterbrechungen](./story-1_7.md)
8. [Ergebnis bestaetigen und Punkte auswerten](./story-1_8.md)
9. [K.-o.-Phase spielen](./story-1_9.md)
10. [Turnierabschluss anzeigen](./story-1_10.md)

Das JSON-Sicherungsformat aus Story 3 wird bei Einfuehrung neuer Daten in den
Folgestories konsistent erweitert und gezielt nachgetestet.

## Nicht im Umfang

Backend, Mehrgeraetebetrieb, sichere Benutzeranmeldung, Passwort-Reset,
Live-Torerfassung, automatische Teamrotation, automatische Phasenwechsel,
Ergebnisrevisionen, Turnierloeschung, CSV-Import/-Export und verpflichtendes
Drag-and-drop.
