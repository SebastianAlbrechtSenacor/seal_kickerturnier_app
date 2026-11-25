# Story 1.7: Partie, Countdown und Unterbrechungen

Status: Urspruengliche Spezifikation freigegeben am 24.11.2026.
Die nachstehende Bedien- und Zwischenstandspezifikation wurde am
25.11.2026 ausdruecklich freigegeben und anschliessend umgesetzt.
Automatisierte Pruefungen, Browserpruefungen und alle drei Entwickler-
Praxispruefungen sind bestanden. Die Story wurde am 25.11.2026
ausdruecklich abgenommen.
Epic: [Epic 1](./epic-1-DONE.md)
Abhaengigkeiten: [Story 1.6](./story-1_6-DONE.md).

Als spielende Person moechte ich die Restzeit gross sehen und nach Zeitablauf
durch einen Pfiff und einen sichtbaren Hinweis informiert werden.

## Akzeptanzszenarien

### A: Spielstart
- Gegeben ist eine gueltige vollstaendige Aufstellung.
- Wenn ich "Spiel starten" anklicke,
- dann werden Aufstellung, Start- und Endzeit erfolgreich gespeichert,
  bevor die Partie als gestartet gilt. Die Positionen sind gesperrt und
  der grosse Countdown beginnt mit der konfigurierten Dauer.
  Doppelklick startet keine zweite Partie.

### B: Zeitablauf
- Gegeben ist eine laufende Partie in einem aktiven Browser mit freigegebenem Ton.
- Wenn ihr Endzeitpunkt erreicht wird,
- dann zeigt der Timer null, es ertont einmal ein Schiedsrichterpfiff
  und ein sichtbarer Ablaufhinweis mit Zugang zur Ergebniseingabe erscheint.
  Bei Gleichstand wird auf das naechste entscheidende Tor hingewiesen.
  Es wird noch kein Ergebnis automatisch gespeichert.

### C: Vorzeitiges Ende bei 10 Toren
- Gegeben ist eine laufende Partie vor Ablauf der Zeit.
- Wenn ich "10 Tore erreicht" auswaehle,
- dann wird die Ergebniseingabe geoeffnet. Vor Ablauf kann nur ein
  Ergebnis mit genau 10 Toren fuer ein Team und weniger fuer das andere
  zur Ergebnispruefung gelangen. Zurueckkehren ohne Speicherung behaelt
  den urspruenglichen Endzeitpunkt bei.
  Verbindliche Ergebnisbestaetigung, Abschluss und Wertung folgen erst
  mit Story 1.8, wie in G konkretisiert.

### D: Neuladen und Hintergrund
- Gegeben ist eine gespeicherte laufende Partie.
- Wenn ich neu lade oder nach einem Tabwechsel zurueckkehre,
- dann werden Aufstellung und Restzeit aus dem urspruenglichen Endzeitpunkt
  wiederhergestellt, nicht mit voller Dauer neu gestartet.
  Bei bereits abgelaufener Zeit erscheint null mit Ablaufhinweis und
  Ergebniseingabe. Es entsteht kein negatives Zeitdisplay oder Pfiff-Sturm.

### E: Ton blockiert oder Rechner schlaeft
- Gegeben ist verweigerte Audiowiedergabe oder ein schlafender Rechner.
- Wenn Audioaktivierung scheitert beziehungsweise ich nach Ablauf zur App
  zurueckkehre,
- dann zeigt die App den Audiofehler beziehungsweise den abgelaufenen Zustand
  sichtbar. Sie behauptet nicht, ein Pfiff sei erfolgreich abgespielt worden.
  Eine Garantie fuer einen Pfiff bei schlafendem Rechner wird nicht gegeben.

### F: Abbruch
- Gegeben ist eine laufende Partie oder deren noch ungespeicherte Ergebniseingabe.
- Wenn ich den Abbruch bestaetige,
- dann wird die Partie ohne Ergebnis und ohne Punkte beendet; eine neue
  Vorrundenaufstellung ist moeglich. Breche ich den Dialog ab, bleibt
  die Partie mit ihrem urspruenglichen Endzeitpunkt bestehen.
  Solange die Partie offen ist, kann ich keine zweite starten.

## Validierung

### Durchgefuehrte Pruefungen

- Gesamtsuite: 134 Tests in 12 Dateien bestanden; Linting, TypeScript-Pruefung
  und Produktionsbuild erfolgreich.
- Modell-/Speichertests: gueltige und ungueltige Partiedaten, atomarer Start,
  Revisionen und Konflikte, Schreibfehler, einmalige Pfiffreservierung,
  Abbruch, Rueckwaertskompatibilitaet und Sicherungen offener Partien.
- UI-/Audiotests: Countdown und Fokus-/Hintergrundrueckkehr, abgelaufenes
  Wiederoeffnen ohne Pfiff, Doppelklick, Ergebnisregeln vor/nach der Frist,
  explizite Audiofehler einschliesslich blockierter Aktivierung, Abbruch
  und Rueckkehr zur leeren Vorbereitung.
