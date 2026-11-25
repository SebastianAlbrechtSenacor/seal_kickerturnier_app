# Story 1.5: Vorrunde starten und Tabelle anzeigen

Status: Abgenommen am 25.11.2026. Alle drei Entwickler-Praxispruefungen
als bestanden gemeldet; ausdrueckliche Abnahme erteilt.
Epic: [Epic 1](./epic-1-DONE.md)
Abhaengigkeiten: [Story 1.4](./story-1_4-DONE.md).

Als teilnehmende Person moechte ich nach Turnierstart die individuelle
Wertung und die Aktion fuer eine neue Partie sehen.

## Akzeptanzszenarien

### A: Erfolgreicher manueller Start
- Gegeben sind mindestens vier Spielende und gueltige Turniereinstellungen.
- Wenn ich den Turnierstart ausdruecklich bestaetige,
- dann wechselt das Turnier in die Vorrunde. Die Tabelle zeigt alle
  Spielenden mit Avatar, Rang, Spielen, Siegen, Niederlagen, Toren,
  Gegentoren, Tordifferenz und Punkten; alle Statistiken beginnen bei null.
  Eine Aktion zum Vorbereiten der naechsten Partie ist sichtbar.

### B: Mindestanzahl und Abbrechen
- Gegeben sind weniger als vier Spielende oder ein Startdialog.
- Wenn ich zu starten versuche beziehungsweise die Bestaetigung abbreche,
- dann bleibt das Turnier in Vorbereitung. Bei zu wenigen Personen ist
  die Mindestanzahl als Grund sichtbar.

### C: Gesperrte Vorbereitung
- Gegeben ist ein gestartetes Turnier, auch nach Neuladen.
- Wenn ich die Einstellungen oder Spielendenliste aufrufe,
- dann kann ich keine Turnierfelder, Punkte, Dauer, Codes, Namen oder Avatare
  mehr aendern und keine Personen hinzufuegen oder entfernen.

### D: Vollstaendige Sortierung
- Gegeben sind unterschiedliche oder gleiche Wertungsstaende.
- Wenn die Tabelle angezeigt wird,
- dann wird absteigend nach Gesamtpunkten, Siegen, Tordifferenz und erzielten
  Toren sortiert, danach aufsteigend deutschsprachig nach Spielername.
  Jeder Rang ist eindeutig; die Rangfolge ist nach Neuladen identisch.
  Die Vergleichslogik wird auch fuer die K.-o.-Qualifikation verwendet.

### E: Kein automatischer Zeitwechsel
- Gegeben ist ein vorbereitetes oder laufendes Turnier.
- Wenn die angegebene Startzeit oder 19 Uhr erreicht wird,
- dann aendert sich die Phase nicht ohne ausdrueckliche Benutzeraktion.

## Validierung

Automatisiert: Startbedingungen, Sperren, Persistenz und Sortierung mit
gezielten Faellen fuer jedes einzelne Rangentscheidungsmerkmal.

## Freigegebene Konkretisierung vom 25.11.2026

- Die Aktion **Partie vorbereiten** ist sichtbar, aber mit Hinweis auf
  Story 1.6 deaktiviert. Positionsauswahl, Spiele und Punkteberechnung
  werden nicht vorzeitig implementiert; die Tabelle zeigt bis dahin Nullwerte.
- Ein zentraler Wertungsvergleich entscheidet nach allen fuenf Merkmalen;
  die deutsche Namenssortierung entspricht dem Eindeutigkeitsvergleich
  der Spielenden. Keine separat gespeicherten Punktestaende.
- Die bestehende vollstaendige JSON-Wiederherstellung bleibt nach
  bestehendem Turniercode und ausdruecklicher Ersetzungsbestaetigung erlaubt.
  Eine Vorbereitungssicherung setzt dabei bewusst den gesamten Stand zurueck.
  Normales Speichern kann die gesperrte Vorbereitung nicht wieder oeffnen.
- Ein fehlgeschlagener oder konkurrierender Start zeigt einen Fehler und
  laesst den zuletzt gespeicherten Stand unveraendert. Ein Startdialog ist
  noch kein gestartetes Turnier.
- Startphase, Spielende und Einstellungen werden vollstaendig gesichert.
  Eine importierte Vorrunde bleibt nach erneuter Codeeingabe gesperrt.
  Unmoegliche Vorrundenstaende mit weniger als vier Spielenden werden abgewiesen.

## Umsetzung und eigenstaendige Pruefung am 25.11.2026

96 automatisierte Tests in sieben Dateien bestanden; Linting, TypeScript und
Produktions-Build erfolgreich. Die bisherigen Vorbereitungs-, Zugangs-,
Speicher- und Sicherungsfunktionen bleiben erfolgreich geprueft.

