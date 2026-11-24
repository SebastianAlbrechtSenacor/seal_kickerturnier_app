# Kickerturnier-App

Die Kickerturnier-App ist als einfache Webanwendung zur Erfassung von Spielergebnissen geplant. Gespielt wird am echten Kickertisch; die Teilnehmenden tragen ihre Ergebnisse selbst am Laptop neben dem Tisch ein.

Die Bedienung soll unkompliziert sein und mit schickem Design und unterhaltsamen Animationen Spaß machen.

## Projektstand

Die App ist noch nicht implementiert. Die Spezifikation entsteht in `spec\`, der Anwendungscode in `app\`. Der Entwicklungsablauf steht in [agents.md](./agents.md).

## Geplanter erster Funktionsumfang

Der [Spezifikationsentwurf mit zehn ATDD-Stories](./spec/epic-1.md) liegt zur
Freigabe vor. Er beschreibt die Vorrunde mit wechselnden Zweierteams und
individuellen Punkten, die anschliessende K.-o.-Phase der besten acht Personen
und die getrennten Abschlusswertungen.

Geplant sind React, TypeScript und Vite sowie statisches Hosting auf GitHub
Pages. Turniere werden auf einem gemeinsamen Laptop automatisch im Browser
gespeichert, nicht auf GitHub. JSON-Sicherungen dienen zur Wiederherstellung
und Uebertragung; CSV-Import/-Export ist nicht vorgesehen. Es gibt keine automatische
Synchronisation zwischen Geraeten; geloeschte Browserdaten koennen ohne
Sicherung zum Datenverlust fuehren.

Die Partiedauer ist konfigurierbar, standardmaessig 10 Minuten.
Unabhaengig davon dienen zwei konfigurierbare Phasendauern zur Zeitplanung:
120 Minuten Vorrunde und 60 Minuten K.-o.-Phase als Standard. Angezeigte
Phasen-/Endzeiten sind nur eine Planung; Start und Phasenwechsel bleiben manuell.

Die [beiden Werbeplakate](./spec/epic-1.md#dauerhafte-designreferenzen)
sind als dauerhafte Referenzen fuer Farben und Gestaltungsstil abgelegt.

Master- und Turnier-Zugangscodes sind ausschliesslich umgehbare
Frontend-Zugangshuerden, kein verlaesslicher Schutz einer nichtoeffentlichen
Anwendung. Echte oder anderweitig verwendete Passwoerter duerfen dafuer
nicht verwendet werden. Technische Grenzen und Quellen stehen im
[Epic](./spec/epic-1.md#technische-recherche-stand-24112026).
