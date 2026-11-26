# Story 2.10: Anwendung durch Design-Fachperson prüfen und verfeinern

Status: Am 26.11.2026 einschließlich der vier Screenshot-Nachträge
ausdrücklich abgenommen. Das separate Deployment steht aus.
Epic: [Epic 2](./epic-2.md).
Lieferpaket 5 – Design-Feinschliff: separater Fachreview, visuelle
Abnahme und separates Deployment.
Startbedingung: Stories 2.1 bis 2.9 sind umgesetzt und abgenommen.

Als organisierende Person möchte ich nach den funktionalen Änderungen
einen kritischen Design-Review der gesamten Anwendung und spürbaren
Feinschliff, ohne die schnelle Bedienung zu verschlechtern.

## Bestätigte Abgrenzung

- Die Master-Zugangsmaske bleibt bewusst minimal und unverändert.
- Der Feinschliff und die Layout-Abnahme konzentrieren sich auf das große
  Querformat des Turnierlaptops. Referenzen sind 1280 × 720 und die am
  Turnierlaptop gemessenen 1485 × 871 CSS-Pixel. Für schmale Viewports
  oder Mobilgeräte sind keine eigenen Layoutänderungen oder zusätzlichen
  Abnahmekriterien vorgesehen; die bestehende Bedienbarkeit bleibt erhalten.

## Akzeptanzszenarien

### Bestätigte Anforderungen aus den sechs Screenshots und dem Gespräch

1. **Anlegen und Bearbeiten (Bild 1):** Gegeben ist ein Turnierformular.
   Wenn es geöffnet wird, stehen Name, Datum, Ort, alle Dauer- und
   Punktefelder, Beschreibung und Zeitplanung direkt im Formular. Es
   gibt weder **Weitere Einstellungen** noch einen Scrollcontainer für
   die Einstellungen. Bei 1280 × 720 sind auch Speichern und Abbrechen
   ohne Seitenscrollen erreichbar.
2. **Laufende Vorrundenpartie (Bild 2):** Gegeben ist die Vorrundenvorschau.
   Wenn eine Partie startet und anschließend die Toreingabe geöffnet
   oder geschlossen wird, bleiben Tabelle links und Kickertisch rechts.
   Der Tisch behält im selben Viewport seine Position und Abmessungen
   aus der Partievorbereitung. Restzeit und Spielstatus bleiben sichtbar.
   Toreingabe, Speichern und der getrennte Abbruch der Partie stehen
   flach unter dem Tisch statt in einer dritten Spalte. Ungültige Eingaben
   oder Schreibfehler lassen Partie und Entwurf unverändert.
   **Ton aktivieren / testen** und sein Begleittext entfallen. Nach
   Neuladen einer offenen Partie versucht die App bei der nächsten
   geeigneten normalen Bedieninteraktion, Audio zu aktivieren. Wenn der
   Browser das blockiert oder es keine Interaktion gibt, bleibt der
   sichtbare Ablaufhinweis maßgeblich; kein nachträglicher Pfiff.
3. **K.-o.-Bestätigung (Bild 3):** Gegeben ist eine Vorrunde mit mehr als
   acht Spielenden. Wenn der K.-o.-Startdialog geöffnet wird, erscheint
   die vollständige Vorrundentabelle mit allen Statistikspalten und
   allen Rängen. Die ersten acht Zeilen sind visuell und textlich als
   qualifiziert gekennzeichnet; Rang neun und weitere bleiben sichtbar
   bzw. im Dialog erreichbar. Die festen Teams A–D stehen darunter in
   einer strukturierten, zur Tabelle passenden Darstellung mit Namen
   und Avataren. Paarungsregeln, Warnung, Entwurf bei Abbruch und
   Speicherverhalten bleiben unverändert.
4. **K.-o.-Vorbereitung (Bild 4):** Gegeben ist eine gestartete
   K.-o.-Runde. Wenn bei 1280 × 720 die nächste Partie vorbereitet wird,
   sind links alle vier Begegnungen mit Titel, Paarung bzw.
   Platzhaltern und Status bzw. Ergebnis ohne Scrollen zu sehen.
   Der Tisch steht rechts an derselben Position und in derselben Größe
   wie in der Vorrundenvorbereitung. **Vorrundenstand und Ergebnisse**
   öffnet als beschrifteter Info-Link ein großes Overlay mit eingefrorener
   Tabelle und Ergebnisverlauf, ohne ineinander verschachtelte vertikale
   Scrollbereiche.
