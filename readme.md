# Kickerturnier-App

Eine Webanwendung fuer das Kickerturnier im Eschborner Office. Gespielt wird
am echten Kickertisch; die Teilnehmenden bedienen den Laptop daneben selbst.

## Projektstand

Die [Spezifikation mit zehn ATDD-Stories](./spec/epic-1.md) ist seit dem
24.11.2026 zur Umsetzung freigegeben. Der Ablauf steht in
[agents.md](./agents.md): Jede Story wird einzeln umgesetzt und abgenommen.

Story 1.1 setzt das React-/TypeScript-/Vite-Grundgeruest um:

- Neutrale Zugangsmaske mit Master-Zugangscode und sichtbaren Eingabefehlern;
  ohne Office-Branding, Grafik oder Turnierinformationen.
- Entsperrte Turnierauswahl als Einstieg in die Turnierverwaltung.
- Explizites Sperren; nach Neuladen ist der Zugang ebenfalls wieder gesperrt.
- Responsive Gestaltung in Petrol/Tuerkis, Orange/Gelb und Weiss nach den
  [Werbeplakaten](./spec/epic-1.md#dauerhafte-designreferenzen), mit Maus-,
  Touch- und Tastaturbedienung sowie reduzierter Bewegung. Diese gestaltete
  Oberflaeche erscheint erst nach erfolgreicher Mastercode-Eingabe und wird
  beim Sperren wieder entfernt.
- Tests, Typpruefung und Linting sowie GitHub-Pages-Deployment-Workflow.

Der Entwickler hat die urspruenglichen Akzeptanzszenarien A-D einschliesslich
echtem Pages-Aufruf als bestanden gemeldet. Vor Abnahme wurde eine Erweiterung
gewuenscht: Zunaechst nur eine neutrale Zugangsmaske, die gestaltete
Oberflaeche erst nach Codeeingabe. Diese
[Erweiterung](./spec/story-1_1-DONE.md) ist ebenfalls freigegeben und umgesetzt.
Die erneuten Entwicklertests C und D sind bestanden; Story 1.1 wurde am
24.11.2026 ausdruecklich abgenommen.
Auch damit bleiben Dateien oeffentlich abrufbar und
die Frontend-Sperre umgehbar; eine Aussage zum Entfallen einer
Impressumspflicht ist damit nicht verbunden.
[Story 1.2](./spec/story-1_2-DONE.md) ist umgesetzt, getestet und nach
erfolgreichen Entwickler-Praxispruefungen abgenommen.
[Story 1.3](./spec/story-1_3-DONE.md) ist umgesetzt, getestet und nach
erfolgreichen Entwickler-Praxispruefungen am 24.11.2026 abgenommen.
[Story 1.4](./spec/story-1_4-DONE.md) ist umgesetzt, getestet und nach
erfolgreichen Entwickler-Praxispruefungen am 24.11.2026 abgenommen.
[Story 1.5](./spec/story-1_5-DONE.md) ist umgesetzt, getestet und nach
erfolgreichen Entwickler-Praxispruefungen am 25.11.2026 abgenommen.
[Story 1.6](./spec/story-1_6-DONE.md) ist einschliesslich der UI-Rueckmeldung
umgesetzt, getestet und nach erfolgreichen erneuten Entwickler-
Praxispruefungen ausdruecklich abgenommen.
Stories 1.7 bis 1.10 sind noch nicht implementiert.

## Turniere vorbereiten

1. Anwendung mit dem Master-Zugangscode entsperren.
2. **Turnier anlegen** waehlen. Name, Datum/Startzeit, Spielort und einen
   eigenen Turnier-Zugangscode eingeben. Beschreibung ist optional.
3. Dauer je Partie (Standard 10 Minuten), Punkte je Sieg/Niederlage (3/1)
   und geplante Phasendauern (Vorrunde 120, K.-o. 60 Minuten) festlegen.
   Dauern muessen positive ganze Minutenzahlen sein, Punkte ganze Zahlen
   ab null mit Siegpunkten groesser Niederlagenpunkten.
4. Die Vorschau zeigt geplanten K.-o.-Beginn und Turnierende.
   Sie ist unabhaengig von der Partiedauer und startet keine Phase automatisch.
5. **Turnier speichern** oeffnet das neu angelegte Turnier sofort.
   **Einstellungen bearbeiten** erlaubt Aenderungen in der Vorbereitung.
   Ein leeres Turniercode-Feld behaelt beim Bearbeiten den bisherigen Code;
   eine Eingabe ersetzt ihn.
6. **Zur Turnierauswahl** schliesst den Turnierzugang. Die Liste zeigt nur
   Name und Datum. Erneutes Oeffnen erfordert den passenden Turniercode.
7. **Anwendung sperren** oder Neuladen sperrt auch den Masterzugang.
   Gespeicherte Turniere bleiben im selben Browserprofil erhalten.

Datum und Uhrzeit gelten immer fuer `Europe/Berlin`, auch auf einem
anders eingestellten Rechner. Nicht existierende Uhrzeiten bei der
Fruehjahrs-Zeitumstellung sind ungueltig; bei einer doppelt vorkommenden
Herbst-Uhrzeit wird das fruehere Vorkommen verwendet. Phasendauern werden
als tatsaechlich vergangene Minuten gerechnet, auch ueber Tageswechsel hinweg.

### Speicherung und Fehler

Jedes Turnier wird als zusammenhaengender, versionierter JSON-Stand mit
eigener ID im lokalen Browserspeicher gespeichert. Fuer den Turniercode
wird nur ein SHA-256-Pruefwert abgelegt, keine Klartext-Eingabe und keine
entsperrte Sitzung. Die uebrigen Turnierdaten sind nicht verschluesselt.

Bei fehlgeschlagenem Speichern zeigt die App einen Fehler und behaelt die
Eingaben sowie den letzten erfolgreich gespeicherten Stand. Gesperrter
Lesespeicher oder beschaedigte Daten werden nicht als leere Turnierliste
ausgegeben. Schreibzugriffe pro Turnier werden ueber Web Locks serialisiert;
veraltete Bearbeitungen werden mit Konfliktmeldung abgewiesen, auch wenn
zwischenzeitlich eine alte Sicherung importiert wurde. Bei einem Konflikt
den aktuellen Stand ueber die Turnierauswahl neu oeffnen. Es gibt keine
automatische Live-Aktualisierung oder Zusammenfuehrung zwischen Tabs.
Ein aktueller Browser mit Web-Locks-Unterstuetzung ueber HTTPS oder localhost
ist zum Speichern und Importieren erforderlich; ohne Unterstuetzung erscheint
eine Fehlermeldung statt eines ungeschuetzten Schreibzugriffs.

Die Daten liegen **nur in diesem Browserprofil auf diesem Geraet**,
nicht bei GitHub. Kein Privatmodus; geloeschte Browserdaten koennen zum
Datenverlust fuehren. Regelmaessig JSON-Sicherungen herunterladen.
Der Turnierstart erfolgt ausschliesslich manuell mit Bestaetigung.

### Spielende und Avatare verwalten

1. Im geoeffneten Turnier **Spielende verwalten** waehlen.
2. **Person hinzufuegen** waehlen, Spitznamen eingeben und einen freien
   Emoji-Avatar anklicken oder per Tastatur auswaehlen. **Person speichern**
   legt die Person mit eigener, stabiler ID an.
3. Die Palette enthaelt 64 Avatare; damit sind maximal 64 Personen je
   Turnier moeglich. Belegte Avatare sind gesperrt. Sind alle belegt,
   erscheint eine Begruendung und weitere Anmeldungen sind gesperrt.
4. **Bearbeiten** aendert Spitznamen und Avatar, aber nicht die ID.
   Der eigene Avatar bleibt dabei verfuegbar.
   **Entfernen** fordert eine Bestaetigung; **Abbrechen** laesst die
   Person unveraendert. Nach bestaetigtem Entfernen ist der Avatar wieder frei.
5. **Zur Turnieruebersicht** fuehrt zu Einstellungen und JSON-Sicherung zurueck.
   Aendern der Turniereinstellungen behaelt die Spielendenliste bei.

Spitznamen und Avatare sind pro Turnier eindeutig; andere Turniere duerfen
sie erneut verwenden. Der deutsche Namensvergleich ignoriert Gross-/
Kleinschreibung, unterscheidet aber Umlaute vom Grundbuchstaben.
Aeussere Leerzeichen werden entfernt, interne bleiben unveraendert.
Leere oder doppelte Namen zeigen einen Feldhinweis.
Fehlgeschlagene Speicherungen und Mehrtab-Konflikte veraendern die
gespeicherte Liste nicht und behalten den Entwurf bei.
Nach Turnierstart ist die Spielendenliste gesperrt.

### Vorrunde starten und Tabelle anzeigen

1. Mindestens vier Spielende anmelden. Darunter bleibt **Turnier starten**
   mit sichtbarer Begruendung gesperrt.
2. **Turnier starten** oeffnet eine Bestaetigungsansicht. Bis zur
   Bestaetigung bleibt alles unveraendert; **Abbrechen** kehrt zur Vorbereitung
   zurueck. **Vorrunde verbindlich starten** speichert den Phasenwechsel.
3. Die Vorrundentabelle zeigt alle Personen mit Avatar, eindeutigem Rang,
   Spielen, Siegen, Niederlagen, Toren, Gegentoren, Tordifferenz und Punkten.
   Alle Statistiken beginnen bei null. Da Partien und Ergebniswertung erst
   folgen, bleiben sie in diesem Entwicklungsstand bei null.
4. Sortiert wird nach Punkten, Siegen, Tordifferenz und erzielten Toren
   absteigend, anschliessend nach deutschem Spielernamen aufsteigend.
   Auf schmalen Bildschirmen laesst sich die Tabelle seitlich scrollen,
   auch per Tastatur nach Fokussieren des Tabellenbereichs.
5. Einstellungen, Punktevergabe, Dauern, Turniercode und Spielende sind
   nach Start unveraenderbar. Die Felder bleiben lesbar, Bearbeitungsaktionen
   entfallen. Neuladen und erneute Codeeingabe behalten Phase und Rangfolge bei.
   Veraltete Tabs koennen die gesperrte Vorbereitung nicht ueberschreiben.
6. **Partie vorbereiten** oeffnet die Positionsauswahl. Ein verbindlicher
   Partiestart und der Timer folgen erst mit Story 1.7.

Startzeit und geplante Phasenenden sind nur Planung. Weder der geplante
Beginn noch 19 Uhr starten oder wechseln eine Phase automatisch.
Speicherfehler oder ein konkurrierend geaenderter Stand zeigen einen Fehler;
ein nicht erfolgreich gespeicherter Start zeigt keine gestartete Vorrunde.

### Eine Partie besetzen

1. In der gestarteten Vorrunde **Partie vorbereiten** waehlen.
   Links steht die kompakte Tabelle mit **Rang**, **Spielende** und **Punkte**,
   rechts der groessere Tisch. Die Turnieruebersicht behaelt ihre vollstaendige
   Tabelle mit allen neun Spalten. Auf schmalen Bildschirmen stehen beide
   Bereiche untereinander. Turnierinfos stehen kompakt unten.
2. Name oder Avatar mit Maus oder Finger aus der Tabelle auf Weiss Angriff,
   Weiss Verteidigung, Schwarz Angriff oder Schwarz Verteidigung ziehen.
   Am oberen/unteren Bildschirmrand scrollt die Seite beim Ziehen mit.
   Ausserhalb der Namens-/Avatarflaechen bleiben Tabelle und Seite scrollbar.
   Tabellenkopf und Namensspalte bleiben beim Tabellenscrollen sichtbar.
   Links steht Weiss Verteidigung oben und Weiss Angriff darunter;
   rechts steht Schwarz Angriff oben und Schwarz Verteidigung darunter.
   Angriff und gegnerische Verteidigung stehen sich damit gegenueber.
   Besetzte Positionen zeigen den Avatar deutlich vergroessert,
   weiterhin mit Positionsbezeichnung und Spitzname.
3. Alternativ zuerst eine Position anklicken/antippen, dann eine freie Person
   in der Tabelle auswaehlen. Beide Schritte funktionieren auch mit
   Tabulator und Enter/Leertaste. Die ausgewaehlte Position ist markiert.
4. Eingesetzte Personen sind mit ihrer Position markiert und gegen erneutes
   Einsetzen gesperrt. Eine freie Person auf eine belegte Position ziehen
   oder fuer sie auswaehlen ersetzt die Belegung; die bisherige Person wird frei.
   **Entfernen** leert eine einzelne Position, **Aufstellung leeren** alle vier.
   Ungueltiges oder abgebrochenes Ziehen laesst den Entwurf mit Hinweis bestehen.
5. Erst mit vier verschiedenen Personen ist **Spiel starten** aktiv und
   hervorgehoben. Vier Belegungen allein sperren die Bearbeitung nicht.
   Die Aktion oeffnet derzeit ausdruecklich nur **Aufstellung pruefen**:
   Noch keine Partie laeuft, es werden keine Partiedaten gespeichert.
   **Zur Aufstellung** behaelt den bearbeitbaren Entwurf bei.
6. **Vorbereitung verlassen**, Neuladen oder **Anwendung sperren** verwerfen
   den Entwurf. Erneutes Vorbereiten beginnt leer; dieselben Personen duerfen
   erneut gewaehlt werden. Der Entwurf ist auch nicht Teil einer JSON-Sicherung.
   Veraltete Turnierstaende werden beim Oeffnen und vor der Aufstellungspruefung
   mit Konfliktmeldung abgewiesen.

### JSON-Sicherung und Wiederherstellung

- Im geoeffneten Turnier **JSON-Sicherung herunterladen** waehlen.
  Die UTF-8-Datei enthaelt ID, Einstellungen, Spielende mit IDs/Spitznamen/Avataren,
  Phase und den Pruefwert des
  Turniercodes, aber weder Mastercode noch Klartext-Codes oder entsperrte Sitzung.
  Die Daten sind nicht verschluesselt; Sicherungen nicht oeffentlich teilen.
- In der Turnierauswahl **JSON-Sicherung importieren** waehlen und die
  Datei auswaehlen. Die Vorschau zeigt Name und Datum. Erst
  **Turnier importieren** speichert das neue Turnier; **Abbrechen** aendert nichts.
- Existiert dieselbe ID bereits, sind der **bestehende** Turniercode und
  die ausdrueckliche Ersetzungsbestaetigung erforderlich. **Turnier ersetzen**
  ersetzt den gesamten Stand, ohne ihn mit dem lokalen Stand zu vermischen.
  Anschliessend gilt der Code aus der Sicherung. Zum Oeffnen wird er erneut
  abgefragt. Die lokale Revision steigt dabei zur Konflikterkennung.
  Das gilt auch fuer eine gestartete Vorrunde: Eine aeltere
  Vorbereitungssicherung setzt nach Codepruefung und Ersetzungsbestaetigung
  bewusst den gesamten Stand zurueck. Dies ist keine normale Einstellungsaenderung.
  Eine gesicherte Vorrunde wird hingegen mit gesperrter Vorbereitung
  und derselben Spielendenliste wiederhergestellt.
- Beschaedigte Dateien, unbekannte Versionen/Felder und widerspruechliche
  Einstellungen werden mit Importfehler abgewiesen. Vorhandene Turniere
  bleiben ebenso bei Lese-/Speicherfehlern unveraendert.
- Uebertragung in einen anderen Browser oder auf ein anderes Geraet erfolgt
  durch Kopieren und Importieren der Datei, nicht automatisch.
  Sicherungen enthalten die zum jeweiligen Entwicklungsstand vorhandenen Daten.
  Partien, Timer und weitere Phasen werden erst mit den Folgestories
  in das Format aufgenommen und geprueft. CSV wird nicht unterstuetzt.

Alte Turniere und Sicherungen ohne Spielendenliste bleiben nutzbar und
zeigen eine leere Liste. Neue Turniere und bearbeitete Staende verwenden
Datenschema 2 mit ausdruecklicher Spielendenliste; die Sicherungshuellen-Version
bleibt 1. Alte App-Versionen koennen Schema 2 nicht bearbeiten und daher
keine neuen Spielendendaten versehentlich entfernen. Nach einem Deployment
offene App-Tabs neu laden. Ungueltige oder doppelte Spielenden-IDs,
Spitznamen und Avatare werden beim Laden/Importieren abgewiesen.

## Lokal starten

Voraussetzung: Node.js 24 LTS einschliesslich npm.
Im Terminal im Repository-Verzeichnis:

```powershell
Set-Location app
npm ci
npm run configure-access
npm run dev
```

`configure-access` fragt interaktiv nach einem ausschliesslich fuer diese App
verwendeten Master-Zugangscode. Die Eingabe ist im Terminal sichtbar.
Gespeichert wird nur dessen SHA-256-Pruefwert in der Git-ignorierten
Datei `app\.env.local`, nicht der Klartext. Das Skript gibt ausserdem den
Pruefwert fuer die GitHub-Konfiguration aus. Code nicht als Kommandoargument
oder in Quelltextdateien hinterlegen. Nach Aenderung den Dev-Server neu starten.

Die App ist standardmaessig unter
`http://localhost:5173/seal_kickerturnier_app/` erreichbar; bei belegtem Port
zeigt Vite einen anderen Port an. Ohne gueltigen Pruefwert bleibt der Zugang
gesperrt. Der Produktions-Build bricht bei fehlender Konfiguration ab.
Es gibt keinen voreingestellten Master-Zugangscode.

## Pruefen und bauen

Im Verzeichnis `app`:

```powershell
npm test
npm run lint
npm run build
npm run preview
```

Der Build prueft auch die TypeScript-Typen von Anwendung, Tests und
Vite-Konfiguration. Der Testcode verwendet ausschliesslich synthetische
Testeingaben und benoetigt keinen echten Zugangscode.
Die Vorschau liegt standardmaessig unter
`http://localhost:4173/seal_kickerturnier_app/`.

## GitHub Pages einrichten

1. Lokal `npm run configure-access` ausfuehren und den ausgegebenen
   SHA-256-Pruefwert kopieren, nicht den eingegebenen Code.
2. Im GitHub-Repository unter **Settings > Secrets and variables > Actions >
   Variables** die Repositoryvariable `MASTER_CODE_HASH` mit diesem Wert
   anlegen. Der Hash ist keine geheime Server-Zugangsinformation.
3. Unter **Settings > Pages > Build and deployment > Source** die Quelle
   **GitHub Actions** waehlen.
4. Aenderungen nach `main` pushen oder den Workflow **Validate and deploy
   Pages** manuell starten.
5. Nach erfolgreichem Deployment
   `https://sebastianalbrechtsenacor.github.io/seal_kickerturnier_app/`
   aufrufen. Massgeblich ist die im Deployment ausgegebene Pages-URL.

Der [Workflow](./.github/workflows/deploy.yml) fuehrt Installation aus dem
Lockfile, Tests, Linting und Build aus. Nur ein erfolgreicher Build von
`main` wird veroeffentlicht; Pull Requests werden nur geprueft.
Ein neuer Pruefwert in der Repositoryvariable wird erst mit einem neuen
Build wirksam. Der Projekt-Basispfad ist in der
[Vite-Konfiguration](./app/vite.config.ts) festgelegt; bei Umbenennung
des Repositorys muss er angepasst werden.

## Grenzen des Zugangs

Master- und Turnier-Zugangscodes sind ausschliesslich umgehbare
Frontend-Zugangshuerden, kein verlaesslicher Schutz einer nichtoeffentlichen
Anwendung. Pruefwert und Prueflogik werden an den Browser ausgeliefert;
auch ein Hash ermoeglicht keine sichere Zugriffskontrolle.
Keine echten, vertraulichen oder anderweitig verwendeten Passwoerter nutzen.
Es wird kein Code an einen Anmeldeserver gesendet. Die Daten sind durch die
Zugangsmaske nicht verschluesselt.

## Geplanter weiterer Funktionsumfang

- Partien mit der konfigurierten Dauer und Punktewertung.
  Keine Unentschieden; bei Gleichstand nach Zeit entscheidet das naechste Tor.
- Wechselnde Zweierteams, individuelle Punkte und Rangliste.
- K.-o.-Phase der besten acht Personen mit festen Teams und
  getrennten Abschlusswertungen.

Kein Backend und keine automatische Synchronisation zwischen Geraeten.
Geloeschte Browserdaten koennen ohne Sicherung zum Datenverlust fuehren.

Technische Grenzen und recherchierte Quellen stehen im
[Epic](./spec/epic-1.md#technische-recherche-stand-24112026).
