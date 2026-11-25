# Story 1.4: Spielende und Avatare verwalten

Status: Abgenommen am 24.11.2026. Alle drei Entwickler-Praxispruefungen
als bestanden gemeldet; ausdrueckliche Abnahme erteilt.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: [Story 1.2](./story-1_2-DONE.md),
[Story 1.3](./story-1_3-DONE.md).

Als organisierende Person moechte ich Spielende mit eindeutigem Spitznamen
und Emoji-Avatar einem vorbereiteten Turnier zuordnen.

## Akzeptanzszenarien

### A: Person hinzufuegen
- Gegeben ist ein entsperrtes, noch nicht gestartetes Turnier.
- Wenn ich einen nichtleeren Spitznamen und ein freies Emoji aus der Palette
  auswaehle und speichere,
- dann erscheint die Person mit eigener ID, bereinigtem Namen und Avatar
  in diesem Turnier und bleibt nach Neuladen erhalten.
  Leerzeichen innerhalb eines Namens wie "Alex am Kicker" sind erlaubt
  und bleiben erhalten.

### B: Eindeutigkeit
- Gegeben ist die Person "Alex" mit einem belegten Emoji.
- Wenn ich " alex " oder den bereits belegten Avatar erneut verwenden will,
- dann weist die Anwendung die doppelte Zuordnung mit Feldhinweis ab.
  Der deutsche Namensvergleich ignoriert Gross-/Kleinschreibung.
  In einem anderen Turnier duerfen Name und Avatar erneut vorkommen.

### C: Bearbeiten und entfernen
- Gegeben ist eine angelegte Person vor Turnierstart.
- Wenn ich Name/Avatar gueltig aendere oder die Person entferne,
- dann wird die Liste entsprechend gespeichert; die Eindeutigkeit bleibt
  gewahrt und ein freigewordener Avatar ist wieder auswaehlbar.

### D: Avatar-Palette erschoepft oder Name leer
- Gegeben sind keine freien Avatare oder eine Eingabe nur aus Leerzeichen.
- Wenn ich eine weitere Person speichern moechte,
- dann verhindert die Anwendung das Speichern mit sichtbarer Begruendung.
  Es wird kein doppelter Avatar und kein leerer Spieler angelegt.

## Validierung

Automatisiert: CRUD vor Start, Normalisierung, Namens-/Avatar-Konflikte,
Turniertrennung und Speicherung. Browserpruefung: Auswahl per Klick und Touch.

## Freigegebene Konkretisierung vom 24.11.2026

- Feste Palette aus 64 eindeutig beschrifteten Emoji-Avataren. Damit sind
  bis zu 64 Spielende je Turnier moeglich. Belegte Avatare sind sichtbar
  gesperrt; beim Bearbeiten bleibt der eigene Avatar auswaehlbar.
- Namensvergleich mit deutscher Sortierung ohne Gross-/Kleinschreibung;
  Umlaute bleiben von ihrem Grundbuchstaben unterscheidbar. Aeussere
  Leerzeichen werden entfernt, interne Leerzeichen unveraendert behalten.
- Entfernen erfordert eine ausdrueckliche Bestaetigung; Abbrechen aendert nichts.
- Vorhandene Turniere und alte JSON-Sicherungen ohne Spielendenliste
  bleiben als Turniere ohne Spielende nutzbar. Neue Sicherungen enthalten
  IDs, Spitznamen und Avatare verlustfrei. Ungueltige oder doppelte IDs,
  Namen und Avatare werden beim Laden/Importieren abgewiesen.
- Neue Turniere und bearbeitete Staende verwenden Datenschema 2 mit
  ausdruecklicher Spielendenliste. Alte Staende in Schema 1 bleiben lesbar.
  Noch geoeffnete alte App-Versionen erkennen Schema 2 als unbekannt,
  statt beim Speichern versehentlich neue Spielendendaten zu entfernen.
- Aendern der Turniereinstellungen behaelt die Spielenden unveraendert.
  Speicherfehler und Mehrtab-Konflikte zeigen einen Fehler, ohne den
  bestehenden Stand zu ersetzen; Eingaben bleiben fuer einen neuen Versuch erhalten.
- Turnierstart und die daran gekoppelte Bearbeitungssperre folgen mit Story 1.5.

## Umsetzung und eigenstaendige Pruefung am 24.11.2026

78 automatisierte Tests in sechs Dateien bestanden. Linting, TypeScript und
Produktions-Build erfolgreich. Die bisherigen Zugangs-, Speicher- und
JSON-Sicherungstests bleiben erfolgreich.

