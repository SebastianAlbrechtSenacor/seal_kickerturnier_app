# Story 1.7: Partie, Countdown und Unterbrechungen

Status: Freigegeben am 24.11.2026, noch nicht implementiert.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.6](./story-1_6.md).

Als spielende Person moechte ich die Restzeit gross sehen und nach Zeitablauf
durch einen Pfiff und einen sichtbaren Hinweis informiert werden.

## Akzeptanzszenarien

### A: Spielstart
- Gegeben ist eine gueltige vollstaendige Aufstellung.
- Wenn ich "Spiel starten" anklicke,
- dann werden Aufstellung, Start- und Endzeit erfolgreich gespeichert,
  bevor die Partie als gestartet gilt. Die Positionen sind gesperrt und
  der grosse Countdown beginnt mit der konfigurierten Dauer.
  Doppelklick startet keine zweite Partie.

### B: Zeitablauf
- Gegeben ist eine laufende Partie in einem aktiven Browser mit freigegebenem Ton.
- Wenn ihr Endzeitpunkt erreicht wird,
- dann zeigt der Timer null, es ertont einmal ein Schiedsrichterpfiff
  und ein sichtbarer Ablaufhinweis mit Zugang zur Ergebniseingabe erscheint.
  Bei Gleichstand wird auf das naechste entscheidende Tor hingewiesen.
  Es wird noch kein Ergebnis automatisch gespeichert.

### C: Vorzeitiges Ende bei 10 Toren
- Gegeben ist eine laufende Partie vor Ablauf der Zeit.
- Wenn ich "10 Tore erreicht" auswaehle,
- dann wird die Ergebniseingabe geoeffnet. Ein vorzeitiges Ergebnis kann
  nur mit genau 10 Toren fuer ein Team und weniger fuer das andere
  bestaetigt werden. Zurueckkehren ohne Speicherung behaelt den
  urspruenglichen Endzeitpunkt bei.

### D: Neuladen und Hintergrund
- Gegeben ist eine gespeicherte laufende Partie.
- Wenn ich neu lade oder nach einem Tabwechsel zurueckkehre,
- dann werden Aufstellung und Restzeit aus dem urspruenglichen Endzeitpunkt
  wiederhergestellt, nicht mit voller Dauer neu gestartet.
  Bei bereits abgelaufener Zeit erscheint null mit Ablaufhinweis und
  Ergebniseingabe. Es entsteht kein negatives Zeitdisplay oder Pfiff-Sturm.

### E: Ton blockiert oder Rechner schlaeft
- Gegeben ist verweigerte Audiowiedergabe oder ein schlafender Rechner.
- Wenn Audioaktivierung scheitert beziehungsweise ich nach Ablauf zur App
  zurueckkehre,
- dann zeigt die App den Audiofehler beziehungsweise den abgelaufenen Zustand
  sichtbar. Sie behauptet nicht, ein Pfiff sei erfolgreich abgespielt worden.
  Eine Garantie fuer einen Pfiff bei schlafendem Rechner wird nicht gegeben.

### F: Abbruch
- Gegeben ist eine laufende Partie oder deren noch ungespeicherte Ergebniseingabe.
- Wenn ich den Abbruch bestaetige,
- dann wird die Partie ohne Ergebnis und ohne Punkte beendet; eine neue
  Vorrundenaufstellung ist moeglich. Breche ich den Dialog ab, bleibt
  die Partie mit ihrem urspruenglichen Endzeitpunkt bestehen.
  Solange die Partie offen ist, kann ich keine zweite starten.

## Validierung

Automatisiert: Endzeitberechnung, Neuladen, Ablauf, Start-Doppelklick,
vorzeitiger Ergebnisweg, Audiofehler und Abbruch.
Entwicklertest: Lautstaerke/Pfiff im Zielbrowser am Turnierlaptop,
Verhalten nach echtem Ruhezustand und Lesbarkeit am Kickertisch.
