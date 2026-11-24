# Arbeitsanweisung für das Kickerturnier-Projekt

## Projektziel

Entwickle eine möglichst einfach zu bedienende Webanwendung zur Erfassung von Kickerturnier-Ergebnissen. Die Partien finden am echten Kickertisch statt. Die Teilnehmenden tragen die Ergebnisse selbst am Laptop neben dem Tisch ein. Ein schickes Design und unterhaltsame Animationen sollen Spaß machen, ohne die Eingabe zu bremsen.

## Workflow für jede Änderung am Repository

1. **Anforderung klären.** Frage beim Entwickler nach und diskutiere die Anforderung als Business Analyst kritisch. Kläre Ziel, Umfang, offene Fragen, Randfälle und überprüfbare Akzeptanzkriterien. Trenne bestätigte Anforderungen von Annahmen.
2. **Spezifikation nach ATDD erweitern.** Lege unter `spec\` je nach Bedarf neue Epics (`epic-[epic_number].md`) und/oder neue Stories zu bestehenden oder neu angelegten Epics (`story-[epic_number]_[story_number].md`) an. Beschreibe im Epic das Ziel und den Umfang. Formuliere nach dem Prinzip des Acceptance Test-Driven Development (ATDD) die Akzeptanzkriterien jeder Story vor der Implementierung als konkrete, prüfbare Szenarien (z. B. „Gegeben – Wenn – Dann“). Halte für jedes Szenario die Ausgangslage, die Aktion und das erwartete, beobachtbare Ergebnis fest. Berücksichtige relevante Fehler- und Randfälle.
3. **Freigabe einholen.** Bitte den Entwickler, die neuen Epics und Stories zu prüfen. Arbeite Rückmeldungen ein und warte auf die ausdrückliche Freigabe, bevor du mit der Implementierung beginnst.
4. **Story für Story umsetzen und testen.** Implementiere die freigegebenen Stories in `app\` einzeln. Teste nach jeder Story alle Akzeptanzkriterien, die du eigenständig prüfen kannst, und berichte die Ergebnisse im Chat. Die übrigen Kriterien muss der Entwickler testen. Benenne jedes dieser Kriterien im Chat einzeln mit Testschritten und erwartetem Ergebnis und fordere den Entwickler ausdrücklich zur Durchführung und Rückmeldung auf. Bitte nach jeder Story um Feedback, auch wenn keine Entwicklertests nötig sind. Warte auf die Rückmeldung und die Ergebnisse aller ausstehenden Tests, bevor du mit der nächsten Story beginnst.
5. **Anwendungsdokumentation aktualisieren.** Halte [readme.md](./readme.md) auf dem Stand der umgesetzten Funktionen, damit sie nach und nach eine übersichtliche Anwendungsdokumentation wird.
6. **Arbeit abschließen.** Markiere abgenommene Stories durch Umbenennung in `story-[epic_number]_[story_number]-DONE.md`. Markiere ein Epic erst als abgeschlossen, wenn alle zugehörigen Stories abgenommen sind, und benenne es in `epic-[epic_number]-DONE.md` um. Gib eine passende Commit-Message für den GitHub-Push im Chat aus.
