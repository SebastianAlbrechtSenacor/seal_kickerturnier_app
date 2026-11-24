# Story 1.9: K.-o.-Phase spielen

Status: Freigegeben am 24.11.2026, noch nicht implementiert.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.8](./story-1_8.md).

Als teilnehmende Person moechte ich die besten acht Personen in festen
Zweierteams durch Halbfinals, Platzierungsspiel und Finale begleiten.

## Akzeptanzszenarien

### A: Qualifikation und unumkehrbarer Wechsel
- Gegeben ist die Vorrunde mit mindestens acht Spielenden ohne offene
  Partie oder offene Ergebniseingabe.
- Wenn ich den K.-o.-Start ausloese,
- dann zeigt die App die acht Qualifizierten und die vorgeschlagenen Teams
  zusammen mit dem Hinweis auf den unumkehrbaren Wechsel.
- Wenn ich bestaetige,
- dann speichert sie den vollstaendigen Vorrundenstand und bildet gemaess
  dessen Rangfolge A=1+8, B=2+7, C=3+6, D=4+5.
  Weitere Vorrundenpartien und eine Rueckkehr in die Vorrunde sind gesperrt.
  Auch bei mehr als acht Personen qualifizieren sich genau acht.

### B: Verhinderter oder abgebrochener Wechsel
- Gegeben sind weniger als acht Personen, eine offene Partie oder eine
  noch nicht gespeicherte Ergebniseingabe.
- Wenn ich den K.-o.-Start versuche,
- dann bleibt er mit erkennbarem Grund gesperrt.
- Gegeben ist dagegen ein erlaubter Wechsel mit Bestaetigungsdialog.
- Wenn ich abbreche oder das Speichern fehlschlaegt,
- dann bleiben Phase, Teams und Vorrundenstand unveraendert; ein
  Speicherfehler wird sichtbar gemeldet.

### C: Fester Spielplan
- Gegeben ist eine gestartete K.-o.-Phase.
- Wenn ich die Begegnungen nacheinander spiele,
- dann folgt auf Halbfinale A gegen D das Halbfinale B gegen C, danach
  spielen die beiden Verliererteams um Platz 3 und die beiden Siegerteams
  das Finale. Eine spaetere Begegnung startet erst nach bestaetigtem
  Ergebnis ihrer notwendigen Vorgaenger und ohne andere offene Partie.
  Partner bleiben unveraendert; es gibt keine Weiss-/Schwarz- oder
  Angriffs-/Verteidigungsauswahl.

### D: Timer und Teamergebnis
- Gegeben ist die naechste K.-o.-Begegnung.
- Wenn ich sie starte und anschliessend ein Ergebnis erfasse,
- dann gelten dieselbe Turnierdauer, derselbe Pfiff, die 10-Tore-Regel,
  Golden Goal und die ausdrueckliche finale Bestaetigung wie in der Vorrunde.
  Die Eingabefelder nennen die festen Teams mit beiden Personen statt
  Farben oder Positionen. Ein Gleichstand wird nicht angenommen.

### E: Abbruch, Neuladen und doppelte Bestaetigung
- Gegeben ist eine laufende K.-o.-Begegnung.
- Wenn ich neu lade,
- dann bleiben Teams und urspruenglicher Endzeitpunkt erhalten.
- Wenn ich die Begegnung bestaetigt abbreche,
- dann bleibt genau diese Begegnung ungewertet und kann neu gestartet werden.
  Es wird kein Sieger eingetragen oder Folgespiel freigeschaltet.
- Wenn ich ein gueltiges Ergebnis mehrfach bestaetige,
- dann wird es nur einmal gespeichert und der Spielplan nur einmal fortgesetzt.

### F: Unveraenderliche Vorrunde
- Gegeben sind gespeicherte K.-o.-Ergebnisse.
- Wenn ich die Vorrundentabelle ansehe oder das Turnier exportiere und importiere,
- dann entsprechen alle Vorrundenwerte exakt dem eingefrorenen Stand.
  K.-o.-Tore, Siege und Ergebnisse beeinflussen keine Vorrundenpunkte
  oder Qualifikationsplaetze.

## Validierung

Automatisiert: alle Zugangsvoraussetzungen, Top-8 mit Gleichstaenden,
Teamzuordnung, kompletter Spielbaum, Abbruch, Persistenz, Doppelsubmit
und unveraenderter Vorrundenstand. Sicherungs-Roundtrip in der K.-o.-Phase.