5. **Laufende K.-o.-Partie (Bild 5):** Gegeben ist ein laufendes K.-o.-Spiel.
   Wenn die Toreingabe aufgeht, gilt dasselbe stabile Tisch- und
   Eingabelayout wie in der Vorrunde, links steht jedoch der vollständige
   K.-o.-Spielplan. Der Info-Link für die Vorrunde bleibt erreichbar.
   Sichtbar heißen die Torefelder **Tore Team A** usw. mit den beiden
   Emoji-Avataren in Klammern, aber ohne Spielernamen; die Namen
   bleiben am Tisch sowie in der zugänglichen Feldbeschreibung erhalten.
6. **Siegerehrung (Bild 6):** Gegeben ist ein beendetes Finale. Wenn die
   Siegerehrung angezeigt wird, nutzt das Podest die volle Arbeitsbreite:
   Platz 1 steht am höchsten, Platz 2 mittelhoch und Platz 3 niedriger,
   alle drei mit gemeinsamer Unterkante; Platz 4 steht darunter.
   Unter dem Podest öffnen zwei getrennt beschriftete
   Info-Links je ein Overlay: **Vorrundenstand und Ergebnisse** sowie
   **K.-o.-Spielplan und Ergebnisse**.
7. **Turnier verlassen (zusätzlich bestätigt):** Gegeben ist ein
   geöffnetes Turnier. Wenn **Turnier verlassen** im Header gewählt
   wird, geht es direkt in die Turnierauswahl, ohne Zwischenübersicht.
   Die reine Turnierübersicht und **Zur Turnierübersicht** entfallen.
   Vor Start bleibt eine aktive Turniervorbereitung mit Einstellungen,
   Spielendenverwaltung und Vorrundenstart erhalten. Der Export bleibt
   in den Turnieransichten erreichbar. Tabelle, Verlauf und Turnierinfos
   bleiben in den jeweiligen Spielansichten über benannte Info-Links
   zugänglich. Verlassen löscht keine gespeicherten Daten; eine offene
   Partie läuft weiter und wird beim Wiederöffnen direkt angezeigt.
   Ungespeicherte Spielentwürfe werden wie bisher verworfen. Die Auswahl
   ist hell, ein erneut geöffnetes K.-o.-Turnier ist wieder dunkel.

### Nachtrag aus der Rückmeldung zur ersten Umsetzung

8. **Turniervorbereitung (neues Bild 1):** Gegeben ist ein Turnier vor
   Vorrundenstart. Wenn die Vorbereitung geöffnet wird, sind Startzeit,
   Ort, Beschreibung, Spielregeln und Zeitplanung direkt sichtbar,
   ohne **Turnierinfos** aufklappen zu müssen. Startzeit und Ort werden
   nicht doppelt angezeigt. Die angemeldeten Spielenden stehen mit ihren
   Namen ohne Emoji-Avatare in einer kommagetrennten Zeile.
   Nur wenn die Namen nicht in eine Zeile passen,
   bricht die Auflistung um, statt Namen abzuschneiden. Ohne Anmeldungen
   erscheint ein Hinweis statt einer leeren Zeile. Bearbeiten,
   Spielendenverwaltung und Vorrundenstart bleiben erreichbar.
9. **Person hinzufügen und bearbeiten (neues Bild 2):** Wenn das
   Personenformular geöffnet wird, gibt es keinen Link **Zur
   Speicheraktion** mehr. Die regulären Schaltflächen **Person
   speichern** und **Abbrechen** bleiben unter der Avatarpalette;
   Belegung, Auswahl und vorhandene Speichervalidierung bleiben
   unverändert. Dies ersetzt den sichtbaren Tastatursprung aus dem
   ersten Feinschliff.
10. **Vorrundenvorbereitung (neues Bild 3):** Wenn die Aufstellung
    vorbereitet wird, gibt es mehr Abstand zwischen Anleitung und
    Arbeitsbereich, zwischen Vorrundentabelle und Tischspalte, zwischen
    Tabellenüberschrift und Tabelle, zwischen Startaktionen und Tisch
    sowie ober- und unterhalb der Überschrift **Letzte 3 Ergebnisse**.
    Der überdeckte Zähler **Noch … von 4 Positionen frei** samt
    Vollständig-Variante entfällt; freie und belegte Positionen bleiben
    am Tisch erkennbar. Bei 1280 × 720 und 1485 × 871 überdeckt kein
    Text den Tisch. Seine Position und Größe bleiben beim Spielstart
    und beim Öffnen der Toreingabe wie in den bisherigen Szenarien stabil.
