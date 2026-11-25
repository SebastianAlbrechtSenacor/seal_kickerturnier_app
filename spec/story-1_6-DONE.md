# Story 1.6: Vorrundenpartie besetzen

Status: Umgesetzt, getestet und vom Entwickler ausdruecklich abgenommen,
einschliesslich der UI-Anpassungen und der erneuten Praxispruefungen F-H.
Urspruengliche Spezifikation freigegeben am 24.11.2026,
Bedienkonkretisierung am 25.11.2026.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.5](./story-1_5-DONE.md).

Als teilnehmende Person moechte ich vier Spielende den vier Positionen am
visualisierten Kickertisch primaer per Ziehen mit Maus oder Touch zuordnen;
Klick-/Tastaturauswahl steht als Alternative bereit.

## Akzeptanzszenarien

### A: Vollstaendige Aufstellung
- Gegeben ist eine Vorrunde ohne offene Partie.
- Wenn ich vier verschiedene Personen den Positionen Weiss Angriff,
  Weiss Verteidigung, Schwarz Angriff und Schwarz Verteidigung zuordne,
- dann sind Name und Avatar an der jeweiligen Position sichtbar.
  Erst mit vier vollstaendig belegten Positionen wird "Spiel starten"
  bedienbar und visuell hervorgehoben.

### B: Unvollstaendig oder doppelt
- Gegeben sind weniger als vier belegte Positionen.
- Wenn ich einen bereits eingesetzten Spieler erneut einsetzen oder
  die unvollstaendige Partie starten will,
- dann entstehen weder eine Doppelbesetzung noch eine laufende Partie.
  Belegte Positionen und der noch fehlende Bedarf sind erkennbar.

### C: Aendern vor Spielstart
- Gegeben sind vier belegte Positionen, aber noch kein Spielstart.
- Wenn ich eine Belegung entferne oder durch eine andere freie Person ersetze,
- dann wird sie angepasst; beim Entfernen wird der Start wieder deaktiviert.
  Vier Belegungen allein frieren die Auswahl noch nicht ein.

### D: Auswahl zuruecksetzen
- Gegeben ist eine gewertete oder bestaetigt abgebrochene Vorrundenpartie.
- Wenn ich die naechste Partie vorbereite,
- dann sind alle vier Positionen leer. Ich darf dieselben vier Personen
  erneut auswaehlen, muss aber jede Position neu belegen.

## Validierung

Automatisiert: Positionszuordnung, Eindeutigkeit, Aktivierung und Reset.
Browserpruefung: echtes Maus-Ziehen, emuliertes Touch-Ziehen,
Klick-/Tastaturalternative und responsives Layout.

## Freigegebene Bedienkonkretisierung vom 25.11.2026

Auf Wunsch des Entwicklers wird Drag-and-drop zur primaeren Bedienung:

- **Partie vorbereiten** oeffnet eine zweigeteilte Ansicht: links die
  individuelle Tabelle, rechts der visualisierte Tisch mit vier Positionen
  und der Startaktion. Turnierinformationen erscheinen kompakt am unteren Rand.
  Auf schmalen Bildschirmen stehen die Bereiche untereinander.
- Spielende werden an Name/Avatar aus der Tabelle auf eine Position gezogen.
  Das Ziehen soll Maus und Touch unterstuetzen; ausserhalb der Drag-Flaechen
  bleiben Tabelle und Seite normal scrollbar.
- Als gleichwertige Alternative kann zuerst eine Position und danach eine
  freie Person in der Tabelle angeklickt/angetippt oder per Tastatur gewaehlt werden.
- Bereits eingesetzte Personen sind entsprechend markiert und fuer eine
  zweite Position nicht verfuegbar. Ablegen einer freien Person auf einer
  belegten Position ersetzt die Belegung und gibt die vorherige Person frei.
  Ablegen ausserhalb der Positionen aendert nichts und zeigt einen Hinweis.
