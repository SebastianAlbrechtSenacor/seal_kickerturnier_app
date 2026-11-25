# Story 2.12: Konfetti-Kanonen für die Siegerehrung

Status: Spezifikation freigegeben. Epic: [Epic 2](./epic-2.md).
Lieferpaket 6 – Pfiff und Konfetti: eigener Story-Test und eigene Abnahme;
gemeinsamer Praxislauf und gemeinsames Deployment mit
[Story 2.11](./story-2_11.md), wenn die freigegebene Audiodatei vorliegt.
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
- **Langer Ausklang:** Gegeben ist eine ununterbrochene Feier im
  Vordergrund. Wenn seit dem Start etwa 20 Sekunden vergangen sind,
  endet der dichte Regen. Um Sekunde 60 sind noch einzelne Teile sichtbar;
  spätestens nach 65 Sekunden ist die Animation vollständig beendet.
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
