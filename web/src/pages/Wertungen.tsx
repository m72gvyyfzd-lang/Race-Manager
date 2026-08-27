import { useState } from "react";
import {
  berechneGesamtwertung,
  berechneStartErgebnis,
  formatDauer,
  formatUhrzeit,
  kangarooStartzeiten,
  maxStreicher,
  streckenzeitSek,
  type Regatta,
  type Sonderstatus,
  type Start,
  type Wertungsart,
} from "@race-manager/core";
import { DezimalInput } from "../components/DezimalInput";
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

const START_TABS = [
  { id: "startliste", label: "Startliste" },
  { id: "zeiten", label: "Zeiterfassung" },
  { id: "gesegelt", label: "Ergebnis gesegelt" },
  { id: "berechnet", label: "Ergebnis berechnet" },
] as const;

type StartTabId = (typeof START_TABS)[number]["id"];

function drucken(titel: string) {
  const vorher = document.title;
  document.title = titel;
  window.print();
  setTimeout(() => {
    document.title = vorher;
  }, 500);
}

function wertungsTitel(regatta: Regatta, wertungsart: Wertungsart): string {
  return regatta.startmodus === "kangaroo"
    ? "nach Zieleinlauf (Kangaroo)"
    : WERTUNGSART_LABEL[wertungsart];
}

