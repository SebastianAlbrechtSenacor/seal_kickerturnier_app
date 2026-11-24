# Story 1.10: Turnierabschluss anzeigen

Status: Entwurf, nicht freigegeben.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.9](./story-1_9.md).

Als teilnehmende Person moechte ich nach dem Finale die Teamplatzierungen
und davon getrennt die individuelle Vorrundentabelle sehen.

## Akzeptanzszenarien

### A: Abschluss erst mit vollstaendigen Ergebnissen
- Gegeben sind zwei gewertete Halbfinals und ein gewertetes Spiel um Platz 3.
- Wenn das Finale noch offen ist,
- dann wird das Turnier noch nicht als beendet angezeigt.
- Wenn ich das gueltige Finalergebnis ausdruecklich bestaetige,
- dann wird der Abschluss gespeichert und der Abschlussbildschirm angezeigt.

### B: Zwei getrennte Wertungen
- Gegeben ist das abgeschlossene Turnier.
- Wenn ich den Abschlussbildschirm oeffne,
- dann sehe ich die vollstaendige eingefrorene Vorrundentabelle mit allen
  Spielenden und eine getrennte Teamwertung:
  Finalsieger Platz 1, Finalverlierer Platz 2, Sieger des Spiels um Platz 3
  auf Platz 3 und dessen Verlierer auf Platz 4.
  Bei jedem Team sind beide Namen und Avatare sichtbar.
  Die individuelle Vorrundenplatzierung wird nicht als Teamplatzierung umgedeutet.

### C: Dauerhafter Abschluss
- Gegeben ist ein abgeschlossenes Turnier.
- Wenn ich neu lade, es spaeter erneut entsperre oder eine Sicherung importiere,
- dann erscheinen dieselben beiden Wertungen. Neue Partien, Aenderungen
  und ein erneuter Phasenwechsel sind nicht moeglich; JSON-Export/-Import
  bleiben nach Entsperren moeglich.

### D: Feierlicher, bedienbarer Bildschirm
- Gegeben ist ein abgeschlossener Stand auf Laptop oder Touch-Geraet.
- Wenn der Abschluss angezeigt wird,
- dann unterstreichen Plakatfarben und eine kurze nicht blockierende
  Abschlussanimation das Ergebnis. Beide Wertungen und Exportaktionen
  bleiben ohne Warten erreichbar; reduzierte Bewegung wird respektiert.

## Validierung

Automatisiert: vollstaendiger Turnierdurchlauf, alle vier Teamplaetze,
Vorrunden-Snapshot, Endzustand und Sicherungs-Roundtrip.
Entwicklertest: visuelle Abschlussfreigabe und Lesbarkeit am Turnierlaptop.
