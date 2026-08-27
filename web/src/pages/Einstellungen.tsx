import { maxStreicher } from "@race-manager/core";
import { KeineRegatta } from "../components/KeineRegatta";
import { REGATTA_LOGOS, VERANSTALTER_LOGOS } from "../data/logos";
import { useData } from "../state/DataContext";

export function Einstellungen() {
  const { aktiveRegatta, updateRegatta } = useData();
  if (!aktiveRegatta) return <KeineRegatta />;

  const regatta = aktiveRegatta;
  const streicherMax = maxStreicher(regatta);

  return (
    <div>
      <h1>Einstellungen</h1>
      <p className="hinweis">
        Gilt für die aktive Regatta: {regatta.name} {regatta.jahr}
      </p>

      <section className="panel form-grid">
        <h2>Regatta</h2>
        <label>
          Name
          <input
            value={regatta.name}
            onChange={(e) => updateRegatta(regatta.id, { name: e.target.value })}
          />
        </label>
        <label>
          Jahr
          <input
            type="number"
            value={regatta.jahr}
            onChange={(e) => updateRegatta(regatta.id, { jahr: Number(e.target.value) })}
          />
        </label>
        <label>
          Datum
          <input
            type="date"
            value={regatta.datum ?? ""}
            onChange={(e) => updateRegatta(regatta.id, { datum: e.target.value || undefined })}
          />
        </label>
        <div>
          <span className="form-label">Regatta-Logo</span>
          <div className="symbol-row">
            {REGATTA_LOGOS.map((logo) => (
              <button
                key={logo.id}
                type="button"
                title={logo.name}
                className={`symbol-btn${logo.id === regatta.symbol ? " is-active" : ""}`}
                onClick={() => updateRegatta(regatta.id, { symbol: logo.id })}
              >
                <img src={logo.url} alt={logo.name} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="form-label">Veranstalterlogo</span>
          <div className="symbol-row">
            <button
              type="button"
              className={`symbol-btn${!regatta.veranstalterLogo ? " is-active" : ""}`}
              onClick={() => updateRegatta(regatta.id, { veranstalterLogo: undefined })}
            >
              keins
            </button>
            {VERANSTALTER_LOGOS.map((logo) => (
              <button
                key={logo.id}
                type="button"
                title={logo.name}
                className={`symbol-btn${logo.id === regatta.veranstalterLogo ? " is-active" : ""}`}
                onClick={() => updateRegatta(regatta.id, { veranstalterLogo: logo.id })}
              >
                <img src={logo.url} alt={logo.name} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Startmodus</h2>
        <label className="radio-label">
          <input
            type="radio"
            name="startmodus"
            checked={regatta.startmodus === "normal"}
            onChange={() => updateRegatta(regatta.id, { startmodus: "normal" })}
          />
          <span>
            <strong>Yardstick Regatta</strong> — alle Boote starten zur gleichen Zeit, gewertet
            wird nach gesegelter und nach Yardstick-berechneter Zeit.
          </span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="startmodus"
            checked={regatta.startmodus === "kangaroo"}
            onChange={() => updateRegatta(regatta.id, { startmodus: "kangaroo" })}
          />
          <span>
            <strong>Kangaroo-Start</strong> — jede Yacht bekommt eine individuelle Startzeit aus
            Streckenzeit und Yardstick: das langsamste Boot startet zuerst zur geplanten
            Startzeit, alle anderen entsprechend später. Der Zieleinlauf ist die Platzierung.
          </span>
        </label>
      </section>

      <section className="panel">
        <h2>Gesamtwertung</h2>
        <label>
          Streichergebnisse
          <input
            type="number"
            min={0}
            max={Math.max(streicherMax, regatta.streicher)}
            value={regatta.streicher}
            onChange={(e) =>
              updateRegatta(regatta.id, { streicher: Math.max(0, Number(e.target.value) || 0) })
            }
          />
        </label>
        <p className="hinweis">
          Wirksam sind höchstens {streicherMax} (aktive Starts − 2) — aktuell{" "}
          {Math.min(regatta.streicher, streicherMax)}.
        </p>
      </section>
    </div>
  );
}
