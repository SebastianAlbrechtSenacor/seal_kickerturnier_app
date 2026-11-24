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
- Entsperrte Turnieransicht als Vorbereitung fuer Story 1.2.
  Turniere anlegen und oeffnen ist noch nicht verfuegbar.
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
Die folgenden Stories sind noch nicht implementiert.

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

Master- und spaetere Turnier-Zugangscodes sind ausschliesslich umgehbare
Frontend-Zugangshuerden, kein verlaesslicher Schutz einer nichtoeffentlichen
Anwendung. Pruefwert und Prueflogik werden an den Browser ausgeliefert;
auch ein Hash ermoeglicht keine sichere Zugriffskontrolle.
Keine echten, vertraulichen oder anderweitig verwendeten Passwoerter nutzen.
Es wird kein Code an einen Anmeldeserver gesendet. Die Daten sind durch die
Zugangsmaske nicht verschluesselt.

## Geplanter weiterer Funktionsumfang

- Mehrere Turniere mit Spielenden und eindeutigen Emoji-Avataren.
- Konfigurierbare Partiedauer (Standard 10 Minuten), Siegpunkte (3) und
  Niederlagenpunkte (1). Keine Unentschieden; bei Gleichstand nach Zeit
  entscheidet das naechste Tor.
- Unabhaengige Zeitplanung: 120 Minuten Vorrunde und 60 Minuten K.-o.-Phase
  als aenderbare Standardwerte. Start und Phasenwechsel bleiben manuell.
- Wechselnde Zweierteams, individuelle Punkte und Rangliste.
- K.-o.-Phase der besten acht Personen mit festen Teams und
  getrennten Abschlusswertungen.
- Automatische lokale Browserspeicherung auf einem gemeinsamen Laptop.
  JSON-Import/-Export fuer Sicherung und Uebertragung, kein CSV.
  Kein Backend und keine automatische Synchronisation zwischen Geraeten.
  Geloeschte Browserdaten koennen ohne Sicherung zum Datenverlust fuehren.

Technische Grenzen und recherchierte Quellen stehen im
[Epic](./spec/epic-1.md#technische-recherche-stand-24112026).
