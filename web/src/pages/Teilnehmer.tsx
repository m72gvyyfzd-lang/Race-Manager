import type { Boot } from "@race-manager/core";
import { KeineRegatta } from "../components/KeineRegatta";
import { useData } from "../state/DataContext";

function TextZelle({
  wert,
  onWert,
  breit,
}: {
  wert: string;
  onWert: (wert: string) => void;
  breit?: boolean;
}) {
  return (
    <input
      className={breit ? "zelle zelle--breit" : "zelle"}
      value={wert}
      onChange={(e) => onWert(e.target.value)}
    />
  );
}

export function Teilnehmer() {
  const { aktiveRegatta, addBoot, updateBoot, removeBoot } = useData();
  if (!aktiveRegatta) return <KeineRegatta />;

  const boote = aktiveRegatta.boote;
  const meldungen = boote.filter((b) => b.meldungErhalten).length;
  const bezahlt = boote.filter((b) => b.meldegeldBezahlt).length;
  const essen = boote.reduce((sum, b) => sum + b.anzahlEssen, 0);
  const essenBezahlt = boote.filter((b) => b.essenBezahlt).reduce((sum, b) => sum + b.anzahlEssen, 0);

  const feld = (boot: Boot, key: "name" | "skipper" | "crew" | "verein" | "bootstyp") => (
    <TextZelle wert={boot[key]} onWert={(wert) => updateBoot(boot.id, { [key]: wert })} />
  );

  return (
    <div>
      <div className="print-header">
        <h1>
          Meldeliste {aktiveRegatta.name} {aktiveRegatta.jahr}
        </h1>
      </div>

      <dl className="stat-grid no-print">
        <div className="stat-grid__item">
          <dt>Meldungen (bezahlt)</dt>
          <dd>
            {meldungen} ({bezahlt})
          </dd>
        </div>
        <div className="stat-grid__item">
          <dt>Essen (bezahlt)</dt>
          <dd>
            {essen} ({essenBezahlt})
          </dd>
        </div>
      </dl>

      <div className="tabelle-scroll">
        <table className="tabelle">
          <thead>
            <tr>
              <th>#</th>
              <th>Bootsname</th>
              <th>Skipper</th>
              <th>Crew</th>
              <th>Verein</th>
              <th>Bootstyp</th>
              <th>Yardstick</th>
              <th title="Meldung erhalten">Meldung</th>
              <th title="Meldegeld bezahlt">Meldegeld</th>
              <th title="Anzahl Essen">Essen</th>
              <th title="Essen bezahlt">Essen bez.</th>
              <th>Bemerkung</th>
              <th className="no-print"></th>
            </tr>
          </thead>
          <tbody>
            {boote.map((boot, index) => (
              <tr key={boot.id}>
                <td>{index + 1}</td>
                <td>{feld(boot, "name")}</td>
                <td>{feld(boot, "skipper")}</td>
                <td>{feld(boot, "crew")}</td>
                <td>{feld(boot, "verein")}</td>
                <td>{feld(boot, "bootstyp")}</td>
                <td>
                  <input
                    className="zelle zelle--zahl"
                    type="number"
                    min={1}
                    value={boot.yardstick}
                    onChange={(e) => updateBoot(boot.id, { yardstick: Number(e.target.value) || 100 })}
                  />
                </td>
                <td className="mittig">
                  <input
                    type="checkbox"
                    checked={boot.meldungErhalten}
                    onChange={(e) => updateBoot(boot.id, { meldungErhalten: e.target.checked })}
                  />
                </td>
                <td className="mittig">
                  <input
                    type="checkbox"
                    checked={boot.meldegeldBezahlt}
                    onChange={(e) => updateBoot(boot.id, { meldegeldBezahlt: e.target.checked })}
                  />
                </td>
                <td>
                  <input
                    className="zelle zelle--zahl"
                    type="number"
                    min={0}
                    value={boot.anzahlEssen}
                    onChange={(e) => updateBoot(boot.id, { anzahlEssen: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="mittig">
                  <input
                    type="checkbox"
                    checked={boot.essenBezahlt}
                    onChange={(e) => updateBoot(boot.id, { essenBezahlt: e.target.checked })}
                  />
                </td>
                <td>
                  <TextZelle
                    breit
                    wert={boot.bemerkung ?? ""}
                    onWert={(wert) => updateBoot(boot.id, { bemerkung: wert || undefined })}
                  />
                </td>
                <td className="no-print">
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      if (window.confirm(`Boot „${boot.name || "ohne Namen"}“ löschen?`)) {
                        removeBoot(boot.id);
                      }
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-row no-print">
        <button type="button" className="primary" onClick={addBoot}>
          + Boot hinzufügen
        </button>
        <button type="button" onClick={() => window.print()}>
          Drucken / PDF
        </button>
      </div>
    </div>
  );
}
