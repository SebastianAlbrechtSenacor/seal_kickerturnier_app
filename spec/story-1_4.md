# Story 1.4: Spielende und Avatare verwalten

Status: Freigegeben am 24.11.2026, noch nicht implementiert.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.2](./story-1_2-DONE.md).

Als organisierende Person moechte ich Spielende mit eindeutigem Spitznamen
und Emoji-Avatar einem vorbereiteten Turnier zuordnen.

## Akzeptanzszenarien

### A: Person hinzufuegen
- Gegeben ist ein entsperrtes, noch nicht gestartetes Turnier.
- Wenn ich einen nichtleeren Spitznamen und ein freies Emoji aus der Palette
  auswaehle und speichere,
- dann erscheint die Person mit eigener ID, bereinigtem Namen und Avatar
  in diesem Turnier und bleibt nach Neuladen erhalten.
  Leerzeichen innerhalb eines Namens wie "Alex am Kicker" sind erlaubt
  und bleiben erhalten.

### B: Eindeutigkeit
- Gegeben ist die Person "Alex" mit einem belegten Emoji.
- Wenn ich " alex " oder den bereits belegten Avatar erneut verwenden will,
- dann weist die Anwendung die doppelte Zuordnung mit Feldhinweis ab.
  Der deutsche Namensvergleich ignoriert Gross-/Kleinschreibung.
  In einem anderen Turnier duerfen Name und Avatar erneut vorkommen.

### C: Bearbeiten und entfernen
- Gegeben ist eine angelegte Person vor Turnierstart.
- Wenn ich Name/Avatar gueltig aendere oder die Person entferne,
- dann wird die Liste entsprechend gespeichert; die Eindeutigkeit bleibt
  gewahrt und ein freigewordener Avatar ist wieder auswaehlbar.

### D: Avatar-Palette erschoepft oder Name leer
- Gegeben sind keine freien Avatare oder eine Eingabe nur aus Leerzeichen.
- Wenn ich eine weitere Person speichern moechte,
- dann verhindert die Anwendung das Speichern mit sichtbarer Begruendung.
  Es wird kein doppelter Avatar und kein leerer Spieler angelegt.

## Validierung

Automatisiert: CRUD vor Start, Normalisierung, Namens-/Avatar-Konflikte,
Turniertrennung und Speicherung. Browserpruefung: Auswahl per Klick und Touch.
