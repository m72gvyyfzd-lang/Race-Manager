import { useRef, useState } from "react";
import type { Regatta } from "@race-manager/core";
import { beispielRegatta } from "../data/beispiel";
import { SYMBOLE } from "../data/symbole";
import { exportiereRegatta, parseImport } from "../lib/exportImport";
import { useData } from "../state/DataContext";

export function Regatten() {
  const { regatten, aktiveRegatta, setAktiveRegattaId, neueRegatta, importiereRegatta, loescheRegatta } =
    useData();
  const [formOffen, setFormOffen] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState(SYMBOLE[0]);
  const [jahr, setJahr] = useState(new Date().getFullYear());
  const [datum, setDatum] = useState("");
  const dateiInput = useRef<HTMLInputElement>(null);

  const anlegen = () => {
    if (!name.trim()) return;
    const regatta: Regatta = {
      id: crypto.randomUUID(),
      name: name.trim(),
      symbol,
      jahr,
      datum: datum || undefined,
      startmodus: "normal",
      streicher: 0,
      boote: [],
      starts: [],
      zeiten: [],
    };
    neueRegatta(regatta);
    setFormOffen(false);
    setName("");
  };

  const importieren = async (datei: File) => {
    try {
      const regatta = parseImport(await datei.text());
      if (
        regatten.some((r) => r.id === regatta.id) &&
        !window.confirm(`„${regatta.name}“ existiert bereits — beim Import überschreiben?`)
      ) {
        return;
      }
      importiereRegatta(regatta);
    } catch (fehler) {
      window.alert(fehler instanceof Error ? fehler.message : "Import fehlgeschlagen.");
    }
  };

  return (
    <div>
      <h1>Regatten</h1>

      <div className="button-row no-print">
        <button type="button" onClick={() => setFormOffen((o) => !o)}>
          + Neue Regatta
        </button>
        <button type="button" onClick={() => dateiInput.current?.click()}>
          Importieren…
        </button>
        <input
          ref={dateiInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const datei = e.target.files?.[0];
            if (datei) void importieren(datei);
            e.target.value = "";
          }}
        />
        {regatten.length === 0 && (
          <button type="button" onClick={() => importiereRegatta(beispielRegatta())}>
            Beispiel laden (Helgoland Double 2025)
          </button>
        )}
      </div>

      {formOffen && (
        <div className="panel form-grid">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Helgoland Double" />
          </label>
          <label>
            Jahr
            <input
              type="number"
              value={jahr}
              onChange={(e) => setJahr(Number(e.target.value))}
            />
          </label>
          <label>
            Datum
            <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
          </label>
          <div>
            <span className="form-label">Symbol</span>
            <div className="symbol-row">
              {SYMBOLE.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`symbol-btn${s === symbol ? " is-active" : ""}`}
                  onClick={() => setSymbol(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="button-row">
            <button type="button" className="primary" onClick={anlegen} disabled={!name.trim()}>
              Anlegen
            </button>
            <button type="button" onClick={() => setFormOffen(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {regatten.length === 0 && !formOffen && (
        <p>Noch keine Regatta angelegt — starte mit „Neue Regatta“ oder lade das Beispiel.</p>
      )}

      <div className="card-grid">
        {regatten.map((regatta) => (
          <div
            key={regatta.id}
            className={`regatta-card${regatta.id === aktiveRegatta?.id ? " is-active" : ""}`}
            onClick={() => setAktiveRegattaId(regatta.id)}
          >
            <div className="regatta-card__symbol">{regatta.symbol}</div>
            <div className="regatta-card__name">
              {regatta.name} {regatta.jahr}
            </div>
            <div className="regatta-card__meta">
              {regatta.boote.length} Boote · {regatta.starts.length} Starts
              {regatta.startmodus === "kangaroo" ? " · Kangaroo" : ""}
            </div>
            {regatta.id === aktiveRegatta?.id && <div className="regatta-card__badge">aktiv</div>}
            <div className="button-row">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  exportiereRegatta(regatta);
                }}
              >
                Export
              </button>
              <button
                type="button"
                className="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Regatta „${regatta.name} ${regatta.jahr}“ endgültig löschen?`)) {
                    loescheRegatta(regatta.id);
                  }
                }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
