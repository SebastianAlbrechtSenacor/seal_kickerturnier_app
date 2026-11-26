# Story 2.3: Hauptansichten ohne Seitenscrollen im Querformat

Status: Am 26.11.2026 nach erfolgreicher Entwickler-Praxisprüfung
einschließlich der Design-Ergänzung ausdrücklich abgenommen.
Epic: [Epic 2](./epic-2.md).
Lieferpaket 2 – Turnieransicht und Aufstellung (2.3–2.7): gemeinsame
Browser-Regression und gemeinsames Deployment; eigene Abnahme.

Als teilnehmende Person möchte ich am Querformat-Bildschirm die aktuelle
Ansicht bedienen, ohne die Hauptseite hin- und herscrollen zu müssen.

## Überarbeitetes Ziel

Maßgeblich ist der Browser-Viewport, nicht die physische
Bildschirmauflösung. Die erste Umsetzung griff ab 1920 × 1080
CSS-Pixeln. Der Turnierlaptop hat bei 250 % Windows-Skalierung im
normalen Firefox-Fenster einen Viewport von 1485 × 871 CSS-Pixeln
und lag damit unter der bisherigen Schwelle. Neues Referenzformat
ist 1280 × 720 CSS-Pixel bei 100 % Browserzoom; der Turnierlaptop
wird zusätzlich mit seinen üblichen Einstellungen geprüft.

## Akzeptanzszenarien

- **Referenzformat:** Gegeben ist mindestens ein Viewport von 1280 × 720
  CSS-Pixeln bei 100 % Zoom. Wenn ich Zugangsmaske, Turnierliste,
  Formular- und Importansichten, Turniervorbereitung, Spielendenverwaltung,
  Vorrunde, Aufstellung, laufende Partie, Ergebniseingabe, K.-o.-Phase
  und Siegerehrung aufrufe, scrollen Dokument und Hauptcontainer weder
  vertikal noch horizontal. Titel, Rückweg und Hauptaktionen sind
  vollständig sichtbar und bedienbar, nicht lediglich vor Überlauf
  verborgen.
- **Zugang und Turnierliste:** Gegeben sind ein noch gesperrter Zugang
  oder viele gespeicherte Turniere. Wenn ich die Seite nutze, bleiben
  Code-Eingabe und Entsperren bzw. Anlegen und Importieren sichtbar.
  Nur die Turnierliste scrollt, um weitere Öffnen-Aktionen zu erreichen;
  Grafik und Slogans verdrängen keine Bedienung.
- **Formulare und Import:** Gegeben ist ein neues oder zu bearbeitendes
  Turnier. Wenn ich das Formular öffne, sind Name, Datum, Ort,
  Speichern und Abbrechen direkt sichtbar. Beschreibung, Spielregeln
  und Zeitplanung sind unter **Weitere Einstellungen** erreichbar;
  eine sichtbare Zusammenfassung zeigt die aktuellen Werte der Regeln
  und Planung. Enthält der geschlossene Bereich einen Validierungsfehler,
  öffnet er sich und macht das Feld erreichbar, ohne den Entwurf
  zu verwerfen. Beim Import sind Dateiauswahl, Vorschau und Bestätigung
  erreichbar; beim Ersetzen bleibt die Warnung direkt sichtbar.
- **Turniervorbereitung und Spielende:** Gegeben ist ein Turnier vor
  dem Start. Wenn ich es öffne, sind Termin, Ort, Zahl der Spielenden,
  Startvoraussetzung und Hauptaktionen sichtbar; Beschreibung und
  ausführliche Zeitplanung stehen unter **Turnierinfos**. Export ist
  über eine sichtbare Aktion erreichbar. In der Spielendenverwaltung
  bleiben Hinzufügen und Rückweg sichtbar, beim Bearbeiten Spitzname,
  gewählter Avatar, Speichern und Abbrechen. Bei Überlauf scrollt nur
  die Personenliste bzw. das Emoji-Raster.
