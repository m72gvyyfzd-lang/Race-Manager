import { useEffect, useState } from "react";
import type { Boot } from "@race-manager/core";
import { KeineRegatta } from "../components/KeineRegatta";
import { ListenTitel } from "../components/ListenTitel";
import { PrintKopf } from "../components/PrintKopf";
import { drucken } from "../lib/drucken";
import { useData } from "../state/DataContext";

function TextZelle({
  wert,
  onWert,
  voll,
  mittig,
}: {
  wert: string;
  onWert: (wert: string) => void;
  voll?: boolean;
  mittig?: boolean;
}) {
  return (
    <input
      className={`zelle${voll ? " zelle--voll" : ""}${mittig ? " zelle--mittig" : ""}`}
      value={wert}
      onChange={(e) => onWert(e.target.value)}
    />
  );
}

const TABS = [
  { id: "regatta", label: "Anmeldung Regatta" },
  { id: "essen", label: "Anmeldung Essen" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Teilnehmer() {
  const { aktiveRegatta, addBoot, updateBoot, removeBoot, addEssen, updateEssen, removeEssen } =
    useData();
  const [tab, setTab] = useState<TabId>("regatta");
  // Hebt die noch nicht bezahlten Essen-Anmeldungen kurz hervor
  const [hebeOffeneHervor, setHebeOffeneHervor] = useState(false);

  useEffect(() => {
    if (!hebeOffeneHervor) return;
    const timer = setTimeout(() => setHebeOffeneHervor(false), 5000);
    return () => clearTimeout(timer);
  }, [hebeOffeneHervor]);

  if (!aktiveRegatta) return <KeineRegatta />;

  const boote = aktiveRegatta.boote;
  const essenListe = aktiveRegatta.essenAnmeldungen ?? [];

  const meldungen = boote.filter((b) => b.meldungErhalten).length;
  const meldegeldFehlt = boote.filter((b) => !b.meldegeldBezahlt).length;
  const essenErwachsen = essenListe.reduce((sum, e) => sum + e.essenErwachsen, 0);
  const essenKind = essenListe.reduce((sum, e) => sum + e.essenKind, 0);
  const essenGesamt = essenErwachsen + essenKind;
  const essenOffen = essenListe
    .filter((e) => !e.bezahlt)
    .reduce((sum, e) => sum + e.essenErwachsen + e.essenKind, 0);

  /** Springt in die Essen-Liste und hebt die offenen Zahlungen hervor. */
  const zeigeOffeneEssen = () => {
    setTab("essen");
    setHebeOffeneHervor(false);
    // im nächsten Frame neu setzen, damit die Animation auch bei
    // wiederholtem Klick erneut startet
    requestAnimationFrame(() => setHebeOffeneHervor(true));
  };

  const feld = (boot: Boot, key: "name" | "skipper" | "crew") => (
    <TextZelle voll wert={boot[key]} onWert={(wert) => updateBoot(boot.id, { [key]: wert })} />
  );

  return (
    <div>
      <PrintKopf regatta={aktiveRegatta} seitentitel="Teilnehmer & Orga" />

      <div className="orga-dashboard no-print">
        <section className="kachel orga-kachel">
          <h2 className="kachel__legende">Racing…</h2>
          <dl className="orga-werte">
            <div className="orga-wert">
              <dt>angemeldete Boote :</dt>
              <dd>{boote.length}</dd>
            </div>
            <div className="orga-wert">
              <dt>checked in :</dt>
              <dd>{meldungen}</dd>
            </div>
            <div className="orga-wert">
              <dt>Meldegelder erhalten :</dt>
              <dd>
                {boote.length === 0 ? (
                  "–"
                ) : meldegeldFehlt === 0 ? (
                  <span className="orga-wert--gut">✓</span>
                ) : (
                  <span className="orga-wert--fehlt">
                    {meldegeldFehlt} {meldegeldFehlt === 1 ? "fehlt" : "fehlen"} …!
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>
        <section className="kachel orga-kachel">
          <h2 className="kachel__legende">Party…</h2>
          <dl className="orga-werte">
            <div className="orga-wert">
              <dt>Essen gesamt :</dt>
              <dd>{essenGesamt}</dd>
            </div>
            <div className="orga-wert">
              <dt>davon Erw. / Kinder :</dt>
              <dd>
                {essenErwachsen} / {essenKind}
              </dd>
            </div>
            <div className="orga-wert">
              <dt>Bezahlung erhalten :</dt>
              <dd>
                {essenGesamt === 0 ? (
                  "–"
                ) : essenOffen === 0 ? (
                  <span className="orga-wert--gut">✓</span>
                ) : (
                  <button
                    type="button"
                    className="orga-wert--fehlt orga-wert__knopf"
                    title="Offene Einträge in der Liste zeigen"
                    onClick={zeigeOffeneEssen}
                  >
                    {essenOffen} {essenOffen === 1 ? "fehlt" : "fehlen"} …!
                  </button>
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <ListenTitel
        className="listen-titel"
        titel={tab === "regatta" ? "Anmeldung Regatta" : "Anmeldung Essen"}
      />

      <div className="karteireiter no-print" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`karteireiter__tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <div className="karteireiter__aktionen">
          <button
            type="button"
            className="primary"
            onClick={tab === "regatta" ? addBoot : addEssen}
          >
            {tab === "regatta" ? "+ Boot hinzufügen" : "+ Essen hinzufügen"}
          </button>
          <button
            type="button"
            onClick={() =>
              drucken(
                `${tab === "regatta" ? "Anmeldung Regatta" : "Anmeldung Essen"} ${aktiveRegatta.name} ${aktiveRegatta.jahr}`,
                "quer",
              )
            }
          >
            Drucken / PDF
          </button>
        </div>
      </div>

      <div className="karteikarte">
        {tab === "regatta" ? (
          <>
            <div className="tabelle-scroll">
              <table className="tabelle tabelle--kopf-mittig">
                <thead>
                  <tr>
                    <th className="spalte-nr">#</th>
                    <th className="spalte-links">Bootsname</th>
                    <th className="spalte-links">Skipper</th>
                    <th className="spalte-links">Crew</th>
                    <th className="spalte-mittig">Bootstyp</th>
                    <th className="spalte-mittig spalte-schmal">Yardstick</th>
                    <th className="spalte-schmal">Verein</th>
                    <th className="spalte-schmal" title="Meldung erhalten">
                      Meldung
                    </th>
                    <th className="spalte-schmal" title="Meldegeld bezahlt">
                      Meldegeld
                    </th>
                    <th className="spalte-links">Bemerkung</th>
                    <th className="no-print"></th>
                  </tr>
                </thead>
                <tbody>
                  {boote.map((boot, index) => (
                    <tr key={boot.id}>
                      <td className="spalte-nr">{index + 1}</td>
                      <td>{feld(boot, "name")}</td>
                      <td>{feld(boot, "skipper")}</td>
                      <td>{feld(boot, "crew")}</td>
                      <td className="spalte-mittig">
                        <TextZelle
                          voll
                          mittig
                          wert={boot.bootstyp}
                          onWert={(wert) => updateBoot(boot.id, { bootstyp: wert })}
                        />
                      </td>
                      <td className="spalte-mittig spalte-schmal">
                        <input
                          className="zelle zelle--zahl zelle--mittig"
                          type="number"
                          min={1}
                          value={boot.yardstick}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) =>
                            updateBoot(boot.id, { yardstick: Number(e.target.value) || 100 })
                          }
                        />
                      </td>
                      <td className="spalte-schmal">
                        <TextZelle
                          voll
                          mittig
                          wert={boot.verein}
                          onWert={(wert) => updateBoot(boot.id, { verein: wert })}
                        />
                      </td>
                      <td className="spalte-schmal">
                        <input
                          type="checkbox"
                          checked={boot.meldungErhalten}
                          onChange={(e) =>
                            updateBoot(boot.id, { meldungErhalten: e.target.checked })
                          }
                        />
                      </td>
                      <td className="spalte-schmal">
                        <input
                          type="checkbox"
                          checked={boot.meldegeldBezahlt}
                          onChange={(e) =>
                            updateBoot(boot.id, { meldegeldBezahlt: e.target.checked })
                          }
                        />
                      </td>
                      <td>
                        <TextZelle
                          voll
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
          </>
        ) : (
          <>
            <div className="tabelle-scroll">
              <table className="tabelle tabelle--kopf-mittig">
                <thead>
                  <tr>
                    <th className="spalte-nr">#</th>
                    <th className="spalte-links">Name</th>
                    <th className="spalte-mittig spalte-schmal">Essen Erwachsen</th>
                    <th className="spalte-mittig spalte-schmal">Essen Kind</th>
                    <th className="spalte-schmal">Bezahlt</th>
                    <th className="spalte-links">Bemerkungen</th>
                    <th className="no-print"></th>
                  </tr>
                </thead>
                <tbody>
                  {essenListe.map((eintrag, index) => (
                    <tr
                      key={eintrag.id}
                      className={
                        hebeOffeneHervor && !eintrag.bezahlt ? "zeile-hervorheben" : undefined
                      }
                    >
                      <td className="spalte-nr">{index + 1}</td>
                      <td>
                        <TextZelle
                          voll
                          wert={eintrag.name}
                          onWert={(wert) => updateEssen(eintrag.id, { name: wert })}
                        />
                      </td>
                      <td className="spalte-mittig spalte-schmal">
                        <input
                          className="zelle zelle--zahl zelle--mittig"
                          type="number"
                          min={0}
                          value={eintrag.essenErwachsen}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) =>
                            updateEssen(eintrag.id, { essenErwachsen: Number(e.target.value) || 0 })
                          }
                        />
                      </td>
                      <td className="spalte-mittig spalte-schmal">
                        <input
                          className="zelle zelle--zahl zelle--mittig"
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
                          voll
                          wert={eintrag.bemerkung ?? ""}
                          onWert={(wert) =>
                            updateEssen(eintrag.id, { bemerkung: wert || undefined })
                          }
                        />
                      </td>
                      <td className="no-print">
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Essen-Anmeldung „${eintrag.name || "ohne Namen"}“ löschen?`,
                              )
                            ) {
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
          </>
        )}
      </div>
    </div>
  );
}
