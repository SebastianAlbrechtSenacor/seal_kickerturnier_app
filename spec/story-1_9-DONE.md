# Story 1.9: K.-o.-Phase spielen

Status: Grundspezifikation freigegeben am 24.11.2026.
Die Bedienkonkretisierung und ergaenzten Akzeptanzszenarien vom 25.11.2026
wurden ausdruecklich zur Umsetzung freigegeben.
Am 25.11.2026 umgesetzt, automatisiert und im Browser getestet.
Beide Entwickler-Praxispruefungen sind bestanden. Die anschliessende
UI-Rueckmeldung mit G2/G3 ist ausdruecklich freigegeben, umgesetzt und
getestet. Auch die erneute Layoutpruefung P3 ist bestanden.
Story 1.9 wurde am 25.11.2026 ausdruecklich abgenommen.
Epic: [Epic 1](./epic-1-DONE.md)
Abhaengigkeiten: [Story 1.8](./story-1_8-DONE.md).

Als teilnehmende Person moechte ich die besten acht Personen in festen
Zweierteams durch Halbfinals, Platzierungsspiel und Finale begleiten.

## Bedienkonkretisierung vom 25.11.2026

Vom Entwickler bestaetigt:
- Die K.-o.-Phase soll die Darstellung der Vorrundenpartien fuer einen
  hohen Wiedererkennungsgrad weitestgehend wiederverwenden.
- Es gilt unveraendert die bestehende Tabellenreihenfolge, ohne
  Mindestspielzahl. Auch Personen ohne absolviertes Vorrundenspiel koennen
  unter den ersten acht stehen. Die bekannten Rangentscheidungen gelten
  bis einschliesslich des deutschen Spielernamens.

Zusaetzlich freigegebene Konkretisierung:
- **K.-o.-Phase starten** steht in der Turnieruebersicht. Vor Bestaetigung
  werden die acht Qualifizierten mit Rang, Name und Avatar sowie die vier
  Paarungen A=1+8, B=2+7, C=3+6, D=4+5 gezeigt. Der unumkehrbare Wechsel
  wird ausdruecklich benannt. Eine laufende/offene Partie sperrt den Start.
- Links steht gemaess freigegebener UI-Rueckmeldung direkt der kompakte
  Spielplan mit allen vier K.-o.-Begegnungen und ihrem jeweiligen Status.
  Eine zusaetzliche Vorrundentabelle neben dem Tisch entfaellt;
  die vollstaendige eingefrorene Vorrunde bleibt im unteren Archiv.
- Rechts bleiben Tischdarstellung, vier grosse Avatare und die bekannten
  Start-, Countdown-, Ton-, Ergebnis- und Abbruchaktionen erhalten.
  Die beiden Personen jedes festen Teams stehen automatisch auf derselben
  Tischhaelfte. Es gibt weder Ziehen noch Positions- oder Farbauswahl;
  Beschriftungen nennen Teams statt Angriff/Verteidigung oder Weiss/Schwarz.
  Die Tischfarben bleiben Gestaltung und sind keine weitere Auswahl.
- Oberhalb des Tischs ist die aktuelle Begegnung benannt. Vor Start sind
  ihre vier Personen bereits eingesetzt und **Spiel starten** ist
  verfuegbar. Erst erfolgreiches Speichern startet den Countdown.
  Dauer, Audioaktivierung und sichtbarer Ablaufhinweis entsprechen der
  Vorrunde; nachtraegliches Oeffnen einer abgelaufenen Partie pfeift nicht.
- Die Ergebniseingabe benennt beide Teams mit ihren Personen. Vorschau,
  Hinweis auf Unveraenderlichkeit, Korrektur vor Bestaetigung und
  **Ergebnis verbindlich speichern** bleiben wie gewohnt.
  K.-o.-Partien vergeben ausdruecklich keine Vorrundenpunkte.
