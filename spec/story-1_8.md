# Story 1.8: Ergebnis bestaetigen und Punkte auswerten

Status: Freigegeben am 24.11.2026, noch nicht implementiert.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.7](./story-1_7.md).

Als teilnehmende Person moechte ich ein eindeutiges Endergebnis bestaetigen,
damit alle vier Personen ihre individuellen Punkte erhalten.

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
  Die Tabelle wird sofort neu sortiert und die naechste Aufstellung ist leer.

### B: Konfigurierte Punkte und wechselnde Teams
- Gegeben sind vor Turnierstart 5 Siegpunkte und 2 Niederlagenpunkte festgelegt.
- Wenn eine Person in wechselnden Zweierteams einmal gewinnt und einmal verliert,
- dann hat sie individuell 7 Punkte, unabhaengig von ihren Teampartnern.
  Nur erfolgreich gespeicherte Vorrundenpartien zaehlen.

### C: Ungueltiges Ergebnis
- Gegeben ist die Ergebniseingabe.
- Wenn ich Gleichstand einschliesslich 0:0, negative Zahlen, Bruchteile,
  fehlende Werte oder mehr als 10 Tore eingebe,
- dann erscheint ein konkreter Fehler und Bestaetigen ist nicht moeglich.
  Bei Gleichstand nach Zeitablauf fordert die App zum naechsten Tor auf.
  Vor Zeitablauf ist auch ein Ergebnis wie 7:5 nicht speicherbar.
  10:9 ist sowohl bei vorzeitigem Ende als auch nach Ablauf gueltig.

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

## Validierung

Automatisiert: Ergebnisgrenzen, Unentschieden, individuelle Statistik,
abweichende Punkte, Sortierung, fehlgeschlagenes Speichern und Doppelsubmit.
Sicherungs-Roundtrip einschliesslich Partien und daraus berechneter Wertung.
