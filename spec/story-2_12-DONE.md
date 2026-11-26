# Story 2.12: Konfetti-Kanonen für die Siegerehrung

Status: Am 26.11.2026 einschließlich des Nachtrags zur Konfettidichte
abgenommen. Das gemeinsame Deployment mit Story 2.11 steht aus.
Epic: [Epic 2](./epic-2-DONE.md).
Lieferpaket 6 – Pfiff und Konfetti: eigener Story-Test und eigene Abnahme;
gemeinsamer Praxislauf und gemeinsames Deployment mit
[Story 2.11](./story-2_11-DONE.md), wenn die freigegebene Audiodatei vorliegt.
Reihenfolge: nach Abnahme von Story 2.11. Fehlt die Audiodatei, ist ein
Vorziehen nach Abnahme von Story 2.10 nur mit ausdrücklicher Freigabe der
geänderten Reihenfolge möglich.

Als teilnehmende Person möchte ich den Turniersieg mit einer
bildschirmfüllenden Konfetti-Feier erleben.

## Akzeptanzszenarien

- **Drei Kanonen, ganzer Bildschirm:** Gegeben ist ein erfolgreich
  gespeichertes Finalergebnis bei normaler Bewegungseinstellung. Wenn
  die Siegerehrung erscheint, startet der Effekt einmal aus drei
  Richtungen: links, rechts und unten. Im Referenz-Viewport und bei
  schmaler Ansicht füllt das Konfetti den gesamten sichtbaren Bereich
  statt nur das Podest. Einzelne Flugbahnen führen über die sichtbaren
  Ränder hinaus, ohne Scrollbalken oder Layoutsprünge zu verursachen.
- **Dichte Startphase (Nachtrag):** Gegeben ist eine ununterbrochene
  Feier im Vordergrund. Wenn die drei Kanonen abfeuern, füllt sich der
  Bildschirm sofort mit so dichtem Konfetti, dass die App dahinter
  in den ersten 20 Sekunden nicht erkennbar ist. Als Ausnahme bleibt
  **Konfetti stoppen** sichtbar und bedienbar.
- **Langer Ausklang (Nachtrag):** Gegeben ist die laufende Feier. Wenn
  20 Sekunden vergangen sind, feuert keine der drei Kanonen mehr.
  Bereits in der Luft befindliche Teile, auch oberhalb des sichtbaren
  Bereichs, fallen nach und nach von oben herunter. Die App wird wieder
  sichtbar und der Regen wird bis etwa Sekunde 60 allmählich dünner.
  Spätestens nach 65 Sekunden ist die Animation vollständig beendet.
- **Jederzeit bedienbar:** Gegeben ist die laufende Feier. Wenn ich
  Turnierdaten ansehe, exportiere oder navigiere, blockiert die Animation
  weder Zeiger- oder Touch-Eingaben noch Tastaturfokus. Eine sichtbare
  und per Tastatur erreichbare Aktion **Konfetti stoppen** beendet den
  Effekt sofort, ohne die Siegerehrung zu schließen. Auch beim Verlassen
  der Ansicht endet die Animation.
- **Keine Wiederholung, reduzierte Bewegung:** Gegeben ist ein bereits
  abgeschlossenes Turnier. Wenn ich neu lade, es erneut öffne oder eine
  Sicherung importiere, startet keine Feier. Bei aktivierter Einstellung
  für reduzierte Bewegung erscheint sie auch nach erstmaligem
  Finalspeichern nicht. Platzierungen und Archiv bleiben ohne Wartezeit
  verfügbar; der Konfetti-Effekt selbst hat keinen Ton.

Der lange Effekt ersetzt die bisherige Zwei-Sekunden-Grenze aus
[Story 1.10](./story-1_10-DONE.md).

## Prüfnachweis der ersten Umsetzung

- Im lokalen Browser erreichte der Effekt bei 1485 × 871 und in der
  schmalen Ansicht bei 390 × 844 alle vier Bildschirmquadranten aus
  drei Richtungen, ohne horizontales Scrollen. In der Messung waren
  nach rund 20 Sekunden deutlich weniger Teile sichtbar und um Sekunde
  60 noch einzelne Teile. Das Archiv blieb bedienbar; Stoppen und
  Verlassen entfernten den Effekt, erneutes Öffnen startete ihn nicht.
- 31 betroffene Regressionstests bestanden, darunter Tastaturstopp,
  zeitgesteuertes Ende und reduzierte Bewegung. TypeScript, Linter und
  Produktionsbuild sind erfolgreich.

## Prüfnachweis des Nachtrags

- Die Canvas-Pixelmessung im lokalen Browser ergab eine vollständig
  deckende Fläche bei Sekunde 0,1 und 19,9. Bei Sekunde 22 und 45
  nahm die bedeckte Fläche deutlich ab; bei Sekunde 60 waren noch
  einzelne Teile sichtbar. Bei Sekunde 64 war die Fläche leer.
- Der Stopp war bei voller Abdeckung anklickbar und ließ die
  Siegerehrung offen. 12 K.-o.-Regressionstests bestanden. TypeScript,
  Linter und Produktionsbuild sind erfolgreich.
