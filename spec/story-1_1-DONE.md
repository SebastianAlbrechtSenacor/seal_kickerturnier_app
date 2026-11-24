# Story 1.1: Pages-Grundgeruest und Masterzugang

Status: Abgenommen am 24.11.2026, einschliesslich Erweiterung zur neutralen
Zugangsmaske. Urspruengliche A-D sowie erneute Entwicklertests C und D
als bestanden gemeldet; ausdrueckliche Abnahme erteilt.
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
  Die Maske ist eine schlichte neutrale Flaeche mit Beschriftung,
  Codeeingabe, Absendeaktion und erforderlichen Fehler-/Konfigurationshinweisen.
  Die gestaltete Anwendungsoberflaeche wird noch nicht gerendert:
  kein Office-Branding, kein Standort, keine Turnierueberschrift,
  keine Tischgrafik, keine Slogans, keine Modusinformationen und kein
  gestalteter Anwendungs-Header oder -Footer.

### B: Entsperren und Sperren
- Gegeben ist die Zugangsmaske.
- Wenn ich den korrekten Mastercode eingebe,
- dann erscheinen erstmals die gestaltete Startseite im Plakatstil und
  die Turnierauswahl.
- Wenn ich die Anwendung explizit sperre,
- dann werden auch entsperrte Turnieransichten geschlossen und die
  neutrale Zugangsmaske erscheint erneut; auch die gestalteten Inhalte
  werden vollstaendig aus der Ansicht entfernt, nicht nur ueberdeckt.
  Gespeicherte Turniere bleiben erhalten.
- Wenn ich die Seite neu lade,
- dann erscheint erneut ausschliesslich die neutrale Zugangsmaske,
  ohne kurzzeitiges Aufblitzen der gestalteten Startseite.

### C: Deployment unter dem Repository-Pfad
- Gegeben ist der fuer dieses Repository eingerichtete Pages-Workflow.
- Wenn ein freigegebener Stand ueber GitHub Actions gebaut und veroeffentlicht
  und die Projekt-URL anschliessend geoeffnet und neu geladen wird,
- dann laden Anwendung, Schriften und sonstige Ressourcen ohne Pfadfehler.
  Ein fehlgeschlagener Build wird nicht als erfolgreicher neuer Stand deployt.

### D: Gestaltung und Bedienung
- Gegeben ist die neutrale Zugangsmaske auf Laptop oder Touch-Geraet.
- Wenn ich sie mit Maus, Touch oder Tastatur bediene und erfolgreich entsperre,
- dann sind Eingabe und Absenden schon in der neutralen Maske nutzbar,
  Fokus und Fehler erkennbar. Erst die entsperrte Oberflaeche greift
  Petrol/Tuerkis, Orange/Gelb und Weiss der Plakate auf.
  Bei reduzierter Bewegung entfallen nicht notwendige Animationen.

### E: Ehrliche Zugangshuerde
- Gegeben sind Build und Anwendungsdokumentation.
- Wenn Zugangscode-Konfiguration und Nutzung beschrieben werden,
- dann wird der umgehbare Frontendschutz ausdruecklich benannt. Es befinden
  sich keine echten Geheimnisse, Klartext-Passwoerter oder GitHub-Schreibtokens
  im Repository oder im ausgelieferten Build. Ein fester Pruefwert fuer den
  ausschliesslich hier verwendeten Master-Zugangscode ist kein echter Schutz.
  Auch die neutrale Maske ist keine serverseitige Zugangskontrolle:
  Dateien werden weiterhin vor Codeeingabe vom Browser geladen und bleiben
  oeffentlich abrufbar. Ein nativer Browser-Passwortdialog ist nicht vorgesehen.
  Die Aenderung macht keine Zusage zum Entfallen einer Impressumspflicht.

## Freigegebener Aenderungsumfang am 24.11.2026

Nach bestandenen Tests des urspruenglichen Standes wurde eine neutrale
Zugangsmaske statt der bereits gestalteten Startseite vor Entsperrung
gewuenscht. Die umgehbare Frontend-Loesung und oeffentlich abrufbare Dateien
wurden ausdruecklich akzeptiert; externe Zugangsdienste sind nicht vorgesehen.
Die oben ergaenzten Szenarien A, B, D und E konkretisieren diese Aenderung.
Die Erweiterung wurde anschliessend ausdruecklich zur Umsetzung freigegeben.
Weitere Stories, Speicherung und Zugangspruefung bleiben unveraendert.

