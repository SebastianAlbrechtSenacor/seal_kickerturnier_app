# Story 1.8: Ergebnis bestaetigen und Punkte auswerten

Status: Grundspezifikation freigegeben am 24.11.2026.
Die nachstehende Bedienkonkretisierung und die ergaenzten Akzeptanzszenarien
wurden am 25.11.2026 ausdruecklich zur Umsetzung freigegeben.
Die Story ist umgesetzt und automatisiert sowie im Browser getestet.
Beide Entwickler-Praxispruefungen sind bestanden; die Story wurde
am 25.11.2026 ausdruecklich abgenommen.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.7](./story-1_7-DONE.md).

Als teilnehmende Person moechte ich ein eindeutiges Endergebnis bestaetigen,
damit alle vier Personen ihre individuellen Punkte erhalten.

## Bedienkonkretisierung vom 25.11.2026

Vom Entwickler bestaetigte Anforderungen:
- Nach erfolgreichem Speichern wird sofort und ohne weiteren Klick die
  Vorbereitung der naechsten Partie mit vier leeren Positionen geladen.
- Unter der kompakten Platzierungstabelle links stehen die letzten drei
  abgeschlossenen Partien. Der Tisch rechts behaelt seine bisherige Anordnung.
- In der Turnieruebersicht stehen alle abgeschlossenen Partien direkt unter
  der vollstaendigen Platzierungstabelle. Es gibt keine separate Ergebnisansicht.
- Die Turnierinformationen werden in dieser Uebersicht ebenso platzsparend
  wie in der Partievorbereitung dargestellt, statt als grosse Detailflaechen.
- Das bewusste Ersetzen eines ganzen Turniers durch eine Sicherung bleibt
  erlaubt, wenn keine Partie offen ist. Eine ausdrueckliche Warnung macht
  deutlich, dass dabei auch der Ergebnisverlauf ersetzt wird.

Zusaetzlich freigegebene Details:
- Der Verlauf zeigt die zuletzt gespeicherte Partie zuerst, mit Endstand,
  beiden Teams samt Namen/Avataren und Abschlusszeit in Eschborner Ortszeit.
  Es gibt keine Bearbeitungs- oder Loeschaktionen.
- Ohne abgeschlossene Partie steht ein kurzer Leerhinweis. Abgebrochene
  oder noch offene Partien sind keine Ergebnisse.
- Alle Turnierinformationen bleiben erreichbar: Name, Start, Ort,
  Partiedauer und Punkte kompakt im Infofuss; Beschreibung und Zeitplanung
  einschliesslich geplanter Phasendauern platzsparend aufklappbar.
  In der Turniervorbereitung vor Vorrundenstart bleibt die bisherige
  Darstellung unveraendert.
- Die laufende Partie behaelt ihre bisherige Anordnung; die neue
  Ergebnisliste wird in Partievorbereitung und Turnieruebersicht angezeigt.
- Gespeicherte abgeschlossene Partien sind die einzige Quelle fuer Punkte
  und Statistik; es werden keine unabhaengigen Punktestaende hochgezaehlt.

## Akzeptanzszenarien

### A: Bestaetigung und Wertung
- Gegeben ist eine abgelaufene Vorrundenpartie mit Standardpunkten.
- Wenn ich Weiss 7 und Schwarz 5 eingebe,
- dann zeigt eine Bestaetigung beide Teams, Ergebnis und Hinweis auf die
  anschliessende Unveraenderlichkeit.
- Wenn ich ausdruecklich bestaetige,
- dann werden genau eine Partie und ihr Ergebnis gespeichert. Jede weisse
  Person erhaelt 3 Punkte und einen Sieg, jede schwarze 1 Punkt und eine
  Niederlage. Je Person steigen Spiele um eins; Teamtore und Gegentore
  gehen jeweils in ihre persoenliche Torstatistik ein.
  Die Tabelle wird sofort neu sortiert. Ohne weiteren Klick wird die
  Vorbereitung der naechsten Partie mit vier leeren Positionen angezeigt;
  "Spiel starten" ist bis zur vollstaendigen neuen Belegung gesperrt.
  Das neue Ergebnis steht direkt an erster Stelle unter der Tabelle.

