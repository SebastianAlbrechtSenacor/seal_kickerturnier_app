import type { ReactNode } from 'react'
import { positions } from './lineup'
import type { Lineup, Position } from './lineup'
import type { Player } from './players'
import { formatBerlinTime } from './tournament'
import type { Tournament } from './tournament'
import './MatchPreparation.css'

interface PitchProps {
  players: readonly Player[]
  lineup: Lineup
  selected?: Position | null
  dropTarget?: Position | null
  onSelect?: (position: Position) => void
  onRemove?: (position: Position) => void
  teamLabels?: Record<'white' | 'black', string>
}

export function LineupPitch({ players, lineup, selected, dropTarget, onSelect, onRemove, teamLabels }: PitchProps) {
  return (
    <div className="lineup-pitch" role="group" aria-label="Kickertisch">
      <span className="pitch-centre" aria-hidden="true" />
      {positions.map((position) => {
        const player = players.find((person) => person.id === lineup[position.id])
        const label = teamLabels?.[position.team] ?? position.label
        return (
          <div key={position.id} data-lineup-position={position.id}
            className={`lineup-slot team-${position.team}${selected === position.id ? ' is-selected' : ''}${dropTarget === position.id ? ' is-drop-target' : ''}`}>
            <button className="position-select" type="button" aria-pressed={selected === position.id}
              disabled={!onSelect} aria-label={`${label}: ${player ? player.nickname : 'frei'}`}
              onClick={() => onSelect?.(position.id)}>
              <span className="position-label">{label}</span>
              {player ? <>
                <span className="position-avatar" aria-hidden="true">{player.avatar}</span>
                <span className="position-player">{player.nickname}</span>
              </> : <span className="position-player">Hier ablegen oder auswählen</span>}
            </button>
            {player && onRemove && <button className="position-remove" type="button"
              aria-label={`${position.label} leeren`} onClick={() => onRemove(position.id)}>Entfernen</button>}
          </div>
        )
      })}
    </div>
  )
}

export function MatchInfo({ tournament, children }: { tournament: Tournament; children: ReactNode }) {
  return (
    <footer className="match-info">
      <p><strong>{tournament.settings.name}</strong> · {formatBerlinTime(tournament.settings.startsAt)} · {tournament.settings.location}
        {' · '}{tournament.settings.matchMinutes} Minuten je Partie · {tournament.phase === 'knockout' && 'Vorrunde: '}
        Sieg {tournament.settings.winPoints} / Niederlage {tournament.settings.lossPoints} Punkte</p>
      {children}
    </footer>
  )
}
