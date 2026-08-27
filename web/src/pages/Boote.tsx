import { yachten } from "../data/mockData";

export function Boote() {
  return (
    <div>
      <h1>Boote</h1>
      <table>
        <thead>
          <tr>
            <th>Segelnummer</th>
            <th>Name</th>
            <th>Klasse</th>
            <th>Skipper</th>
          </tr>
        </thead>
        <tbody>
          {yachten.map((yacht) => (
            <tr key={yacht.id}>
              <td>{yacht.segelnummer}</td>
              <td>{yacht.name}</td>
              <td>{yacht.klasse}</td>
              <td>{yacht.skipper}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