### B: Konfigurierte Punkte und wechselnde Teams
- Gegeben sind vor Turnierstart 5 Siegpunkte und 2 Niederlagenpunkte festgelegt.
- Wenn eine Person in wechselnden Zweierteams einmal gewinnt und einmal verliert,
- dann hat sie individuell 7 Punkte, unabhaengig von ihren Teampartnern.
  Nur erfolgreich gespeicherte Vorrundenpartien zaehlen.
Nicht beteiligte Personen erhalten weder Punkte noch Statistikzuwachs.

### C: Ungueltiges Ergebnis
- Gegeben ist die Ergebniseingabe.
- Wenn ich Gleichstand einschliesslich 0:0, negative Zahlen, Bruchteile,
  fehlende Werte oder mehr als 10 Tore eingebe,
- dann erscheint ein konkreter Fehler und Bestaetigen ist nicht moeglich.
  Bei Gleichstand nach Zeitablauf fordert die App zum naechsten Tor auf.
  Vor Zeitablauf ist auch ein Ergebnis wie 7:5 nicht speicherbar.
  10:9 ist sowohl bei vorzeitigem Ende als auch nach Ablauf gueltig.
- Beim verbindlichen Speichern werden Ergebnis und urspruenglicher
  Endzeitpunkt erneut geprueft; eine vorherige Vorschau ersetzt diese
  Pruefung nicht. Eine erfolgreiche vorzeitige Speicherung beendet den
  Timer dieser Partie; spaeter ertont kein automatischer Endpfiff mehr.

### D: Abbrechen der Bestaetigung und Schreibfehler
- Gegeben ist ein gueltiger, noch nicht gespeicherter Ergebnisentwurf.
- Wenn ich die Bestaetigung abbreche,
- dann kann ich den Entwurf aendern, ohne dass Punkte entstehen.
- Wenn das Speichern fehlschlaegt,
- dann bleiben Entwurf und offene Partie erhalten, ein Fehler erscheint
  und weder Wertung noch Anzeige behaupten einen erfolgreichen Abschluss.

### E: Einmaligkeit und Finalitaet
- Gegeben ist eine erfolgreich bestaetigte Partie.
- Wenn ich doppelt bestaetige, neu lade oder spaeter die Ergebnisliste oeffne,
- dann zaehlt die Partie genau einmal. Es gibt keine Funktion zur
  nachtraeglichen Korrektur oder Loeschung dieses Ergebnisses.
  Ergebnis, beteiligte Personen und Wertung sind nach Neuladen identisch.
Das ausdrueckliche Ersetzen des ganzen Turniers durch eine Sicherung
ist davon getrennt und wird in I beschrieben.

### F: Letzte drei Ergebnisse in der Partievorbereitung
- Gegeben ist ein Turnier mit mindestens vier gespeicherten Ergebnissen.
- Wenn ich die naechste Partie vorbereite, auch direkt nach einer Speicherung,
- dann zeigt die linke Spalte zuerst die kompakte Tabelle mit Rang,
Spielenden und Punkten und direkt darunter genau die letzten drei
gespeicherten Ergebnisse, zuletzt gespeichert zuerst.
Jedes Ergebnis zeigt Endstand, beide Teams mit Namen/Avataren und
Abschlusszeit. Der Tisch bleibt rechts; schmale Bildschirme ordnen
die Bereiche weiterhin untereinander an, ohne Seitenueberlauf.
- Gegeben sind null, ein oder zwei Ergebnisse,
- dann erscheint der Leerhinweis beziehungsweise genau diese Anzahl;
es werden weder Platzhalterpartien noch Abbrueche als Ergebnisse angezeigt.

### G: Vollstaendiger Verlauf und kompakte Turnierinformationen
- Gegeben ist die Turnieruebersicht eines gestarteten Turniers mit vier
oder mehr abgeschlossenen Partien.
- Wenn ich die Uebersicht oeffne,
- dann sehe ich die vollstaendige individuelle Tabelle und unmittelbar
darunter alle Ergebnisse, zuletzt gespeichert zuerst. Die Ergebnisliste
ist hier nicht auf drei Eintraege begrenzt.
Namen, Avatare, Endstand und Abschlusszeit sind wie in F sichtbar.
- Die Turnierinformationen folgen kompakt unterhalb des sportlichen
Inhalts. Beschreibung und vollstaendige Zeitplanung bleiben ueber
einen aufklappbaren Bereich lesbar; bestehende Export-/Navigationsaktionen
bleiben verfuegbar. Einstellungen und Spielendenliste bleiben gesperrt.