- Jede Belegung ist einzeln entfernbar. Vollstaendige Belegung allein
  sperrt weder Ziehen noch Klickauswahl.
- Die Aufstellung ist ein ungespeicherter Entwurf. Rueckkehr zur Tabelle,
  Neuladen oder Mastersperre verwirft ihn; erneutes Vorbereiten beginnt leer.
  Eine Aktion zum Leeren der gesamten Aufstellung ist ebenfalls vorhanden.
- Abgrenzung zu Story 1.7: **Spiel starten** ist bei vier verschiedenen
  Personen aktiv und hervorgehoben, oeffnet in diesem Zwischenstand aber
  nur eine Aufstellungspruefung. Sie sagt ausdruecklich, dass noch keine
  Partie gestartet wurde und verbindlicher Start/Timer in Story 1.7 folgen.
  Rueckkehr zur bearbeitbaren Aufstellung ist moeglich.
- Der echte Reset nach gewerteter oder bestaetigt abgebrochener Partie aus D
  wird mit Story 1.7/1.8 vervollstaendigt. Es gibt hier noch keine laufende Partie.

### E: Primaere Ziehbedienung und Alternative
- Gegeben ist die zweigeteilte Vorbereitungsansicht.
- Wenn ich eine freie Person aus der Tabelle auf eine Position ziehe,
- dann zeigt diese Name und Avatar; Ersetzen, Entfernen und Doppelbelegungsschutz
  verhalten sich genauso wie bei der Alternative Position anklicken und Person waehlen.
- Wenn ich ausserhalb einer Position ablege oder das Ziehen abbreche,
- dann bleibt die Aufstellung unveraendert und die App zeigt einen Hinweis.

## Umsetzung und Testergebnisse

- Lokaler, nicht persistierter Aufstellungsentwurf mit gemeinsamen Regeln
  fuer bekannte Personen, vier verschiedene Positionen und Ersetzen.
  Turnier-/Sicherungsschema und gespeicherter Turnierstand bleiben unveraendert.
- Pointer Events mit Ziehschwelle, Vorschau, Zielmarkierung und
  Bildschirmrand-Scrolling; nur die Namens-/Avatarbuttons blockieren
  native Touch-Scrollgesten. Abgebrochene/ungueltige Drops melden den
  unveraenderten Zustand, ohne versehentliche Klickzuordnung danach.
- Vor der UI-Rueckmeldung: **104 Tests in neun Dateien bestanden**, einschliesslich acht neuer
  Tests fuer Aufstellungsregeln, Klick-/Tastaturbedienung, Maus-/Touch-
  Pointerhandler, Ersetzen, Entfernen, Pruefung, Konflikt und Entwurfsreset.
  Linting, TypeScript und Produktions-Build ebenfalls erfolgreich.
- Im isolierten Chromium-Browser mit synthetischen Daten geprueft:
  vier Maus-Zuordnungen einschliesslich mehrteiligem Emoji, Ersetzen,
  Doppelbelegungsschutz, ungueltiger Drop bei ausgewaehlter Position,
  Aufstellungspruefung und Rueckkehr ohne Speicherung, Tastaturalternative,
  Entfernen sowie Leerstart nach Neuladen und Mastersperre.
- Native Touch-Eingaben per Browseremulation geprueft: Ziehen auf die
  Position bei 390 Pixeln Breite mit 408 Pixeln Rand-Scrolling;
  separates Wischen auf Statistikzellen scrollt die Tabelle und behaelt
  den Tabellenkopf sichtbar.
- Layout bei 320, 390, 1024 und 1440 Pixeln ohne horizontalen Seitenueberlauf
  geprueft; schmal untereinander, am Laptop nebeneinander.
  Desktopansicht und schmale Tischansicht zusaetzlich visuell kontrolliert.

### Entwicklertests der urspruenglichen Umsetzung: bestanden

Ausgangslage: Testturnier mit mindestens fuenf Personen in gestarteter Vorrunde.

