import { useRef, useState } from 'react'
import { knockoutFixtures, knockoutLineup, knockoutTeamName, nextKnockoutFixture, teamsFor } from './knockout'
import { calculateStandings } from './standings'
import type { Tournament } from './tournament'
import StandingsTable from './StandingsTable'
import MatchHistory from './MatchHistory'
import { LineupPitch, MatchInfo } from './MatchPresentation'
import './KnockoutBoard.css'

export function KnockoutPlan({ tournament }: { tournament: Tournament }) {
  const state = tournament.knockout
  if (!state) throw new Error('Der K.-o.-Spielplan fehlt.')
  return (
    <section className="match-history" aria-label="K.-o.-Spielplan">
      <h3>K.-o.-Spielplan</h3>
      <ol className="match-history-list knockout-plan">
        {knockoutFixtures(state).map((fixture) => (
          <li key={fixture.index} aria-current={fixture.index === state.results.length ? 'step' : undefined}>
            <h4>{fixture.title}</h4>
            <p>{fixture.first ? knockoutTeamName(fixture.first, tournament.players ?? []) :
              `${fixture.index === 2 ? 'Verlierer' : 'Sieger'} Halbfinale 1`}</p>
            <p>gegen {fixture.second ? knockoutTeamName(fixture.second, tournament.players ?? []) :
              `${fixture.index === 2 ? 'Verlierer' : 'Sieger'} Halbfinale 2`}</p>
            <p className="history-score">{fixture.result ?
              <strong>Team {fixture.first?.id} {fixture.result.whiteGoals} : {fixture.result.blackGoals} Team {fixture.second?.id}</strong> :
              fixture.index === state.results.length ? tournament.activeMatch ? 'Läuft' : 'Als Nächstes' : 'Ausstehend'}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function KnockoutArchive({ tournament }: { tournament: Tournament }) {
  return (
    <details className="knockout-archive">
      <summary>Vorrundenstand und Ergebnisse</summary>
      <StandingsTable tournament={tournament} />
      <MatchHistory tournament={tournament} />
    </details>
  )
}

export function KnockoutConfirmation({ tournament }: { tournament: Tournament }) {
  const standings = calculateStandings(tournament.players ?? [], tournament.completedMatches ?? [], tournament.settings)
  return (
    <>
      <p className="card-description">Die ersten acht qualifizieren sich. Eine Mindestspielzahl ist nicht erforderlich.</p>
      <ol className="knockout-qualifiers">
        {standings.slice(0, 8).map(({ player, points }) =>
          <li key={player.id}><span aria-hidden="true">{player.avatar} </span>{player.nickname} · {points} Punkte</li>)}
      </ol>
      {teamsFor(standings).map((team) => <p key={team.id}>{knockoutTeamName(team, tournament.players ?? [])}</p>)}
      <p className="storage-note">Dieser Wechsel ist unumkehrbar. Der vollständige Vorrundenstand wird eingefroren.
        Weitere Vorrundenpartien sind danach nicht möglich.</p>
    </>
  )
}

interface Props {
  tournament: Tournament
  onStart: () => Promise<void>
  onBack: () => void
  onExport: () => void
}

export default function KnockoutBoard({ tournament, onStart, onBack, onExport }: Props) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  if (!tournament.knockout) throw new Error('Der K.-o.-Spielplan fehlt.')
  const fixture = nextKnockoutFixture(tournament.knockout)

  async function start() {
    if (pending.current) return
    pending.current = true
    setStarting(true)
    setError('')
    try { await onStart() }
    catch (error) { setError(error instanceof Error ? error.message : 'Die Partie konnte nicht gestartet werden.') }
    finally { pending.current = false; setStarting(false) }
  }

  return (
    <>
      <p className="card-description">Feste Teams. Der Vorrundenstand bleibt unverändert; K.-o.-Partien vergeben keine Vorrundenpunkte.</p>
      <div className="match-layout">
        <KnockoutPlan tournament={tournament} />
        <section className="lineup-panel" aria-label={fixture ? 'K.-o.-Begegnung vorbereiten' : 'K.-o.-Abschluss'}>
          {fixture ? <>
            <h3>{fixture.title}: Team {fixture.first.id} gegen Team {fixture.second.id}</h3>
            <p>Teams stehen fest. Starte die Partie, wenn alle am Tisch bereit sind.</p>
            <LineupPitch players={tournament.players ?? []} lineup={knockoutLineup(fixture)}
              teamLabels={{ white: `Team ${fixture.first.id}`, black: `Team ${fixture.second.id}` }} />
            <div className="form-actions"><button className="action-button" type="button" disabled={starting}
              onClick={() => void start()}>{starting ? 'Wird gestartet ...' : 'Spiel starten'}</button></div>
          </> : <>
            <h3>K.-o.-Phase abgeschlossen</h3>
            <p role="status">Alle vier Begegnungen sind gewertet. Der Spielplan ist vollständig.</p>
          </>}
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>
      </div>
      <KnockoutArchive tournament={tournament} />
      <MatchInfo tournament={tournament}>
        <div className="form-actions">
          <button className="secondary-button" type="button" disabled={starting} onClick={onExport}>JSON-Sicherung herunterladen</button>
          <button className="secondary-button" type="button" disabled={starting} onClick={onBack}>Zur Turnierübersicht</button>
        </div>
      </MatchInfo>
    </>
  )
}
