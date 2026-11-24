# Story 1.2: Turniere anlegen, speichern und oeffnen

Status: Freigegeben am 24.11.2026, noch nicht implementiert.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.1](./story-1_1.md).

Als organisierende Person moechte ich mehrere getrennte Turniere vorbereiten
und mit ihrem jeweiligen Turniercode wieder oeffnen.

## Akzeptanzszenarien

### A: Gueltiges Turnier
- Gegeben ist die entsperrte Anwendung.
- Wenn ich Name, Datum/Uhrzeit in Eschborner Ortszeit, Ort und Turniercode
  angebe und das Turnier speichere,
- dann entsteht ein neues Turnier mit eigener ID; Beschreibung ist optional.
  Vorbelegt sind 10 Minuten je Partie, 3 Siegpunkte und 1 Niederlagenpunkt
  sowie 120 Minuten geplante Vorrunde und 60 Minuten geplante K.-o.-Phase.
  Die Turnieransicht ist fuer die erstellende Sitzung geoeffnet.

### B: Ungueltige Werte
- Gegeben ist das Anlage- oder Bearbeitungsformular.
- Wenn Pflichtangaben fehlen, der Zeitpunkt ungueltig ist, die Partiedauer
  oder eine geplante Phasendauer keine positive ganze Minutenzahl ist
  oder Punkte nicht ganzzahlig ab null mit
  Siegpunkten groesser Niederlagenpunkten sind,
- dann benennen sichtbare Fehler die betroffenen Felder. Es wird kein
  ungueltiger Stand gespeichert und die gueltigen Eingaben bleiben erhalten.

### C: Wieder oeffnen und getrennte Turniere
- Gegeben sind zwei gespeicherte Turniere und nur ein entsperrter Masterzugang.
- Wenn ich die Turnierauswahl aufrufe,
- dann sehe ich Name und Datum der Turniere, aber noch keine Spielenden,
  Ergebnisse oder Einstellungen.
- Wenn ich eines mit seinem korrekten Turniercode oeffne,
- dann sehe ich nur dessen Daten. Ein falscher Code meldet einen Fehler;
  das Oeffnen entsperrt nicht automatisch das andere Turnier.

### D: Bearbeitung vor Start
- Gegeben ist ein noch nicht gestartetes Turnier.
- Wenn ich seine Daten einschliesslich Partiedauer, geplanter Phasendauern,
  Punkte und Turniercode aendere,
- dann sind die Aenderungen nach erfolgreichem Speichern und Neuladen erhalten.
  Mit neuem Code funktioniert nur der neue Code bei erneuter Entsperrung.
  Datum/Uhrzeit allein loesen keinen Turnierstart aus.

### E: Unabhaengige Zeitplanung
- Gegeben ist ein Turnier am 26.11.2026 um 17:00 Uhr Eschborner Ortszeit mit
  120 Minuten geplanter Vorrunde, 60 Minuten geplanter K.-o.-Phase und
  10 Minuten Partiedauer.
- Wenn ich die Planung ansehe,
- dann zeigt sie 19:00 Uhr als voraussichtlichen K.-o.-Beginn und 20:00 Uhr
  als voraussichtliches Turnierende.
- Wenn ich die geplante Vorrundendauer auf 90 Minuten aendere,
- dann werden 18:30 Uhr und 19:30 Uhr angezeigt. Die Partiedauer bleibt
  10 Minuten. Die Planungswerte werden gespeichert, sind nach Turnierstart
  gesperrt und loesen niemals einen automatischen Phasenwechsel aus.

### F: Speicherfehler
- Gegeben ist gesperrter oder erschoepfter Browserspeicher.
- Wenn ich ein Turnier anlege oder aendere,
- dann erscheint eine konkrete Speicherfehlermeldung. Die App meldet keinen
  Speichererfolg und verliert den letzten erfolgreich gespeicherten Stand
  nicht; Eingaben bleiben fuer einen erneuten Versuch verfuegbar.

### G: Neuladen und Code-Daten
- Gegeben ist ein erfolgreich gespeichertes Turnier.
- Wenn ich die Seite neu lade oder den Browser spaeter erneut oeffne,
- dann ist es im selben Browserprofil wieder vorhanden. Gespeicherte
  Code-Pruefdaten enthalten keinen Klartext-Turniercode. Eine JSON-Sicherung
  wird nicht automatisch entsperrt; Daten sind dadurch nicht verschluesselt.

## Validierung

Automatisiert: Validierung, Zeitplanung unabhaengig vom Partietimer,
Turniertrennung, Codepruefung, lokale Persistenz und Speicherfehler.
Browserpruefung: Wiederaufruf nach Neuladen.