- Nach erfolgreicher Ergebnisspeicherung wird direkt dieselbe vertraute
  Ansicht fuer die naechste feste Begegnung geladen. Die vier Avatare
  sind automatisch besetzt, der Timer laeuft erst nach erneutem Start.
  Nach Abbruch ist dieselbe Begegnung mit denselben Teams neu startbar.
- Die vollstaendige eingefrorene Vorrundentabelle und alle bisherigen
  Vorrundenergebnisse bleiben ueber einen aufklappbaren Bereich erreichbar.
  Turnierinformationen und Export-/Navigationsaktionen bleiben kompakt unten.
- Auf schmalen Bildschirmen stehen die Bereiche wie bisher untereinander.
- Nach dem bestaetigten Finale zeigt Story 1.9 den vollstaendigen Spielplan
  mit dem Hinweis **K.-o.-Phase abgeschlossen**. Weitere Spiele sind gesperrt,
  auch nach erneutem Oeffnen. Der separate feierliche Abschlussbildschirm
  mit beiden Wertungen und Animation folgt erst in Story 1.10.

## Akzeptanzszenarien

### A: Qualifikation und unumkehrbarer Wechsel
- Gegeben ist die Vorrunde mit mindestens acht Spielenden ohne offene
  Partie oder offene Ergebniseingabe.
- Wenn ich den K.-o.-Start ausloese,
- dann zeigt die App die acht Qualifizierten und die vorgeschlagenen Teams
  zusammen mit dem Hinweis auf den unumkehrbaren Wechsel.
- Wenn ich bestaetige,
- dann speichert sie den vollstaendigen Vorrundenstand und bildet gemaess
  dessen Rangfolge A=1+8, B=2+7, C=3+6, D=4+5.
  Weitere Vorrundenpartien und eine Rueckkehr in die Vorrunde sind gesperrt.
  Auch bei mehr als acht Personen qualifizieren sich genau acht.
  Eine Mindestanzahl absolvierter Spiele ist nicht erforderlich.

### B: Verhinderter oder abgebrochener Wechsel
- Gegeben sind weniger als acht Personen, eine offene Partie oder eine
  noch nicht gespeicherte Ergebniseingabe.
- Wenn ich den K.-o.-Start versuche,
- dann bleibt er mit erkennbarem Grund gesperrt.
- Gegeben ist dagegen ein erlaubter Wechsel mit Bestaetigungsdialog.
- Wenn ich abbreche oder das Speichern fehlschlaegt,
- dann bleiben Phase, Teams und Vorrundenstand unveraendert; ein
  Speicherfehler wird sichtbar gemeldet.

### C: Fester Spielplan
- Gegeben ist eine gestartete K.-o.-Phase.
- Wenn ich die Begegnungen nacheinander spiele,
- dann folgt auf Halbfinale A gegen D das Halbfinale B gegen C, danach
  spielen die beiden Verliererteams um Platz 3 und die beiden Siegerteams
  das Finale. Eine spaetere Begegnung startet erst nach bestaetigtem
  Ergebnis ihrer notwendigen Vorgaenger und ohne andere offene Partie.
  Partner bleiben unveraendert; es gibt keine Weiss-/Schwarz- oder
  Angriffs-/Verteidigungsauswahl.
  Insbesondere wird das Finale erst nach dem gewerteten Spiel um Platz 3
  startbar; eine bekannte Teambesetzung allein erlaubt kein Ueberspringen.

### D: Timer und Teamergebnis
- Gegeben ist die naechste K.-o.-Begegnung.
- Wenn ich sie starte und anschliessend ein Ergebnis erfasse,
- dann gelten dieselbe Turnierdauer, derselbe Pfiff, die 10-Tore-Regel,
  Golden Goal und die ausdrueckliche finale Bestaetigung wie in der Vorrunde.
  Die Eingabefelder nennen die festen Teams mit beiden Personen statt
  Farben oder Positionen. Ein Gleichstand wird nicht angenommen.

