# Story 1.10: Turnierabschluss anzeigen

Status: Grundspezifikation freigegeben am 24.11.2026.
Bedienkonkretisierung und ergaenzte Szenarien vom 25.11.2026 ausdruecklich
freigegeben und umgesetzt. Automatisierte und Browserpruefungen bestanden.
Beide Entwickler-Praxispruefungen sind bestanden; Story 1.10 wurde am
25.11.2026 ausdruecklich abgenommen.
Epic: [Epic 1](./epic-1-DONE.md)
Abhaengigkeiten: [Story 1.9](./story-1_9-DONE.md).

Als teilnehmende Person moechte ich nach dem Finale die Teamplatzierungen
und davon getrennt die individuelle Vorrundentabelle sehen.

## Bedienkonkretisierung vom 25.11.2026

Vom Entwickler bestaetigt:
- Eine eigene Siegerehrung ersetzt nach dem Finale die vorlaeufige
  Abschlussansicht aus Story 1.9.
- Oben stehen die Plaetze 1 bis 3 als Podest mit beiden Namen und Avataren
  je Team; Platz 4 steht unmittelbar darunter.
- Die vollstaendige eingefrorene Vorrundentabelle steht darunter in einem
  aufklappbaren Bereich, nicht neben dem Podest und nicht initial geoeffnet.
- Eine kurze, nicht blockierende Feieranimation erscheint nur direkt nach
  erfolgreich gespeichertem Finale. Erneutes Oeffnen, Neuladen und Import
  wiederholen sie nicht. Es gibt keine zusaetzlichen Sounds.

Zusaetzlich ausdruecklich freigegebene Konkretisierung:
- Auf breiten Bildschirmen steht Platz 1 hervorgehoben in der Podestmitte,
  Platz 2 links, Platz 3 rechts; auf schmalen Bildschirmen erscheinen die
  Teams in Rangfolge untereinander. Die logische Lesereihenfolge ist 1 bis 4.
- Die bekannte Archivaktion **Vorrundenstand und Ergebnisse** zeigt nach
  Aufklappen alle Personen mit saemtlichen Vorrundenstatistiken sowie den
  vollstaendigen Vorrundenverlauf. Ein separater aufklappbarer
  **K.-o.-Spielplan und Ergebnisse** behaelt alle vier Begegnungen lesbar.
- Export und Navigation bleiben wie gewohnt ohne Animationswartezeit
  verfuegbar. Das abgeschlossene Turnier ist nach erneutem Zugang direkt
  wieder auf seinem Abschlussbildschirm erreichbar.
- Die rein dekorative Animation endet spaetestens nach zwei Sekunden.
  Sie verdeckt keine Bedienung und entfaellt bei reduzierter Bewegung.
- Der dauerhafte Abschluss folgt bereits aus den vier gespeicherten
  K.-o.-Ergebnissen. Es ist kein neuer Speicherschritt beim Anzeigen und
  kein neues Datenformat erforderlich. Bereits unter Story 1.9 beendete
  Turniere erhalten dieselbe Siegerehrung, ohne ihre Daten zu veraendern.

## Akzeptanzszenarien

### A: Abschluss erst mit vollstaendigen Ergebnissen
- Gegeben sind zwei gewertete Halbfinals und ein gewertetes Spiel um Platz 3.
- Wenn das Finale noch offen ist,
- dann wird das Turnier noch nicht als beendet angezeigt.
- Wenn ich das gueltige Finalergebnis ausdruecklich bestaetige,
- dann werden Finalergebnis und damit der vollstaendige Abschluss zusammen
  gespeichert. Erst nach erfolgreichem Speichern erscheint automatisch die
  Siegerehrung mit allen vier Teamplaetzen.
- Wenn das Speichern fehlschlaegt oder ein veralteter Tab bestaetigt,
- dann erscheint keine Siegerehrung oder Feieranimation. Die bekannte
  Fehlermeldung, offene Partie und der Ergebnisentwurf bleiben erhalten;
  ein neuerer gespeicherter Stand wird nicht ueberschrieben.

### B: Zwei getrennte Wertungen
- Gegeben ist das abgeschlossene Turnier.
- Wenn ich den Abschlussbildschirm oeffne,
- dann sehe ich zunaechst die getrennte Teamwertung als Podest mit Platz 4
  unmittelbar darunter:
  Finalsieger Platz 1, Finalverlierer Platz 2, Sieger des Spiels um Platz 3
  auf Platz 3 und dessen Verlierer auf Platz 4.
  Bei jedem Team sind beide Namen und Avatare sichtbar.
  Die individuelle Vorrundenplatzierung wird nicht als Teamplatzierung umgedeutet.