1. **A/B/C/E, Maus und Layout:** Vier Personen auf die Positionen ziehen,
   eine durch die fuenfte ersetzen und eine entfernen.
   Erwartet: Namen/Avatare stimmen, keine doppelte Besetzung, ersetzte Person
   wieder frei, Start nur bei vier Belegungen aktiv; die Aufteilung passt
   am tatsaechlich eingesetzten Laptop.
2. **D und Zwischenstand:** Vollstaendig belegen, **Spiel starten** waehlen,
   zur Aufstellung zurueckkehren und danach Vorbereitung verlassen/erneut
   oeffnen. Anschliessend mit Entwurf neu laden oder die Anwendung sperren.
   Erwartet: Nur Pruefung, kein Timer; Rueckkehr behaelt die Aufstellung,
   Verlassen/Neuladen/Sperren verwirft sie. Erneute Codeeingabe bleibt noetig.
   Der echte Folgepartien-Reset nach Wertung/Abbruch bleibt Story 1.7/1.8.
3. **E, physischer Touch:** Auf einem echten Touchgeraet Name/Avatar auf
   eine Position ziehen, ausserhalb ablegen und Tabelle/Seite ausserhalb der
   Namensflaechen wischen; auch Position antippen und freie Person antippen.
   Erwartet: Zuordnung/Alternative funktionieren, ungueltiger Drop aendert
   nichts und meldet das; normales Scrollen bleibt moeglich.
   Browseremulation ersetzt diesen Hardwaretest nicht.

Der Entwickler hat alle drei Punkte als bestanden gemeldet, die Story aber
noch nicht abgenommen. Vor Abnahme sind die folgenden Anpassungen gewuenscht.

## Freigegeben: UI-Anpassungen aus der Praxispruefung

Bestaetigter Aenderungswunsch: In **Partie vorbereiten** weniger Tabellenraum,
die Positionsanordnung eines Kickertischs und deutlich groessere besetzte Avatare.
Unveraendert bleiben Zuordnungsregeln, Drag-/Klick-/Tastaturbedienung,
Pruefung statt echtem Spielstart sowie der ungespeicherte Entwurf.

### F: Kompakte Tabelle nur in der Partievorbereitung
- Gegeben ist die vollstaendige Vorrundentabelle in der Turnieruebersicht.
- Wenn ich **Partie vorbereiten** oeffne,
- dann zeigt die Tabelle dort genau die drei Spalten **Rang**, **Spielende**
  und **Punkte**. Namen, Avatare, Reihenfolge und Werte bleiben gleich.
  Spiele, Siege, Niederlagen, Tore, Gegentore und Tordifferenz fehlen nur
  in dieser Ansicht; die Turnieruebersicht behaelt alle neun Spalten.
- Auf Laptopbreite ist der linke Tabellenbereich schmaler als der rechte
  Tischbereich. Auf schmalen Bildschirmen bleibt die gestapelte Darstellung.

### G: Angriff und gegnerische Verteidigung gegenueber
- Gegeben ist eine leere oder belegte Partieaufstellung.
- Wenn ich den visualisierten Tisch betrachte,
- dann steht **Weiss Verteidigung oben links**, **Weiss Angriff unten links**,
  **Schwarz Angriff oben rechts** und **Schwarz Verteidigung unten rechts**.
  Damit stehen sich Weiss Verteidigung/Schwarz Angriff sowie
  Weiss Angriff/Schwarz Verteidigung gegenueber.
  Dieselbe Anordnung gilt auch auf schmalen Bildschirmen.
- Ziehen, alternative Auswahl und Entfernen betreffen weiterhin exakt die
  beschriftete Position; die Umordnung vertauscht keine Zuordnungen.