- **Vorrunde und Aufstellung:** Gegeben ist ein gestartetes Turnier.
  Wenn ich Übersicht oder Aufstellung nutze, bleiben der nächste
  Spielschritt und die Navigation sichtbar. In der Aufstellung stehen
  Kickertisch und kompakte Spielendenliste nebeneinander; Start und
  Rückweg sind ohne Seitenscrollen erreichbar. Die jüngsten Ergebnisse
  sind als kurze Vorschau erreichbar, vollständiger Verlauf und
  Turnierinfos auf Abruf. Die Änderung der Standardansicht, der
  Tabellen-Overlay und die neuen Aktionen am Tisch folgen mit
  [Story 2.4](./story-2_4-DONE.md); zwölf gleichzeitig sichtbare Tabellenzeilen
  folgen mit [Story 2.5](./story-2_5-DONE.md).
- **Laufende Partie und Ergebniseingabe:** Gegeben ist ein laufendes oder
  abgelaufenes Spiel. Wenn ich Ergebnis oder Bestätigung aufrufe,
  bleiben der Countdown bzw. Ablaufstatus, die Teams, die Eingabe
  bzw. Prüfung und der nächste Schritt sichtbar. Die Ergebniseingabe
  nutzt im Querformat den Platz neben dem Tisch; sichtbare Fehlerhinweise
  verdrängen keine Hauptaktion. Ton-Test und Archiv bleiben erreichbar.
  Der bestehende Prüfschritt entfällt erst mit [Story 2.8](./story-2_8.md).
- **K.-o.-Phase und Siegerehrung:** Gegeben ist die K.-o.-Phase oder ein
  abgeschlossenes Turnier. Wenn ich die Ansicht öffne, sehe ich
  die aktuelle Begegnung samt Spielplan und Startaktion bzw. alle
  vier Platzierungen. Bei geöffnetem Archiv bleiben Navigation und
  Export sichtbar; der ausführliche Inhalt scrollt bei Bedarf intern.
- **Lange Inhalte und Tastatur:** Gegeben sind lange Namen, viele
  Einträge oder ein geöffneter Detailbereich. Wenn ich bis zum letzten
  Eintrag navigiere, scrollt nur der betroffene Bereich; nichts ist
  unerreichbar. Overlays sind mit Escape und einer sichtbaren Aktion
  schließbar; der Fokus kehrt danach zum Auslöser zurück.
- **Kleiner Viewport:** Gegeben ist ein schmaleres Fenster, Hochformat oder
  stärkerer Zoom. Wenn dort nicht alles hineinpasst, bleibt der Inhalt
  durch Umbruch oder vertikales Scrollen lesbar und erreichbar; es gibt
  keinen horizontalen Überlauf der Hauptseite.

## Freigegebene Design-Ergänzung vom 26.11.2026

Die Praxisprüfung bestätigt das scrollfreie Layout. Die Turniervorbereitung
sitzt aber als flache, vertikal zentrierte Karte in einer großen dunklen
Fläche. In der Vorrunde bleiben trotz Freiraum außerhalb der Karte nur
wenige Tabellenzeilen sichtbar; die rechte Tabellenkante und ein Teil
der Zeilen sind erst nach internem Scrollen erreichbar. Ziel ist,
den Platz für Inhalte zu nutzen, statt sie in kleinere Fenster zu
drängen. Die Phasenfarben bleiben Gegenstand von [Story 2.9](./story-2_9.md).

### Zusätzliche Akzeptanzszenarien

- **Arbeitsfläche statt schwebender Karte:** Gegeben ist eine
  Turnieransicht im Querformat, zunächst mit wenigen und anschließend
  mit vielen Inhalten. Wenn ich zwischen Vorbereitung, Aufstellung
  und Ergebnisansicht wechsle, beginnt die helle Arbeitsfläche direkt
  unter dem Header mit einem einheitlichen Abstand von höchstens
  24 CSS-Pixeln. Bei 1280 × 720 und 1485 × 871 bleiben seitlich höchstens
  48 CSS-Pixel je Seite frei. Die Fläche reicht bis nahe an den unteren
  Rand; darunter liegen keine separaten Navigationsbuttons. Bei wenig
  Inhalt bleiben Titel, Fakten und Aktionen oben gruppiert, ohne sie
  künstlich auseinanderzuziehen. Bei viel Inhalt nutzen Listen, Tabellen
  oder Ergebnisbereiche den tatsächlich verfügbaren Platz, bevor sie
  intern scrollen. Die neutrale Zugangsmaske und der Startseiten-Aufmacher
  behalten ihre eigene Gestaltung.