### H: Sicherung, Wiederherstellung und alte Turniere
- Gegeben ist ein Turnier mit mehreren Ergebnissen und gegebenenfalls
zusaetzlich einer offenen Partie.
- Wenn ich es als JSON sichere, importiere und erneut oeffne,
- dann bleiben Ergebnisse, vier Positionen je Partie, Tore, Zeitpunkte
und daraus berechnete individuelle Statistiken identisch.
Eine offene Partie behaelt ihre urspruenglichen Zeitpunkte und bleibt
von abgeschlossenen Ergebnissen getrennt.
- Alte Turniere und Sicherungen ohne Ergebnisverlauf bleiben lesbar,
haben zunaechst keine abgeschlossenen Ergebnisse und koennen regulaer
fortgesetzt werden, auch mit einer bereits gespeicherten offenen Partie.
- Doppelte Partie-IDs, unbekannte oder mehrfach eingesetzte Personen,
ungueltige Endstaende und widerspruechliche Zeitpunkte werden beim
Laden und Import mit Fehler abgewiesen, nicht stillschweigend entfernt.

### I: Bewusstes Ersetzen des gesamten Ergebnisverlaufs
- Gegeben ist ein lokales Turnier mit gespeicherten Ergebnissen und ohne
offene Partie sowie eine Sicherung derselben Turnier-ID.
- Wenn ich diese Sicherung zum Import auswaehle,
- dann warnt die Vorschau ausdruecklich, dass der gesamte lokale
Ergebnisverlauf und die daraus berechnete Wertung ersetzt werden,
auch wenn die Sicherung weniger oder keine Ergebnisse enthaelt.
- Erst nach bestehendem Turniercode und ausdruecklicher Ersetzungsbestaetigung
wird der gesamte Stand ersetzt. Abbrechen behaelt den lokalen Stand.
Ergebnisse werden nicht vermischt. Eine offene Zielpartie blockiert
das Ersetzen unveraendert.

### J: Konkurrierende Speicherung und atomarer Abschluss
- Gegeben ist dieselbe offene Partie in zwei Tabs oder eine inzwischen
abgeschlossene beziehungsweise abgebrochene Partie in einem veralteten Tab.
- Wenn mehrfach oder aus dem veralteten Tab verbindlich gespeichert wird,
- dann wird hoechstens ein Ergebnis fuer diese Partie gespeichert.
Ein Konflikt zeigt einen Fehler und fordert zum erneuten Oeffnen auf;
weder eine neue Partie noch deren Ergebnis werden ueberschrieben.
- Ergebnis hinzufuegen und offene Partie schliessen erfolgen zusammen:
Nach einem fehlgeschlagenen Schreibversuch gibt es weder zusaetzliche
Punkte noch eine verschwundene offene Partie. Der Entwurf bleibt wie in D
zur Korrektur beziehungsweise erneuten Speicherung erhalten.

## Validierung

Automatisiert: Ergebnisgrenzen, Unentschieden, individuelle Statistik,
abweichende Punkte, Sortierung, fehlgeschlagenes Speichern und Doppelsubmit.
Sicherungs-Roundtrip einschliesslich Partien und daraus berechneter Wertung.
Gezielte UI-Tests fuer sofortige Rueckkehr zur leeren Aufstellung,
aktualisierte Tabellen in Uebersicht/Vorbereitung/laufender Partie,
die Begrenzung auf drei Ergebnisse nur in der Vorbereitung, Leerzustaende
und den ausdruecklichen Ersetzungswarnhinweis.
Browserpruefung des gesamten Speicherablaufs, der kompakten Uebersicht
sowie der Tabellen-/Verlaufsanordnung bei breiter und schmaler Darstellung.

### Durchgefuehrte Pruefungen

- Gesamtsuite: 144 Tests in 12 Dateien bestanden; Linting, TypeScript-Pruefung
  und Produktionsbuild erfolgreich.
- A-E/J: Individuelle Wertung mit 3/1 und 5/2 Punkten, wechselnde Partner,
  unveraenderte Unbeteiligte, komplette Torstatistik und Rangfolge.
  Vorzeitiges 10:9, Ergebnisgrenzen, Endzeitpruefung innerhalb der
  Schreibsperre, keine spaetere Pfiffreservierung fuer abgeschlossene Partien.