11. **Turnierbasisinfos (neues Bild 4):** Wenn im großen Querformat eine
    Vorrunden- oder K.-o.-Spielansicht bzw. die Siegerehrung geöffnet
    wird, steht der gemeinsame Basisinfo-Bereich mit Trennlinie an
    derselben Position am unteren Rand der Turnierkarte. Der Link
    **Turnierinfos** bzw. **Weitere Turnierinfos** steht unter der
    Trennlinie bei den Basisinfos, nicht bei den Archiven. Die beiden
    Archivlinks der Siegerehrung bleiben direkt unter dem Podest.
    Bei normalem Inhalt bleibt der Bereich ohne Scrollen erreichbar;
    bei längeren Inhalten oder Meldungen darf er keine Aktionen
    überdecken. Die Vorbereitung vor Vorrundenstart zeigt die
    vollständigen Daten stattdessen direkt (Szenario 8).

### Eigene Design-Findings und Vorschläge zur Freigabe

Prioritäten: **P1** behindert einen Kernablauf oder die Orientierung,
**P2** verbessert Lesbarkeit oder Bedienbarkeit, **P3** nachrangiger
Feinschliff. Die sechs Bildwünsche und die bestätigte Navigation
oben haben Vorrang vor den zusätzlichen Vorschlägen.

