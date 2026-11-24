# Story 1.2: Turniere anlegen, speichern und oeffnen

Status: Abgenommen. Alle drei Entwickler-Praxispruefungen als bestanden
gemeldet; ausdrueckliche Abnahme erteilt.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.1](./story-1_1-DONE.md).

Als organisierende Person moechte ich mehrere getrennte Turniere vorbereiten
und mit ihrem jeweiligen Turniercode wieder oeffnen.

## Akzeptanzszenarien

### A: Gueltiges Turnier
- Gegeben ist die entsperrte Anwendung.
- Wenn ich Name, Datum/Uhrzeit in Eschborner Ortszeit, Ort und Turniercode
  angebe und das Turnier speichere,
- dann entsteht ein neues Turnier mit eigener ID; Beschreibung ist optional.
  Vorbelegt sind 10 Minuten je Partie, 3 Siegpunkte und 1 Niederlagenpunkt
  sowie 120 Minuten geplante Vorrunde und 60 Minuten geplante K.-o.-Phase.
  Die Turnieransicht ist fuer die erstellende Sitzung geoeffnet.

### B: Ungueltige Werte
- Gegeben ist das Anlage- oder Bearbeitungsformular.
- Wenn Pflichtangaben fehlen, der Zeitpunkt ungueltig ist, die Partiedauer
  oder eine geplante Phasendauer keine positive ganze Minutenzahl ist
  oder Punkte nicht ganzzahlig ab null mit
  Siegpunkten groesser Niederlagenpunkten sind,
- dann benennen sichtbare Fehler die betroffenen Felder. Es wird kein
  ungueltiger Stand gespeichert und die gueltigen Eingaben bleiben erhalten.

### C: Wieder oeffnen und getrennte Turniere
- Gegeben sind zwei gespeicherte Turniere und nur ein entsperrter Masterzugang.
- Wenn ich die Turnierauswahl aufrufe,
- dann sehe ich Name und Datum der Turniere, aber noch keine Spielenden,
  Ergebnisse oder Einstellungen.
- Wenn ich eines mit seinem korrekten Turniercode oeffne,
- dann sehe ich nur dessen Daten. Ein falscher Code meldet einen Fehler;
  das Oeffnen entsperrt nicht automatisch das andere Turnier.

### D: Bearbeitung vor Start
- Gegeben ist ein noch nicht gestartetes Turnier.
- Wenn ich seine Daten einschliesslich Partiedauer, geplanter Phasendauern,
  Punkte und Turniercode aendere,
- dann sind die Aenderungen nach erfolgreichem Speichern und Neuladen erhalten.
  Mit neuem Code funktioniert nur der neue Code bei erneuter Entsperrung.
  Datum/Uhrzeit allein loesen keinen Turnierstart aus.

### E: Unabhaengige Zeitplanung
- Gegeben ist ein Turnier am 26.11.2026 um 17:00 Uhr Eschborner Ortszeit mit
  120 Minuten geplanter Vorrunde, 60 Minuten geplanter K.-o.-Phase und
  10 Minuten Partiedauer.
- Wenn ich die Planung ansehe,
- dann zeigt sie 19:00 Uhr als voraussichtlichen K.-o.-Beginn und 20:00 Uhr
  als voraussichtliches Turnierende.
- Wenn ich die geplante Vorrundendauer auf 90 Minuten aendere,
- dann werden 18:30 Uhr und 19:30 Uhr angezeigt. Die Partiedauer bleibt
  10 Minuten. Die Planungswerte werden gespeichert, sind nach Turnierstart
  gesperrt und loesen niemals einen automatischen Phasenwechsel aus.

### F: Speicherfehler
- Gegeben ist gesperrter oder erschoepfter Browserspeicher.
- Wenn ich ein Turnier anlege oder aendere,
- dann erscheint eine konkrete Speicherfehlermeldung. Die App meldet keinen
  Speichererfolg und verliert den letzten erfolgreich gespeicherten Stand
  nicht; Eingaben bleiben fuer einen erneuten Versuch verfuegbar.

### G: Neuladen und Code-Daten
- Gegeben ist ein erfolgreich gespeichertes Turnier.
- Wenn ich die Seite neu lade oder den Browser spaeter erneut oeffne,
- dann ist es im selben Browserprofil wieder vorhanden. Gespeicherte
  Code-Pruefdaten enthalten keinen Klartext-Turniercode. Eine JSON-Sicherung
  wird nicht automatisch entsperrt; Daten sind dadurch nicht verschluesselt.

## Validierung

Automatisiert: Validierung, Zeitplanung unabhaengig vom Partietimer,
Turniertrennung, Codepruefung, lokale Persistenz und Speicherfehler.
Browserpruefung: Wiederaufruf nach Neuladen.

