import type { Player } from './players'
import { initialStandings } from './standings'

export default function StandingsTable({ players }: { players: Player[] }) {
  const standings = initialStandings(players)
  return (
    <section className="standings" aria-labelledby="standings-heading">
      <h3 id="standings-heading">Vorrundentabelle</h3>
      <p className="form-note" id="standings-hint">Jede Person sammelt ihre eigenen Punkte.
        Auf schmalen Bildschirmen die Tabelle seitlich scrollen.</p>
      <div className="standings-scroll" role="region" aria-label="Vorrundentabelle horizontal scrollen"
        aria-describedby="standings-hint" tabIndex={0}>
        <table className="standings-table">
          <caption className="sr-only">Individuelle Vorrundenwertung</caption>
          <thead>
            <tr>
              <th scope="col">Rang</th><th scope="col">Spielende</th><th scope="col">Spiele</th>
              <th scope="col">Siege</th><th scope="col">Niederlagen</th><th scope="col">Tore</th>
              <th scope="col">Gegentore</th><th scope="col">Tordifferenz</th><th scope="col">Punkte</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr key={standing.player.id}>
                <td>{index + 1}</td>
                <th scope="row"><span aria-hidden="true">{standing.player.avatar} </span>{standing.player.nickname}</th>
                <td>{standing.played}</td><td>{standing.wins}</td><td>{standing.losses}</td>
                <td>{standing.goalsFor}</td><td>{standing.goalsAgainst}</td><td>{standing.goalDifference}</td>
                <td className="standings-points">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="form-note">Reihenfolge: Punkte, Siege, Tordifferenz, erzielte Tore, dann deutscher Spielername.</p>
      <button className="action-button" type="button" disabled aria-describedby="next-match-hint">Partie vorbereiten</button>
      <p className="form-note" id="next-match-hint">Die Positionsauswahl für eine Partie folgt in Story 1.6.</p>
    </section>
  )
}
