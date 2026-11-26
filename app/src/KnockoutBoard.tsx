import { useRef, useState } from 'react'
import { knockoutFixtures, knockoutLineup, nextKnockoutFixture, teamsFor } from './knockout'
import { calculateStandings } from './standings'
import type { Tournament } from './tournament'
import StandingsTable from './StandingsTable'
import MatchHistory from './MatchHistory'
import { LineupPitch, MatchInfo } from './MatchPresentation'
import { WorkspaceNavigation } from './WorkspaceNavigation'
import WorkspaceDialog from './WorkspaceDialog'
import type { ReactNode } from 'react'
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
            <p>{fixture.first ? `Team ${fixture.first.id}` :
              `${fixture.index === 2 ? 'Verlierer' : 'Sieger'} Halbfinale 1`}</p>
            <p>gegen {fixture.second ? `Team ${fixture.second.id}` :
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
    <WorkspaceDialog inline label="Vorrundenstand und Ergebnisse" title="Vorrundenstand und Ergebnisse">
      <StandingsTable tournament={tournament} />
      <MatchHistory tournament={tournament} />
    </WorkspaceDialog>
  )
}

export function KnockoutConfirmation({ tournament }: { tournament: Tournament }) {
  const standings = calculateStandings(tournament.players ?? [], tournament.completedMatches ?? [], tournament.settings)
  return (
    <>
      <p className="card-description">Die ersten acht qualifizieren sich. Eine Mindestspielzahl ist nicht erforderlich.</p>
      <StandingsTable tournament={tournament} showQualification />
      <h4>Feste K.-o.-Teams</h4>
      <ul className="knockout-team-preview" aria-label="Feste K.-o.-Teams">
        {teamsFor(standings).map((team) => <li key={team.id}>
          <strong>Team {team.id}</strong>
          {team.playerIds.map((id) => {
            const player = standings.find(({ player }) => player.id === id)?.player
            if (!player) throw new Error('Das K.-o.-Team enthält unbekannte Spielende.')
            return <span key={id}><span aria-hidden="true">{player.avatar} </span>{player.nickname}</span>
          })}
        </li>)}
      </ul>
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
  tournamentInfo?: ReactNode
}

export default function KnockoutBoard({ tournament, onStart, onBack, onExport, tournamentInfo }: Props) {
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
      <p className="card-description pitch-description">Feste Teams · K.-o.-Partien ändern die Vorrundenwertung nicht.</p>
      <div className="match-layout pitch-workspace">
        <KnockoutPlan tournament={tournament} />
        <section className="lineup-panel" aria-label={fixture ? 'K.-o.-Begegnung vorbereiten' : 'K.-o.-Abschluss'}>
          {fixture ? <>
            <div className="pitch-header">
              <h3>{fixture.title}: Team {fixture.first.id} gegen Team {fixture.second.id}</h3>
              <p>Teams stehen fest. Starte die Partie, wenn alle am Tisch bereit sind.</p>
            </div>
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
      <MatchInfo tournament={tournament}>
        <div className="match-info-actions"><KnockoutArchive tournament={tournament} />{tournamentInfo}</div>
        <WorkspaceNavigation>
          <button className="secondary-button" type="button" disabled={starting} onClick={onBack}>Turnier verlassen</button>
          <button className="secondary-button" type="button" disabled={starting} onClick={onExport}>JSON-Sicherung herunterladen</button>
        </WorkspaceNavigation>
      </MatchInfo>
    </>
  )
}