| Szenario | Gepruefter Umfang | Ergebnis |
| --- | --- | --- |
| A | Bestaetigter Start ab vier Personen; persistente Vorrundenphase; alle Personen/Avatare, eindeutige Raenge und alle sieben Statistikfelder bei null; sichtbare deaktivierte Folgeaktion | Bestanden |
| B | Null bis drei Personen fachlich abgewiesen; deaktivierter Start mit Begruendung; Oeffnen/Abbrechen der Bestaetigung schreibt nichts | Bestanden |
| C | Keine Bearbeitungsaktionen nach Start oder Neuladen; direkte Aenderungsversuche an Einstellungen, Code oder Spielenden sowie Rueckwechsel in Vorbereitung gesperrt; veraltete Revisionen abgewiesen | Bestanden |
| D | Gezielte Vergleichstests fuer Punkte, Siege, Tordifferenz, Tore und deutsche Namenssortierung; Vorrundentabelle mit vollstaendiger Nullstatistik und identischer Rangfolge nach Neuladen | Bestanden |
| E | Simulierte Uhrspruenge ueber Startzeit und 19 Uhr aendern weder Vorbereitung noch Vorrunde | Bestanden |

Weitere Pruefungen: Speicherfehler beim Start erhalten den Vorbereitungsstand;
konkurrierender Start in einem zweiten Tab wird statt eines vorgetaeuschten
Erfolgs als Konflikt gemeldet. Gestartete Sicherung wiederhergestellt;
normaler Rueckwechsel in Vorbereitung abgewiesen, ausdrueckliche
Wiederherstellung mit bestehendem Code und neuer Revision erlaubt.
Falscher Code und unmoegliche Phasenstaende werden ohne Datenverlust abgewiesen.
Der zentrale Wertungsvergleich ist fuer spaetere Ergebniswertung und
K.-o.-Qualifikation wiederverwendbar. Ergebnisaggregation selbst folgt mit
Story 1.8; bis dahin existieren keine gespeicherten Ergebnis- oder Punktestaende.

Im isolierten Produktions-Browser: Vorbereitung mit drei Personen importiert,
Startbegrenzung geprueft und vierte Person ueber die Oberflaeche ergaenzt.
Abbrechen hielt die Vorbereitung; Bestaetigen zeigte vier alphabetisch
sortierte Personen mit Nullwerten und ohne Bearbeitungsaktionen.
Neuladen mit erneuter Master-/Turniercodeeingabe behielt dieselben Tabellenzeilen.
JSON-Rundlauf der Vorrunde hielt Phase und Sperren bei; explizites Ersetzen
durch die Vorbereitungssicherung stellte die Vorbereitung wieder her.
Mastersperre zeigte ausschliesslich die neutrale Maske.

Bei 1365, 390 und 320 Pixeln Breite blieb die Seite ohne horizontales
Ueberlaufen; nur der Tabellenbereich scrollt bei Bedarf seitlich.
Tabellenbereich per Tastatur fokussiert und mit Pfeiltaste gescrollt;
schmale Darstellung zusaetzlich visuell geprueft.
Eigene Testdaten entfernt und isolierter Pruefserver gestoppt.
Nativer Datei-Download/-Transfer und Geraetebedienung wurden anschliessend
vom Entwickler als bestanden gemeldet.

## Entwickler-Praxispruefungen und Abnahme

1. **A/B/C auf GitHub Pages:** Ein Testturnier mit drei Personen oeffnen:
   Start gesperrt und Begruendung sichtbar. Vierte Person ergaenzen.
   Vor Start eine JSON-Vorbereitungssicherung herunterladen. Startbestaetigung
   zuerst abbrechen: weiterhin bearbeitbare Vorbereitung. Danach bestaetigen:
   Vorrundentabelle mit vier Personen, Raengen und ausschliesslich Nullwerten.
   Nach Neuladen und beiden Codes: gleiche Tabelle; keine Aenderung von
   Einstellungen, Code oder Spielenden moeglich.
2. **Tabelle und Bedienung:** Am Turnierlaptop alle Spalten, Avatare und
   Namen pruefen; bei schmalem Fenster Tabelle seitlich mit Maus/Tastatur
   und soweit verfuegbar Touch scrollen. Erwartet: alle Spalten erreichbar,
   keine abgeschnittenen Seitenaktionen. **Partie vorbereiten** sichtbar,
   deaktiviert und mit Hinweis auf Story 1.6.
3. **Vollstaendige Sicherung/Wiederherstellung:** Gestartete Vorrunde sichern
   und in einem anderen Browserprofil importieren. Erwartet: nach Turniercode
   gleiche Phase, Liste, Rangfolge und gesperrte Vorbereitung. Anschliessend
   im urspruenglichen Testturnier die Vorbereitungssicherung importieren,
   bestehenden Code und Ersetzungsbestaetigung angeben.
   Erwartet: bewusst wieder Vorbereitung, gleiche Personen, Bearbeiten
   und manueller Start wieder moeglich.

Ergebnis am 25.11.2026: Alle drei Praxispruefungen als bestanden gemeldet,
keine Abweichungen genannt. Der Entwickler hat die Story ausdruecklich
abgenommen. Die Voraussetzung fuer die Umsetzung von Story 1.6 ist erfuellt.
