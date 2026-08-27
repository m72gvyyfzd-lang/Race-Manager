import { useState } from "react";
import {
  berechneGesamtwertung,
  berechneStartErgebnis,
  formatDauer,
  formatUhrzeit,
  kangarooStartzeiten,
  maxStreicher,
  type Regatta,
  type Sonderstatus,
  type Start,
  type Wertungsart,
} from "@race-manager/core";
import { KeineRegatta } from "../components/KeineRegatta";
import { PrintKopf } from "../components/PrintKopf";
import { TimeInput } from "../components/TimeInput";
import { jetztSekunden } from "../lib/zeitHelfer";
import { useData } from "../state/DataContext";

const STATUS_OPTIONEN: Sonderstatus[] = ["DNC", "DNS", "DSQ", "DNF", "RET", "OCS"];

const WERTUNGSART_LABEL: Record<Wertungsart, string> = {
  gesegelt: "nach gesegelter Zeit",
  berechnet: "nach berechneter Zeit",
};

function drucken(titel: string) {
  const vorher = document.title;
  document.title = titel;
  window.print();
  setTimeout(() => {
    document.title = vorher;
  }, 500);
}

function WertungsartTabs({
  wert,
  onWert,
}: {
  wert: Wertungsart;
  onWert: (wert: Wertungsart) => void;
}) {
  return (
    <div className="chip-row no-print">
      {(Object.keys(WERTUNGSART_LABEL) as Wertungsart[]).map((art) => (
        <button
          key={art}
          type="button"
          className={`chip${wert === art ? " is-active" : ""}`}
          onClick={() => onWert(art)}
        >
          {WERTUNGSART_LABEL[art]}
        </button>
      ))}
    </div>
  );
}

