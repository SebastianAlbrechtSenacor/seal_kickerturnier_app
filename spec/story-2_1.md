# Story 2.1: Master-Zugang für die Browsersitzung merken

Status: Spezifikation freigegeben. Epic: [Epic 2](./epic-2.md).

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