### E: Abbruch, Neuladen und doppelte Bestaetigung
- Gegeben ist eine laufende K.-o.-Begegnung.
- Wenn ich neu lade,
- dann bleiben Teams und urspruenglicher Endzeitpunkt erhalten.
- Wenn ich die Begegnung bestaetigt abbreche,
- dann bleibt genau diese Begegnung ungewertet und kann neu gestartet werden.
  Es wird kein Sieger eingetragen oder Folgespiel freigeschaltet.
- Wenn ich ein gueltiges Ergebnis mehrfach bestaetige,
- dann wird es nur einmal gespeichert und der Spielplan nur einmal fortgesetzt.

### F: Unveraenderliche Vorrunde
- Gegeben sind gespeicherte K.-o.-Ergebnisse.
- Wenn ich die Vorrundentabelle ansehe oder das Turnier exportiere und importiere,
- dann entsprechen alle Vorrundenwerte exakt dem eingefrorenen Stand.
  K.-o.-Tore, Siege und Ergebnisse beeinflussen keine Vorrundenpunkte
  oder Qualifikationsplaetze.
Der Snapshot umfasst alle Spielenden, nicht nur die acht Qualifizierten.

### G: Vertraute Darstellung und automatisch besetzte Folgepartie
- Gegeben ist die gestartete K.-o.-Phase vor einer Begegnung.
- Wenn ich den K.-o.-Bildschirm oeffne,
- dann sehe ich links ausschliesslich den Spielplan mit Halbfinale 1,
Halbfinale 2, Platz 3 und Finale.
Unbekannte spaetere Paarungen sind als Sieger/Verlierer ihrer
Halbfinals benannt, nicht mit erfundenen Personen besetzt.
- Rechts zeigt der bekannte Tisch die vier automatisch eingesetzten
Personen der naechsten Begegnung mit den bisherigen grossen Avataren.
Das Team ist erkennbar, es gibt keine veraenderbaren Positionsfelder.
- Wenn ich das Ergebnis verbindlich speichere,
- dann werden Ergebnis und Fortschritt zuerst zusammen gespeichert.
Erst danach zeigt dieselbe Ansicht die naechste Begegnung mit ihren
festen Personen. Diese Partie laeuft noch nicht und muss gestartet werden.
Die vollstaendige Vorrundentabelle und ihr Ergebnisverlauf bleiben lesbar.
- Bei schmaler Darstellung stehen die Bereiche untereinander; weder
Spielplan noch Ergebnisfelder erzeugen horizontalen Seitenueberlauf.

### H: Schreibfehler und konkurrierende Aktionen
- Gegeben ist eine K.-o.-Startbestaetigung, eine startbare Begegnung oder
ein gueltiger Ergebnisentwurf.
- Wenn der jeweilige Schreibversuch fehlschlaegt,
- dann erscheint ein Fehler und der letzte gespeicherte Stand bleibt
erhalten. Ein Ergebnisentwurf geht nicht verloren, es wird weder ein
Sieger angezeigt noch eine Folgepartie freigeschaltet.
- Wenn doppelt oder aus einem veralteten Tab gestartet, bestaetigt oder
abgebrochen wird,
- dann entstehen weder doppelte Ergebnisse noch eine zweite offene Partie.
Ein Konflikt fordert zum erneuten Oeffnen auf, ohne einen neueren Stand
unbemerkt zu ueberschreiben.

### I: Sicherungen mit K.-o.-Daten
- Gegeben ist eine K.-o.-Phase mit gespeicherten Ergebnissen und
gegebenenfalls laufender Begegnung.
- Wenn ich exportiere, importiere und das Turnier erneut entsperre,
- dann bleiben Snapshot, Qualifikation, feste Teams, Spielplanfortschritt
und Ergebnisse identisch. Eine offene Begegnung behaelt ihre
urspruenglichen Zeitpunkte; eine abgelaufene bleibt abgelaufen.
- Eine offene K.-o.-Begegnung im Zielturnier sperrt das Ersetzen durch
eine Sicherung ebenso wie eine offene Vorrundenpartie.
Ohne offene Partie bleibt bewusstes vollstaendiges Wiederherstellen
mit Code, Warnung und Bestaetigung moeglich. Die Warnung beruecksichtigt
auch gespeicherte K.-o.-Ergebnisse.
- Alte Turniere bleiben ohne K.-o.-Daten lesbar. Widerspruechliche Teams,
veraenderte Snapshots, ungueltige Endstaende und eine falsche
Begegnungsreihenfolge werden beim Laden/Importieren abgewiesen.

