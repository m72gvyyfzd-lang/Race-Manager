import { useRef, useState } from "react";
import type { Regatta } from "@race-manager/core";
import { RegattaSymbol } from "../components/RegattaSymbol";
import { beispielRegatta } from "../data/beispiel";
import { REGATTA_LOGOS } from "../data/logos";
import {
  backupIstVeraltet,
  exportiereAlle,
  exportiereRegatta,
  letztesBackup,
  parseImport,
} from "../lib/exportImport";
import { useData } from "../state/DataContext";

export function Regatten() {
  const {
    regatten,
    aktiveRegatta,
    setAktiveRegattaId,
    neueRegatta,
    importiereRegatta,
    importiereRegatten,
    loescheRegatta,
  } = useData();
  const [formOffen, setFormOffen] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState(REGATTA_LOGOS[0].id);
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
      const importListe = parseImport(await datei.text());
      // Vorschau: was steckt in der Datei, was würde ersetzt?
      const zeilen = importListe.map((r) => {
        const vorhanden = regatten.some((x) => x.id === r.id);
        return `• ${r.name} ${r.jahr} — ${r.boote.length} Boote, ${r.starts.length} Starts${
          vorhanden ? " (ersetzt vorhandene Regatta!)" : " (neu)"
        }`;
      });
      const ok = window.confirm(
        `Diese Datei enthält:\n\n${zeilen.join("\n")}\n\nImportieren?`,
      );
      if (!ok) return;
      importiereRegatten(importListe);
    } catch (fehler) {
      window.alert(fehler instanceof Error ? fehler.message : "Import fehlgeschlagen.");
    }
  };

  // backupTick erzwingt nach einem Export das Neu-Lesen des Backup-Zeitpunkts
  const [, setBackupTick] = useState(0);
  const backup = letztesBackup();
  const backupVeraltet = backupIstVeraltet();

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
        {regatten.length > 0 && (
          <button
            type="button"
            onClick={() => {
              exportiereAlle(regatten);
              setBackupTick((t) => t + 1);
            }}
          >
            Backup: alle exportieren
          </button>
        )}
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

      {regatten.length > 0 && (
        <p className={`hinweis no-print${backupVeraltet ? " hinweis--warnung" : ""}`}>
          {backup
            ? `Letztes Backup: ${backup.toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}`
            : "Noch kein Backup exportiert"}
          {backupVeraltet && " — die Daten liegen nur in diesem Browser, bitte exportieren!"}
        </p>
      )}

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
            <span className="form-label">Regatta-Logo</span>
            <div className="symbol-row">
              {REGATTA_LOGOS.map((logo) => (
                <button
                  key={logo.id}
                  type="button"
                  title={logo.name}
                  className={`symbol-btn${logo.id === symbol ? " is-active" : ""}`}
                  onClick={() => setSymbol(logo.id)}
                >
                  <img src={logo.url} alt={logo.name} />
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
            <div className="regatta-card__symbol">
              <RegattaSymbol symbol={regatta.symbol} className="regatta-card__symbol-bild" />
            </div>
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
                  setBackupTick((t) => t + 1);
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