- Die Vorrundentabelle ist zunaechst eingeklappt. Wenn ich
  **Vorrundenstand und Ergebnisse** aufklappe, sehe ich genau eine
  vollstaendige eingefrorene Tabelle mit allen Spielenden, einschliesslich
  der nicht K.-o.-Qualifizierten, und alle Vorrundenergebnisse.
  Die Vorrundenwerte bleiben exakt unveraendert.
- Wenn ich **K.-o.-Spielplan und Ergebnisse** aufklappe,
- dann sehe ich die beiden Halbfinals, Platzierungsspiel und Finale mit
  festen Teammitgliedern und endgueltigen Ergebnissen.
  Beide Bereiche lassen sich ohne Aenderung der Daten wieder zuklappen.

### C: Dauerhafter Abschluss
- Gegeben ist ein abgeschlossenes Turnier.
- Wenn ich neu lade, es spaeter erneut entsperre oder eine Sicherung importiere,
- dann erscheinen dieselben beiden Wertungen. Neue Partien, Aenderungen
  und ein erneuter Phasenwechsel sind nicht moeglich; JSON-Export/-Import
  bleiben nach Entsperren moeglich.
- Auch ein bereits unter Story 1.9 abgeschlossenes Turnier mit Datenschema 5
  zeigt nach Zugang diese Siegerehrung, ohne neue Punkte oder Ergebnisse
  zu speichern oder seine Revision allein durch das Anzeigen zu erhoehen.
- Das bewusste vollstaendige Wiederherstellen einer anderen Sicherung
  bleibt vom normalen gesperrten Spielbetrieb getrennt moeglich, mit
  bestehendem Code, Warnung und ausdruecklicher Ersetzungsbestaetigung.

### D: Feierlicher, bedienbarer Bildschirm
- Gegeben ist ein abgeschlossener Stand auf Laptop oder Touch-Geraet.
- Wenn der Abschluss angezeigt wird,
- dann unterstreichen Plakatfarben das Ergebnis. Nur unmittelbar nach dem
  erfolgreich gespeicherten Finale laeuft einmal eine nicht blockierende,
  dekorative Abschlussanimation von hoechstens zwei Sekunden.
  Beide Wertungen, Archivaktionen, Export und Navigation bleiben ohne
  Warten bedienbar; es gibt keine zusaetzlichen Sounds.
- Wenn ich anschliessend neu lade, den Abschluss erneut oeffne oder importiere,
- dann bleibt die Siegerehrung sichtbar, ohne die Animation zu wiederholen.
- Wenn reduzierte Bewegung eingestellt ist,
- dann erscheint keine Feieranimation; alle Inhalte und Aktionen bleiben
  sofort vollstaendig sichtbar und bedienbar.

### E: Responsive und zugaengliche Siegerehrung
- Gegeben ist ein abgeschlossenes Turnier mit langen Namen und mindestens
  zehn Spielenden.
- Wenn ich den Abschluss am Laptop oder bei 320 Pixeln Breite ansehe,
- dann bleiben alle vier Teamplaetze und beide Namen/Avatare je Team
  lesbar. Auf breiten Bildschirmen ist Platz 1 in der Mitte hervorgehoben;
  schmal stehen die Plaetze in Rangfolge untereinander.
  Weder Podest noch aufgeklappte Bereiche erzeugen horizontalen
  Seitenueberlauf; die vollstaendige Vorrundentabelle scrollt wie bisher
  nur innerhalb ihres Tabellenbereichs.
- Wenn ich Tastatur oder Touch verwende,
- dann erreiche ich Archivaktionen, Export und Navigation ohne Fokusfalle.
  Nach erfolgreichem Finalspeichern wird der Abschluss als neue Ansicht
  fokussiert; dekorative Elemente tragen keine stoerenden Ansagen bei.

## Validierung

Automatisiert: vollstaendiger Turnierdurchlauf, alle vier Teamplaetze,
Vorrunden-Snapshot aller Personen, Archivansichten, Endzustand und
Sicherungs-Roundtrip. Beide moeglichen Siegerseiten des Finales und des
Platzierungsspiels pruefen, damit die Plaetze nicht an Teamfarben haengen.
Speicherfehler und Doppelsubmit duerfen keine falsche Siegerehrung erzeugen.
Alte abgeschlossene Schema-5-Staende ohne Schreibzugriff oeffnen.
Browserpruefung der breiten/schmalen Anordnung, langen Namen, Animation
mit maximal zwei Sekunden, sofortiger Bedienbarkeit, ausbleibender
Wiederholung nach erneutem Oeffnen und reduzierter Bewegung.
Entwicklertest: visuelle Abschlussfreigabe, Anmutung der kurzen Animation
und Lesbarkeit/Bedienung am Turnierlaptop vor ausdruecklicher Abnahme.

