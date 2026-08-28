import { maxStreicher } from "@race-manager/core";
import { KeineRegatta } from "../components/KeineRegatta";
import { PrintKopf } from "../components/PrintKopf";
import { REGATTA_LOGOS, VERANSTALTER_LOGOS } from "../data/logos";
import { useData } from "../state/DataContext";

export function Einstellungen() {
  const { aktiveRegatta, updateRegatta } = useData();
  if (!aktiveRegatta) return <KeineRegatta />;

  const regatta = aktiveRegatta;
  const streicherMax = maxStreicher(regatta);

  return (
    <div>
      <PrintKopf regatta={regatta} seitentitel="Einstellungen" />

      <div className="einstellungen-grid">
        <section className="kachel kachel--legende">
          <h2 className="kachel__legende">Regatta bearbeiten</h2>

          <div className="neue-regatta__ebene1">
            <input
              className="eingabe-zentriert neue-regatta__name"
              type="text"
              value={regatta.name}
              onChange={(e) => updateRegatta(regatta.id, { name: e.target.value })}
              placeholder="Name der Regatta"
            />
            <input
              className="eingabe-zentriert neue-regatta__jahr"
              type="number"
              value={regatta.jahr}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => updateRegatta(regatta.id, { jahr: Number(e.target.value) })}
              placeholder="Jahr"
            />
          </div>

          <div className="neue-regatta__ebene2">
            <div className="neue-regatta__datum">
              <span className="form-label">Datum</span>
              <input
                type="date"
                value={regatta.datum ?? ""}
                onChange={(e) => updateRegatta(regatta.id, { datum: e.target.value || undefined })}
              />
            </div>
            <div className="neue-regatta__veranstalter">
              <span className="form-label">Veranstalter-Logo</span>
              <div className="symbol-row">
                <button
                  type="button"
                  className={`symbol-btn${!regatta.veranstalterLogo ? " is-active" : ""}`}
                  onClick={() => updateRegatta(regatta.id, { veranstalterLogo: undefined })}
                >
                  ohne
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
            <div className="neue-regatta__regattalogo">
              <span className="form-label">Regatta-Logo</span>
              <div className="symbol-row">
                <button
                  type="button"
                  className={`symbol-btn${regatta.symbol === "" ? " is-active" : ""}`}
                  onClick={() => updateRegatta(regatta.id, { symbol: "" })}
                >
                  ohne
                </button>
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
          </div>
        </section>

        <section className="kachel kachel--legende">
          <h2 className="kachel__legende">Startmodus</h2>
          <label className="radio-label">
            <input
              type="radio"
              name="startmodus"
              checked={regatta.startmodus === "normal"}
              onChange={() => updateRegatta(regatta.id, { startmodus: "normal" })}
            />
            <span>
              <strong>Yardstick Regatta</strong> — gemeinsamer Start, Wertung nach gesegelter
              und berechneter Zeit.
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
              <strong>Kangaroo-Start</strong> — individuelle Startzeiten aus Streckenzeit und
              Yardstick, das langsamste Boot zuerst. Der Zieleinlauf ist die Platzierung.
            </span>
          </label>
        </section>

        <section className="kachel kachel--legende">
          <h2 className="kachel__legende">Gesamtwertung</h2>
          <label className="einstellungen-streicher">
            Streichergebnisse
            <input
              type="number"
              min={0}
              max={Math.max(streicherMax, regatta.streicher)}
              value={regatta.streicher}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) =>
                updateRegatta(regatta.id, { streicher: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </label>
          <p className="hinweis kachel__fuss">
            Wirksam sind höchstens {streicherMax} (aktive Starts − 2) — aktuell{" "}
            {Math.min(regatta.streicher, streicherMax)}.
          </p>
        </section>
      </div>
    </div>
  );
}
