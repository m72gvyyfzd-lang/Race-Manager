import { useRef, useState } from "react";
import type { Regatta } from "@race-manager/core";
import { RegattaSymbol } from "../components/RegattaSymbol";
import { beispielRegatta } from "../data/beispiel";
import { REGATTA_LOGOS, VERANSTALTER_LOGOS } from "../data/logos";
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
  const [jahr, setJahr] = useState("");
  const [datum, setDatum] = useState("");
  const [symbol, setSymbol] = useState("");
  const [veranstalterLogo, setVeranstalterLogo] = useState<string | undefined>(undefined);
  const dateiInput = useRef<HTMLInputElement>(null);

  // backupTick erzwingt nach einem Export das Neu-Lesen des Backup-Zeitpunkts
  const [, setBackupTick] = useState(0);
  const backup = letztesBackup();
  const backupVeraltet = backupIstVeraltet();

  const formZuruecksetzen = () => {
    setFormOffen(false);
    setName("");
    setJahr("");
    setDatum("");
    setSymbol("");
    setVeranstalterLogo(undefined);
  };

  const anlegen = () => {
    if (!name.trim()) return;
    const regatta: Regatta = {
      id: crypto.randomUUID(),
      name: name.trim(),
      symbol,
      veranstalterLogo,
      jahr: Number(jahr) || new Date().getFullYear(),
      datum: datum || undefined,
      startmodus: "normal",
      streicher: 0,
      boote: [],
      starts: [],
      zeiten: [],
    };
    neueRegatta(regatta);
    formZuruecksetzen();
  };

  const importieren = async (datei: File) => {
    try {
      const importListe = parseImport(await datei.text());
      const zeilen = importListe.map((r) => {
        const vorhanden = regatten.some((x) => x.id === r.id);
        return `• ${r.name} ${r.jahr} — ${r.boote.length} Boote, ${r.starts.length} Starts${
          vorhanden ? " (ersetzt vorhandene Regatta!)" : " (neu)"
        }`;
      });
      const ok = window.confirm(`Diese Datei enthält:\n\n${zeilen.join("\n")}\n\nImportieren?`);
      if (!ok) return;
      importiereRegatten(importListe);
    } catch (fehler) {
      window.alert(fehler instanceof Error ? fehler.message : "Import fehlgeschlagen.");
    }
  };

  return (
    <div>
      <h1 className="titel-zentriert">Regatta Management</h1>

      <div className="kachel-grid no-print">
        <section className="kachel">
          <div className="kachel__kopf">
            <h2>Neue Regatta</h2>
            <button
              type="button"
              className="primary"
              onClick={() => (formOffen ? formZuruecksetzen() : setFormOffen(true))}
            >
              + neue Regatta
            </button>
          </div>

          {formOffen ? (
            <>
              <div className="neue-regatta__ebene1">
                <input
                  className="eingabe-zentriert neue-regatta__name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name der Regatta"
                />
                <input
                  className="eingabe-zentriert neue-regatta__jahr"
                  type="number"
                  value={jahr}
                  onChange={(e) => setJahr(e.target.value)}
                  placeholder="Jahr"
                />
              </div>

              <div className="neue-regatta__ebene2">
                <div>
                  <span className="form-label">Datum</span>
                  <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
                </div>
                <div>
                  <span className="form-label">Veranstalter-Logo</span>
                  <div className="symbol-row">
                    <button
                      type="button"
                      className={`symbol-btn${veranstalterLogo === undefined ? " is-active" : ""}`}
                      onClick={() => setVeranstalterLogo(undefined)}
                    >
                      ohne
                    </button>
                    {VERANSTALTER_LOGOS.map((logo) => (
                      <button
                        key={logo.id}
                        type="button"
                        title={logo.name}
                        className={`symbol-btn${logo.id === veranstalterLogo ? " is-active" : ""}`}
                        onClick={() => setVeranstalterLogo(logo.id)}
                      >
                        <img src={logo.url} alt={logo.name} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="form-label">Regatta-Logo</span>
                  <div className="symbol-row">
                    <button
                      type="button"
                      className={`symbol-btn${symbol === "" ? " is-active" : ""}`}
                      onClick={() => setSymbol("")}
                    >
                      ohne
                    </button>
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
              </div>

              <div className="neue-regatta__ebene3">
                <button type="button" onClick={formZuruecksetzen}>
                  Abbrechen
                </button>
                <button type="button" className="primary" onClick={anlegen} disabled={!name.trim()}>
                  Anlegen
                </button>
              </div>
            </>
          ) : (
            <p className="hinweis">
              Lege eine neue Regatta mit Name, Jahr, Datum und Logos an — der Button rechts
              öffnet das Formular.
            </p>
          )}
        </section>

        <section className="kachel">
          <div className="kachel__kopf">
            <h2>Import / Export</h2>
          </div>
          <p className="hinweis">
            Regatten als JSON-Datei sichern und auf einem anderen Gerät mit derselben App
            wieder importieren. Einzelne Regatten exportierst du direkt an ihrer Karte unten.
          </p>
          <div className="button-row">
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
            {regatten.length === 0 && (
              <button type="button" onClick={() => importiereRegatta(beispielRegatta())}>
                Beispiel laden (Helgoland Double 2025)
              </button>
            )}
          </div>
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
          {regatten.length > 0 && (
            <p className={`hinweis kachel__fuss${backupVeraltet ? " hinweis--warnung" : ""}`}>
              {backup
                ? `Letztes Backup: ${backup.toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}`
                : "Noch kein Backup exportiert"}
              {backupVeraltet && " — die Daten liegen nur in diesem Browser, bitte exportieren!"}
            </p>
          )}
        </section>
      </div>

      <hr className="trenner no-print" />

      {regatten.length === 0 && !formOffen && (
        <p>Noch keine Regatta angelegt — starte mit „+ neue Regatta“ oder lade das Beispiel.</p>
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
