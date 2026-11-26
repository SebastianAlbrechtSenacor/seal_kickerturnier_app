import { formatBerlinTime } from './tournament'
import type { Tournament } from './tournament'
import type { ReactNode } from 'react'
import './MatchHistory.css'

export default function MatchHistory({ tournament, recent = false, headingAction }: { tournament: Tournament; recent?: boolean; headingAction?: ReactNode }) {
  const matches = (tournament.completedMatches ?? []).slice(recent ? -3 : 0).reverse()
  const title = recent ? 'Letzte 3 Ergebnisse' : 'Spielergebnisse'
  return (
    <section className="match-history" aria-label={title}>
      {headingAction ? <div className="section-heading"><h3>{title}</h3>{headingAction}</div> : <h3>{title}</h3>}
      {matches.length === 0 ? <p className="form-note">Noch keine abgeschlossene Partie.</p> : (
        <ol className="match-history-list result-list" aria-label={title} tabIndex={0}>
          {matches.map((match) => (
            <li key={match.id}>
              <details className="history-result">
                <summary>
                  <strong className="history-score">Weiß {match.whiteGoals} : {match.blackGoals} Schwarz</strong>
                  {(['white', 'black'] as const).map((color) => (
                    <span className={`history-team history-${color}`} key={color}>
                      {(['Defence', 'Attack'] as const).map((position, index) => {
                        const player = tournament.players?.find((person) => person.id === match.lineup[`${color}${position}`])
                        if (!player) throw new Error('Ein gespeichertes Ergebnis enthält unbekannte Spielende.')
                        return <span key={position}>{index > 0 && ' + '}<span aria-hidden="true">{player.avatar} </span>{player.nickname}</span>
                      })}
                    </span>
                  ))}
                </summary>
                <time dateTime={match.finishedAt}>{formatBerlinTime(match.finishedAt)}</time>
              </details>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