function StartlisteTab({ regatta, start }: { regatta: Regatta; start: Start }) {
  const kangaroo = regatta.startmodus === "kangaroo";

  const startliste =
    kangaroo && start.geplanteStartzeit !== undefined && start.basiszeit !== undefined
      ? kangarooStartzeiten(regatta.boote, start.geplanteStartzeit, start.basiszeit)
      : null;

  const booteSortiert = [...regatta.boote].sort((a, b) => a.name.localeCompare(b.name, "de"));
  const eintrag = (bootId: string) =>
    regatta.zeiten.find((z) => z.startId === start.id && z.bootId === bootId);

  return (
    <div>
      {kangaroo ? (
        startliste ? (
          <div className="tabelle-scroll">
            <table className="tabelle tabelle--mittig">
              <thead>
                <tr>
                  <th>Startfolge</th>
                  <th className="spalte-links">Boot</th>
                  <th>Yardstick</th>
                  <th>Verzögerung</th>
                  <th>Startzeit</th>
                </tr>
              </thead>
              <tbody>
                {startliste.map((zeile, index) => (
                  <tr key={zeile.boot.id}>
                    <td>{index + 1}</td>
                    <td className="spalte-links">{zeile.boot.name}</td>
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
        )
      ) : (
        <div className="tabelle-scroll">
          <table className="tabelle tabelle--mittig">
            <thead>
              <tr>
                <th>#</th>
                <th className="spalte-links">Boot</th>
                <th>Skipper</th>
                <th>Yardstick</th>
                <th>Startzeit</th>
              </tr>
            </thead>
            <tbody>
              {booteSortiert.map((boot, index) => (
                <tr key={boot.id}>
                  <td>{index + 1}</td>
                  <td className="spalte-links">{boot.name}</td>
                  <td>{boot.skipper}</td>
                  <td>{boot.yardstick}</td>
                  <td>
                    {eintrag(boot.id)?.startzeit !== undefined
                      ? formatUhrzeit(eintrag(boot.id)!.startzeit!)
                      : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="button-row no-print">
        <button
          type="button"
          onClick={() => drucken(`Startliste ${start.bezeichnung} ${regatta.name} ${regatta.jahr}`)}
        >
          Drucken / PDF
        </button>
      </div>
    </div>
  );
}

function ZeiterfassungTab({ regatta, start }: { regatta: Regatta; start: Start }) {
  const { setZeit } = useData();
  const kangaroo = regatta.startmodus === "kangaroo";
  const boote = [...regatta.boote].sort((a, b) => a.name.localeCompare(b.name, "de"));

  const eintrag = (bootId: string) =>
    regatta.zeiten.find((z) => z.startId === start.id && z.bootId === bootId);

  const startliste =
    kangaroo && start.geplanteStartzeit !== undefined && start.basiszeit !== undefined
      ? kangarooStartzeiten(regatta.boote, start.geplanteStartzeit, start.basiszeit)
      : null;

  const ergebnis = berechneStartErgebnis(regatta, start, "gesegelt");

  return (
    <div className="no-print">
      <p className="hinweis">
        Zeiten als Ziffern eingeben: z.B. <code>154023</code> für 15:40:23 — oder an der Ziellinie
        einfach <strong>Jetzt</strong> antippen.
        {kangaroo && " Startzeiten kommen aus der Startliste, nur bei Abweichung überschreiben."}
      </p>
      <div className="tabelle-scroll">
        <table className="tabelle tabelle--mittig">
          <thead>
            <tr>
              <th className="spalte-links">Boot</th>
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
                  <td className="spalte-links">{boot.name}</td>
                  <td>{boot.yardstick}</td>
                  <td>
                    <TimeInput
                      wert={zeit?.startzeit}
                      onWert={(wert) => setZeit(start.id, boot.id, { startzeit: wert })}
                      placeholder={
                        startliste
                          ? formatUhrzeit(startliste.find((z) => z.boot.id === boot.id)!.startzeit)
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
                  <td>{zeile?.berechnetSek !== undefined ? formatDauer(zeile.berechnetSek) : "–"}</td>
                  <td>
                    <input
                      className="zelle zelle--zahl zelle--mittig"
                      type="number"
                      min={0}
                      step={0.5}
                      value={zeit?.punkteManuell ?? ""}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) =>
                        setZeit(start.id, boot.id, {
                          punkteManuell: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="zelle zelle--voll"
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
    </div>
  );
}

function ErgebnisTab({
  regatta,
  start,
  wertungsart,
}: {
  regatta: Regatta;
  start: Start;
  wertungsart: Wertungsart;
}) {
  const ergebnis = berechneStartErgebnis(regatta, start, wertungsart);
  const mitBemerkung = ergebnis.some((z) => z.bemerkung);

  return (
    <div>
      <div className="tabelle-scroll">
        <table className="tabelle tabelle--mittig">
          <thead>
            <tr>
              <th>Platz</th>
              <th className="spalte-links">Boot</th>
              <th>Skipper</th>
              <th>Crew</th>
              <th>YS</th>
              <th>Start</th>
              <th>Ziel</th>
              <th>gesegelte Zeit</th>
              <th>berechnete Zeit</th>
              <th>Punkte</th>
              {mitBemerkung && <th>Bemerkung</th>}
            </tr>
          </thead>
          <tbody>
            {ergebnis.map((zeile) => (
              <tr key={zeile.boot.id}>
                <td>{zeile.status ?? zeile.platz}</td>
                <td className="spalte-links">{zeile.boot.name}</td>
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
                {mitBemerkung && <td>{zeile.bemerkung ?? ""}</td>}
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
          onClick={() => drucken(`Ergebnis ${start.bezeichnung} ${regatta.name} ${regatta.jahr}`)}
        >
          Drucken / PDF
        </button>
      </div>
    </div>
  );
}

function GesamtPanel({
  regatta,
  wertungsart,
  onWertungsart,
}: {
  regatta: Regatta;
  wertungsart: Wertungsart;
  onWertungsart: (wert: Wertungsart) => void;
}) {
  const kangaroo = regatta.startmodus === "kangaroo";
  const wertung = berechneGesamtwertung(regatta, wertungsart);
  const aktiveStarts = regatta.starts.filter((s) => s.aktiv).sort((a, b) => a.nummer - b.nummer);

  return (
    <div>
      {!kangaroo && (
        <div className="karteireiter no-print" role="tablist">
          {(Object.keys(WERTUNGSART_LABEL) as Wertungsart[]).map((art) => (
            <button
              key={art}
              type="button"
              role="tab"
              aria-selected={wertungsart === art}
              className={`karteireiter__tab${wertungsart === art ? " is-active" : ""}`}
              onClick={() => onWertungsart(art)}
            >
              {WERTUNGSART_LABEL[art]}
            </button>
          ))}
        </div>
      )}
      <div className={`karteikarte${kangaroo ? " karteikarte--voll" : ""}`}>
      {aktiveStarts.length === 0 ? (
        <p>Noch kein Start zählt zur Gesamtwertung.</p>
      ) : (
        <>
          <div className="tabelle-scroll">
            <table className="tabelle tabelle--mittig">
              <thead>
                <tr>
                  <th>Platz</th>
                  <th className="spalte-links">Boot</th>
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
                    <td className="spalte-links">{zeile.boot.name}</td>
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
    </div>
  );
}

export function Wertungen() {
  const { aktiveRegatta, addStart, updateStart, removeStart, setZeit } = useData();
  const [auswahl, setAuswahl] = useState<string>("gesamt");
  const [tab, setTab] = useState<StartTabId>("zeiten");
  const [wertungsart, setWertungsart] = useState<Wertungsart>("gesegelt");
  const [massenstart, setMassenstart] = useState<number | undefined>(undefined);
  if (!aktiveRegatta) return <KeineRegatta />;

  const regatta = aktiveRegatta;
  const kangaroo = regatta.startmodus === "kangaroo";
  const starts = [...regatta.starts].sort((a, b) => a.nummer - b.nummer);
  const start = starts.find((s) => s.id === auswahl);

  // Die Kachel zeigt je nach Startmodus und Reiter die passenden Felder
  const zeigeMassenstart = !!start && !kangaroo && tab === "zeiten";
  const zeigeKangarooFelder = !!start && kangaroo && tab === "startliste";

  const massenstartUebernehmen = () => {
    if (!start || massenstart === undefined) return;
    const abweichend = regatta.boote.some((b) => {
      const s = regatta.zeiten.find((z) => z.startId === start.id && z.bootId === b.id)?.startzeit;
      return s !== undefined && s !== massenstart;
    });
    if (
      abweichend &&
      !window.confirm("Einzelne Boote haben bereits abweichende Startzeiten — alle überschreiben?")
    ) {
      return;
    }
    for (const boot of regatta.boote) {
      setZeit(start.id, boot.id, { startzeit: massenstart });
    }
  };

  /** Strecke bzw. Schnitt ändern und daraus — wenn beide vorliegen — die
   *  Streckenzeit (Basiszeit) berechnen. */
  const setStrecke = (patch: { streckeNm?: number; schnittKn?: number }) => {
    if (!start) return;
    const streckeNm = "streckeNm" in patch ? patch.streckeNm : start.streckeNm;
    const schnittKn = "schnittKn" in patch ? patch.schnittKn : start.schnittKn;
    const basiszeit = streckenzeitSek(streckeNm, schnittKn);
    updateStart(start.id, {
      streckeNm,
      schnittKn,
      ...(basiszeit !== null ? { basiszeit } : {}),
    });
  };

  // Listentitel unter der Trennlinie — richtet sich nach Auswahl und Reiter,
  // der Kopf darüber bleibt beim Umschalten unverändert stehen.
  let titel: string;
  let untertitel: string | undefined;
  if (!start) {
    const streicher = Math.min(regatta.streicher, maxStreicher(regatta));
    titel = "Gesamtwertung";
    untertitel = `Wertung ${wertungsTitel(regatta, wertungsart)}${
      streicher > 0
        ? ` · ${streicher} Streichergebnis${streicher > 1 ? "se" : ""} (in Klammern)`
        : ""
    }`;
  } else {
    const bezug = `${start.nummer}. Start: ${start.bezeichnung}`;
    if (tab === "startliste") titel = `Startliste ${bezug}`;
    else if (tab === "zeiten") titel = `Zeiterfassung ${bezug}`;
    else {
      titel = `Ergebnisliste ${bezug}`;
      untertitel = `Wertung ${wertungsTitel(regatta, tab === "gesegelt" ? "gesegelt" : "berechnet")}`;
    }
  }

  return (
    <div>
      <PrintKopf
        regatta={regatta}
        seitentitel="Wertungen"
        titel={titel}
        untertitel={untertitel}
      />

      <section className="kachel kachel--nav no-print">
        <div className="chip-row chip-row--kompakt">
          <button
            type="button"
            className={`chip${auswahl === "gesamt" ? " is-active" : ""}`}
            onClick={() => setAuswahl("gesamt")}
          >
            Gesamtwertung
          </button>
          {starts.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip${auswahl === s.id ? " is-active" : ""}${s.aktiv ? "" : " is-inaktiv"}`}
              onClick={() => setAuswahl(s.id)}
            >
              {s.nummer}. {s.bezeichnung}
            </button>
          ))}
          <button type="button" className="chip chip--aktion" onClick={addStart}>
            + Start
          </button>
        </div>
      </section>

      {start ? (
        <section className="kachel start-kachel no-print">
          <div className="start-kachel__grid">
            <label className="start-kachel__bezeichnung">
              <span className="form-label">Bezeichnung</span>
              <input
                value={start.bezeichnung}
                onChange={(e) => updateStart(start.id, { bezeichnung: e.target.value })}
              />
            </label>
            <label className="start-kachel__haken check-label">
              <input
                type="checkbox"
                checked={start.aktiv}
                onChange={(e) => updateStart(start.id, { aktiv: e.target.checked })}
              />
              zählt zur Gesamtwertung
            </label>

            {zeigeMassenstart && (
              <>
                <label className="start-kachel__feld-b1">
                  <span className="form-label">Startzeit für alle :</span>
                  <TimeInput wert={massenstart} onWert={setMassenstart} />
                </label>
                <div className="start-kachel__feld-c1 start-kachel__jetzt">
                  <button type="button" onClick={() => setMassenstart(jetztSekunden())}>
                    Jetzt
                  </button>
                </div>
                <button
                  type="button"
                  className="primary start-kachel__breit"
                  disabled={massenstart === undefined}
                  onClick={massenstartUebernehmen}
                >
                  Für alle übernehmen
                </button>
              </>
            )}

            {zeigeKangarooFelder && (
              <>
                <label className="start-kachel__feld-b1">
                  <span className="form-label">gepl. Startzeit 0-Boot :</span>
                  <TimeInput
                    wert={start.geplanteStartzeit}
                    onWert={(wert) => updateStart(start.id, { geplanteStartzeit: wert })}
                  />
                </label>
                <label className="start-kachel__feld-b2">
                  <span className="form-label">Streckenzeit YS 100 :</span>
                  <TimeInput
                    wert={start.basiszeit}
                    onWert={(wert) => updateStart(start.id, { basiszeit: wert })}
                  />
                </label>
                <label className="start-kachel__feld-c1">
                  <span className="form-label">Strecke :</span>
                  <DezimalInput
                    einheit="nm"
                    wert={start.streckeNm}
                    onWert={(wert) => setStrecke({ streckeNm: wert })}
                  />
                </label>
                <label className="start-kachel__feld-c2">
                  <span className="form-label">⌀ Geschw. :</span>
                  <DezimalInput
                    einheit="kn"
                    wert={start.schnittKn}
                    onWert={(wert) => setStrecke({ schnittKn: wert })}
                  />
                </label>
              </>
            )}

            <div className="start-kachel__loeschen">
              <button
                type="button"
                className="danger"
                onClick={() => {
                  if (window.confirm(`Start „${start.bezeichnung}“ samt Zeiten löschen?`)) {
                    setAuswahl("gesamt");
                    removeStart(start.id);
                  }
                }}
              >
                Start löschen
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Platzhalter gleicher Höhe: so springt der Inhalt beim Umschalten nicht */
        <div className="kachel start-kachel start-kachel--platzhalter no-print" aria-hidden="true" />
      )}

      {start ? (
        <div>
          <div className="karteireiter no-print" role="tablist">
            {START_TABS.map((t) => (
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
          </div>
          <div className="karteikarte">
            {tab === "startliste" && <StartlisteTab regatta={regatta} start={start} />}
            {tab === "zeiten" && <ZeiterfassungTab regatta={regatta} start={start} />}
            {tab === "gesegelt" && (
              <ErgebnisTab regatta={regatta} start={start} wertungsart="gesegelt" />
            )}
            {tab === "berechnet" && (
              <ErgebnisTab regatta={regatta} start={start} wertungsart="berechnet" />
            )}
          </div>
        </div>
      ) : (
        <GesamtPanel
          regatta={regatta}
          wertungsart={wertungsart}
          onWertungsart={setWertungsart}
        />
      )}
    </div>
  );
}