- Browser mit synthetischem Turnier und kontrollierter Uhr: ein gespeicherter
  Start trotz Doppelklick, gesperrte Positionen, exakt konfigurierte Dauer,
  genau ein automatischer Pfiffversuch an der Frist, unveraenderter
  Eingabefokus bei dessen Speicherung, vorzeitige Pruefung von 10:9,
  Ablehnung von 7:5 vor und Annahme nach Ablauf.
- Browser: Abbruchdialog verwerfen aendert den gespeicherten Stand nicht;
  bestaetigter Abbruch oeffnet eine leere Aufstellung. JSON-Export/-Import
  stellt dieselbe Partie mit verbleibender Zeit wieder her; ein offenes
  Zielturnier bleibt gegen Ersetzen gesperrt.
- Browser: Neuladen und Oeffnen nach der Frist zeigen `00:00`, ohne
  nachtraeglichen Pfiffversuch, auch bei noch nicht gesetzter Pfiffmarkierung.
  Ein ausdruecklicher Testpfiff bleibt moeglich. Fehlende Audio-Unterstuetzung
  zeigt einen Fehler; Partie und Ergebniseingabe bleiben erhalten.
- Layout-Messungen bei 320, 390, 1024 und 1440 Pixeln ohne horizontalen
  Seitenueberlauf; schmale Darstellung visuell geprueft. Ergebniseingabe
  mit nativen emulierten Touch-Ereignissen geoeffnet. Ein Toreentwurf bleibt
  nach Neuladen nicht erhalten.

Kontrollierte Uhr und Audio-API-Pruefung ersetzen weder echten Ruhezustand
noch das Hoeren am Zielgeraet. Die integrierte Screenshot-Aufnahme bildet
die Desktop-Emulation nicht verlaesslich ab; deren Sichtpruefung bleibt
Teil des folgenden Lesbarkeitstests.

### Abgenommene Entwickler-Praxispruefungen

In einem separaten Testturnier eine Minute je Partie einstellen, mindestens
vier Spielende anmelden und die Vorrunde starten. Zwischen den Pruefungen
die offene Partie ausdruecklich abbrechen und neu besetzen.

1. **Pfiff am Zielgeraet (B/E):** Partie starten, **Ton aktivieren / testen**
   waehlen und die Minute bei geoeffneter App ablaufen lassen.
   Erwartet: Testpfiff hoerbar; bei `00:00` genau ein automatischer Pfiff,
   sichtbarer Ablaufhinweis und verfuegbare Ergebniseingabe.
2. **Echter Ruhezustand (D/E):** Neue Partie starten, Rechner vor Ablauf
   schlafen legen und erst nach mehr als einer Minute wecken.
   Erwartet: urspruengliche Aufstellung und `00:00` mit Ablaufhinweis,
   keine neue volle Dauer und keine negative Zeit. Nach Neuladen und
   erneuter Codeeingabe weiterhin abgelaufen, ohne nachtraeglichen Pfiff.
   Ein zeitgenauer Pfiff waehrend des Schlafens ist nicht zugesichert.
3. **Lesbarkeit und Bedienung am Tisch (A/C/F/G):** Neue Partie am
   Turnierlaptop aus der ueblichen Entfernung betrachten, Ergebniseingabe
   und Abbruchdialog mit Maus, falls vorhanden auch Touch, bedienen.
   Den Abbruch erst verwerfen, dann bestaetigen.
   Erwartet: grosser Timer und Personen gut erkennbar, auf breitem Bildschirm
   kompakte Tabelle links und Tisch rechts; beim Verwerfen bleibt die Partie
   offen, beim Bestaetigen folgt eine leere Aufstellung ohne Punkte.
   Die Ergebnispruefung ist klar als noch nicht gespeichert gekennzeichnet.

Der Entwickler hat alle drei Praxispruefungen als bestanden gemeldet
und die Story am 25.11.2026 ausdruecklich abgenommen.

## Freigegebene Bedienkonkretisierung vom 25.11.2026

Nach Rueckfrage bestaetigt:
- Ergebniseingabe und Pruefung werden bereits umgesetzt; verbindliches
  Speichern und individuelle Wertung folgen in Story 1.8.
- Beim Wiederoeffnen einer bereits abgelaufenen Partie ertont kein
  nachtraeglicher Pfiff, sondern es erscheint der deutliche Ablaufhinweis.

Vorgesehene Bedienung:
- Die kompakte Tabelle links und die Tischanordnung mit grossen Avataren
  rechts bleiben erhalten. Ueber dem Tisch steht der grosse Countdown.
- **Spiel starten** speichert und startet direkt; die bisherige
  Aufstellungspruefung aus Story 1.6 entfaellt an dieser Stelle.
  Erst nach erfolgreichem Speichern wird die laufende Partie angezeigt.
  Bei einem Fehler bleiben Aufstellungsentwurf und Fehlermeldung sichtbar.
- Die laufende Aufstellung bleibt sichtbar, ist aber nicht aenderbar.
  **10 Tore erreicht** oeffnet vorzeitig die Ergebniseingabe.
  Der Countdown laeuft dabei weiter; es gibt keine Pausefunktion.