- **Kompakte, verständliche Tabellen:** Gegeben sind vier Spielende mit
  typischen Spitznamen in der vollständigen Vorrundentabelle. Wenn ich
  sie bei 1280 × 720 oder auf dem Turnierlaptop öffne, sehe ich alle vier
  Zeilen und alle Spalten einschließlich Punkte ohne internes Scrollen.
  Rang und Zahlen sind platzsparend, die Namensspalte bekommt den
  flexiblen Platz. Beschriftung: `Rang`, `Spielende`,
  `Sp.`, `S`, `N`, `Tore`, `GT`, `TD`, `Pkt.`. Fahre ich mit der Maus
  über einen Spaltenkopf oder fokussiere ihn per Tastatur, erscheint
  die vollständige Bezeichnung, etwa **Tordifferenz** für `TD`.
  Die Langbezeichnungen sind auch mit Touch abrufbar, beispielsweise
  über eine sichtbare Spaltenlegende, und werden von Screenreadern
  verständlich ausgegeben. Die reduzierte Zeilenhöhe gilt auch für die
  kompakte Ansicht, ohne die Spielendenauswahl schwerer bedienbar zu
  machen. Bei Überlauf scrollt nur die Tabelle. Der verbindliche Test
  mit zwölf sichtbaren Zeilen in Vorschau und Overlay bleibt in
  [Story 2.5](./story-2_5-DONE.md).
- **Ergebnisse schnell erfassen:** Gegeben sind mehrere abgeschlossene
  Partien. Wenn ich Vorschau oder Verlauf öffne, sehe ich pro Partie
  eine kompakte Zeile mit beiden Teams und hervorgehobenem Spielstand.
  Typische Namen passen im Querformat nebeneinander; lange Namen dürfen
  umbrechen. Datum, Uhrzeit und gegebenenfalls ausgeblendete Avatare
  bleiben über die Ergebnisdetails erreichbar. Lose Abstände, große
  Einzelkarten und wiederholte Teamüberschriften entfallen. Die jüngste
  Partie steht weiterhin zuerst; Bearbeiten und Löschen folgen erst
  in [Story 2.8](./story-2_8.md).
- **Header für Ansichtswechsel und Export:** Gegeben ist ein geöffnetes
  Turnier. Wenn ich zur Startseite bzw. Turnierauswahl zurück oder
  eine Sicherung herunterladen möchte, finde ich die jeweils passende
  Aktion im Header statt am Ende der Inhaltskarte. Ist die Startseite
  zugleich die Turnierauswahl, gibt es dafür nicht zwei sichtbare Aktionen.
  Export wird nur angeboten, wenn er für den aktuellen Turnierstand
  vorgesehen ist. Inhalte und Listen können scrollen, ohne den Header
  mitzubewegen. Die Verlagerung ändert weder Speichern noch Abbruch
  oder das Verhalten der laufenden Partie.
- **Zusammengehörige Aktionen auf einer Zeile:** Gegeben sind
  Haupt- und Nebenaktionen einer Ansicht. Wenn ich beispielsweise
  ein Formular oder die Aufstellung öffne, stehen **Speichern** und
  **Abbrechen** bzw. **Spiel starten** und **Aufstellung leeren**
  nebeneinander. Ebenso teilen sich **Partie vorbereiten** und
  **K.-o.-Phase starten** in der bestehenden Vorrundenübersicht nach
  Möglichkeit eine Zeile. Die Hauptaktion ist visuell hervorgehoben;
  Nebenaktionen nehmen nicht ohne Grund die ganze Breite ein.
  Konkrete Formular- und Spielaktionen bleiben am jeweiligen Inhalt.
  Bei Platzmangel dürfen Gruppen umbrechen, ohne abgeschnitten zu werden.
  Die abweichende Navigation mit **Turnier verlassen** folgt weiterhin
  in [Story 2.4](./story-2_4-DONE.md).

### Zusätzliche Abnahme

