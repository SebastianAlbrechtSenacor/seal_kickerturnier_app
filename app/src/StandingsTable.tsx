import type { Player } from './players'
import type { ReactNode } from 'react'
import { calculateStandings } from './standings'
import type { Tournament } from './tournament'

interface Props {
  tournament: Tournament
  onPrepare?: () => void
  renderPlayer?: (player: Player) => ReactNode
  compact?: boolean
  prepareLabel?: string
}

export default function StandingsTable({ tournament, onPrepare, renderPlayer, compact = false, prepareLabel = 'Partie vorbereiten' }: Props) {
  const standings = calculateStandings(tournament.players ?? [], tournament.completedMatches ?? [], tournament.settings)
  return (
    <section className="standings" aria-labelledby="standings-heading">
      <h3 id="standings-heading">Vorrundentabelle</h3>
      <p className="form-note" id="standings-hint">Jede Person sammelt ihre eigenen Punkte.
        {!compact && ' Auf schmalen Bildschirmen die Tabelle seitlich scrollen.'}</p>
      <div className="standings-scroll" role="region" aria-label={compact ? 'Vorrundentabelle scrollen' : 'Vorrundentabelle horizontal scrollen'}
        aria-describedby="standings-hint" tabIndex={0}>
        <table className={`standings-table${compact ? ' standings-compact' : ''}`}>
          <caption className="sr-only">Individuelle Vorrundenwertung</caption>
          <thead>
            <tr>
              <th scope="col">Rang</th><th scope="col">Spielende</th>
              {!compact && <>
                <th scope="col">Spiele</th><th scope="col">Siege</th><th scope="col">Niederlagen</th>
                <th scope="col">Tore</th><th scope="col">Gegentore</th><th scope="col">Tordifferenz</th>
              </>}
              <th scope="col">Punkte</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr key={standing.player.id}>
                <td>{index + 1}</td>
                <th scope="row">{renderPlayer ? renderPlayer(standing.player) :
                  <><span aria-hidden="true">{standing.player.avatar} </span>{standing.player.nickname}</>}</th>
                {!compact && <>
                  <td>{standing.played}</td><td>{standing.wins}</td><td>{standing.losses}</td>
                  <td>{standing.goalsFor}</td><td>{standing.goalsAgainst}</td><td>{standing.goalDifference}</td>
                </>}
                <td className="standings-points">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="form-note">Reihenfolge: Punkte, Siege, Tordifferenz, erzielte Tore, dann deutscher Spielername.</p>
      {onPrepare && <button className="action-button" type="button" onClick={onPrepare}>{prepareLabel}</button>}
    </section>
  )
}
