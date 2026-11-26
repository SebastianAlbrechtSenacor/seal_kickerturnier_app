import type { Player } from './players'
import type { ReactNode } from 'react'
import { useId } from 'react'
import { calculateStandings } from './standings'
import type { Tournament } from './tournament'

interface Props {
  tournament: Tournament
  renderPlayer?: (player: Player) => ReactNode
  compact?: boolean
  showHeading?: boolean
}

const statistics = [
  ['Sp.', 'Spiele'], ['S', 'Siege'], ['N', 'Niederlagen'], ['Tore', 'Tore'],
  ['GT', 'Gegentore'], ['TD', 'Tordifferenz'], ['Pkt.', 'Punkte'],
] as const

export default function StandingsTable({ tournament, renderPlayer, compact = false, showHeading = true }: Props) {
  const standings = tournament.knockout?.standings ?? calculateStandings(tournament.players ?? [], tournament.completedMatches ?? [], tournament.settings)
  const id = useId()
  const heading = `${id}-heading`
  const hint = `${id}-hint`
  return (
    <section className="standings" aria-labelledby={heading}>
      <h3 id={heading} className={showHeading ? undefined : 'sr-only'}>{tournament.knockout ? 'Vorrunde (eingefroren)' : 'Vorrundentabelle'}</h3>
      {tournament.knockout && <p className="form-note" id={hint}>Dieser Stand bleibt während der K.-o.-Phase unverändert.</p>}
      <div className="standings-scroll" role="region" aria-label="Vorrundentabelle scrollen"
        aria-describedby={tournament.knockout ? hint : undefined} tabIndex={0}>
        <table className={`standings-table${compact ? ' standings-compact' : ''}`}>
          <caption className="sr-only">Individuelle Vorrundenwertung</caption>
          <thead>
            <tr>
              <th scope="col">Rang</th><th scope="col">Spielende</th>
              {compact ? <th scope="col">Punkte</th> : statistics.map(([short, full]) => (
                <th key={full} scope="col" aria-label={full}>
                  {short === full ? full : <span className="column-abbreviation" tabIndex={0} aria-label={full}>
                    <span aria-hidden="true">{short}</span><span className="column-hint" aria-hidden="true">{full}</span>
                  </span>}
                </th>
              ))}
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
      {!compact && <details className="standings-legend">
        <summary>Spaltenlegende</summary>
        <dl>{statistics.filter(([short, full]) => short !== full).map(([short, full]) => (
          <div key={full}><dt>{short}</dt><dd>{full}</dd></div>
        ))}</dl>
      </details>}
      <p className="form-note">Reihenfolge: Punkte, Siege, Tordifferenz, erzielte Tore, dann deutscher Spielername.</p>
    </section>
  )
}
