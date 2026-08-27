import { Link } from "react-router-dom";

export function KeineRegatta() {
  return (
    <div>
      <h1>Keine Regatta ausgewählt</h1>
      <p>
        Lege unter <Link to="/regatten">Regatten</Link> eine Regatta an oder wähle eine aus.
      </p>
    </div>
  );
}