### J: Vollstaendiger Spielplan vor Story 1.10
- Gegeben sind drei gewertete K.-o.-Begegnungen und das offene Finale.
- Wenn ich dessen gueltiges Ergebnis verbindlich bestaetige,
- dann sind alle vier Ergebnisse dauerhaft gespeichert und der Spielplan
zeigt **K.-o.-Phase abgeschlossen**. Kein weiterer Start oder erneuter
Phasenwechsel ist moeglich. Vorrundenwerte bleiben unveraendert,
Export und Navigation bleiben verfuegbar.
- Neuladen und Import desselben abgeschlossenen Stands behalten diesen
Zustand. Der feierliche Abschlussbildschirm ist nicht Teil dieser Story.

## Validierung

Automatisiert: alle Zugangsvoraussetzungen, Top-8 mit Gleichstaenden,
Teamzuordnung, kompletter Spielbaum, Abbruch, Persistenz, Doppelsubmit
und unveraenderter Vorrundenstand. Sicherungs-Roundtrip in der K.-o.-Phase.
Zusaetzlich: kein Mindestspielzwang, automatische Folgebegegnung erst
nach erfolgreichem Speichern, Fehlererhalt, Audio-/Ergebnisregeln wie
in der Vorrunde und dauerhafter Zustand nach dem vierten Ergebnis.
Browserpruefung eines vollstaendigen Durchlaufs, der vertrauten Tischansicht
und der Anordnung bei breiter/schmaler Darstellung.
Danach Entwicklerfeedback und erforderliche Praxispruefungen vor Abnahme.

### Durchgefuehrte Pruefungen am 25.11.2026

- Gesamtsuite: **155 Tests in 14 Dateien bestanden**; Linting,
  TypeScript-Pruefung und Produktions-Build erfolgreich.
  Neue Regressionstests:
  [K.-o.-Modell](../app/src/knockout.test.ts) und
  [Bedienung](../app/src/KnockoutBoard.test.tsx).
- A/B: Top 8 aus zehn Personen einschliesslich Namensentscheid bei gleichen
  Werten und Qualifikation ohne gespielte Partie; feste Paare; Startsperre
  bei sieben Personen oder offener Vorrundenpartie; Vorschau, Abbrechen und
  fehlgeschlagener Phasenwechsel ohne gespeicherte Aenderung.
- C/D: Vollstaendiger Spielbaum mit korrekten Verlierer-/Siegerpaaren und
  fester Reihenfolge; Wiederverwendung der Vorrunden-Ergebnisvalidierung.
  Im Browser vor Ablauf 7:5 abgewiesen, nach Ablauf angenommen; Gleichstand
  mit Golden-Goal-Hinweis abgewiesen. Teamnamen und Personen stehen an den
  Eingaben und in der ausdruecklichen Ergebnisbestaetigung.
- E/H: Abbruch/Verwerfen, Neustart derselben Begegnung mit neuer Partie-ID,
  Neuladen bei 00:30 mit unveraendertem Endzeitpunkt, einmaliges Werten bei
  Doppelklick sowie konkurrierende und veraltete Schreibzugriffe.
  Simulierte Speicherfehler bei Phasenwechsel, Start, Abbruch und Ergebnis
  erhalten den letzten gespeicherten Stand; der Toreentwurf bleibt erhalten.
