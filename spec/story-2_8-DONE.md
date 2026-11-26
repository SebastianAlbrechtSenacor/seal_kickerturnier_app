# Story 2.8: Ergebnisse direkt speichern und jüngste Vorrundenspiele korrigieren

Status: Abgenommen am 26.11.2026 einschließlich der Ergänzung zur
Korrekturregel. Epic: [Epic 2](./epic-2.md).
Lieferpaket 3 – Ergebnisverwaltung: eigener Regressionstest für Wertung,
Speicherfehler und veraltete Tabs; separates Deployment.
Bediengrundlage: [Story 2.4](./story-2_4-DONE.md).

Als teilnehmende Person möchte ich ein gültiges Ergebnis ohne zweite
Bestätigung speichern und Tippfehler in den jüngsten Vorrundenspielen
noch vor dem Phasenwechsel berichtigen können.

## Akzeptanzszenarien

- **Direkt speichern:** Gegeben ist die Ergebniseingabe einer Vorrunden-
  oder K.-o.-Partie. Wenn ich ein nach bisherigen Spielregeln gültiges
  Ergebnis absende, wird es genau einmal ohne Vorschau oder zweiten Klick
  gespeichert. Es folgt die nächste Aufstellung bzw. Begegnung oder
  nach dem Finale die Siegerehrung. Bei ungültiger Eingabe oder
  Speicherfehler erscheinen ein Hinweis und der erhaltene Eingabeentwurf;
  die Partie bleibt offen und es erfolgt keine Wertung.
- **Gezielt korrigieren:** Gegeben sind mindestens vier gespeicherte
  Vorrundenspiele, keine offene Partie und noch kein K.-o.-Start. Wenn
  ich in der Liste der letzten Spiele das kleine, beschriftete Stift-Icon
  bei einem der drei jüngsten Spiele öffne, kann ich dessen Torstand
  korrigieren oder das Spiel löschen. Ältere Spiele und K.-o.-Spiele
  haben keine solche Aktion. Nach einer gültigen Korrektur werden Rang,
  Punkte und Statistik neu berechnet. Teams, ursprüngliche Spielzeit und
  Position in der chronologischen Historie bleiben unverändert.
- **Korrektur unabhängig vom ursprünglichen Zeitablauf:** Gegeben ist ein
  bearbeitbares Vorrundenspiel, das vor Zeitablauf als 10:8 gespeichert
  wurde. Wenn ich es auf 9:8 korrigiere, wird 9:8 mit dem ursprünglichen
  Abschlusszeitpunkt gespeichert. Neuladen und Export mit anschließendem
  Import behalten beides bei. Bei Korrekturen bleiben nur ganze Torzahlen
  von 0 bis 10 ohne Gleichstand zulässig. Eine laufende Vorrunden- oder
  K.-o.-Partie lässt sich vor Zeitablauf weiterhin nicht mit 9:8 abschließen.
- **Bewusst löschen:** Gegeben ist ein bearbeitbares Vorrundenspiel.
  Wenn ich Löschen wähle und bestätige, verschwindet es aus dem Verlauf,
  seine Wertung entfällt und gegebenenfalls rückt der nächste ältere
  Eintrag in die letzten drei nach. Abbrechen ändert nichts. Der
  erfolgreich korrigierte oder gelöschte Stand bleibt nach Neuladen
  erhalten und geht in neue JSON-Sicherungen ein.
- **Stand schützen:** Gegeben ist eine offene Partie, der bereits
  gestartete K.-o.-Modus, ein veralteter Tab oder ein Speicherfehler.
  Wenn ich eine Mutation versuche, wird sie abgelehnt bzw. gar nicht
  angeboten. Ein erkannter Schreibfehler wird angezeigt; Statistiken,
  Qualifikation und gespeicherter Stand werden nicht teilweise geändert
  oder mit einem alten Stand überschrieben.
