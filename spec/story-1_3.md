# Story 1.3: JSON-Sicherung und Wiederherstellung

Status: Freigegeben am 24.11.2026, noch nicht implementiert.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.2](./story-1_2.md).

Als organisierende Person moechte ich ein Turnier vollstaendig als JSON sichern
und auf denselben oder einen anderen Browser uebertragen.

## Akzeptanzszenarien

### A: Vollstaendige Sicherung
- Gegeben ist ein entsperrtes Turnier.
- Wenn ich eine JSON-Sicherung exportiere und in einer entsperrten Anwendung
  ohne dieses Turnier importiere,
- dann werden ID, Einstellungen und saemtliche zum jeweiligen
  Entwicklungsstand verfuegbaren Spielenden-, Partien- und Phasendaten
  vollstaendig wiederhergestellt.
  Ein laufender Timer behaelt seinen urspruenglichen Endzeitpunkt.
  Zum Oeffnen ist der Turniercode erforderlich; keine entsperrte Sitzung
  oder Mastercode wird uebertragen.

### B: Beschaedigte oder unbekannte Sicherung
- Gegeben ist ein bestehender lokaler Datenbestand.
- Wenn ich ungueltiges JSON, eine unbekannte Formatversion oder fachlich
  widerspruechliche Daten importiere, beispielsweise doppelte Spieler-IDs,
  unbekannte Spielreferenzen oder ein gespeichertes Unentschieden,
- dann nennt die App einen Importfehler und laesst alle vorhandenen Daten
  unveraendert. Es gibt keinen teilweisen Import.

### C: Bereits vorhandenes Turnier
- Gegeben ist ein Turnier mit derselben ID wie in einer gueltigen Sicherung.
- Wenn ich diese importiere,
- dann wird der Stand erst nach Pruefung des bestehenden Turniercodes und
  ausdruecklicher Ersetzungsbestaetigung ersetzt. Abbrechen aendert nichts.
  Mit laufender Partie oder offener Ergebniseingabe im Ziel wird das
  Ersetzen abgewiesen. Staende werden nicht automatisch zusammengefuehrt.

### D: Namen und Avatare verlustfrei sichern
- Gegeben ist ein entsperrtes Turnier mit Umlauten, Leerzeichen innerhalb
  von Spitznamen und Emoji-Avataren.
- Wenn ich eine JSON-Sicherung exportiere und wieder importiere,
- dann sind Namen und Avatare unveraendert. Mehrteilige Emoji-Sequenzen
  bleiben vollstaendig erhalten.

### E: Konkurrierende Tabs und Schreibfehler
- Gegeben ist dasselbe Turnier in zwei Tabs.
- Wenn beide Aenderungen versuchen oder ein Import nicht gespeichert werden kann,
- dann wird kein neuerer Stand still ueberschrieben und kein Erfolg
  vorgetaeuscht. Der betroffene Tab zeigt den Konflikt beziehungsweise
  Speicherfehler und fordert zum Laden des aktuellen Standes auf.

## Validierung

Automatisiert: JSON-Export-/Import-Roundtrip einschliesslich Unicode,
ungueltige Referenzen/Versionen, Ersetzung und Schreibkonflikte.
Die Sicherungsszenarien werden bei neuen Spiel- und K.-o.-Daten erweitert.
