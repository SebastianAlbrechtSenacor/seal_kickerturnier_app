# Story 2.3: Hauptansichten ohne Seitenscrollen im Querformat

Status: Spezifikation freigegeben. Epic: [Epic 2](./epic-2.md).

Als teilnehmende Person möchte ich am Querformat-Bildschirm die aktuelle
Ansicht bedienen, ohne die Hauptseite hin- und herscrollen zu müssen.

## Akzeptanzszenarien

- **Referenzformat:** Gegeben ist ein Browser-Viewport von 1920 × 1080
  CSS-Pixeln bei 100 % Zoom. Wenn ich Zugangsmaske, Turnierliste,
  Turniervorbereitung, Vorrunde, laufende Partie, Ergebniseingabe,
  K.-o.-Phase und Siegerehrung aufrufe, lassen sich Dokument und
  Hauptcontainer weder vertikal noch horizontal scrollen. Titel, Navigation
  und primäre Aktionen der jeweiligen Ansicht sind vollständig sichtbar.
- **Viele Inhalte:** Gegeben sind am Referenzformat lange Namen, viele
  Turniere, Spielende oder Ergebnisse. Wenn Inhalte nicht in den
  verfügbaren Platz passen, scrollt nur der betroffene Bereich,
  beispielsweise Tabelle, Verlauf oder Dialoginhalt. Der letzte Eintrag
  ist erreichbar, nichts wird abgeschnitten und die Hauptansicht bleibt
  stehen. Das gilt auch bei Tastaturbedienung.
- **Kleiner Viewport:** Gegeben ist ein schmaleres Fenster, Hochformat oder
  stärkerer Zoom. Wenn dort nicht alles hineinpasst, bleibt der Inhalt
  durch Umbruch oder vertikales Scrollen lesbar und erreichbar; es gibt
  keinen horizontalen Überlauf der Hauptseite.
