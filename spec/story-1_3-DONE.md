# Story 1.3: JSON-Sicherung und Wiederherstellung

Status: Abgenommen am 24.11.2026. Alle drei Entwickler-Praxispruefungen
als bestanden gemeldet; ausdrueckliche Abnahme erteilt.
Konkretisierung einschliesslich Szenario E am 24.11.2026 ausdruecklich freigegeben.
Epic: [Epic 1](./epic-1-DONE.md)
Abhaengigkeiten: [Story 1.2](./story-1_2-DONE.md).

Als organisierende Person moechte ich ein Turnier vollstaendig als JSON sichern
und auf denselben oder einen anderen Browser uebertragen.

## Akzeptanzszenarien

### A: Vollstaendige Sicherung
- Gegeben ist ein entsperrtes Turnier.
- Wenn ich eine JSON-Sicherung exportiere und in einer entsperrten Anwendung
  ohne dieses Turnier importiere,
- dann werden ID, Einstellungen und saemtliche zum jeweiligen
  Entwicklungsstand verfuegbaren Spielenden-, Partien- und Phasendaten
  vollstaendig wiederhergestellt.

### E: Speicherfehler und konkurrierende Tabs
- Gegeben ist ein gueltiger Import oder eine geoeffnete Bearbeitung.
- Wenn der Speicher nicht verfuegbar ist oder ein anderer Tab den Zielstand
  seit dem Einlesen veraendert hat,
- dann erscheint ein Fehler mit Hinweis zum erneuten Oeffnen bzw. Wiederholen;
  kein bestehender Stand wird teilweise oder unbemerkt ueberschrieben.
- Wenn zwei Tabs gleichzeitig denselben Stand speichern oder ersetzen,
- dann wird nur einer gespeichert; der andere erhaelt einen Konfliktfehler.
  Auch das Einspielen einer aelteren Sicherung macht offene Bearbeitungen
  nicht wieder gueltig.

## Umsetzungskonkretisierung

Export ist nur im entsperrten Turnier verfuegbar; Import in der entsperrten
Turnierauswahl. Vor dem Import zeigt die App Name und Datum sowie bei
vorhandener ID eine gesonderte Ersetzungsbestaetigung. Nach erfolgreichem
Import bleibt das Turnier gesperrt. Abbrechen schreibt nichts.
Unbekannte Felder werden als unbekanntes Format abgewiesen, nicht stillschweigend
entfernt. Das Dateiformat umfasst eine Kennung, Formatversion und ein Turnier.
Ein lokal ersetzter Stand erhaelt eine neue lokale Revision zur Konflikterkennung.
Schreibvorgaenge werden mit Web Locks serialisiert; fehlt die Browserunterstuetzung,
bleiben Schreiben/Import mit sichtbarer Fehlermeldung gesperrt.

Spielende, Avatare, Partien, Timer und weitere Phasen existieren erst in den
Folgestories. Die entsprechenden Teile von A-D werden dort erweitert und
geprueft; Story 1.3 sichert alle gegenwaertig verfuegbaren Vorbereitungsdaten.

## Umsetzung und eigenstaendige Pruefung am 24.11.2026

57 automatisierte Tests in fuenf Dateien bestanden, einschliesslich aller
bisherigen Domaenen-, Speicher-, Turnierverwaltungs- und Masterzugangstests.
Linting, TypeScript und Produktions-Build erfolgreich.

| Szenario | Gepruefter aktueller Umfang | Ergebnis |
| --- | --- | --- |
| A | Serialisieren, Einlesen und Import aller aktuellen Turnierdaten; ID/Pruefhash bleiben erhalten; keine Sitzung und kein Klartext-Code; nach Import erneut gesperrt | Bestanden |
| B | Defektes JSON, fremde Kennung/Version, unbekannte Felder und widerspruechliche Einstellungen; Dateilesefehler; kein teilweises Schreiben | Bestanden |
| C | Gleiche ID: Bestaetigung erforderlich, Abbrechen ohne Aenderung, nur bestehender Code erlaubt Ersetzen; danach gilt Sicherungscode | Bestanden |
| D | Umlaute, interne Leerzeichen, Zeilenumbrueche und mehrteilige Emojis in den aktuellen Textfeldern verlustfrei | Bestanden |
| E | Voller/gesperrter Speicher, veraltete Revisionen, konkurrierende Schreibvorgaenge und fehlende Web Locks werden sichtbar abgewiesen | Bestanden |

Ein isolierter Produktions-Build wurde im Browser geprueft:

- Exportaktion erzeugt UTF-8-JSON mit Kennung, Version und genau einem
  vollstaendigen Turnier, ohne Klartext-Zugangscode.
- Dateiimport ueber File/FileReader und Wiederentsperren erfolgreich.
- Alte Sicherung nach Aenderung in einem zweiten Tab eingespielt:
  explizite Bestaetigung und bestehender Code erforderlich; falscher Code
  aendert nichts; nach Ersetzen neue Revision und Sicherungscode wirksam.
- Zwei echte Tabs auf denselben Stand angesetzt und beide Speicheraktionen
  hinter einer Web-Lock-Testbarriere gestartet: Nur der erste Schreibzugriff
  gespeichert; zweiter zeigt Konflikt und behaelt seinen Eingabeentwurf.
