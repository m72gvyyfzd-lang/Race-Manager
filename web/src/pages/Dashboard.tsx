import { platzierungen, wettfahrten, yachten } from "../data/mockData";

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Frühe Konzeptphase — die Zahlen unten basieren auf Platzhalterdaten,
        bis die echte Boots- und Wertungsliste angebunden ist.
      </p>
      <dl className="stat-grid">
        <div className="stat-grid__item">
          <dt>Boote</dt>
          <dd>{yachten.length}</dd>
        </div>
        <div className="stat-grid__item">
          <dt>Wettfahrten</dt>
          <dd>{wettfahrten.length}</dd>
        </div>
        <div className="stat-grid__item">
          <dt>Platzierungen erfasst</dt>
          <dd>{platzierungen.length}</dd>
        </div>
      </dl>
    </div>
  );
}
