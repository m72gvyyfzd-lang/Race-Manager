import { platzierungen, wettfahrten } from "../data/mockData";

export function Wettfahrten() {
  return (
    <div>
      <h1>Wettfahrten</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Bezeichnung</th>
            <th>Datum</th>
            <th>Teilnehmer</th>
          </tr>
        </thead>
        <tbody>
          {wettfahrten.map((wettfahrt) => (
            <tr key={wettfahrt.id}>
              <td>{wettfahrt.nummer}</td>
              <td>{wettfahrt.bezeichnung}</td>
              <td>{wettfahrt.datum}</td>
              <td>{platzierungen.filter((p) => p.wettfahrtId === wettfahrt.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
