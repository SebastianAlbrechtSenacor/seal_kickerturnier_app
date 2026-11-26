# Story 2.6: Kickertisch stabil darstellen und Stangen ergänzen

Status: Am 26.11.2026 ausdrücklich abgenommen.
Epic: [Epic 2](./epic-2.md).
Lieferpaket 2 – Turnieransicht und Aufstellung (2.3–2.7): gemeinsame
Browser-Regression und gemeinsames Deployment; eigene Abnahme.

Als teilnehmende Person möchte ich Spielende auf einen stabilen Tisch
ziehen und die Aufstellung auf Anhieb als Kickertisch erkennen.

## Akzeptanzszenarien

- **Kein Layoutsprung:** Gegeben ist die leere Aufstellung im
  Referenz-Viewport. Wenn ich vier Personen mit unterschiedlichen
  Karteninhalten auf die Positionen ziehe, umsetze und wieder entferne,
  bleiben Tischhöhe, Tischbreite und Position der Drop-Zonen unverändert.
  Die Karten passen in die vorgesehenen Flächen und bleiben lesbar.
- **Stangen und Bedienung:** Gegeben ist die Tischansicht, auch mit festen
  K.-o.-Teams. Wenn ich sie betrachte, ist die Spielfläche gegenüber dem
  MVP schmaler und rechts und links ragen Kickerstangen sichtbar heraus.
  Sie verdecken keine Karten oder Bedienflächen. Drag-and-drop sowie die
  bisherigen Alternativen per Klick/Touch oder Tastatur bleiben nutzbar;
  schmalere Ansichten erzeugen keinen seitlichen Seitenüberlauf.

## Prüfergebnisse

- 28 gezielte UI-Tests, Lint und Produktions-Build bestanden.
- Im integrierten Browser bei 1280 × 720 und 1485 × 871 CSS-Pixeln
  blieben Tisch und alle vier Drop-Zonen beim Ziehen, Ablegen, Umsetzen
  und Entfernen unverändert. Geprüft wurde auch ein langer Spitzname.
- Bei 320 × 680 blieb die Geometrie bei Zuweisung und Entfernen stabil,
  ohne horizontalen Seitenüberlauf. In der K.-o.-Ansicht bei
  1280 × 720 waren die Stangen und die vier festen Positionen sichtbar.
- Der Entwickler hat die Story am 26.11.2026 ausdrücklich abgenommen.
