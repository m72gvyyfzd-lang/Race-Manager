import type { Platzierung, Wertungszeile, Wettfahrt, Yacht } from "./types";

/**
 * Wertungsberechnung nach dem Low-Point-System (World Sailing RRS Appendix A):
 * Platz 1 = 1 Punkt, Platz 2 = 2 Punkte usw. Yachten ohne regulären Zieldurchgang
 * (DNF/DNS/DSQ/OCS/RET/DNC) erhalten Starterzahl-der-Wettfahrt + 1 Punkte.
 *
 * `anzahlStreicher` (Anzahl der zu streichenden schlechtesten Ergebnisse) wird
 * bewusst als Parameter übergeben statt anhand einer Streichertabelle geraten —
 * die genaue Regel steht in der Segelanweisung der jeweiligen Regatta.
 */
export function berechneWertung(
  wettfahrten: Wettfahrt[],
  platzierungen: Platzierung[],
  yachten: Yacht[],
  anzahlStreicher = 0,
): Wertungszeile[] {
  const starterJeWettfahrt = new Map<string, number>();
  for (const wettfahrt of wettfahrten) {
    const anzahl = platzierungen.filter((p) => p.wettfahrtId === wettfahrt.id).length;
    starterJeWettfahrt.set(wettfahrt.id, anzahl);
  }

  const zeilen: Wertungszeile[] = yachten.map((yacht) => {
    const punkteProWettfahrt: Record<string, number> = {};

    for (const wettfahrt of wettfahrten) {
      const eintrag = platzierungen.find(
        (p) => p.wettfahrtId === wettfahrt.id && p.yachtId === yacht.id,
      );
      if (!eintrag) continue; // nicht gemeldet -> zählt nicht in dieser Wettfahrt

      const starter = starterJeWettfahrt.get(wettfahrt.id) ?? 0;
      punkteProWettfahrt[wettfahrt.id] = eintrag.platz ?? starter + 1;
    }

    const gemeldeteWettfahrten = Object.keys(punkteProWettfahrt);
    const nachPunktenAbsteigend = [...gemeldeteWettfahrten].sort(
      (a, b) => punkteProWettfahrt[b] - punkteProWettfahrt[a],
    );
    const gestrichen = nachPunktenAbsteigend.slice(
      0,
      Math.min(anzahlStreicher, gemeldeteWettfahrten.length),
    );
    const gesamtpunkte = gemeldeteWettfahrten
      .filter((id) => !gestrichen.includes(id))
      .reduce((summe, id) => summe + punkteProWettfahrt[id], 0);

    return { yachtId: yacht.id, punkteProWettfahrt, gestrichen, gesamtpunkte, platz: 0 };
  });

  zeilen.sort((a, b) => a.gesamtpunkte - b.gesamtpunkte);
  zeilen.forEach((zeile, index) => {
    zeile.platz = index + 1;
  });

  return zeilen;
}
