# Story 2.5: Vorrundentabellen verdichten

Status: Am 26.11.2026 nach erfolgreichem Praxistest einschließlich
der Layout-Ergänzung ausdrücklich abgenommen. Epic: [Epic 2](./epic-2-DONE.md).
Lieferpaket 2 – Turnieransicht und Aufstellung (2.3–2.7): gemeinsame
Browser-Regression und gemeinsames Deployment; eigene Abnahme.
Abhängigkeit: [Story 2.4](./story-2_4-DONE.md).

Als teilnehmende Person möchte ich die Vorrundenplätze von zwölf
Spielenden auf einen Blick sehen, ohne Abstriche bei der Lesbarkeit.

## Akzeptanzszenarien

- **Zwölf sichtbare Zeilen:** Gegeben sind zwölf Spielende mit typischen
  Spitznamen und der Referenz-Viewport aus Epic 2. Wenn ich die Vorschau
  betrachte und danach die vollständige Tabelle öffne, sind in beiden
  Versionen Überschriften und alle zwölf Zeilen ohne vertikales
  Tabellenscrollen sichtbar. Die Zeilen sind gegenüber dem MVP kompakter;
  in der Vollansicht bleiben alle Werte und Spaltenüberschriften lesbar.
- **Überlauf und unveränderte Wertung:** Gegeben sind mehr Spielende oder
  sehr lange Namen. Wenn der Tabellenbereich überläuft, bleiben alle
  Namen und Einträge erreichbar und nur der betroffene Tabellenbereich
  scrollt. Reihenfolge, Punkte und Statistik entsprechen in Vorschau und
  Vollansicht demselben Stand; die kompaktere Darstellung ändert keine
  Berechnung.

## Layout-Ergänzung zur Aufstellungsansicht

Die linke Spalte soll möglichst vollständig der Vorrundenvorschau
gehören. Die zusätzliche Höhe entsteht vor allem durch das Verschieben
der Ergebnisse und das Einsparen separater Aktionszeilen, nicht allein
durch kleinere Schrift oder schlechter erreichbare Auswahlflächen.

- **Details am jeweiligen Inhalt:** Wenn ich die Aufstellung öffne,
  steht je ein kleiner, als Textlink gestalteter **Mehr Infos**-Auslöser
  neben **Vorrundentabelle**, neben **Letzte 3 Ergebnisse** und bei der
  kompakten Turnierinfo am unteren Rand. Die Auslöser ersetzen die drei
  bisherigen großen Buttons und öffnen jeweils das bestehende Overlay
  für Tabelle, Verlauf bzw. Turnierinfos. Sie sind per Maus, Tastatur
  und Touch bedienbar und haben unterscheidbare zugängliche Namen.
  Beim Schließen kehrt der Fokus zum jeweiligen Auslöser zurück; die
  Aufstellung bleibt erhalten. Der Sortierhinweis bleibt in der
  vollständigen Tabelle statt unter der Vorschau sichtbar.
- **Tabelle links, Ergebnisse unter dem Tisch:** Wenn mindestens drei
  Partien abgeschlossen sind, stehen die drei jüngsten Ergebnisse in
  absteigender Reihenfolge unter dem Spieltisch in der rechten Spalte.
  Bei weniger Partien erscheinen nur die vorhandenen bzw. der
  Leerhinweis. Die linke Spalte nutzt die gewonnene Höhe für die
  Tabelle; lange Listen scrollen intern, nicht die Anwendung.
- **Startaktionen über dem Tisch:** Wenn ich die Aufstellung öffne,
  stehen **Spiel starten** und **K.O. Runde starten** neben der
  Tischüberschrift oder bei Platzmangel unmittelbar darunter, weiterhin
  oberhalb des Tisches. Freigaberegeln und die K.-o.-Bestätigung bleiben
  unverändert; eine Startsperre bleibt nachvollziehbar. **Aufstellung
  leeren** entfällt, einzelne besetzte Positionen lassen sich weiterhin
  direkt am Tisch leeren.
- **Abnahme mit gefüllter Ansicht:** Bei 1280 × 720 und in Firefox bei
  1485 × 871 CSS-Pixeln mit zwölf typischen Spitznamen, mindestens drei
  Ergebnissen und einer besetzten Position prüfen: Beide Tabellenversionen
  zeigen zwölf Zeilen samt Kopf ohne vertikales Scrollen. In der
  Aufstellung bleiben Startaktionen und die drei kompakten Ergebniszeilen
  ohne Seitenscrollen sichtbar. Bei überlangen Namen oder aufgeklappten
  Ergebnisdetails darf der jeweilige Inhaltsbereich intern scrollen.

## Prüfergebnisse

- 57 gezielte UI-Tests, Lint und Produktions-Build bestanden.
- Im integrierten Browser bei 1280 × 720 und 1485 × 871 CSS-Pixeln:
  zwölf sichtbare Zeilen in Vorschau und Overlay, neun Spalten in der
  Vollansicht und drei sichtbare Ergebniszeilen unter dem Tisch,
  jeweils mit einer besetzten Position. Kein Seitenscrollen.
- Mit 48 Spielenden bei 1280 × 720 scrollen Vorschau und Overlay intern.
  Alle drei **Mehr Infos**-Auslöser öffnen die jeweiligen Details.
  Beim Schließen kehrt der Fokus zurück und die Aufstellung bleibt
  erhalten. Der Entwickler hat den Praxistest am 26.11.2026 als
  erfolgreich bestätigt und die Story abgenommen.
