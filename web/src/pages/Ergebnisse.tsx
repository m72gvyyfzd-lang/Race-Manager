import { berechneWertung } from "@race-manager/core";
import { platzierungen, wettfahrten, yachten } from "../data/mockData";

const ANZAHL_STREICHER = 1;

export function Ergebnisse() {
  const wertung = berechneWertung(wettfahrten, platzierungen, yachten, ANZAHL_STREICHER);

  return (
    <div>
      <h1>Ergebnisse</h1>
      <p>Low-Point-Wertung, {ANZAHL_STREICHER} Streichergebnis.</p>
      <table>
        <thead>
          <tr>
            <th>Platz</th>
            <th>Boot</th>
            {wettfahrten.map((w) => (
              <th key={w.id}>{w.bezeichnung}</th>
            ))}
            <th>Gesamt</th>
          </tr>
        </thead>
        <tbody>
          {wertung.map((zeile) => {
            const yacht = yachten.find((y) => y.id === zeile.yachtId);
            return (
              <tr key={zeile.yachtId}>
                <td>{zeile.platz}</td>
                <td>{yacht?.name}</td>
                {wettfahrten.map((w) => {
                  const punkte = zeile.punkteProWettfahrt[w.id];
                  const gestrichen = zeile.gestrichen.includes(w.id);
                  return (
                    <td key={w.id}>
                      {punkte === undefined ? "–" : gestrichen ? `(${punkte})` : punkte}
                    </td>
                  );
                })}
                <td>{zeile.gesamtpunkte}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