- Nach Ablauf zeigt der Timer `00:00`, nie negative Werte; der sichtbare
  Hinweis fordert bei Gleichstand zum naechsten entscheidenden Tor auf.
  Ein Pfiff allein ist niemals der einzige Ablaufhinweis.
- Audio wird beim Start ueber die Browser-Audiofunktion aktiviert.
  **Ton aktivieren / testen** erlaubt eine ausdrueckliche Aktivierung
  und einen Testpfiff, insbesondere nach Neuladen oder bei Audioproblemen.
  Der Pfiff wird lokal erzeugt; externe Audiodienste sind nicht erforderlich.
  Audiofehler verhindern nicht den gespeicherten Spielstart, bleiben aber
  sichtbar. Automatische Pfiffausloesung und absichtliche Testpfiffe sind
  getrennt; die App behauptet bei Fehlern keine erfolgreiche Wiedergabe.
- Die Restzeit folgt der gespeicherten Endzeit auch hinter Zugangsmasken
  oder nach Ruhezustand. Neuladen/Sperren stoppt die Partie nicht.
  Eine Garantie fuer einen zeitgenauen Pfiff im Hintergrund oder
  Ruhezustand besteht nicht. Audio kann nach Neuladen eine erneute
  Aktivierung erfordern.

### G: Ergebnisentwurf und ausdruecklicher Zwischenstand
- Gegeben ist die Ergebniseingabe nach Ablauf oder ueber **10 Tore erreicht**.
- Wenn ich die Tore fuer Weiss und Schwarz eingebe und **Ergebnis pruefen**
  waehle,
- dann gelangt nur ein gueltiger Endstand zur Pruefung:
  zwei ganze Zahlen von 0 bis 10, kein Gleichstand; vor dem gespeicherten
  Endzeitpunkt muss genau ein Team 10 Tore haben.
  Fehlende, negative, gebrochene oder zu grosse Werte zeigen konkrete
  Fehler. Bei Gleichstand nach Ablauf wird auf das naechste Tor hingewiesen.
- Die aktuell erreichte Zeit entscheidet ueber die Regel: Laeuft die Zeit
  waehrend einer frueh geoeffneten Eingabe ab, ist danach auch 7:5 gueltig.
  Weder Eingabe noch Pruefung verlaengern oder pausieren die Partie.
- Die Pruefung zeigt beide Teams und den eingegebenen Endstand sowie
  ausdruecklich **Noch nicht gespeichert oder gewertet; folgt in Story 1.8**.
  Verbindliches Speichern ist deaktiviert. Zurueck erlaubt Aenderungen
  am Entwurf; eine Rueckkehr zum Tisch behaelt die offene Partie.
  Neuladen/Sperren verwerfen nur den Toreentwurf, nicht die offene Partie.
- Solange Ergebnisse noch nicht verbindlich gespeichert werden koennen,
  ist ausschliesslich ein bestaetigter Abbruch der Weg zur naechsten Partie.

### H: Gleichzeitige Aktionen und Schreibfehler
- Gegeben ist eine vollstaendige Aufstellung oder eine gespeicherte offene Partie.
- Wenn der Start oder ein bestaetigter Abbruch nicht gespeichert werden kann,
- dann erscheint ein Fehler; der letzte gespeicherte Zustand bleibt bestehen.
  Insbesondere verschwindet eine nicht erfolgreich abgebrochene Partie nicht,
  und ein fehlgeschlagener Start zeigt keinen laufenden Countdown.
- Wenn ich doppelt starte/abbreche oder in einem veralteten Tab handele,
- dann entstehen weder eine zweite offene Partie noch unbemerkte
  Ueberschreibungen. Ein Konflikt fordert zum erneuten Oeffnen auf.
- Mehrere Timeraktualisierungen oder Rueckkehr in die laufende Ansicht
  erzeugen keinen Pfiff-Sturm. Eine Partie hat hoechstens eine automatische
  Pfiffausloesung; absichtliche Testpfiffe bleiben moeglich.

### I: Sicherung einer offenen Partie
- Gegeben ist eine offene Partie.
- Wenn ich eine JSON-Sicherung herunterlade und in einem anderen Browserprofil
  importiere und nach Codeeingabe oeffne,
- dann werden dieselben vier Personen und die urspruenglichen Zeitpunkte
  wiederhergestellt. Eine bereits abgelaufene Partie bleibt abgelaufen,
  ohne nachtraeglichen Pfiff. Ergebnisentwuerfe sind nicht Teil der Sicherung.
- Wenn ich ein Zielturnier mit offener Partie durch eine Sicherung ersetzen will,
- dann wird das Ersetzen mit sichtbarem Hinweis abgewiesen, auch nach
  Codeeingabe. Ein bestaetigter Abbruch ist vorher erforderlich.
- Alte Turniere/Sicherungen ohne Partiedaten bleiben weiterhin lesbar;
  neue Partiedaten werden beim Laden und Importieren vollstaendig validiert,
  statt verworfen oder als neue leere Partie interpretiert zu werden.
