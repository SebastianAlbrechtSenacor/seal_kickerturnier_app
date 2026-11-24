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
Stories 1.4 bis 1.10 sind noch nicht implementiert.

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
Spielende und Turnierstart sind ebenfalls noch nicht verfuegbar.

### JSON-Sicherung und Wiederherstellung

- Im geoeffneten Turnier **JSON-Sicherung herunterladen** waehlen.
  Die UTF-8-Datei enthaelt ID, Einstellungen, Phase und den Pruefwert des
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
- Beschaedigte Dateien, unbekannte Versionen/Felder und widerspruechliche
  Einstellungen werden mit Importfehler abgewiesen. Vorhandene Turniere
  bleiben ebenso bei Lese-/Speicherfehlern unveraendert.
- Uebertragung in einen anderen Browser oder auf ein anderes Geraet erfolgt
  durch Kopieren und Importieren der Datei, nicht automatisch.
  Sicherungen enthalten die zum jeweiligen Entwicklungsstand vorhandenen Daten.
  Spielende, Partien, Timer und weitere Phasen werden erst mit den Folgestories
  in das Format aufgenommen und geprueft. CSV wird nicht unterstuetzt.

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

- Spielende mit eindeutigen Emoji-Avataren in den vorbereiteten Turnieren.
- Partien mit der konfigurierten Dauer und Punktewertung.
  Keine Unentschieden; bei Gleichstand nach Zeit entscheidet das naechste Tor.
- Wechselnde Zweierteams, individuelle Punkte und Rangliste.
- K.-o.-Phase der besten acht Personen mit festen Teams und
  getrennten Abschlusswertungen.

Kein Backend und keine automatische Synchronisation zwischen Geraeten.
Geloeschte Browserdaten koennen ohne Sicherung zum Datenverlust fuehren.

Technische Grenzen und recherchierte Quellen stehen im
[Epic](./spec/epic-1.md#technische-recherche-stand-24112026).
