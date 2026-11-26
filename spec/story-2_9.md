# Story 2.9: Farbschema mit Turnierphase wechseln

Status: Spezifikation freigegeben. Epic: [Epic 2](./epic-2.md).
Lieferpaket 4 – Phasenfarben: eigener Browser-Durchlauf über beide
Farbschemata und separates Deployment.
Bediengrundlage: [Story 2.4](./story-2_4-DONE.md).

Als teilnehmende Person möchte ich den Übergang in die K.-o.-Runde
an der Gestaltung der ganzen Anwendung erkennen.

## Akzeptanzszenarien

- **Heller Standard:** Gegeben ist die entsperrte App in der Turnierliste,
  Turniervorbereitung oder Vorrunde. Wenn ich diese Ansichten aufrufe,
  sehe ich eine lebendige hellblau-türkis-hellgrüne Palette mit
  gelb-orangen Akzenten nach [Plakat 2](./design/werbeplakat-2.png).
  Die neutrale Master-Zugangsmaske bleibt getrennt davon.
- **Dunkler Phasenwechsel:** Gegeben ist eine Vorrunde. Wenn ich den
  K.-o.-Start bestätige und dieser gespeichert ist, wechseln Hintergrund,
  Navigation, Karten, Tisch, Buttons und Dialoge auf das dunklere Blau
  mit energetischem Grün und tief-orangenen Akzenten nach
  [Plakat 1](./design/werbeplakat-1.png). Abgebrochene oder fehlgeschlagene
  Wechsel ändern das Farbschema nicht. Beim Wiederöffnen eines
  K.-o.-Turniers und auf seiner Siegerehrung gilt das dunkle Schema
  ebenfalls; **Turnier verlassen** stellt das helle Schema wieder her.
- **Lesbarkeit:** Gegeben sind beide Schemata. Wenn ich Tabellen,
  Eingaben, Fehlermeldungen, Fokus und deaktivierte Bedienelemente prüfe,
  sind Texte und aktive Bedienzustände gut unterscheidbar; relevante
  Information hängt nicht allein von der Farbe ab.
