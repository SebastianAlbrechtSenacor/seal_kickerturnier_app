# Kickerturnier-App

Eine Webanwendung fuer das Kickerturnier im Eschborner Office. Gespielt wird
am echten Kickertisch; die Teilnehmenden bedienen den Laptop daneben selbst.

## Projektstand

Die [Spezifikation mit zehn ATDD-Stories](./spec/epic-1-DONE.md) ist seit dem
24.11.2026 zur Umsetzung freigegeben. Der Ablauf steht in
[agents.md](./agents.md): Jede Story wird einzeln umgesetzt und abgenommen.

Story 1.1 setzt das React-/TypeScript-/Vite-Grundgeruest um:

- Neutrale Zugangsmaske mit Master-Zugangscode und sichtbaren Eingabefehlern;
  ohne Office-Branding, Grafik oder Turnierinformationen.
- Entsperrte Turnierauswahl als Einstieg in die Turnierverwaltung.
- Explizites Sperren; nach Neuladen ist der Zugang ebenfalls wieder gesperrt.
- Responsive Gestaltung in Petrol/Tuerkis, Orange/Gelb und Weiss nach den
  [Werbeplakaten](./spec/epic-1-DONE.md#dauerhafte-designreferenzen), mit Maus-,
  Touch- und Tastaturbedienung sowie reduzierter Bewegung. Diese gestaltete
  Oberflaeche erscheint erst nach erfolgreicher Mastercode-Eingabe und wird
  beim Sperren wieder entfernt.
- Tests, Typpruefung und Linting sowie GitHub-Pages-Deployment-Workflow.

Der Entwickler hat die urspruenglichen Akzeptanzszenarien A-D einschliesslich
echtem Pages-Aufruf als bestanden gemeldet. Vor Abnahme wurde eine Erweiterung
gewuenscht: Zunaechst nur eine neutrale Zugangsmaske, die gestaltete
Oberflaeche erst nach Codeeingabe. Diese
[Erweiterung](./spec/story-1_1-DONE.md) ist ebenfalls freigegeben und umgesetzt.
Die erneuten Entwicklertests C und D sind bestanden; Story 1.1 wurde am
24.11.2026 ausdruecklich abgenommen.
Auch damit bleiben Dateien oeffentlich abrufbar und
die Frontend-Sperre umgehbar; eine Aussage zum Entfallen einer
Impressumspflicht ist damit nicht verbunden.
[Story 1.2](./spec/story-1_2-DONE.md) ist umgesetzt, getestet und nach
erfolgreichen Entwickler-Praxispruefungen abgenommen.
[Story 1.3](./spec/story-1_3-DONE.md) ist umgesetzt, getestet und nach
erfolgreichen Entwickler-Praxispruefungen am 24.11.2026 abgenommen.
[Story 1.4](./spec/story-1_4-DONE.md) ist umgesetzt, getestet und nach
erfolgreichen Entwickler-Praxispruefungen am 24.11.2026 abgenommen.
[Story 1.5](./spec/story-1_5-DONE.md) ist umgesetzt, getestet und nach
erfolgreichen Entwickler-Praxispruefungen am 25.11.2026 abgenommen.
[Story 1.6](./spec/story-1_6-DONE.md) ist einschliesslich der UI-Rueckmeldung
umgesetzt, getestet und nach erfolgreichen erneuten Entwickler-
Praxispruefungen ausdruecklich abgenommen.
[Story 1.7](./spec/story-1_7-DONE.md) ist umgesetzt, automatisiert sowie im
Browser getestet und nach allen drei bestandenen Entwickler-Praxispruefungen
am 25.11.2026 ausdruecklich abgenommen.
[Story 1.8](./spec/story-1_8-DONE.md) ist einschliesslich Ergebnisverlauf und
kompakter Turnieruebersicht umgesetzt, getestet und nach beiden bestandenen
Entwickler-Praxispruefungen am 25.11.2026 ausdruecklich abgenommen.
[Story 1.9](./spec/story-1_9-DONE.md) ist mit der vertrauten Partieansicht umgesetzt,
automatisiert und im Browser getestet. Beide Entwickler-Praxispruefungen
sind bestanden; die anschliessend gewuenschte Anpassung der linken
K.-o.-Ansicht ist ebenfalls freigegeben, umgesetzt und getestet.
Auch die erneute Layoutpruefung P3 ist bestanden; die Story wurde am
25.11.2026 ausdruecklich abgenommen.
[Story 1.10](./spec/story-1_10-DONE.md) ist einschliesslich der freigegebenen
Siegerehrung umgesetzt, automatisiert und im Browser getestet.
Beide Entwickler-Praxispruefungen sind bestanden; die Story wurde am
25.11.2026 ausdruecklich abgenommen. Damit ist Epic 1 mit allen zehn
Stories abgeschlossen.

## Turniere vorbereiten

1. Anwendung mit dem Master-Zugangscode entsperren.
2. **Turnier anlegen** waehlen. Name, Datum/Startzeit, Spielort und einen
   eigenen Turnier-Zugangscode eingeben. Beschreibung ist optional.
3. Dauer je Partie (Standard 10 Minuten), Punkte je Sieg/Niederlage (3/1)
   und geplante Phasendauern (Vorrunde 120, K.-o. 60 Minuten) festlegen.
   Dauern muessen positive ganze Minutenzahlen sein, Punkte ganze Zahlen
   ab null mit Siegpunkten groesser Niederlagenpunkten.
4. Die Vorschau zeigt geplanten K.-o.-Beginn und Turnierende.
   Sie ist unabhaengig von der Partiedauer und startet keine Phase automatisch.
5. **Turnier speichern** oeffnet das neu angelegte Turnier sofort.
   **Einstellungen bearbeiten** erlaubt Aenderungen in der Vorbereitung.
   Ein leeres Turniercode-Feld behaelt beim Bearbeiten den bisherigen Code;
   eine Eingabe ersetzt ihn.
6. **Zur Turnierauswahl** schliesst den Turnierzugang. Die Liste zeigt nur
   Name und Datum. Erneutes Oeffnen erfordert den passenden Turniercode.
7. **Anwendung sperren** oder Neuladen sperrt auch den Masterzugang.
   Gespeicherte Turniere bleiben im selben Browserprofil erhalten.

Datum und Uhrzeit gelten immer fuer `Europe/Berlin`, auch auf einem
anders eingestellten Rechner. Nicht existierende Uhrzeiten bei der
Fruehjahrs-Zeitumstellung sind ungueltig; bei einer doppelt vorkommenden
Herbst-Uhrzeit wird das fruehere Vorkommen verwendet. Phasendauern werden
als tatsaechlich vergangene Minuten gerechnet, auch ueber Tageswechsel hinweg.

### Speicherung und Fehler

Jedes Turnier wird als zusammenhaengender, versionierter JSON-Stand mit
eigener ID im lokalen Browserspeicher gespeichert. Fuer den Turniercode
wird nur ein SHA-256-Pruefwert abgelegt, keine Klartext-Eingabe und keine
entsperrte Sitzung. Die uebrigen Turnierdaten sind nicht verschluesselt.

Bei fehlgeschlagenem Speichern zeigt die App einen Fehler und behaelt die
Eingaben sowie den letzten erfolgreich gespeicherten Stand. Gesperrter
Lesespeicher oder beschaedigte Daten werden nicht als leere Turnierliste
ausgegeben. Schreibzugriffe pro Turnier werden ueber Web Locks serialisiert;
veraltete Bearbeitungen werden mit Konfliktmeldung abgewiesen, auch wenn
zwischenzeitlich eine alte Sicherung importiert wurde. Bei einem Konflikt
den aktuellen Stand ueber die Turnierauswahl neu oeffnen. Es gibt keine
automatische Live-Aktualisierung oder Zusammenfuehrung zwischen Tabs.
Ein aktueller Browser mit Web-Locks-Unterstuetzung ueber HTTPS oder localhost
ist zum Speichern und Importieren erforderlich; ohne Unterstuetzung erscheint
eine Fehlermeldung statt eines ungeschuetzten Schreibzugriffs.

Die Daten liegen **nur in diesem Browserprofil auf diesem Geraet**,
nicht bei GitHub. Kein Privatmodus; geloeschte Browserdaten koennen zum
Datenverlust fuehren. Regelmaessig JSON-Sicherungen herunterladen.
Der Turnierstart erfolgt ausschliesslich manuell mit Bestaetigung.

### Spielende und Avatare verwalten

1. Im geoeffneten Turnier **Spielende verwalten** waehlen.
2. **Person hinzufuegen** waehlen, Spitznamen eingeben und einen freien
   Emoji-Avatar anklicken oder per Tastatur auswaehlen. **Person speichern**
   legt die Person mit eigener, stabiler ID an.
3. Die Palette enthaelt 64 Avatare; damit sind maximal 64 Personen je
   Turnier moeglich. Belegte Avatare sind gesperrt. Sind alle belegt,
   erscheint eine Begruendung und weitere Anmeldungen sind gesperrt.
4. **Bearbeiten** aendert Spitznamen und Avatar, aber nicht die ID.
   Der eigene Avatar bleibt dabei verfuegbar.
   **Entfernen** fordert eine Bestaetigung; **Abbrechen** laesst die
   Person unveraendert. Nach bestaetigtem Entfernen ist der Avatar wieder frei.
5. **Zur Turnieruebersicht** fuehrt zu Einstellungen und JSON-Sicherung zurueck.
   Aendern der Turniereinstellungen behaelt die Spielendenliste bei.

Spitznamen und Avatare sind pro Turnier eindeutig; andere Turniere duerfen
sie erneut verwenden. Der deutsche Namensvergleich ignoriert Gross-/
Kleinschreibung, unterscheidet aber Umlaute vom Grundbuchstaben.
Aeussere Leerzeichen werden entfernt, interne bleiben unveraendert.
Leere oder doppelte Namen zeigen einen Feldhinweis.
Fehlgeschlagene Speicherungen und Mehrtab-Konflikte veraendern die
gespeicherte Liste nicht und behalten den Entwurf bei.
Nach Turnierstart ist die Spielendenliste gesperrt.

### Vorrunde starten und Tabelle anzeigen

1. Mindestens vier Spielende anmelden. Darunter bleibt **Turnier starten**
   mit sichtbarer Begruendung gesperrt.
2. **Turnier starten** oeffnet eine Bestaetigungsansicht. Bis zur
   Bestaetigung bleibt alles unveraendert; **Abbrechen** kehrt zur Vorbereitung
   zurueck. **Vorrunde verbindlich starten** speichert den Phasenwechsel.
3. Die Vorrundentabelle zeigt alle Personen mit Avatar, eindeutigem Rang,
   Spielen, Siegen, Niederlagen, Toren, Gegentoren, Tordifferenz und Punkten.
   Alle Statistiken beginnen bei null und werden aus den erfolgreich
   gespeicherten Ergebnissen individuell berechnet.
4. Sortiert wird nach Punkten, Siegen, Tordifferenz und erzielten Toren
   absteigend, anschliessend nach deutschem Spielernamen aufsteigend.
   Auf schmalen Bildschirmen laesst sich die Tabelle seitlich scrollen,
   auch per Tastatur nach Fokussieren des Tabellenbereichs.
5. Einstellungen, Punktevergabe, Dauern, Turniercode und Spielende sind
   nach Start unveraenderbar. Die Felder bleiben lesbar, Bearbeitungsaktionen
   entfallen. Neuladen und erneute Codeeingabe behalten Phase und Rangfolge bei.
   Veraltete Tabs koennen die gesperrte Vorbereitung nicht ueberschreiben.
6. **Partie vorbereiten** oeffnet die Positionsauswahl. Bei bereits offener
   Partie fuehrt **Offene Partie anzeigen** stattdessen zur laufenden Partie.

Startzeit und geplante Phasenenden sind nur Planung. Weder der geplante
Beginn noch 19 Uhr starten oder wechseln eine Phase automatisch.
Speicherfehler oder ein konkurrierend geaenderter Stand zeigen einen Fehler;
ein nicht erfolgreich gespeicherter Start zeigt keine gestartete Vorrunde.

### Eine Partie besetzen

1. In der gestarteten Vorrunde **Partie vorbereiten** waehlen.
   Links steht die kompakte Tabelle mit **Rang**, **Spielende** und **Punkte**,
   rechts der groessere Tisch. Die Turnieruebersicht behaelt ihre vollstaendige
   Tabelle mit allen neun Spalten. Auf schmalen Bildschirmen stehen beide
   Bereiche untereinander. Turnierinfos stehen kompakt unten.
2. Name oder Avatar mit Maus oder Finger aus der Tabelle auf Weiss Angriff,
   Weiss Verteidigung, Schwarz Angriff oder Schwarz Verteidigung ziehen.
   Am oberen/unteren Bildschirmrand scrollt die Seite beim Ziehen mit.
   Ausserhalb der Namens-/Avatarflaechen bleiben Tabelle und Seite scrollbar.
   Tabellenkopf und Namensspalte bleiben beim Tabellenscrollen sichtbar.
   Links steht Weiss Verteidigung oben und Weiss Angriff darunter;
   rechts steht Schwarz Angriff oben und Schwarz Verteidigung darunter.
   Angriff und gegnerische Verteidigung stehen sich damit gegenueber.
   Besetzte Positionen zeigen den Avatar deutlich vergroessert,
   weiterhin mit Positionsbezeichnung und Spitzname.
3. Alternativ zuerst eine Position anklicken/antippen, dann eine freie Person
   in der Tabelle auswaehlen. Beide Schritte funktionieren auch mit
   Tabulator und Enter/Leertaste. Die ausgewaehlte Position ist markiert.
4. Eingesetzte Personen sind mit ihrer Position markiert und gegen erneutes
   Einsetzen gesperrt. Eine freie Person auf eine belegte Position ziehen
   oder fuer sie auswaehlen ersetzt die Belegung; die bisherige Person wird frei.
   **Entfernen** leert eine einzelne Position, **Aufstellung leeren** alle vier.
   Ungueltiges oder abgebrochenes Ziehen laesst den Entwurf mit Hinweis bestehen.
5. Erst mit vier verschiedenen Personen ist **Spiel starten** aktiv und
   hervorgehoben. Vier Belegungen allein sperren die Bearbeitung nicht.
   **Spiel starten** speichert Aufstellung, Start- und Endzeit und startet
   direkt die Partie. Erst nach erfolgreichem Speichern wird der Countdown
   angezeigt; die Aufstellung ist dann gesperrt. Doppelklick startet keine
   zweite Partie. Bei Speicherfehlern bleibt der Entwurf mit Fehlerhinweis bestehen.
6. **Vorbereitung verlassen**, Neuladen oder **Anwendung sperren** verwerfen
   den Entwurf. Erneutes Vorbereiten beginnt leer; dieselben Personen duerfen
   erneut gewaehlt werden. Der Entwurf ist auch nicht Teil einer JSON-Sicherung.
   Veraltete Turnierstaende werden beim Oeffnen und vor dem Spielstart
   mit Konfliktmeldung abgewiesen.

### Laufende Partie und Countdown

1. Links bleibt die kompakte Tabelle, rechts stehen der grosse Countdown
   und die gesperrte Aufstellung. Auf schmalen Bildschirmen stehen die
   Bereiche untereinander. Die Restzeit folgt dem gespeicherten Endzeitpunkt:
   Neuladen, Sperren, Tabwechsel oder Verlassen halten die Partie nicht an.
   Nach erneutem Zugang wird dieselbe offene Partie angezeigt.
2. Der Start aktiviert den Ton im Rahmen des Klicks. **Ton aktivieren / testen**
   erlaubt einen Testpfiff, auch nach erneutem Oeffnen. Geraetelautstaerke
   pruefen! Audiofehler erscheinen sichtbar und verhindern weder den
   gespeicherten Start noch die spaetere Ergebniseingabe.
3. Bei Zeitablauf steht der Timer auf `00:00`; ein deutlicher Hinweis und
   **Ergebnis eingeben** erscheinen. Bei Gleichstand entscheidet das naechste
   Tor. Die App versucht hoechstens einmal je gespeicherter Partie automatisch
   zu pfeifen; ausdrueckliche Testpfiffe sind davon unabhaengig.
   Ein Pfiff im Hintergrund oder Ruhezustand ist nicht garantiert.
   Beim Wiederoeffnen einer bereits abgelaufenen Partie ertont kein
   nachtraeglicher automatischer Pfiff.
4. **10 Tore erreicht** oeffnet die Eingabe vorzeitig, ohne den Timer
   anzuhalten. **Ergebnis pruefen** verlangt zwei ganze Zahlen von 0 bis 10,
   keinen Gleichstand und vor Zeitablauf genau ein Team mit 10 Toren.
   Nach Zeitablauf ist beispielsweise auch 7:5 gueltig, selbst wenn die
   Eingabe vorher geoeffnet wurde.
5. Die Pruefung zeigt beide Teams, den Endstand und den Hinweis, dass
   Ergebnis und Wertung nach Bestaetigung unveraenderlich sind.
   **Ergebnis aendern** behaelt den Entwurf zur Korrektur bei.
   **Ergebnis verbindlich speichern** beendet die Partie und wertet sie
   genau einmal. Erst nach erfolgreichem Speichern wird sofort die
   Vorbereitung der naechsten Partie mit vier leeren Positionen angezeigt.
   Neuladen oder Sperren vor Bestaetigung verwerfen nur den Toreentwurf,
   nicht die offene Partie.
6. **Partie abbrechen** erfordert eine Bestaetigung. Verwerfen behaelt die
   Partie samt urspruenglichem Endzeitpunkt; Bestaetigen beendet sie ohne
   Ergebnis und Punkte und oeffnet eine leere neue Aufstellung.
   Ein Schreibfehler beim Abbruch oder beim Ergebnisspeichern laesst die
   gespeicherte Partie offen und zeigt einen Fehler; der Entwurf bleibt erhalten.
   Auch ueber die Turnieruebersicht kann keine zweite Partie parallel starten.

### Individuelle Wertung und Ergebnisverlauf

- Beide Personen des Siegerteams erhalten die konfigurierten Siegpunkte,
  beide des Verliererteams die Niederlagenpunkte. Spiele, Siege, Niederlagen,
  Teamtore und Gegentore zaehlen jeweils fuer jede beteiligte Person.
  Wechselnde Teampartner aendern daran nichts; Unbeteiligte bleiben unveraendert.
  Tabellen in Uebersicht, Vorbereitung und laufender Partie verwenden
  denselben berechneten Stand und dieselben Rangentscheidungen.
- Unter der kompakten Tabelle links in der Partievorbereitung stehen
  hoechstens die **letzten drei Ergebnisse**. In der Turnieruebersicht
  folgen **alle Spielergebnisse** direkt unter der vollstaendigen Tabelle.
  Zuletzt gespeicherte Partien stehen zuerst, mit Endstand, Teams samt
  Namen/Avataren und Abschlusszeit in Eschborner Ortszeit.
- Ohne Ergebnisse erscheint ein Leerhinweis. Offene oder abgebrochene
  Partien erscheinen nicht im Verlauf und bringen keine Punkte.
- In der gestarteten Turnieruebersicht stehen die Turnierinformationen
  kompakt unten. **Weitere Turnierinfos** klappt Beschreibung, geplante
  Phasendauern und Zeitplanung auf. Vor Vorrundenstart bleibt die
  bisherige ausfuehrliche Vorbereitungsansicht erhalten.
- Ergebnisse koennen weder einzeln korrigiert noch geloescht werden.
  Das bewusste Ersetzen des ganzen Turniers durch eine Sicherung bleibt
  davon getrennt moeglich, einschliesslich des gesamten Ergebnisverlaufs.

### K.-o.-Phase spielen

1. In der Turnieruebersicht **K.-o.-Phase starten** waehlen. Erforderlich
   sind mindestens acht angemeldete Personen und keine offene Partie.
   Eine Mindestspielzahl gibt es nicht; bei mehr als acht Personen
   qualifizieren sich genau die ersten acht der aktuellen Tabelle.
2. Die Vorschau zeigt die Qualifizierten und feste Teams:
   **A = Rang 1+8**, **B = 2+7**, **C = 3+6**, **D = 4+5**.
   **Abbrechen** veraendert nichts. **K.-o.-Phase verbindlich starten**
   friert die vollstaendige Vorrundentabelle aller Personen ein.
   Weitere Vorrundenpartien sind danach gesperrt.
3. Links steht direkt der K.-o.-Spielplan, ohne zusaetzliche Vorrundentabelle;
   rechts steht derselbe Tisch mit vier grossen Avataren. Die festen Teammitglieder
   sind automatisch eingesetzt und nicht veraenderbar. Beschriftungen nennen
   Teams statt Positionen oder Farben; es gibt keine weitere Auswahl.
4. Die feste Reihenfolge lautet **Halbfinale A gegen D**, **Halbfinale
   B gegen C**, **Spiel um Platz 3 der beiden Verliererteams**, **Finale
   der beiden Siegerteams**. Ueberspringen ist nicht moeglich.
   Unbekannte spaetere Paarungen zeigen Sieger-/Verlierer-Platzhalter.
5. **Spiel starten** speichert die Partie und startet den bekannten
   Countdown mit derselben Partiedauer und denselben Audio-/Ergebnisregeln.
   Die Torefelder und Vorschau nennen beide Teams samt Personen.
   K.-o.-Ergebnisse veraendern keine Vorrundenpunkte oder -statistiken.
6. Nach **Ergebnis verbindlich speichern** ist die naechste feste Begegnung
   sofort vorbereitet, startet aber erst nach erneutem **Spiel starten**.
   Bestaetigtes Abbrechen laesst dieselbe Begegnung ungewertet zum Neustart
   bereit. Neuladen behaelt eine offene Partie samt urspruenglichem Endzeitpunkt.
7. Ausschliesslich unten unter **Vorrundenstand und Ergebnisse** lassen sich
   die vollstaendige eingefrorene Tabelle aller Personen und alle
   Vorrundenergebnisse aufklappen, auch waehrend einer Partie.
   Auf schmalen Bildschirmen steht der Spielplan vor dem Tisch;
   die vollstaendige Tabelle bleibt innerhalb ihres Bereichs scrollbar.
8. Nach dem erfolgreich gespeicherten Finale erscheint automatisch die
   **Siegerehrung** mit den vier Teamplatzierungen. Weitere Starts sind
   auch nach Neuladen oder Wiederherstellen gesperrt.
   Export und Navigation bleiben moeglich.

Der normale Phasenwechsel ist unumkehrbar. Davon getrennt bleibt das bewusst
bestaetigte Ersetzen des ganzen Turniers durch eine Sicherung moeglich.
Bei Schreibfehlern bleiben Phase, offene Partie beziehungsweise Ergebnisentwurf
und der zuletzt gespeicherte Spielplan erhalten. Veraltete Tabs werden mit
Konfliktmeldung abgewiesen, statt einen neueren Stand zu ueberschreiben.

### Turnierabschluss und Siegerehrung

- **Turnier abgeschlossen** zeigt die K.-o.-Plaetze 1 bis 3 als Podest:
  Finalsieger auf Platz 1, Finalverlierer auf Platz 2, Sieger des Spiels
  um Platz 3 auf Platz 3. Dessen Verlierer steht als Platz 4 direkt darunter.
  Jedes Team zeigt beide Namen und Avatare.
- Bei breiter Darstellung steht Platz 1 hervorgehoben in der Mitte,
  Platz 2 links und Platz 3 rechts. Bis 1000 Pixel Breite stehen die
  vier Teams in Rangfolge untereinander.
- **Vorrundenstand und Ergebnisse** ist zunaechst eingeklappt und zeigt
  bei Bedarf die vollstaendige eingefrorene Einzelwertung aller Personen
  sowie den gesamten Vorrundenverlauf. Diese Wertung ist von den Teamplaetzen
  getrennt und wird durch K.-o.-Ergebnisse nicht veraendert.
  **K.-o.-Spielplan und Ergebnisse** klappt die vier K.-o.-Begegnungen auf.
- Nur direkt nach dem erfolgreich gespeicherten Finale laeuft einmal
  eine kurze Konfettianimation von hoechstens zwei Sekunden. Archivaktionen,
  Export und Navigation funktionieren waehrenddessen sofort.
  Bei reduzierter Bewegung entfaellt die Animation; zusaetzliche Sounds
  gibt es nicht. Ein Speicherfehler zeigt noch keinen Abschluss.
- Neuladen, Import und erneutes Oeffnen zeigen dieselbe Siegerehrung
  ohne erneute Animation. Auch bereits vorher abgeschlossene
  Schema-5-Turniere funktionieren ohne Datenmigration oder erneutes
  Speichern. Es werden keine zusaetzlichen Punkte vergeben.
- **Zur Turnieruebersicht** zeigt die unveraenderlichen Turnierinformationen;
  **Turnierabschluss anzeigen** fuehrt zur Siegerehrung zurueck.
  Die JSON-Sicherung bleibt verfuegbar. Ein bewusst bestaetigtes
  Wiederherstellen einer anderen Sicherung bleibt vom gesperrten
  Spielbetrieb getrennt moeglich.

### JSON-Sicherung und Wiederherstellung

- Im geoeffneten Turnier **JSON-Sicherung herunterladen** waehlen.
  Die UTF-8-Datei enthaelt ID, Einstellungen, Spielende mit IDs/Spitznamen/Avataren,
  Phase, abgeschlossene Partien mit Aufstellungen, Toren und Zeitpunkten,
  eine gegebenenfalls offene Partie mit urspruenglichen Zeitpunkten sowie
  in der K.-o.-Phase den eingefrorenen Vorrundenstand, feste Teams und
  deren separaten Ergebnisverlauf. Sie enthaelt den Pruefwert des
  Turniercodes, aber weder Mastercode noch Klartext-Codes oder entsperrte Sitzung.
  Die Daten sind nicht verschluesselt; Sicherungen nicht oeffentlich teilen.
- In der Turnierauswahl **JSON-Sicherung importieren** waehlen und die
  Datei auswaehlen. Die Vorschau zeigt Name und Datum. Erst
  **Turnier importieren** speichert das neue Turnier; **Abbrechen** aendert nichts.
- Existiert dieselbe ID bereits, sind der **bestehende** Turniercode und
  die ausdrueckliche Ersetzungsbestaetigung erforderlich. **Turnier ersetzen**
  ersetzt den gesamten Stand, ohne ihn mit dem lokalen Stand zu vermischen.
  Anschliessend gilt der Code aus der Sicherung. Zum Oeffnen wird er erneut
  abgefragt. Die lokale Revision steigt dabei zur Konflikterkennung.
  Hat das lokale Zielturnier eine offene Partie, ist Ersetzen gesperrt;
  diese muss vorher ausdruecklich abgebrochen werden.
  Die Vorschau warnt ausdruecklich vor dem Ersetzen des gesamten
  Ergebnisverlaufs und der daraus berechneten Wertung und zeigt die
  Ergebnisanzahl der Sicherung und des lokalen Stands, einschliesslich
  K.-o.-Ergebnissen. Auch eine aeltere
  Sicherung mit weniger oder keinen Ergebnissen ersetzt alles;
  neuere lokale Ergebnisse gehen dabei bewusst verloren.
  Das gilt auch fuer eine gestartete Vorrunde: Eine aeltere
  Vorbereitungssicherung setzt nach Codepruefung und Ersetzungsbestaetigung
  bewusst den gesamten Stand zurueck. Dies ist keine normale Einstellungsaenderung.
  Eine gesicherte Vorrunde wird hingegen mit gesperrter Vorbereitung
  und derselben Spielendenliste wiederhergestellt.
- Beschaedigte Dateien, unbekannte Versionen/Felder und widerspruechliche
  Einstellungen werden mit Importfehler abgewiesen. Vorhandene Turniere
  bleiben ebenso bei Lese-/Speicherfehlern unveraendert.
- Uebertragung in einen anderen Browser oder auf ein anderes Geraet erfolgt
  durch Kopieren und Importieren der Datei, nicht automatisch.
  Eine gesicherte offene Partie laeuft nach dem Import mit denselben
  Zeitpunkten weiter; bereits abgelaufene Zeit bleibt abgelaufen.
  Nicht gespeicherte Toreentwuerfe sind kein Bestandteil der Sicherung.
  Ergebnisse und die daraus berechnete Wertung werden vollstaendig
  wiederhergestellt, einschliesslich K.-o.-Spielplan und festgelegter Teams.
  CSV wird nicht unterstuetzt.

Alte Turniere und Sicherungen ohne Spielendenliste bleiben nutzbar und
zeigen eine leere Liste. Neue Vorbereitungsdaten verwenden weiterhin
Datenschema 2 mit ausdruecklicher Spielendenliste. Ab dem ersten Partiestart
verwendet ein Turnier Schema 3 mit offener Partie oder ausdruecklichem
Leerwert nach Abbruch. Mit dem ersten gespeicherten Ergebnis folgt
Schema 4 mit ausdruecklichem Ergebnisverlauf; dieses Schema bleibt bei
weiteren Starts und Abbruechen erhalten. Der K.-o.-Start verwendet Schema 5
mit eingefrorener Vorrundentabelle, festen Teams und separaten K.-o.-Ergebnissen.
Alte Schemata ohne Ergebnisse oder K.-o.-Daten bleiben lesbar und koennen
normal fortgesetzt werden.
Die Sicherungshuellen-Version bleibt 1. Alte App-Versionen koennen die
jeweils neueren Schemata nicht bearbeiten und daher keine unbekannten
Daten versehentlich entfernen. Nach einem Deployment offene App-Tabs
neu laden. Ungueltige oder doppelte Spielenden-IDs, Spitznamen und Avatare
sowie doppelte Partie-IDs, ungueltige Endstaende, widerspruechliche
Aufstellungen und Partiezeitpunkte werden beim Laden/Importieren
abgewiesen. Das gilt auch fuer widerspruechliche K.-o.-Teams, veraenderte
Vorrunden-Snapshots und eine falsche Begegnungsreihenfolge.
Nicht mehr exakt darstellbare Punktesummen werden ebenfalls
mit Fehler zurueckgewiesen, statt falsche Ranglisten zu speichern.

## Lokal starten

Voraussetzung: Node.js 24 LTS einschliesslich npm.
Im Terminal im Repository-Verzeichnis:

```powershell
Set-Location app
npm ci
npm run configure-access
npm run dev
```

`configure-access` fragt interaktiv nach einem ausschliesslich fuer diese App
verwendeten Master-Zugangscode. Die Eingabe ist im Terminal sichtbar.
Gespeichert wird nur dessen SHA-256-Pruefwert in der Git-ignorierten
Datei `app\.env.local`, nicht der Klartext. Das Skript gibt ausserdem den
Pruefwert fuer die GitHub-Konfiguration aus. Code nicht als Kommandoargument
oder in Quelltextdateien hinterlegen. Nach Aenderung den Dev-Server neu starten.

Die App ist standardmaessig unter
`http://localhost:5173/seal_kickerturnier_app/` erreichbar; bei belegtem Port
zeigt Vite einen anderen Port an. Ohne gueltigen Pruefwert bleibt der Zugang
gesperrt. Der Produktions-Build bricht bei fehlender Konfiguration ab.
Es gibt keinen voreingestellten Master-Zugangscode.

## Pruefen und bauen

Im Verzeichnis `app`:

```powershell
npm test
npm run lint
npm run build
npm run preview
```

Der Build prueft auch die TypeScript-Typen von Anwendung, Tests und
Vite-Konfiguration. Der Testcode verwendet ausschliesslich synthetische
Testeingaben und benoetigt keinen echten Zugangscode.
Die Vorschau liegt standardmaessig unter
`http://localhost:4173/seal_kickerturnier_app/`.

## GitHub Pages einrichten

1. Lokal `npm run configure-access` ausfuehren und den ausgegebenen
   SHA-256-Pruefwert kopieren, nicht den eingegebenen Code.
2. Im GitHub-Repository unter **Settings > Secrets and variables > Actions >
   Variables** die Repositoryvariable `MASTER_CODE_HASH` mit diesem Wert
   anlegen. Der Hash ist keine geheime Server-Zugangsinformation.
3. Unter **Settings > Pages > Build and deployment > Source** die Quelle
   **GitHub Actions** waehlen.
4. Aenderungen nach `main` pushen oder den Workflow **Validate and deploy
   Pages** manuell starten.
5. Nach erfolgreichem Deployment
   `https://sebastianalbrechtsenacor.github.io/seal_kickerturnier_app/`
   aufrufen. Massgeblich ist die im Deployment ausgegebene Pages-URL.

Der [Workflow](./.github/workflows/deploy.yml) fuehrt Installation aus dem
Lockfile, Tests, Linting und Build aus. Nur ein erfolgreicher Build von
`main` wird veroeffentlicht; Pull Requests werden nur geprueft.
Ein neuer Pruefwert in der Repositoryvariable wird erst mit einem neuen
Build wirksam. Der Projekt-Basispfad ist in der
[Vite-Konfiguration](./app/vite.config.ts) festgelegt; bei Umbenennung
des Repositorys muss er angepasst werden.

## Grenzen des Zugangs

Master- und Turnier-Zugangscodes sind ausschliesslich umgehbare
Frontend-Zugangshuerden, kein verlaesslicher Schutz einer nichtoeffentlichen
Anwendung. Pruefwert und Prueflogik werden an den Browser ausgeliefert;
auch ein Hash ermoeglicht keine sichere Zugriffskontrolle.
Keine echten, vertraulichen oder anderweitig verwendeten Passwoerter nutzen.
Es wird kein Code an einen Anmeldeserver gesendet. Die Daten sind durch die
Zugangsmaske nicht verschluesselt.

## Bekannte Grenzen

Kein Backend und keine automatische Synchronisation zwischen Geraeten.
Geloeschte Browserdaten koennen ohne Sicherung zum Datenverlust fuehren.

Technische Grenzen und recherchierte Quellen stehen im
[Epic](./spec/epic-1-DONE.md#technische-recherche-stand-24112026).
