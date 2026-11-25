import { knockoutPlacements } from './knockout'
import type { Tournament } from './tournament'
import { KnockoutArchive, KnockoutPlan } from './KnockoutBoard'
import { MatchInfo } from './MatchPresentation'
import './TournamentCompletion.css'

interface Props {
  tournament: Tournament
  celebrate: boolean
  onBack: () => void
  onExport: () => void
}

const medals = ['🏆', '🥈', '🥉', '👏']
const confettiColors = ['#ffc63c', '#ee7b00', '#007b80', '#b2d8d5']

export default function TournamentCompletion({ tournament, celebrate, onBack, onExport }: Props) {
  if (!tournament.knockout || tournament.activeMatch) throw new Error('Das Turnier ist noch nicht abgeschlossen.')
  const teams = knockoutPlacements(tournament.knockout)
  return (
    <section className="tournament-completion" aria-label="Turnierabschluss">
      {celebrate && <div className="completion-confetti" aria-hidden="true">
        {Array.from({ length: 20 }, (_, index) => <span key={index}
          style={{ left: `${index * 5 + 2}%`, animationDelay: `${index % 4 * 50}ms`,
            backgroundColor: confettiColors[index % confettiColors.length] }} />)}
      </div>}
      <div className="completion-banner">
        <p className="card-eyebrow">GUTE LEUTE. GROSSES FINALE.</p>
        <h3>Siegerehrung</h3>
        <p>Vier Teams. Ein Podest. Danke an alle, die mitgekickt haben!</p>
      </div>
      <h3 className="completion-heading">K.-o.-Teamwertung</h3>
      <ol className="completion-podium" aria-label="K.-o.-Teamplatzierungen">
        {teams.map((team, index) => <li className={`podium-team place-${index + 1}`} key={team.id}>
          <span className="podium-medal" aria-hidden="true">{medals[index]}</span>
          <h4>{index + 1}. Platz · Team {team.id}</h4>
          <div className="podium-members">
            {team.playerIds.map((id) => {
              const player = tournament.players?.find((person) => person.id === id)
              if (!player) throw new Error('Das K.-o.-Team enthält unbekannte Spielende.')
              return <p key={id}><span className="completion-avatar" aria-hidden="true">{player.avatar}</span>
                <strong>{player.nickname}</strong></p>
            })}
          </div>
        </li>)}
      </ol>
      <KnockoutArchive tournament={tournament} />
      <details className="completion-history">
        <summary>K.-o.-Spielplan und Ergebnisse</summary>
        <KnockoutPlan tournament={tournament} />
      </details>
      <MatchInfo tournament={tournament}>
        <p>Die K.-o.-Teamplätze und die individuelle Vorrundenwertung bleiben getrennt. Das Turnier ist abgeschlossen.</p>
        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onExport}>JSON-Sicherung herunterladen</button>
          <button className="secondary-button" type="button" onClick={onBack}>Zur Turnierübersicht</button>
        </div>
      </MatchInfo>
    </section>
  )
}