| Szenario | Gepruefter Umfang | Ergebnis |
| --- | --- | --- |
| A | Anlegen mit stabiler ID; nur aeussere Leerzeichen entfernt; interne Leerzeichen, Umlaute und mehrteilige Emojis bleiben erhalten; Wiederaufruf nach Neuladen | Bestanden |
| B | Deutsche Namensgleichheit ohne Gross-/Kleinschreibung, auch mit aequivalenter Unicode-Schreibweise; belegte Avatare gesperrt; Daten und Namensraum je Turnier getrennt | Bestanden |
| C | Name/Avatar aendern mit unveraenderter ID; eigenen Avatar beibehalten; Entfernen abbrechen oder bestaetigen; Avatar danach wieder frei | Bestanden |
| D | Genau 64 eindeutige Anmeldungen moeglich; bei voller Palette Hinweismeldung und gesperrtes Hinzufuegen; Bearbeiten bleibt moeglich; leere Namen/fehlende Avatare mit Feldfehlern | Bestanden |

Weitere Pruefungen: Einstellungswechsel behaelt die Spielenden; Schreibfehler
beim Anlegen und Entfernen sowie ein konkurrierend geaenderter Stand werden
ohne Datenverlust abgewiesen. Entwurf und Auswahl bleiben nach Fehlern
erhalten. JSON-Rundlauf einschliesslich IDs, Umlauten, internen Leerzeichen
und mehrteiligen Avataren erfolgreich; doppelte IDs/Namen/Avatare abgewiesen.
Altdaten ohne Liste bleiben lesbar, Schema 2 ohne erforderliche Liste wird
nicht als leerer Stand interpretiert.

Im isolierten Produktions-Browser wurden Anlegen, deutscher Namenskonflikt,
gesperrter Avatar, Bearbeiten per Maus und Avatar-Auswahl per Tastatur,
Entfernen sowie Avatarfreigabe geprueft. Neuladen mit erneuter Codeeingabe
und JSON-Export/-Import stellten dieselbe Spielendenliste wieder her.
Schemawechsel auf 2 erhielt die Liste unveraendert.

Bei 1365, 390 und 320 Pixeln Breite blieben alle Avataraktionen im Viewport.
Avatarbuttons waren mindestens 48 Pixel breit und 51 Pixel hoch;
die schmale Palette wurde zusaetzlich visuell geprueft.
Mastersperre stellte ausschliesslich die neutrale Maske her.
Eigene Testdaten entfernt und isolierten Pruefserver gestoppt.
Die Geraetebedienung und Emoji-Darstellung am Turnierlaptop wurden
anschliessend vom Entwickler als bestanden gemeldet.

## Entwickler-Praxispruefungen und Abnahme

1. **A/B/C auf GitHub Pages:** Ein vorhandenes Turnier oeffnen, unter
   **Spielende verwalten** die Person " Alex am Kicker " mit freiem Avatar
   anlegen. Eine zweite Anmeldung " alex am kicker " versuchen.
   Erwartet: erster Name ohne aeussere Leerzeichen gespeichert; doppelter
   Name mit Feldhinweis abgewiesen; belegter Avatar gesperrt.
   Erste Person bearbeiten, Neuladen und erneut entsperren.
   Erwartet: geaenderter Name/Avatar erhalten.
   Entfernen zuerst abbrechen, danach bestaetigen.
   Erwartet: zunaechst unveraendert, danach entfernt und Avatar wieder frei.
2. **JSON-Sicherung mit Spielenden:** Eine Person mit Umlaut im Namen und
   dem Avatar "Technikerin" anlegen, sichern und in ein anderes Browserprofil
   importieren. Erwartet: nach Turniercode derselbe Spitzname und derselbe
   mehrteilige Emoji-Avatar ohne Zeichenverlust.
3. **Bedienung am Turnierlaptop:** Freie und belegte Avatare mit Maus,
   Tastatur und soweit verfuegbar Touch pruefen. Erwartet: Auswahl eindeutig
   hervorgehoben, belegte Avatare nicht waehbar und alle Aktionen erreichbar.
   Emoji-Zeichen sollten erkennbar sein statt fehlender Zeichensymbole.

Ergebnis am 24.11.2026: Alle drei Praxispruefungen als bestanden gemeldet,
keine Abweichungen genannt. Der Entwickler hat die Story ausdruecklich
abgenommen. Die Voraussetzung fuer die Umsetzung von Story 1.5 ist erfuellt.
