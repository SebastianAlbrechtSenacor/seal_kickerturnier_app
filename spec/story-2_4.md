# Story 2.4: Partievorbereitung als Standardansicht

Status: Spezifikation freigegeben. Epic: [Epic 2](./epic-2.md).
Lieferpaket 2 – Turnieransicht und Aufstellung (2.3–2.7): gemeinsame
Browser-Regression und gemeinsames Deployment; eigene Abnahme.
Layoutgrundlage: [Story 2.3](./story-2_3-DONE.md).

Als teilnehmende Person möchte ich nach dem Turnierstart direkt zur
Aufstellung gelangen und Tabelle, Navigation und Phasenwechsel dort finden.

## Akzeptanzszenarien

- **Standardansicht:** Gegeben ist ein startbereites Turnier. Wenn ich
  die Vorrunde starte oder eine laufende Vorrunde ohne offene Partie
  wieder öffne, lande ich direkt in der Aufstellung. Der Seitentitel ist
  exakt der Turniername. **Turnier verlassen** ersetzt
  **Vorbereitung verlassen** und führt zur Turnierliste, ohne den
  gespeicherten Stand zu ändern. Eine bereits laufende Partie oder offene
  Ergebniseingabe hat beim Wiederöffnen Vorrang.
- **Tabellenoverlay:** Gegeben ist die kompakte Vorschau mit Rang,
  Spielenden und Punkten. Wenn ich den Button an der Vorschau betätige,
  öffnet sich die aktuelle Vorrundentabelle mit allen Spielenden und
  Statistikspalten über der Aufstellung. Ich kann sie per Schließen-Button
  oder Escape verlassen; der Fokus kehrt zum Auslöser zurück und die
  Aufstellung bleibt unverändert. Bei Überlauf scrollt nur der
  Overlay-Inhalt, nicht die Seite darunter.
- **Phasenwechsel:** Gegeben ist die Vorrundenansicht. Wenn ich
  **K.O. Runde starten** wähle, gelten die bisherigen Startregeln:
  mindestens acht Spielende, keine laufende Partie oder offene
  Ergebniseingabe und ausdrückliche Bestätigung. Solange Voraussetzungen
  fehlen, ist der Wechsel nicht möglich. Abbrechen ändert nichts.
  Bestätigen friert die Vorrundentabelle ein und öffnet die K.-o.-Ansicht.
- **Keine verlorenen Informationen:** Gegeben ist die neue
  Standardansicht ohne separaten Aufruf als Zwischenstation. Wenn ich
  Turnierinfos, vollständigen Ergebnisverlauf oder Export brauche, sind
  sie weiterhin erreichbar, ohne die laufende Aufstellung zu verwerfen.
