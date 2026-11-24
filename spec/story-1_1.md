# Story 1.1: Pages-Grundgeruest und Masterzugang

Status: Freigegeben am 24.11.2026, umgesetzt. Entwicklertests und Abnahme ausstehend.
Epic: [Epic 1](./epic-1.md)
Abhaengigkeiten: keine.

Als teilnehmende Person moechte ich die Anwendung ueber GitHub Pages aufrufen
und nach Eingabe des Master-Zugangscodes zur Turnierauswahl gelangen.

## Akzeptanzszenarien

### A: Erster Aufruf und falscher Code
- Gegeben ist ein Browser ohne entsperrte Sitzung.
- Wenn ich die Anwendung aufrufe oder einen falschen/leeren Code absende,
- dann sehe ich ausschliesslich die Zugangsmaske und bei falscher Eingabe
  eine verstaendliche Fehlermeldung; Turnierfunktionen bleiben ausgeblendet.

### B: Entsperren und Sperren
- Gegeben ist die Zugangsmaske.
- Wenn ich den korrekten Mastercode eingebe,
- dann erreiche ich die Turnierauswahl.
- Wenn ich die Anwendung explizit sperre,
- dann werden auch entsperrte Turnieransichten geschlossen und die
  Zugangsmaske erscheint erneut; gespeicherte Turniere bleiben erhalten.

### C: Deployment unter dem Repository-Pfad
- Gegeben ist der fuer dieses Repository eingerichtete Pages-Workflow.
- Wenn ein freigegebener Stand ueber GitHub Actions gebaut und veroeffentlicht
  und die Projekt-URL anschliessend geoeffnet und neu geladen wird,
- dann laden Anwendung, Schriften und sonstige Ressourcen ohne Pfadfehler.
  Ein fehlgeschlagener Build wird nicht als erfolgreicher neuer Stand deployt.

### D: Gestaltung und Bedienung
- Gegeben ist die Startmaske auf Laptop oder Touch-Geraet.
- Wenn ich sie mit Maus, Touch oder Tastatur bediene,
- dann sind Eingabe und Absenden nutzbar, Fokus und Fehler erkennbar und die
  Gestaltung greift Petrol/Tuerkis, Orange/Gelb und Weiss der Plakate auf.
  Bei reduzierter Bewegung entfallen nicht notwendige Animationen.

### E: Ehrliche Zugangshuerde
- Gegeben sind Build und Anwendungsdokumentation.
- Wenn Zugangscode-Konfiguration und Nutzung beschrieben werden,
- dann wird der umgehbare Frontendschutz ausdruecklich benannt. Es befinden
  sich keine echten Geheimnisse, Klartext-Passwoerter oder GitHub-Schreibtokens
  im Repository oder im ausgelieferten Build. Ein fester Pruefwert fuer den
  ausschliesslich hier verwendeten Master-Zugangscode ist kein echter Schutz.

## Validierung

Automatisiert: Zugangszustaende, Fehlerfaelle, Build und Basispfad.
Entwicklertest: echter Pages-Aufruf nach Einrichtung der Repository-Settings
und visuelle Freigabe des Plakatstils.

## Umsetzung und Pruefergebnis am 24.11.2026

- React-/TypeScript-/Vite-Grundgeruest, lokaler SHA-256-Codevergleich,
  explizites Sperren und noch leere Turnierauswahl umgesetzt.
  Turnierverwaltung folgt erst in Story 1.2.
- Zugang bleibt ohne Konfiguration gesperrt; Produktions-Build ohne
  gueltigen Pruefwert bricht mit konkretem Fehler ab.
- Konfigurationsskript speichert ausschliesslich den Pruefwert; mit
  synthetischer Testeingabe geprueft. Kein Mastercode vorgegeben.
- 7 automatisierte Tests bestanden: leere/falsche Eingabe,
  Entsperren/Sperren mit Tastatur und Datenerhalt, Gross-/Kleinschreibung,
  fehlende/ungueltige Konfiguration, WebCrypto-Fehler, Doppel-Submit.
- Reproduzierbare Installation mit `npm ci`, Linting, TypeScript-Pruefung
  und Produktions-Build erfolgreich.
- Browserpruefung des Produktions-Builds: Zugang, Fehleranzeige,
  Tastatureingabe, Sperren, Neuladen und Fokuswechsel erfolgreich.
- Layout bei 1365, 390 und 320 Pixeln Viewportbreite ohne horizontales
  Ueberlaufen der Eingabeaktionen; Eingabe und Hauptbutton 54 Pixel hoch.
- Reduzierte Bewegung: Ballanimation nachweislich deaktiviert.
- HTML, JavaScript, CSS und Favicon unter dem Projekt-Unterpfad lokal
  jeweils mit HTTP 200 erreichbar.
- Pages-Workflow erstellt; noch nicht auf GitHub ausgefuehrt.
  Test-Vorschauserver nach der Pruefung beendet.

## Ausstehende Entwicklertests

### C: Tatsaechliches GitHub-Pages-Deployment

1. Eigenen Office-Zugangscode und Repositoryvariable `MASTER_CODE_HASH`
   gemaess [Anleitung](../readme.md#github-pages-einrichten) konfigurieren.
2. Pages auf GitHub Actions stellen, den Stand nach `main` pushen und den
   erfolgreichen Workflow abwarten.
3. Die im Deployment angegebene URL aufrufen und neu laden; falschen Code,
   richtigen Code und "Anwendung sperren" pruefen.

Erwartet: keine fehlenden Ressourcen oder Pfadfehler, falscher Code mit
Fehlermeldung, richtiger Code zur noch leeren Turnierauswahl, Sperren
zurueck zur Zugangsmaske. Kein Turnier kann bereits angelegt werden.

### D: Visuelle Abnahme und tatsaechliche Geraetebedienung

1. Startmaske am Turnierlaptop mit den verlinkten Plakaten vergleichen.
2. Mit Tab/Enter und Maus entsperren/sperren; wenn verfuegbar dieselben
   Aktionen auf einem echten Touch-Geraet pruefen.
3. Lesbarkeit, Fokusmarkierung, Petrol-/Orange-Farbstil und die Darstellung
   bei schmalem Fenster pruefen.

Erwartet: Stil als passend empfunden; alle Aktionen ohne Drag-and-drop
erreichbar und ohne verdeckte Eingaben oder blockierende Animationen.

Bitte fuer C und D jeweils Ergebnis und gegebenenfalls Abweichungen melden
und die Story ausdruecklich abnehmen oder Aenderungen benennen.
Story 1.2 beginnt erst nach dieser Rueckmeldung.