| Priorität | Ansicht | Befund | Empfehlung |
|---|---|---|---|
| P2 | Turnierliste, leer/befüllt | Poster, Schlagworte und Speicherhinweis konkurrieren mit dem Einstieg. Der leere Zustand betont das Anlegen, der wichtigste nächste Schritt ist bei gespeicherten Turnieren hingegen das Öffnen. | Poster beibehalten, aber Arbeitskarte und Öffnen-Aktionen priorisieren; Erstellen und Import als zusammengehörige Nebenaktionen platzieren. |
| P1 | Anlegen/Bearbeiten | Standardfelder und Zeitplanung sind hinter einer Zusatzaktion versteckt; Bild 1 zeigt abgeschnittene Beschreibung in einem kleinen Scrollbereich. Die Einstellungszusammenfassung wiederholt direkt sichtbare Werte. | Bild 1 umsetzen und redundante Zusammenfassung im editierbaren Formular entfernen. Planung und Eingaben visuell trennen; Begründung zur rein informativen Planung behalten. |
| P2 | JSON-Import | Ein Dateifeld und die allgemeine Importaktion sagen noch nicht, ob eine Datei ausgewählt, geprüft oder zum Import vorbereitet ist. Beim Ersetzen ist der Unterschied besonders wichtig. | Dateiauswahl, lesbare Vorschau und abschließende Aktion klar trennen; Dateiname bzw. Turniername im jeweiligen Schritt, Ersetzungswarnung und Fehler sichtbar bei der Aktion. Bestehende Sicherheitsabfragen behalten. |
| P1 | Turniervorbereitung und bisherige Übersicht | Vor der Vorrunde ist die Ansicht ein Arbeitsbereich mit drei Aufgaben. Nach dem Start ist die gleichartige Übersicht ein Umweg; der Header signalisiert nicht eindeutig, wie man das Turnier verlässt. | Arbeitsbereich als „Turnier vorbereiten“ kennzeichnen; Spielende verwalten und Einstellungen bearbeiten gruppieren, Vorrundenstart eindeutig hervorheben. Nach Start nur direkte Navigation und kontextbezogene Overlays. |
| P2 | Spielendenliste, Person hinzufügen/bearbeiten/entfernen | Wiederholte Zeilenaktionen dominieren die Namen; eine Palette mit 64 Optionen verlängert den Tastaturweg. „Belegt“ und der gewählte Avatar müssen auch ohne Farbwahrnehmung erkennbar sein. | Namen/Avatare vor Zeilenaktionen priorisieren. In der Palette Auswahl und Belegung zusätzlich mit Symbol/Text benennen; nach der Palette Speichern und Abbrechen direkt per Tastatur erreichen können, ohne alle Avatare durchtabben zu müssen. Entfernen klar von Bearbeiten trennen. |
| P2 | Vorrundenstart-Bestätigung | Die irreversible Wirkung steht im Fließtext; die Abbruchaktion kann optisch mit dem Start konkurrieren. | Gesperrte Daten und Wechsel knapp vor den Aktionen benennen; Abbrechen als klar erkennbare Nebenaktion belassen. |
| P2 | Partievorbereitung, Tabelle und Verlauf | Mehrere identische „Mehr Infos“-Beschriftungen sind ohne Umgebung schwer unterscheidbar. Lange Namen und der Wechsel zwischen Drag-and-drop und Antippen erhöhen die Anforderungen an Fokus und Status. | Info-Aktionen sichtbar nach Inhalt benennen; Auswahl, freie Positionen und bereits eingesetzte Personen nicht nur farblich unterscheiden. Lange Namen umbrechen; aktuelle Drag-and-drop- und Klick-/Tastaturwege beibehalten. |
| P1 | Laufende Vorrunde und laufendes K.-o.; Eingabe und Abbruch | Der Tisch schrumpfte in der Browsermessung bei 1280 × 720 von rund 685 px auf 374 px Breite; die Toreingabe konkurriert seitlich mit Tisch und Uhr. Im K.-o. stehen lange Namen doppelt am Tisch und an Eingabefeldern. | Gemeinsames Raster für alle vier Spielzustände nach Bildern 2, 4 und 5. Speichern bleibt Primäraktion, **Partie abbrechen** optisch getrennt; Regel- und Fehlermeldungen direkt bei den Torfeldern und ohne Tischsprung anzeigen. |
| P2 | Vollständige Tabelle, Ergebnisverlauf, Turnierinfos, Korrektur/Löschen | Die Overlays bündeln Details, die Bedienbegriffe sind aber nicht überall gleich. Beim Löschen muss die Zielpartie auch in der Bestätigung unverwechselbar bleiben. | Info-Overlays einheitlich schließen, Fokus zum Auslöser zurückführen; bei Korrektur/Löschen Spielidentität mit Ergebnis, Teams und Zeitpunkt zeigen. Nach Löschen Fokus sinnvoll in die Ergebnisliste zurückgeben. |
| P1 | K.-o.-Startdialog | Mit neun Spielenden erscheinen nur acht Listenpunkte und textbasierte Paarungen. Die Qualifikationsgrenze ist nicht überprüfbar. | Bild 3 umsetzen; Überschrift der Teamdarstellung und eindeutige Hervorhebung einschließlich Texthinweis ergänzen. |
| P1 | K.-o.-Plan und Vorrundenarchiv | Im lokalen Browser bei 1280 × 720 misst der sichtbare Plan etwa 145 px, bei vier Begegnungen stehen etwa 610–698 px Inhalt dagegen. Das Archiv kombiniert mehrere Scrollbereiche. | Lesbare, kompakte Spielzeilen mit konsistenten Statusbegriffen („Als Nächstes“, „Läuft“, Ergebnis, „Ausstehend“), Archiv als Overlay; keine Scrollpflicht für den Plan im Referenzformat. |
| P1 | Siegerehrung | Das Podest konkurriert im Querformat mit Detailblöcken; die gleich hohen Karten vermitteln kein Treppchen. | Bild 6 umsetzen; Platznummern und Teamnamen bleiben auch ohne Farbe oder Symbol verständlich. |
| P3 | Beide Farbschemata und Bewegung | Helle und dunkle Phase sind unterscheidbar. Animationen sind Dekoration, kein Statusindikator. | Farbschemata aus Story 2.9 nicht neu gestalten. Fokus, Fehlermeldungen und deaktivierte Zustände im jeweiligen Schema erneut prüfen. Keine neue Animation in 2.10; Pfiff-Datei und Konfetti bleiben in 2.11/2.12. |

### Abnahme des zusätzlichen Feinschliffs

- **Navigation, Hierarchie und Zustände:** Gegeben sind leerer und
  befüllter Start, Vorbereitung, Import einschließlich Ersetzungsfall
  und Spielendenverwaltung. Wenn diese mit Maus und Tastatur benutzt
  werden, sind Haupt- und Nebenaktionen unterscheidbar, Fehler in
  Aktionsnähe sichtbar und irreversible Aktionen ausdrücklich
  bestätigt. Alle Daten- und Speicherregeln bleiben unverändert.
- **Querformat, Tastatur und Inhalte:** Gegeben sind lange Namen, zwölf
  Spielende und mehrere Ergebnisse. Wenn die Ansichten bei 1280 × 720
  und 1485 × 871 CSS-Pixeln geprüft werden, bleiben alle Kernaktionen
  erreichbar. Die Hauptansicht und der K.-o.-Plan passen ohne Scrollen.
  Umfangreiche Tabellen und Verläufe dürfen im Overlay scrollen.
  Öffnen, Schließen und Fokus
  funktionieren mit Tastatur; bei Touch genügt weiterhin Antippen für
  eine Aufstellung. Bei reduzierter Bewegung bleiben Inhalte und
  Zustandsmeldungen vollständig verständlich.

