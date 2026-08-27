import type { Boot } from "@race-manager/core";
import { KeineRegatta } from "../components/KeineRegatta";
import { PrintKopf } from "../components/PrintKopf";
import { useData } from "../state/DataContext";

function TextZelle({
  wert,
  onWert,
  breit,
  mittig,
}: {
  wert: string;
  onWert: (wert: string) => void;
  breit?: boolean;
  mittig?: boolean;
}) {
  return (
    <input
      className={`zelle${breit ? " zelle--breit" : ""}${mittig ? " zelle--schmal" : ""}`}
      value={wert}
      onChange={(e) => onWert(e.target.value)}
    />
  );
}

export function Teilnehmer() {
  const { aktiveRegatta, addBoot, updateBoot, removeBoot, addEssen, updateEssen, removeEssen } =
    useData();
  if (!aktiveRegatta) return <KeineRegatta />;

  const boote = aktiveRegatta.boote;
  const essenListe = aktiveRegatta.essenAnmeldungen ?? [];

  const meldungen = boote.filter((b) => b.meldungErhalten).length;
  const meldungenBezahlt = boote.filter((b) => b.meldegeldBezahlt).length;
  const essenErwachsen = essenListe.reduce((sum, e) => sum + e.essenErwachsen, 0);
  const essenKind = essenListe.reduce((sum, e) => sum + e.essenKind, 0);
  const essenBezahlt = essenListe
    .filter((e) => e.bezahlt)
    .reduce((sum, e) => sum + e.essenErwachsen + e.essenKind, 0);

  const feld = (boot: Boot, key: "name" | "skipper" | "crew" | "bootstyp") => (
    <TextZelle wert={boot[key]} onWert={(wert) => updateBoot(boot.id, { [key]: wert })} />
  );

  return (
    <div>
      <PrintKopf regatta={aktiveRegatta} titel="Anmeldung (Regatta)" />

      <dl className="stat-grid no-print">
        <div className="stat-grid__item">
          <dt>Regatta: Meldungen</dt>
          <dd>{meldungen}</dd>
          <div className="stat-grid__zusatz">davon bezahlt: {meldungenBezahlt}</div>
        </div>
        <div className="stat-grid__item">
          <dt>Essen: Erwachsene</dt>
          <dd>{essenErwachsen}</dd>
        </div>
        <div className="stat-grid__item">
          <dt>Essen: Kinder</dt>
          <dd>{essenKind}</dd>
        </div>
        <div className="stat-grid__item">
          <dt>Essen: bezahlt</dt>
          <dd>
            {essenBezahlt} / {essenErwachsen + essenKind}
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
              <th>Bootstyp</th>
              <th>Yardstick</th>
              <th className="spalte-schmal">Verein</th>
              <th className="spalte-schmal" title="Meldung erhalten">
                Meldung
              </th>
              <th className="spalte-schmal" title="Meldegeld bezahlt">
                Meldegeld
              </th>
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
                <td>{feld(boot, "bootstyp")}</td>
                <td>
                  <input
                    className="zelle zelle--zahl"
                    type="number"
                    min={1}
                    value={boot.yardstick}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => updateBoot(boot.id, { yardstick: Number(e.target.value) || 100 })}
                  />
                </td>
                <td className="spalte-schmal">
                  <TextZelle
                    mittig
                    wert={boot.verein}
                    onWert={(wert) => updateBoot(boot.id, { verein: wert })}
                  />
                </td>
                <td className="spalte-schmal">
                  <input
                    type="checkbox"
                    checked={boot.meldungErhalten}
                    onChange={(e) => updateBoot(boot.id, { meldungErhalten: e.target.checked })}
                  />
                </td>
                <td className="spalte-schmal">
                  <input
                    type="checkbox"
                    checked={boot.meldegeldBezahlt}
                    onChange={(e) => updateBoot(boot.id, { meldegeldBezahlt: e.target.checked })}
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

      <section>
        <h2>Anmeldungen (Essen)</h2>
        <div className="tabelle-scroll">
          <table className="tabelle">
            <thead>
              <tr>
                <th>Name</th>
                <th className="spalte-schmal">Essen Erwachsen</th>
                <th className="spalte-schmal">Essen Kind</th>
                <th className="spalte-schmal">Bezahlt</th>
                <th>Bemerkungen</th>
                <th className="no-print"></th>
              </tr>
            </thead>
            <tbody>
              {essenListe.map((eintrag) => (
                <tr key={eintrag.id}>
                  <td>
                    <TextZelle
                      wert={eintrag.name}
                      onWert={(wert) => updateEssen(eintrag.id, { name: wert })}
                    />
                  </td>
                  <td className="spalte-schmal">
                    <input
                      className="zelle zelle--zahl"
                      type="number"
                      min={0}
                      value={eintrag.essenErwachsen}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) =>
                        updateEssen(eintrag.id, { essenErwachsen: Number(e.target.value) || 0 })
                      }
                    />
                  </td>
                  <td className="spalte-schmal">
                    <input
                      className="zelle zelle--zahl"
                      type="number"
                      min={0}
                      value={eintrag.essenKind}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) =>
                        updateEssen(eintrag.id, { essenKind: Number(e.target.value) || 0 })
                      }
                    />
                  </td>
                  <td className="spalte-schmal">
                    <input
                      type="checkbox"
                      checked={eintrag.bezahlt}
                      onChange={(e) => updateEssen(eintrag.id, { bezahlt: e.target.checked })}
                    />
                  </td>
                  <td>
                    <TextZelle
                      breit
                      wert={eintrag.bemerkung ?? ""}
                      onWert={(wert) => updateEssen(eintrag.id, { bemerkung: wert || undefined })}
                    />
                  </td>
                  <td className="no-print">
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (window.confirm(`Essen-Anmeldung „${eintrag.name || "ohne Namen"}“ löschen?`)) {
                          removeEssen(eintrag.id);
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
          <button type="button" className="primary" onClick={addEssen}>
            + Essen-Anmeldung
          </button>
        </div>
      </section>
    </div>
  );
}