- F/G: Vollstaendiger Browserdurchlauf mit 7:5, 9:10, 10:8 und 9:10.
  Der Vorrundenstand aller zehn Personen und der bisherige Ergebnisverlauf
  blieben exakt unveraendert. Folgebegegnungen sind automatisch besetzt,
  aber ohne laufenden Timer. Tischansicht visuell geprueft.
  Das Vorrundenarchiv ist vor, waehrend und nach Partien erreichbar.
- G: Vorschau, Spielplan, Torefelder mit langen Namen und aufgeklapptes
  Archiv bei 320, 390, 740, 1000, 1001 und 1440 Pixeln geprueft:
  kein horizontaler Seitenueberlauf; untereinander bis 1000 Pixel,
  Tabelle und Tisch nebeneinander ab 1001 Pixel.
  Die vollstaendige Archiv-Tabelle scrollt innerhalb ihres Bereichs.
- I: Offene und abgeschlossene K.-o.-Staende als Sicherung getestet;
  tatsaechlich heruntergeladene JSON-Datei mit Schema 5, zehn eingefrorenen
  Personen und vier K.-o.-Ergebnissen geprueft.
  Import ueber Dateieingabe, Code und Ersetzungsbestaetigung;
  Warnung zaehlt Vorrunden- und K.-o.-Ergebnisse zusammen.
  Offenes Zielturnier weist Ersetzen ab; nach bewusstem Wiederherstellen
  bleiben Daten identisch und die lokale Revision steigt.
  Abgelaufene importierte Partie bleibt bei 00:00 ohne nachtraeglichen Pfiff.
  Manipulierte Teams, Snapshots, Reihenfolgen, doppelte IDs und unpassende
  Schemaangaben werden abgewiesen; alte Daten bleiben lesbar.
- D/J: Audioerzeugung und einmalige automatische Pfiffmarkierung im Browser
  beobachtet; echte Hoerbarkeit ist damit nicht nachgewiesen.
  Nach vier Ergebnissen bleibt der abgeschlossene Spielplan ohne
  weitere Startaktion erhalten, auch nach Neuladen und Import.

### Entwickler-Praxispruefungen

Beide folgenden Pruefungen wurden am 25.11.2026 als bestanden gemeldet.
Der Entwickler bestaetigt die korrekte Umsetzung, erteilt aber wegen der
anschliessenden UI-Rueckmeldung noch keine Abnahme.

**P1 - Bekannte Bedienung und Lesbarkeit (G, ergaenzend A/C/E/F/J):**
Ein Testturnier mit mindestens acht Personen in die K.-o.-Phase ueberfuehren.
Am vorgesehenen Laptop Tisch, Teamnamen, Spielplan, aufgeklappte Vorrunde
und Ergebniseingabe pruefen; eine Partie abbrechen und neu starten,
anschliessend alle vier Ergebnisse bestaetigen und neu laden.
Erwartet: vertraute, gut lesbare und schnell bedienbare Partieansicht;
automatische, unveraenderliche Teams; naechste Begegnung erst nach
Bestaetigung und ohne automatischen Countdownstart. Die Vorrunde bleibt
unveraendert, nach dem Finale ist kein weiterer Start moeglich.

**P2 - Hoerbarer K.-o.-Pfiff am Zielgeraet (D):**
In einem separaten Testturnier vor Vorrundenstart eine Minute je Partie
einstellen. Eine K.-o.-Partie starten, bei Bedarf Ton testen/aktivieren
und bei eingeschalteter Geraetelautstaerke bis zum Ablauf offen lassen.
Erwartet: grosser Timer bei 00:00, sichtbarer Ablauf-/Golden-Goal-Hinweis
und genau ein automatischer hoerbarer Pfiff. Ein spaeteres erneutes Oeffnen
derselben bereits abgelaufenen Partie pfeift nicht nachtraeglich.

### UI-Rueckmeldung vom 25.11.2026: Spielplan statt doppelter Vorrunde

