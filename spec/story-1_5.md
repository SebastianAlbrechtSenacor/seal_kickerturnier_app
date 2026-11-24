# Story 1.5: Vorrunde starten und Tabelle anzeigen

Status: Freigegeben am 24.11.2026, noch nicht implementiert.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.4](./story-1_4.md).

Als teilnehmende Person moechte ich nach Turnierstart die individuelle
Wertung und die Aktion fuer eine neue Partie sehen.

## Akzeptanzszenarien

### A: Erfolgreicher manueller Start
- Gegeben sind mindestens vier Spielende und gueltige Turniereinstellungen.
- Wenn ich den Turnierstart ausdruecklich bestaetige,
- dann wechselt das Turnier in die Vorrunde. Die Tabelle zeigt alle
  Spielenden mit Avatar, Rang, Spielen, Siegen, Niederlagen, Toren,
  Gegentoren, Tordifferenz und Punkten; alle Statistiken beginnen bei null.
  Eine Aktion zum Vorbereiten der naechsten Partie ist sichtbar.

### B: Mindestanzahl und Abbrechen
- Gegeben sind weniger als vier Spielende oder ein Startdialog.
- Wenn ich zu starten versuche beziehungsweise die Bestaetigung abbreche,
- dann bleibt das Turnier in Vorbereitung. Bei zu wenigen Personen ist
  die Mindestanzahl als Grund sichtbar.

### C: Gesperrte Vorbereitung
- Gegeben ist ein gestartetes Turnier, auch nach Neuladen.
- Wenn ich die Einstellungen oder Spielendenliste aufrufe,
- dann kann ich keine Turnierfelder, Punkte, Dauer, Codes, Namen oder Avatare
  mehr aendern und keine Personen hinzufuegen oder entfernen.

### D: Vollstaendige Sortierung
- Gegeben sind unterschiedliche oder gleiche Wertungsstaende.
- Wenn die Tabelle angezeigt wird,
- dann wird absteigend nach Gesamtpunkten, Siegen, Tordifferenz und erzielten
  Toren sortiert, danach aufsteigend deutschsprachig nach Spielername.
  Jeder Rang ist eindeutig; die Rangfolge ist nach Neuladen identisch.
  Die Vergleichslogik wird auch fuer die K.-o.-Qualifikation verwendet.

### E: Kein automatischer Zeitwechsel
- Gegeben ist ein vorbereitetes oder laufendes Turnier.
- Wenn die angegebene Startzeit oder 19 Uhr erreicht wird,
- dann aendert sich die Phase nicht ohne ausdrueckliche Benutzeraktion.

## Validierung

Automatisiert: Startbedingungen, Sperren, Persistenz und Sortierung mit
gezielten Faellen fuer jedes einzelne Rangentscheidungsmerkmal.