### H: Besetzte Avatare deutlich hervorheben
- Gegeben ist eine mit einer Person belegte Position.
- Wenn ich die Aufstellung auf Laptop oder schmalem Bildschirm betrachte,
- dann steht der Emoji-Avatar als eigenes, deutlich vergroessertes Element
  neben der weiterhin lesbaren Positionsbezeichnung und dem Spitznamen.
  Die Groesse betraegt 64 CSS-Pixel am Laptop, 48 CSS-Pixel
  bei Bildschirmbreiten bis einschliesslich 740 Pixel.
  Auch mehrteilige Emojis bleiben vollstaendig sichtbar.
- Ersetzen und Entfernen aktualisieren beziehungsweise entfernen auch den
  grossen Avatar. Namen und Avatare in der Tabelle bleiben kompakt.

### Erneute Validierung der UI-Anpassungen

- **28 betroffene Tests in drei Dateien bestanden**, einschliesslich eines
  neuen Szenarios fuer die exakten drei Tabellenspalten und die Positions-
  Lesereihenfolge. Bestehende Tests pruefen weiterhin alle neun Spalten
  der Turnieruebersicht; Avatar-Ersetzen/Entfernen wird auch mit einem
  mehrteiligen Emoji geprueft. Linting, TypeScript und Build erfolgreich.
- Im Browser stimmen Rang, Personen/Avatare und Punkte aller zwoelf
  synthetischen Testpersonen zwischen vollstaendiger und kompakter Tabelle
  ueberein. Genau drei Spalten in der Vorbereitung, neun in der Uebersicht.
  Bei 1440 Pixeln ist die Tabelle ca. 441 Pixel und der Tischbereich
  ca. 820 Pixel breit; auch bei 1024 Pixeln ist die Tabelle schmaler.
- Die tatsaechlichen Bildschirmkoordinaten aller vier Positionen bei 320,
  390, 740, 741, 1024 und 1440 Pixeln entsprechen G.
  Schriftgroessen wurden mit `getComputedStyle` geprueft:
  einschliesslich 740 Pixeln 48, darueber 64 CSS-Pixel. Alle vier Avatare,
  einschliesslich eines mehrteiligen Emojis, liegen vollstaendig innerhalb
  der Positionsbuttons. Kein horizontaler Seiten- oder Kompakttabellen-
  Ueberlauf bei diesen Breiten. Desktop und schmaler Tisch visuell geprueft.
- Vier echte Maus-Zuordnungen und Touch-Ersetzen per Browseremulation
  mit Rand-Scrolling funktionieren in der neuen Anordnung. Entfernen
  deaktiviert den Start; Klick-/Tastaturauswahl belegt danach die richtige
  Position mit aktualisiertem grossen Avatar. Aufstellungspruefung und
  Rueckkehr bleiben moeglich; der gespeicherte Turnierstand bleibt gleich.

### Entwicklertests F-H: bestanden

1. **F:** In der Turnieruebersicht alle neun Spalten ansehen, dann
   **Partie vorbereiten** oeffnen. Erwartet: dort nur Rang, Spielende und
   Punkte mit gleichen Werten; links weniger Platz als fuer den Tisch rechts.
2. **G:** Die vier Positionen belegen und die Beschriftung mit der
   sichtbaren Anordnung vergleichen. Erwartet: oben Weiss Verteidigung
   gegen Schwarz Angriff, darunter Weiss Angriff gegen Schwarz Verteidigung;
   jede Person landet auf der gewaehlten Position.
3. **H:** Besetzte Positionen am Laptop und schmalen/Touch-Bildschirm
   betrachten, eine Belegung ersetzen und entfernen.
   Erwartet: deutlich groessere, voll sichtbare Avatare mit lesbaren Namen
   und Positionen; der Avatar wird passend ersetzt oder entfernt.

Der Entwickler hat F, G und H jeweils als bestanden gemeldet und
Story 1.6 ausdruecklich abgenommen. Die Story ist abgeschlossen.
Der echte Partiestart/Timer sowie der Folgepartien-Reset nach Abbruch
oder Wertung bleiben wie vereinbart den Stories 1.7/1.8 vorbehalten.