function StartPanel({ regatta, start }: { regatta: Regatta; start: Start }) {
  const { updateStart, removeStart, setZeit } = useData();
  const [wertungsart, setWertungsart] = useState<Wertungsart>("gesegelt");
  const [massenstart, setMassenstart] = useState<number | undefined>(undefined);
  const kangaroo = regatta.startmodus === "kangaroo";
  const boote = [...regatta.boote].sort((a, b) => a.name.localeCompare(b.name, "de"));

  const massenstartUebernehmen = () => {
    if (massenstart === undefined) return;
    const abweichend = boote.some((b) => {
      const s = regatta.zeiten.find((z) => z.startId === start.id && z.bootId === b.id)?.startzeit;
      return s !== undefined && s !== massenstart;
    });
    if (
      abweichend &&
      !window.confirm("Einzelne Boote haben bereits abweichende Startzeiten — alle überschreiben?")
    ) {
      return;
    }
    for (const boot of boote) {
      setZeit(start.id, boot.id, { startzeit: massenstart });
    }
  };

  const eintrag = (bootId: string) =>
    regatta.zeiten.find((z) => z.startId === start.id && z.bootId === bootId);

  const startliste =
    kangaroo && start.geplanteStartzeit !== undefined && start.basiszeit !== undefined
      ? kangarooStartzeiten(regatta.boote, start.geplanteStartzeit, start.basiszeit)
      : null;

  const ergebnis = berechneStartErgebnis(regatta, start, wertungsart);
  const wertungsTitel = kangaroo ? "nach Zieleinlauf (Kangaroo)" : WERTUNGSART_LABEL[wertungsart];

  return (
    <div>
      <div className="panel form-grid no-print">
        <label>
          Bezeichnung
          <input
            value={start.bezeichnung}
            onChange={(e) => updateStart(start.id, { bezeichnung: e.target.value })}
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={start.aktiv}
            onChange={(e) => updateStart(start.id, { aktiv: e.target.checked })}
          />
          zählt zur Gesamtwertung
        </label>
        {kangaroo && (
          <>
            <label>
              Geplante Startzeit (1. Boot)
              <TimeInput
                wert={start.geplanteStartzeit}
                onWert={(wert) => updateStart(start.id, { geplanteStartzeit: wert })}
              />
            </label>
            <label>
              Kalkulierte Streckenzeit (YS 100)
              <TimeInput
                wert={start.basiszeit}
                onWert={(wert) => updateStart(start.id, { basiszeit: wert })}
                placeholder="z.B. 23000 für 2:30:00"
              />
            </label>
          </>
        )}
        <div className="button-row">
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (window.confirm(`Start „${start.bezeichnung}“ samt Zeiten löschen?`)) {
                removeStart(start.id);
              }
            }}
          >
            Start löschen
          </button>
        </div>
      </div>

      {kangaroo && (
        <section>
          <h2>Startliste</h2>
          {startliste ? (
            <div className="tabelle-scroll">
              <table className="tabelle">
                <thead>
                  <tr>
                    <th>Startfolge</th>
                    <th>Boot</th>
                    <th>Yardstick</th>
                    <th>Verzögerung</th>
                    <th>Startzeit</th>
                  </tr>
                </thead>
                <tbody>
                  {startliste.map((zeile, index) => (
                    <tr key={zeile.boot.id}>
                      <td>{index + 1}</td>
                      <td>{zeile.boot.name}</td>
                      <td>{zeile.boot.yardstick}</td>
                      <td>+{formatDauer(zeile.offsetSek)}</td>
                      <td>{formatUhrzeit(zeile.startzeit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-print">
              Geplante Startzeit und kalkulierte Streckenzeit eingeben, dann erscheinen hier die
              individuellen Startzeiten (langsamstes Boot zuerst).
            </p>
          )}
        </section>
      )}

      <section className="no-print">
        <h2>Zeiterfassung</h2>
        <p className="hinweis">
          Zeiten als Ziffern eingeben: z.B. <code>154023</code> für 15:40:23 — oder an der
          Ziellinie einfach <strong>Jetzt</strong> antippen.
          {kangaroo && " Startzeiten kommen aus der Startliste, nur bei Abweichung überschreiben."}
        </p>
        {!kangaroo && (
          <div className="massenstart no-print">
            <span>Startzeit für alle:</span>
            <TimeInput wert={massenstart} onWert={setMassenstart} />
            <button type="button" onClick={() => setMassenstart(jetztSekunden())}>
              Jetzt
            </button>
            <button
              type="button"
              className="primary"
              disabled={massenstart === undefined}
              onClick={massenstartUebernehmen}
            >
              Für alle übernehmen
            </button>
          </div>
        )}
        <div className="tabelle-scroll">
          <table className="tabelle">
            <thead>
              <tr>
                <th>Boot</th>
                <th>YS</th>
                <th>Startzeit</th>
                <th>Zielzeit</th>
                <th>Status</th>
                <th>gesegelt</th>
                <th>berechnet</th>
                <th title="Manuelle Punktvergabe der Wettfahrtleitung — überschreibt die Berechnung">
                  Punkte man.
                </th>
                <th>Bemerkung</th>
              </tr>
            </thead>
            <tbody>
              {boote.map((boot) => {
                const zeit = eintrag(boot.id);
                const zeile = ergebnis.find((z) => z.boot.id === boot.id);
                return (
                  <tr key={boot.id}>
                    <td>{boot.name}</td>
                    <td>{boot.yardstick}</td>
                    <td>
                      <TimeInput
                        wert={zeit?.startzeit}
                        onWert={(wert) => setZeit(start.id, boot.id, { startzeit: wert })}
                        placeholder={
                          startliste
                            ? formatUhrzeit(
                                startliste.find((z) => z.boot.id === boot.id)!.startzeit,
                              )
                            : undefined
                        }
                      />
                    </td>
                    <td>
                      <div className="ziel-zelle">
                        <TimeInput
                          wert={zeit?.zielzeit}
                          onWert={(wert) => setZeit(start.id, boot.id, { zielzeit: wert })}
                        />
                        <button
                          type="button"
                          className="stempel-btn"
                          title="Zielzeit auf jetzt stempeln"
                          onClick={() => setZeit(start.id, boot.id, { zielzeit: jetztSekunden() })}
                        >
                          Jetzt
                        </button>
                      </div>
                    </td>
                    <td>
                      <select
                        value={zeit?.status ?? ""}
                        onChange={(e) =>
                          setZeit(start.id, boot.id, {
                            status: (e.target.value || undefined) as Sonderstatus | undefined,
                          })
                        }
                      >
                        <option value=""></option>
                        {STATUS_OPTIONEN.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{zeile?.gesegeltSek !== undefined ? formatDauer(zeile.gesegeltSek) : "–"}</td>
                    <td>
                      {zeile?.berechnetSek !== undefined ? formatDauer(zeile.berechnetSek) : "–"}
                    </td>
                    <td>
                      <input
                        className="zelle zelle--zahl"
                        type="number"
                        min={0}
                        step={0.5}
                        value={zeit?.punkteManuell ?? ""}
                        onChange={(e) =>
                          setZeit(start.id, boot.id, {
                            punkteManuell:
                              e.target.value === "" ? undefined : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="zelle"
                        value={zeit?.bemerkung ?? ""}
                        onChange={(e) =>
                          setZeit(start.id, boot.id, { bemerkung: e.target.value || undefined })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <PrintKopf
          regatta={regatta}
          titel={`Ergebnisliste ${start.nummer}. Start: ${start.bezeichnung}`}
          untertitel={`Wertung ${wertungsTitel}`}
        />
        {!kangaroo && <WertungsartTabs wert={wertungsart} onWert={setWertungsart} />}
        <div className="tabelle-scroll">
          <table className="tabelle">
            <thead>
              <tr>
                <th>Platz</th>
                <th>Boot</th>
                <th>Skipper</th>
                <th>Crew</th>
                <th>YS</th>
                <th>Start</th>
                <th>Ziel</th>
                <th>gesegelte Zeit</th>
                <th>berechnete Zeit</th>
                <th>Punkte</th>
                {ergebnis.some((z) => z.bemerkung) && <th>Bemerkung</th>}
              </tr>
            </thead>
            <tbody>
              {ergebnis.map((zeile) => (
                <tr key={zeile.boot.id}>
                  <td>{zeile.status ?? zeile.platz}</td>
                  <td>{zeile.boot.name}</td>
                  <td>{zeile.boot.skipper}</td>
                  <td>{zeile.boot.crew}</td>
                  <td>{zeile.boot.yardstick}</td>
                  <td>{zeile.startzeit !== undefined ? formatUhrzeit(zeile.startzeit) : "–"}</td>
                  <td>{zeile.zielzeit !== undefined ? formatUhrzeit(zeile.zielzeit) : "–"}</td>
                  <td>{zeile.gesegeltSek !== undefined ? formatDauer(zeile.gesegeltSek) : "–"}</td>
                  <td>{zeile.berechnetSek !== undefined ? formatDauer(zeile.berechnetSek) : "–"}</td>
                  <td>
                    {zeile.punkte}
                    {zeile.punkteManuell && (
                      <span title="Punkte manuell von der Wettfahrtleitung vergeben"> *</span>
                    )}
                  </td>
                  {ergebnis.some((z) => z.bemerkung) && <td>{zeile.bemerkung ?? ""}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ergebnis.some((z) => z.punkteManuell) && (
          <p className="hinweis">* Punkte manuell von der Wettfahrtleitung vergeben</p>
        )}
        <div className="button-row no-print">
          <button
            type="button"
            onClick={() =>
              drucken(`Ergebnis ${start.bezeichnung} ${regatta.name} ${regatta.jahr}`)
            }
          >
            Drucken / PDF
          </button>
        </div>
      </section>
    </div>
  );
}

function GesamtPanel({ regatta }: { regatta: Regatta }) {
  const [wertungsart, setWertungsart] = useState<Wertungsart>("gesegelt");
  const kangaroo = regatta.startmodus === "kangaroo";
  const wertung = berechneGesamtwertung(regatta, wertungsart);
  const aktiveStarts = regatta.starts.filter((s) => s.aktiv).sort((a, b) => a.nummer - b.nummer);
  const streicher = Math.min(regatta.streicher, maxStreicher(regatta));
  const wertungsTitel = kangaroo ? "nach Zieleinlauf (Kangaroo)" : WERTUNGSART_LABEL[wertungsart];

  return (
    <div>
      <PrintKopf
        regatta={regatta}
        titel="Gesamtwertung"
        untertitel={`Wertung ${wertungsTitel}${
          streicher > 0
            ? ` · ${streicher} Streichergebnis${streicher > 1 ? "se" : ""} (in Klammern)`
            : ""
        }`}
      />
      {!kangaroo && <WertungsartTabs wert={wertungsart} onWert={setWertungsart} />}
      {aktiveStarts.length === 0 ? (
        <p>Noch kein Start zählt zur Gesamtwertung.</p>
      ) : (
        <>
          <div className="tabelle-scroll">
            <table className="tabelle">
              <thead>
                <tr>
                  <th>Platz</th>
                  <th>Boot</th>
                  <th>Skipper</th>
                  <th>Verein</th>
                  <th>Bootstyp</th>
                  <th>YS</th>
                  {aktiveStarts.map((s) => (
                    <th key={s.id}>{s.nummer}. Start</th>
                  ))}
                  <th>Gesamt</th>
                </tr>
              </thead>
              <tbody>
                {wertung.map((zeile) => (
                  <tr key={zeile.boot.id}>
                    <td>{zeile.platz}</td>
                    <td>{zeile.boot.name}</td>
                    <td>{zeile.boot.skipper}</td>
                    <td>{zeile.boot.verein}</td>
                    <td>{zeile.boot.bootstyp}</td>
                    <td>{zeile.boot.yardstick}</td>
                    {zeile.einzel.map((e) => (
                      <td key={e.start.id}>
                        {e.gestrichen ? `(${e.punkte})` : e.punkte}
                        {e.status && <span className="status-hinweis"> {e.status}</span>}
                      </td>
                    ))}
                    <td>
                      <strong>{zeile.gesamtpunkte}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="button-row no-print">
            <button
              type="button"
              onClick={() => drucken(`Gesamtwertung ${regatta.name} ${regatta.jahr}`)}
            >
              Drucken / PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Wertungen() {
  const { aktiveRegatta, addStart } = useData();
  const [auswahl, setAuswahl] = useState<string>("gesamt");
  if (!aktiveRegatta) return <KeineRegatta />;

  const starts = [...aktiveRegatta.starts].sort((a, b) => a.nummer - b.nummer);
  const aktiverStart = starts.find((s) => s.id === auswahl);

  return (
    <div>
      <h1 className="no-print">Wertungen</h1>
      <div className="chip-row no-print">
        {starts.map((start) => (
          <button
            key={start.id}
            type="button"
            className={`chip${auswahl === start.id ? " is-active" : ""}${start.aktiv ? "" : " is-inaktiv"}`}
            onClick={() => setAuswahl(start.id)}
          >
            {start.nummer}. {start.bezeichnung}
          </button>
        ))}
        <button
          type="button"
          className={`chip${auswahl === "gesamt" ? " is-active" : ""}`}
          onClick={() => setAuswahl("gesamt")}
        >
          Gesamtwertung
        </button>
        <button type="button" className="chip chip--aktion" onClick={addStart}>
          + Start
        </button>
      </div>

      {aktiverStart ? (
        <StartPanel regatta={aktiveRegatta} start={aktiverStart} />
      ) : (
        <GesamtPanel regatta={aktiveRegatta} />
      )}
    </div>
  );
}