- D/E/J: Fehler beim Schreiben behaelt Partie und Entwurf; Doppelsubmit
  und parallele Speicherungen erzeugen nur ein Ergebnis. Veraltete
  Speicherungen sowie Aendern/Loeschen gespeicherter Ergebnisse werden
  abgewiesen. UI wartet vor der leeren Folgeaufstellung auf die Speicherung.
- F/G: Null, zwei und vier Ergebnisse sowie die Drei-Ergebnis-Grenze
  gezielt getestet; Tabellenwerte auch in der folgenden laufenden Partie.
  Kompakte Turnierinfos sind aufklappbar, Vorbereitungsansicht vor
  Vorrundenstart bleibt erhalten.
- H/I: Roundtrip mit Ergebnissen und offener Partie, Pfiffreservierung und
  Abbruch ohne Verlaufsverlust, alte Schemata, bewusstes vollstaendiges
  Wiederherstellen. Ungueltige Ergebnisse, doppelte IDs und ungenaue
  Punktesummen werden abgewiesen. Importwarnung ist getestet.
- Browser: Vier Partien ueber die Oberflaeche abgeschlossen, davon eine
  nach Frist mit 7:5 und drei vorzeitig mit 10 Toren. Mit wechselnden
  Teams und 5/2 Punkten entstehen exakt 17/14/14/11/0 Punkte; alle
  Torstatistiken und die sortierte Rangfolge sind geprueft.
- Browser: Gleichstand abgewiesen, Quotenfehler simuliert und ohne
  Datenverlust wiederholt, Doppelklick unter echter Web-Lock-Sperre,
  sofortige Folgeaufstellung, letzter Dreierverlauf und alle vier
  Ergebnisse nach Neuladen geprueft.
- Browser: Exportierter JSON-Inhalt entspricht exakt dem gespeicherten
  Schema-4-Stand. Die erzeugte eigene Download-Datei wurde im
  Downloads-Verzeichnis gefunden und gezielt bereinigt.
  Import ueber das Dateifeld stellt Ergebnisdaten,
  Personen und Wertung wieder her. Warnung bei Ersetzen von vier durch
  null Ergebnisse, folgenloses Abbrechen, ausdrueckliches Ersetzen und
  weiterhin gesperrtes Ersetzen einer offenen Zielpartie geprueft.
- Layout-Messungen der Vorbereitung bei 320/390/740/1000/1001/1440 Pixeln:
  Verlauf unter der linken Tabelle, Tisch daneben beziehungsweise darunter,
  kein horizontaler Seitenueberlauf. Uebersicht bei 320/390/1440 Pixeln
  mit vollstaendigem Verlauf und nachgeordnetem Infofuss geprueft.
  Schmale Ergebniskarten visuell geprueft.

### Abgenommene Entwickler-Praxispruefungen

1. **Bedienung und Desktopdarstellung (A/F/G):** In einem separaten
   Testturnier vier Ergebnisse speichern, beispielsweise jeweils vorzeitig
   10:9. Erwartet: Nach jedem Speichern sofort vier leere Positionen und
   aktualisierte Punkte; ab dem vierten Ergebnis nur die letzten drei unter
   der linken Tabelle. Die Turnieruebersicht zeigt alle vier unter der
   vollstaendigen Tabelle, Turnierinfos kompakt unten und aufklappbar.
   Bitte Lesbarkeit und Anordnung am Turnierlaptop beurteilen.
2. **Tatsaechliche Sicherungsdatei (H/I):** Dasselbe Testturnier als JSON
   herunterladen und die entstandene Datei wieder zum Import auswaehlen.
   Erwartet: ausdrueckliche Warnung zu Ergebnisverlauf/Wertung und
   Ergebnisanzahlen; nach bestehendem Code, Ersetzungsbestaetigung und
   Import bleiben vier Ergebnisse, Aufstellungen und Punktestaende erhalten.
   Keine offene Partie im Zielturnier lassen.
   JSON-Inhalt, erzeugte Datei und Import sind bereits geprueft;
   bitte den Dateiablauf und den Warnhinweis im normalen Zielbrowser
   zusaetzlich auf Verstaendlichkeit beurteilen.

Der Entwickler hat beide Praxispruefungen als bestanden gemeldet
und die Story am 25.11.2026 ausdruecklich abgenommen.