Lokale Prüfung der Design-Ergänzung: 57 gezielte UI-Tests, Lint und
Produktions-Build bestanden. Im integrierten Browser bei 1280 × 720,
1485 × 871 und 1920 × 1080: Arbeitsfläche 8 px unter dem Header und
12 px über dem unteren Rand; seitlich 32, 37 bzw. 48 px Abstand.
Vorbereitung und Vorrunde ohne Seitenscrollen; die Vierertabelle bleibt
auch mit geöffnetem Verlauf, Legende und Turnierinfos vollständig
sichtbar. Mit 48 Spielenden und 18 Ergebnissen scrollen nur die
Tabelle und der Verlauf; Hauptaktionen bleiben sichtbar. Zusätzlich
geprüft: Maus- und Fokusbeschriftung, Legende, Header-Navigation,
Auslösung des Sicherungsdownloads sowie Spielstart bei 1280 × 720.
Bei 320 × 680 scrollt die Seite vertikal und die Tabelle separat
horizontal. Der Entwickler hat den Praxistest am 26.11.2026 als
erfolgreich bestätigt und die Story abgenommen.

Bei 1280 × 720 und in Firefox bei 1485 × 871 die beiden beanstandeten
Ansichten mit den bisherigen Screenshots vergleichen: Vorbereitung mit
einer Person und Vorrunde mit vier Personen und mehreren Ergebnissen.
Arbeitsfläche, vollständige Tabellenansicht, Ergebnisdichte und sichtbare
Aktionsgruppen prüfen. Langbezeichnungen mit Maus, Tastatur und Touch
aufrufen. Anschließend mit langen Namen und vielen Einträgen prüfen, dass
nur der jeweils betroffene Bereich scrollt und Header, Hauptaktionen sowie
Rückweg erreichbar bleiben. Die bisherigen Kriterien zum Seitenscrollen
gelten unverändert.

## Validierung der Überarbeitung

- Browser-Durchlauf bei 1280 × 720; Regression bei 1920 × 1080 und
  unterhalb der Mindestgröße. Nicht nur Scrollmaße messen, sondern
  auch prüfen, dass Hauptaktionen vollständig im sichtbaren Bereich
  liegen und bedienbar sind. Mit vielen Einträgen, langen Namen,
  offenen Detailbereichen und Validierungsfehlern prüfen.
- Entwickler-Praxisprüfung: dieselben Kernabläufe im normalen Firefox-
  Fenster am Turnierlaptop (gemessen: 1485 × 871 CSS-Pixel) mit Maus,
  Touch und Tastatur durchspielen. Hauptseite bleibt stehen; die nächste
  Aktion und der Rückweg sind jeweils ohne Seitenscrollen erreichbar.

Ergebnisse: 48 gezielte Tests, Linting, Typprüfung und Produktions-Build
bestanden. Im lokalen Browser bei 1280 × 720, 1485 × 871 und
1920 × 1080 geprüft, dass die Hauptaktionen in den getesteten
Turnieransichten auch bei aufgeklappten Archiven und einem Ergebnisfehler
im Viewport liegen. Bei 1280 × 720 zusätzlich die Tastaturnavigation bis
zum Ende der Turnierliste, das Wiederöffnen fehlerhafter erweiterter
Einstellungen und sichtbare Formularaktionen geprüft. Bei 320 × 680
hatte die Importansicht keinen horizontalen Seitenüberlauf.

## Bisherige Validierung (vor der Überarbeitung)

- 48 gezielte Tests in vier Dateien, Linting, Typprüfung und
  Produktions-Build bestanden.
- Browserprüfung bei 1920 × 1080: Zugangsmaske, Turnierliste,
  Turniervorbereitung, Spielendenverwaltung, Vorrunde und Aufstellung,
  laufende Partie, Ergebniseingabe, K.-o.-Phase und Siegerehrung.
  Geprüft mit 22 Turnieren, 48 Spielenden mit langen Namen und
  18 Vorrundenergebnissen, auch mit geöffneten Archiven. Beim
  Tastaturtest erreichte `Ende` das Ende der fokussierten Turnierliste.
- Browserprüfung bei 320 × 680 und 1280 × 720: Die Seite scrollt
  vertikal bei Bedarf, ohne horizontalen Seitenüberlauf.
