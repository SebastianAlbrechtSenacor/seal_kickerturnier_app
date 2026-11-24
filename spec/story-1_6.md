# Story 1.6: Vorrundenpartie besetzen

Status: Freigegeben am 24.11.2026, noch nicht implementiert.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.5](./story-1_5.md).

Als teilnehmende Person moechte ich vier Spielende den vier Positionen am
visualisierten Kickertisch per Klick oder Touch zuordnen.

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
Browserpruefung: vollstaendige Bedienung ohne Drag-and-drop mit Maus/Touch.