Bestaetigter Aenderungswunsch:
- Die kompakte Vorrundentabelle neben dem K.-o.-Tisch entfaellt.
- Links oben steht unmittelbar der K.-o.-Spielplan.
- Die vollstaendige Vorrundentabelle bleibt ausschliesslich unten im
  aufklappbaren Bereich **Vorrundenstand und Ergebnisse** erreichbar.
- Tisch, feste Teams, Timer, Ergebnisablauf und gespeicherte Daten bleiben
  unveraendert. Die vorhandenen Vorrundenergebnisse bleiben im Archiv.

Die folgenden ergaenzten Szenarien wurden ausdruecklich freigegeben und
umgesetzt. Sie ersetzen die urspruengliche Anforderung einer kompakten
linken Vorrundentabelle; Bedienkonkretisierung und Szenario G sind angepasst.
Alle weiteren Akzeptanzkriterien gelten unveraendert.

**G2 - Spielplan als linke Hauptansicht:**
- Gegeben ist eine K.-o.-Phase vor einer Begegnung, waehrend einer offenen
  Partie oder nach dem Finale.
- Wenn ich den K.-o.-Bildschirm oeffne,
- dann steht links direkt der Spielplan mit allen vier Begegnungen,
  den bisherigen Ergebnissen und dem aktuellen Status.
  Dort erscheint keine Vorrundentabelle.
  Der bekannte Tisch beziehungsweise laufende Timer oder Abschlusshinweis
  bleibt rechts unveraendert. Auf schmalen Bildschirmen steht der Spielplan
  vor diesem Bereich; es entsteht kein horizontaler Seitenueberlauf.

**G3 - Vorrunde ausschliesslich im Archiv:**
- Gegeben ist derselbe K.-o.-Bildschirm, auch bei mehr als acht Personen.
- Wenn der Bereich **Vorrundenstand und Ergebnisse** geschlossen ist,
- dann ist keine Vorrundentabelle sichtbar.
- Wenn ich ihn aufklappe,
- dann erscheinen dort genau eine vollstaendige eingefrorene
  Vorrundentabelle aller Personen und alle Vorrundenergebnisse.
  Zuklappen veraendert weder Spielplan noch laufende Partie oder Daten.

Validierung der Anpassung:
- Alle 27 gezielt betroffenen Bedienungstests fuer K.-o.-Ansicht, laufende
  Partie und Vorrundenvorbereitung bestanden; Linting, Typpruefung und Build
  erfolgreich. Drei neue faellebezogene Tests decken Vorbereitung,
  laufende Begegnung und Abschluss ab: genau eine Tabelle, ausschliesslich
  im Archiv, alle zehn Personen und neun Spalten, vollstaendiger Verlauf.
  Auf-/Zuklappen veraendert weder Daten noch laufenden Timer.
- Im Browser alle drei Zustaende bei 320, 390, 740, 1000, 1001 und
  1440 Pixeln geprueft: Spielplan links beziehungsweise vor dem Tisch,
  kein horizontaler Seitenueberlauf, keine Tabelle neben dem Tisch.
  Aufgeklapptes Archiv ebenfalls bei 320 und 1440 Pixeln geprueft.
  Ansicht visuell kontrolliert und alle vier Begegnungen erneut durchlaufen.

**P3 - Feedback zur geaenderten Anordnung (G2/G3): bestanden.**
Am vorgesehenen Laptop die K.-o.-Ansicht vor und waehrend einer Partie
ansehen, das Archiv auf-/zuklappen und das Browserfenster schmaler machen.
Erwartet: links beziehungsweise oben direkt der gut lesbare Spielplan;
keine zusaetzliche Vorrundentabelle neben dem Tisch. Nur das untere Archiv
zeigt bei Bedarf die vollstaendige Vorrunde und deren Ergebnisse.
Der Entwickler hat diese Pruefung als bestanden gemeldet und die Story
am 25.11.2026 ausdruecklich abgenommen.
Die bereits bestandene Hardware-Pfiffpruefung muss fuer diese reine
Anordnungsaenderung nicht wiederholt werden.