## Umsetzung und Pruefergebnis am 24.11.2026

35 Tests in vier Testdateien einschliesslich der sieben
Masterzugang-Regressionstests bestanden. Linting, TypeScript-Pruefung und
Produktions-Build fuer den Pages-Unterpfad erfolgreich.

| AK | Eigenstaendige Pruefung | Ergebnis |
| --- | --- | --- |
| A | Anlegen mit Standardwerten, eigener ID, Pruefhash und sofortiger Turnieransicht; UI-Test und Browserdurchlauf | Bestanden |
| B | Pflichtfelder, ungueltiges Kalenderdatum, Zeitumstellung, null/negative/gebrochene Dauern, ungueltige Punkte und zu grosser Planungszeitraum; Feldfehler und Eingabeerhalt | Bestanden |
| C | Zwei getrennte Turniere; Liste zeigt nur Namen/Datum; falscher und richtiger Code, keine automatische Entsperrung eines zweiten Turniers | Bestanden |
| D | Bearbeiten und Wiederaufruf; neuer Code ersetzt alten, leeres Codefeld behaelt bisherigen; kein automatischer Phasenwechsel | Bestanden |
| E | 26.11.2026, 17:00 plus 120/60 Minuten ergibt 19:00/20:00; 90/60 ergibt 18:30/19:30 bei unveraenderten 10 Minuten je Partie | Bestanden |
| F | Simulierte Lese-/Schreibsperren und voller Speicher; Fehlermeldung statt Erfolg; Anlege-/Bearbeitungsentwurf und letzter gespeicherter Stand bleiben erhalten; Wiederholung gelingt | Bestanden |
| G | Neuladen im Browser, danach Mastercode und erneuter Turniercode; Daten und geaenderter Pruefhash bleiben erhalten, kein Klartext-Code und keine entsperrte Sitzung gespeichert | Bestanden |

Die Punkte zu Sperren nach Turnierstart aus D/E werden mit Story 1.5
umgesetzt und getestet; in Story 1.2 gibt es noch keinen Turnierstart.
Die JSON-Sicherungsaspekte aus G folgen mit Story 1.3.

Weitere Pruefungen: Tageswechsel und Sommerzeit bei Berliner Zeitplanung;
ungueltige/unbekannte Speicherformate ohne Ueberschreiben; Erkennung
bereits geaenderter Revisionen. Umfassende konkurrierende Tab-Bearbeitung
und JSON-Sicherungen bleiben Umfang von Story 1.3.

Browserdurchlauf des isolierten Produktions-Builds: Anlegen, Bearbeiten,
Codewechsel, Neuladen, Wiederentsperren und Rueckkehr zur neutralen Maske
beim Mastersperren erfolgreich. Formulare bei 390 und 320 Pixeln Breite
ohne horizontales Ueberlaufen der Eingabeaktionen; Aktionen mindestens
48 Pixel hoch. Schmale Darstellung visuell geprueft, Desktop-Formular
mit zweispaltigem Layout vermessen. Testturnier und Pruefserver entfernt.

## Entwicklerpruefung und Abnahme

Die fachlichen Kriterien wurden soweit im aktuellen Story-Umfang moeglich
eigenstaendig geprueft. Der Entwickler hat die folgenden Praxispruefungen
als bestanden gemeldet:

1. **A/C/G auf GitHub Pages:** Zwei Turniere mit unterschiedlichen Codes
   anlegen, zur Auswahl zurueckkehren und die Seite neu laden.
   Erwartet: Nach Mastercode sind beide Turniere gelistet; Details werden
   nur nach dem passenden Turniercode angezeigt. Ein falscher Code
   meldet einen Fehler, ohne ein anderes Turnier zu entsperren.
2. **D/E auf GitHub Pages:** Im ersten Turnier Start 26.11.2026, 17:00,
   Vorrunde 120 und K.-o. 60 setzen; danach Vorrunde auf 90 und
   Turniercode aendern, speichern und erneut oeffnen.
   Erwartet: Planung zuerst 19:00/20:00, danach 18:30/19:30;
   Partiedauer weiterhin 10 Minuten. Alter Code scheitert, neuer funktioniert.
3. **Bedienung:** Anlegen, Bearbeiten, Abbrechen und Sperren auf dem
   Turnierlaptop mit Maus/Tastatur und soweit verfuegbar Touch pruefen.
   Erwartet: lesbare, erreichbare Felder und Aktionen ohne verdeckte Inhalte;
   Mastersperre zeigt aus allen Turnieransichten wieder nur die neutrale Maske.

Ergebnis: Alle drei Praxispruefungen bestanden, keine Abweichungen gemeldet.
Der Entwickler hat die Story ausdruecklich abgenommen.
Die Voraussetzung fuer die Umsetzung von Story 1.3 ist damit erfuellt.
