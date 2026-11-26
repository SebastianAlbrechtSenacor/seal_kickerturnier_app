# Story 2.5: Vorrundentabellen verdichten

Status: Spezifikation freigegeben. Epic: [Epic 2](./epic-2.md).
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