- Importformular bei 320 Pixeln Breite ohne Ueberlaufen der Eingabeaktionen
  vermessen und visuell geprueft; Aktionsbuttons 48 Pixel hoch.
- Mastersperre entfernt die gesamte Turnier-/Sicherungsoberflaeche.

Die integrierte Browserumgebung lieferte fuer den nativen Download kein
Download-Ereignis. Die erzeugten Blob-Inhalte wurden stattdessen direkt
geprueft; der Entwickler hat den echten Datei-Download und die Uebertragung
anschliessend als bestanden gemeldet.
Testdaten wurden entfernt und der isolierte Pruefserver gestoppt.

Noch nicht pruefbar und bewusst Folgestories zugeordnet: laufender Timer aus A,
Spielenden-/Partienreferenzen aus B, Ersetzungssperre bei laufender Partie
oder offener Ergebniseingabe aus C sowie Spitznamen/Avatare aus D.
Unbekannte entsprechende Felder werden derzeit abgewiesen, nicht ignoriert.

## Entwickler-Praxispruefungen und Abnahme

1. **A/D: Echter Download und Browserwechsel.** Auf GitHub Pages ein
   Testturnier mit Umlauten/Emoji in Name und Beschreibung oeffnen und
   **JSON-Sicherung herunterladen** waehlen. Die gespeicherte Datei in einem
   anderen Browserprofil ohne dieses Turnier nach Masterentsperrung importieren.
   Erwartet: Vorschau, danach gespeichertes, aber gesperrtes Turnier; nach
   Turniercode identische Einstellungen und unveraenderte Sonderzeichen.
2. **C: Sicheres Ersetzen.** Im urspruenglichen Testturnier Name und Code
   aendern, dann die aeltere Datei waehlen. Zuerst abbrechen.
   Erwartet: keine Aenderung. Wiederholen, Bestaetigung setzen und mit
   falschem Code versuchen: Fehler, keine Aenderung. Danach bestehenden
   aktuellen Code verwenden: alter Sicherungsstand ersetzt den lokalen Stand;
   zum Oeffnen ist nun wieder der Code aus der Datei erforderlich.
3. **Bedienung am Turnierlaptop.** Datei auswaehlen, Vorschau, Bestaetigung
   und Abbrechen mit Maus/Tastatur, soweit verfuegbar Touch, pruefen.
   Erwartet: Texte und Aktionen erreichbar; Mastersperre auch aus der
   Importansicht zeigt ausschliesslich die neutrale Zugangsmaske.

Ergebnis am 24.11.2026: Alle drei Praxispruefungen als bestanden gemeldet,
keine Abweichungen genannt. Der Entwickler hat die Story ausdruecklich
abgenommen. Die Voraussetzung fuer die Umsetzung von Story 1.4 ist erfuellt.
  Ein laufender Timer behaelt seinen urspruenglichen Endzeitpunkt.
  Zum Oeffnen ist der Turniercode erforderlich; keine entsperrte Sitzung
  oder Mastercode wird uebertragen.

### B: Beschaedigte oder unbekannte Sicherung
- Gegeben ist ein bestehender lokaler Datenbestand.
- Wenn ich ungueltiges JSON, eine unbekannte Formatversion oder fachlich
  widerspruechliche Daten importiere, beispielsweise doppelte Spieler-IDs,
  unbekannte Spielreferenzen oder ein gespeichertes Unentschieden,
- dann nennt die App einen Importfehler und laesst alle vorhandenen Daten
  unveraendert. Es gibt keinen teilweisen Import.

### C: Bereits vorhandenes Turnier
- Gegeben ist ein Turnier mit derselben ID wie in einer gueltigen Sicherung.
- Wenn ich diese importiere,
- dann wird der Stand erst nach Pruefung des bestehenden Turniercodes und
  ausdruecklicher Ersetzungsbestaetigung ersetzt. Abbrechen aendert nichts.
  Mit laufender Partie oder offener Ergebniseingabe im Ziel wird das
  Ersetzen abgewiesen. Staende werden nicht automatisch zusammengefuehrt.

### D: Namen und Avatare verlustfrei sichern
- Gegeben ist ein entsperrtes Turnier mit Umlauten, Leerzeichen innerhalb
  von Spitznamen und Emoji-Avataren.
- Wenn ich eine JSON-Sicherung exportiere und wieder importiere,
- dann sind Namen und Avatare unveraendert. Mehrteilige Emoji-Sequenzen
  bleiben vollstaendig erhalten.

### E: Konkurrierende Tabs und Schreibfehler
- Gegeben ist dasselbe Turnier in zwei Tabs.
- Wenn beide Aenderungen versuchen oder ein Import nicht gespeichert werden kann,
- dann wird kein neuerer Stand still ueberschrieben und kein Erfolg
  vorgetaeuscht. Der betroffene Tab zeigt den Konflikt beziehungsweise
  Speicherfehler und fordert zum Laden des aktuellen Standes auf.

## Validierung

Automatisiert: JSON-Export-/Import-Roundtrip einschliesslich Unicode,
ungueltige Referenzen/Versionen, Ersetzung und Schreibkonflikte.
Die Sicherungsszenarien werden bei neuen Spiel- und K.-o.-Daten erweitert.
