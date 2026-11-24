# Story 1.1: Pages-Grundgeruest und Masterzugang

Status: Entwurf, nicht freigegeben.
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
