# Story 2.1: Master-Zugang für die Browsersitzung merken

Status: Am 25.11.2026 abgenommen. Epic: [Epic 2](./epic-2-DONE.md).
Lieferpaket 1 – Zugang und Import: gemeinsamer Browser-Regressionstest
und gemeinsames Deployment mit [Story 2.2](./story-2_2-DONE.md); eigene Abnahme.

Als teilnehmende Person möchte ich den Master-Code nur einmal pro
Browsersitzung eingeben, auch wenn ich die App neu lade oder in einem
weiteren Tab aufrufe.

## Akzeptanzszenarien

- **Erstzugang:** Gegeben ist ein frisches Browserprofil ohne laufende
  Freigabe. Wenn ich die App öffne und einen falschen Code eingebe, bleibt
  die neutrale Zugangsmaske mit Fehlerhinweis sichtbar. Erst der korrekte
  Master-Code öffnet die App.
- **Einmal pro Sitzung:** Gegeben ist eine erfolgreiche Eingabe. Wenn ich
  die App neu lade oder dieselbe App-Adresse im gleichen Profil in einem
  neuen Tab öffne, sehe ich ohne weitere Eingabe die App. Nach dem Wechseln
  zwischen Turnierliste, Turnier und Abschluss ist nirgendwo ein Button
  **Anwendung sperren** vorhanden.
- **Neue Sitzung:** Gegeben ist ein entsperrter Browser. Wenn ich ihn
  vollständig beende und ohne Sitzungswiederherstellung neu starte oder
  die App in einem anderen Profil öffne, erscheint die Zugangsmaske wieder.
  Der eingegebene Master-Code wird weder im Browserspeicher abgelegt noch
  mit einer Turniersicherung exportiert. Das Verhalten bei
  Sitzungswiederherstellung wird dokumentiert.

## Validierung

- 67 gezielte Tests in fünf Dateien bestanden; Linting, Typprüfung und
  Produktions-Build erfolgreich. Geprüft sind unter anderem falsche
  Eingaben, blockierte Cookies, fehlendes Sitzungscookie, unveränderter
  Turnierspeicher und das bestehende JSON-Sicherungsformat.
- Im Browser geprüft: Erstzugang, falscher und korrekter Code, Freigabe
  nach Neuladen und in einem neuen Tab sowie kein Sperrbutton.
- Entwickler-Praxisprüfungen bestanden: Der Browser-Neustart ohne
  Sitzungswiederherstellung und ein separates Browserprofil zeigten
  jeweils wieder die Master-Code-Abfrage.
