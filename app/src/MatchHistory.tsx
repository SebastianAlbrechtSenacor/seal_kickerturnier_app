import { formatBerlinTime } from './tournament'
import type { Tournament } from './tournament'
import './MatchHistory.css'

export default function MatchHistory({ tournament, recent = false }: { tournament: Tournament; recent?: boolean }) {
  const matches = (tournament.completedMatches ?? []).slice(recent ? -3 : 0).reverse()
  const title = recent ? 'Letzte 3 Ergebnisse' : 'Spielergebnisse'
  return (
    <section className="match-history" aria-label={title}>
      <h3>{title}</h3>
      {matches.length === 0 ? <p className="form-note">Noch keine abgeschlossene Partie.</p> : (
        <ol className="match-history-list">
          {matches.map((match) => (
            <li key={match.id}>
              <p className="history-score"><strong>Weiß {match.whiteGoals} : {match.blackGoals} Schwarz</strong></p>
              {(['white', 'black'] as const).map((color) => (
                <p className="history-team" key={color}>
                  <strong>{color === 'white' ? 'Weiß' : 'Schwarz'}: </strong>
                  {(['Defence', 'Attack'] as const).map((position, index) => {
                    const player = tournament.players?.find((person) => person.id === match.lineup[`${color}${position}`])
                    if (!player) throw new Error('Ein gespeichertes Ergebnis enthält unbekannte Spielende.')
                    return <span key={position}>{index > 0 && ' + '}<span aria-hidden="true">{player.avatar} </span>{player.nickname}</span>
                  })}
                </p>
              ))}
              <time dateTime={match.finishedAt}>{formatBerlinTime(match.finishedAt)}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
