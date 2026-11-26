# Story 2.2: Turnier-Code vollständig entfernen

Status: Am 25.11.2026 abgenommen. Epic: [Epic 2](./epic-2-DONE.md).
Lieferpaket 1 – Zugang und Import: gemeinsamer Browser-Regressionstest
und gemeinsames Deployment mit [Story 2.1](./story-2_1-DONE.md); eigene Abnahme.

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

## Validierung

- 163 Tests in 14 Dateien bestanden; Linting, Typprüfung und
  Produktions-Build erfolgreich. Separat erneut geprüft: Altimport mit
  offener K.-o.-Partie, unveränderter Spielzeit und Ersetzungsschutz.
- Browserprüfung bestanden: ohne Turnier-Code anlegen und nach Neuladen
  öffnen, alte JSON-Datei importieren, Ersetzen abbrechen, erst nach
  ausdrücklicher Bestätigung ersetzen und den Stand direkt öffnen.
- Automatisiert geprüft: keine Code-Prüfdaten in neu gespeicherten
  Turnieren und Exporten; beschädigte Dateien und offene Zielpartien
  überschreiben keine Bestandsdaten.