## Validierung

Automatisiert: Zugangszustaende, Fehlerfaelle, Build und Basispfad.
Entwicklertest: echter Pages-Aufruf nach Einrichtung der Repository-Settings
und visuelle Freigabe des Plakatstils.

## Umsetzung und Pruefergebnis des urspruenglichen Standes am 24.11.2026

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
- Pages-Workflow erstellt; Veroeffentlichung auf GitHub Pages vom Entwickler
  bestaetigt. A, B, C und D wurden anschliessend als bestanden gemeldet.
  Wegen des neuen Aenderungswunsches wurde die Story noch nicht abgenommen.
Die obigen Ergebnisse belegen den urspruenglichen Umfang.

## Pruefergebnis der Erweiterung am 24.11.2026

- Neutrale Maske separat gerendert; gestaltete Inhalte erst nach
  erfolgreicher Codepruefung. Sperren entfernt die gesamte gestaltete Ansicht.
  Neutraler Seitenhintergrund gilt bereits vor dem ersten React-Render.
- Bestehende 7 Tests um die Abwesenheit gestalteter Inhalte vor Entsperrung,
  bei Fehlern, waehrend der Pruefung, nach Sperren und nach erneuter
  Initialisierung erweitert; alle bestanden.
- Linting, TypeScript-Pruefung und Produktions-Build erfolgreich.
- Browserpruefung: neutrale Ansicht, leere/falsche Eingabe, Entsperren mit
  Enter, Wiedererscheinen des Plakatstils und Sperren mit Fokus auf der
  Codeeingabe erfolgreich.
- Neuladen einer entsperrten Ansicht: neutrale Maske; ein vor dem Laden
  registrierter DOM-Beobachter hat kein Aufblitzen der gestalteten Ansicht
  festgestellt.
- Neutrale Maske visuell geprueft. Bei 390 und 320 Pixeln Breite kein
  horizontales Ueberlaufen; Eingabefeld 54 und Absendeaktion 48 Pixel hoch.
- Reduzierte Bewegung deaktiviert die Ballanimation nach Entsperrung weiterhin.
- Lokaler Produktions-Build geprueft. Anschliessend hat der Entwickler
  das erneute Pages-Testing C und die visuelle/Bedienungspruefung D als
  bestanden gemeldet und die Story ausdruecklich abgenommen.

## Entwicklertests der Erweiterung: bestanden am 24.11.2026

### C: Tatsaechliches GitHub-Pages-Deployment

1. Eigenen Office-Zugangscode und Repositoryvariable `MASTER_CODE_HASH`
   gemaess [Anleitung](../readme.md#github-pages-einrichten) konfigurieren.
2. Pages auf GitHub Actions stellen, den Stand nach `main` pushen und den
   erfolgreichen Workflow abwarten.
3. Die im Deployment angegebene URL aufrufen und neu laden; falschen Code,
   richtigen Code und "Anwendung sperren" pruefen.

Erwartet: keine fehlenden Ressourcen oder Pfadfehler; vor Entsperrung
ausschliesslich die neutrale Maske, bei falschem Code mit Fehlermeldung.
Richtiger Code zeigt die gestaltete Startseite mit noch leerer Turnierauswahl.
Sperren und Neuladen zeigen wieder nur die neutrale Maske, auch ohne kurzes
Aufblitzen der gestalteten Inhalte. Kein Turnier kann bereits angelegt werden.

### D: Visuelle Abnahme und tatsaechliche Geraetebedienung

1. Vor Entsperrung die Neutralitaet pruefen; erst nach Entsperrung die
   gestaltete Startseite am Turnierlaptop mit den verlinkten Plakaten vergleichen.
2. Mit Tab/Enter und Maus entsperren/sperren; wenn verfuegbar dieselben
   Aktionen auf einem echten Touch-Geraet pruefen.
3. Lesbarkeit, Fokusmarkierung, Petrol-/Orange-Farbstil und die Darstellung
   bei schmalem Fenster pruefen.

Erwartet: Stil als passend empfunden; alle Aktionen ohne Drag-and-drop
erreichbar und ohne verdeckte Eingaben oder blockierende Animationen.

Ergebnis: C und D bestanden, keine weiteren Abweichungen gemeldet.
Die Story ist einschliesslich Erweiterung abgenommen.
Die Voraussetzung fuer die Umsetzung von Story 1.2 ist damit erfuellt.