### Durchgefuehrte Pruefungen am 25.11.2026

- **163 Tests in 14 Dateien bestanden**; Linting, TypeScript-Pruefung und
  Produktions-Build erfolgreich. Die betroffenen Modell-/Bedienungstests
  stehen in [knockout.test.ts](../app/src/knockout.test.ts) und
  [KnockoutBoard.test.tsx](../app/src/KnockoutBoard.test.tsx).
- A/B: Alle vier Kombinationen der beiden moeglichen Siegerseiten in Finale
  und Platzierungsspiel ergeben die korrekten Plaetze 1 bis 4.
  Vor vollstaendig gespeichertem Finale gibt es keine Teamwertung.
  Simulierter Speicherfehler erhaelt offene Partie und Toreentwurf;
  erneute doppelte Bestaetigung speichert genau ein Finalergebnis.
- B/C: Vollstaendiger automatisierter Turnierdurchlauf, unveraenderte
  Vorrundenergebnisse und Statistiken, Archiv mit zehn Personen und neun
  Tabellenspalten sowie K.-o.-Verlauf geprueft.
  Erneutes Oeffnen bestehender Schema-5-Abschluesse schreibt keine Daten,
  erhoeht keine Revision und startet keine Animation.
- B/C im Browser: Finale A gegen C mit 9:10 gespeichert; Teamplaetze
  C, A, B, D mit allen acht Personen/Avataren korrekt dargestellt.
  Eingefrorene Vorrunde und deren Ergebnisverlauf exakt unveraendert.
  Echte JSON-Datei exportiert und geprueft; Import ueber Dateieingabe,
  Code und Ersetzungsbestaetigung stellt denselben Abschluss wieder her,
  mit erwartbar erhoehter lokaler Revision. Kein weiterer Partiestart.
- D im Browser: 20 rein dekorative Konfettielemente mit maximal **1850 ms**
  Gesamtdauer einschliesslich Verzoegerung, ohne Endlosschleife.
  Archiv waehrend laufender Animation geoeffnet; Export und Navigation
  sofort bedienbar, kein abfangender Mauszeiger-Layer.
  Nach Neuladen, Navigation und Import keine Wiederholung.
  Unter reduzierter Bewegung erneut ein Finale gespeichert:
  **keine Animation**, Dekoration unsichtbar, alle Teamkarten sofort sichtbar.
- E im Browser: 320, 390, 740, 741, 1000, 1001 und 1440 Pixel geprueft,
  einschliesslich langer Namen und beider aufgeklappter Archive.
  Kein horizontaler Seitenueberlauf; Vorrundentabelle scrollt intern.
  Bis 1000 Pixel Rangfolge untereinander, darueber Podestmitte fuer Platz 1.
  Die groessere Umschaltbreite verhindert ein optisch hoeheres Silber-/
  Bronzeteam durch umbrochene lange Namen auf schmalen Dreierspalten.
  Podest visuell kontrolliert.
- E: Nach Finalspeicherung Fokus auf **Turnier abgeschlossen**.
  Beide Archive, Export und Navigation per Tabulator erreichbar;
  Archive mit Enter auf-/zugeklappt. Logische Rangfolge 1 bis 4 bleibt
  unabhaengig von der visuellen Podestanordnung erhalten.

### Entwickler-Praxispruefungen: bestanden

Der Entwickler hat P1 und P2 als bestanden gemeldet und die Story am
25.11.2026 ausdruecklich abgenommen.

**P1 - Siegerehrung und Lesbarkeit am Turnierlaptop (B/E):**
Ein abgeschlossenes Turnier oeffnen. Podest, Platz 4, beide Namen/Avatare
je Team sowie beide aufklappbaren Archive pruefen; das Fenster schmaler machen.
Erwartet: passende Plakatgestaltung und gut lesbare, klar getrennte Wertungen;
oben Teams, Vorrunde nur auf Wunsch darunter. Archivaktionen und Navigation
lassen sich am vorgesehenen Eingabegeraet bequem bedienen.

**P2 - Wirkung der kurzen Feieranimation (D):**
In einem Testturnier ein neues gueltiges Finalergebnis verbindlich speichern.
Erwartet: eine kurze, angenehme und nicht blockierende Feieranimation
ohne zusaetzlichen Sound. Archiv/Export sind sofort bedienbar.
Nach erneutem Oeffnen laeuft sie nicht noch einmal.
Bei am Geraet aktivierter reduzierter Bewegung entfaellt sie vollstaendig.

Damit sind alle Akzeptanzkriterien bestaetigt und die Story abgeschlossen.