### Review- und Regressionsnachweis

- **Ist-Stand (26.11.2026):** Im lokalen Browser wurden Zugang,
  Turnierauswahl, Anlegen, Import-Einstieg, Turniervorbereitung,
  Einstellungsformular, Spielendenliste, Hinzufügen, Bearbeiten und
  Entfernen-Bestätigung, Startbestätigung,
  Vorrundenvorbereitung und -partie, Tabelle und Ergebniskorrektur,
  K.-o.-Bestätigung, K.-o.-Plan und laufende K.-o.-Partie sowie
  Siegerehrung durchlaufen. Spielzustände wurden mit neun Testpersonen
  bei 1280 × 720 erfasst; die Siegerehrung zusätzlich bei 390 × 844.
  Import-Konflikt, weitere Dialogvarianten,
  physischer Touch und Turnierlaptop sind Teil der Abnahmeprüfung;
  die Empfehlungen dazu sind keine behaupteten Vorab-Testergebnisse.

- **Fachreview erst nach Umsetzung:** Gegeben sind die neun abgenommenen
  Vorstories. Wenn eine Design-Fachperson die App vom Zugang über beide
  Turnierphasen bis zur Siegerehrung prüft, liegen nachvollziehbare,
  priorisierte Befunde mit betroffenen Ansichten und konkreten
  Empfehlungen vor. Bewertet werden visuelle Hierarchie, Typografie,
  Farben und Kontraste, Abstände, Zustände, Animationen und Bedienbarkeit
  mit Maus, Touch und Tastatur. Vor Abnahme der neun Vorstories beginnt
  dieser Review nicht.
- **Feinschliff und Regression:** Gegeben sind die Befunde und die
  freigegebenen Verbesserungen. Wenn diese umgesetzt sind, zeigen
  Vorher-/Nachher-Vergleiche, was sich verbessert hat; zurückgestellte
  Punkte sind begründet. Ein Browser-Durchlauf in den Referenzgrößen
  des Querformats bestätigt beide Farbschemata, weiterhin erreichbare
  Aktionen, lesbare Tabellen und die unveränderten Kernabläufe. Die
  abschließende visuelle Abnahme erfolgt am Turnierlaptop.

- **Umsetzung lokal geprüft:** Bei 1280 × 720 misst der Tisch rund
  685 × 254 statt zuvor rund 374 Pixel Breite im laufenden Spiel.
  Bei 1485 × 871 misst er 806 × 254 Pixel. Vorbereitung und laufende
  Partie verwenden in beiden Phasen dieselbe Tischgeometrie. Der
  K.-o.-Plan zeigt alle vier Begegnungen ohne Scrollen. Das
  Turnierformular einschließlich Zeitplanung und Aktionen passt in
  beide Referenzgrößen. Im Testturnier mit zwölf Spielenden blieben
  alle Ränge erhalten und genau acht wurden als qualifiziert markiert.
  Das Podest hatte drei Stufen mit gemeinsamer Unterkante; die Archive
  ließen sich separat öffnen. Escape gab den Fokus an den Auslöser
  zurück. Erneutes Öffnen führte direkt zur laufenden Partie bzw. zur
  Siegerehrung. Simulierte fehlende Audioausgabe, Zeitablauf und
  ungültige Toreingaben verschoben den Tisch nicht.
- **Automatisiert:** 169 Tests bestanden; TypeScript, Produktionsbuild
  und Linter ohne Fehler. Der hörbare Pfiff und die Bedienung am
  physischen Turnierlaptop waren Gegenstand der Entwicklerabnahme.
- **Nachtrag lokal geprüft:** Die Turniervorbereitung zeigte die Namen
  der zwölf Testpersonen und die Zeitplanung ohne Aufklappen. In beiden
  Referenzgrößen hatten alle vier Spielzustände dieselbe Tischgeometrie.
  Die Trennlinie der Basisinfos lag in den Spielansichten und auf der
  Siegerehrung bei rund 647 bzw. 798 CSS-Pixeln vom oberen Fensterrand.
  Der Turnierinfo-Link auf der Siegerehrung lag außerhalb der beiden
  Archive; Escape gab ihm nach dem Schließen wieder den Fokus.
  Die 51 betroffenen Regressionstests bestanden.
