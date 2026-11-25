# Story 2.2: Turnier-Code vollständig entfernen

Status: Spezifikation freigegeben. Epic: [Epic 2](./epic-2.md).

Als organisierende Person möchte ich meine lokal gespeicherten Turniere
ohne zusätzlichen Code erstellen, öffnen und wiederherstellen.

## Akzeptanzszenarien

- **Anlegen und öffnen:** Gegeben ist die per Master-Code geöffnete App.
  Wenn ich ein gültiges Turnier anlege, speichere und später auch nach
  Browser-Neustart und erneuter Master-Freigabe öffne, erscheint dabei kein
  Turnier-Code-Feld und keine Code-Abfrage. Auch bestehende lokale
  Turniere mit bisherigen Code-Prüfdaten öffnen ohne Zusatzabfrage.
- **Export und Altbestände:** Gegeben sind ein neuer Export und gültige,
  bislang unterstützte ältere JSON-Sicherungen mit Code-Prüfdaten. Wenn
  ich die Dateien importiere, kommt keine Code-Abfrage; Spielende,
  Ergebnisse, Phase und gegebenenfalls laufende Partie bleiben erhalten.
  Neue und erneut exportierte Sicherungen enthalten keine
  Turnier-Code-Prüfdaten; alte Daten werden nur noch aus
  Kompatibilitätsgründen gelesen und nicht erneut gespeichert.
- **Sicherer Importablauf:** Gegeben ist eine vorhandene Turnier-ID. Wenn
  ich eine passende Sicherung importiere, bleibt die Warnung mit
  ausdrücklicher Ersetzungsbestätigung erhalten; Abbrechen ändert nichts.
  Ist im Zielturnier eine Partie oder Ergebniseingabe offen, wird das
  Ersetzen weiterhin abgelehnt. Beschädigte Sicherungen zeigen einen
  Fehler und überschreiben keine Daten.
