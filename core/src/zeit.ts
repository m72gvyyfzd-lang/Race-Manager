/**
 * Uhrzeiten als Sekunden seit Mitternacht, mit der Ziffern-Schnelleingabe
 * aus dem Excel-Tool: "154023" → 15:40:23.
 */

/**
 * Parst eine Zeiteingabe zu Sekunden seit Mitternacht.
 * Erlaubt "15:40:23", "15:40" sowie reine Ziffern: 6 Stellen HHMMSS,
 * 5 Stellen HMMSS, 4 Stellen HHMM, 3 Stellen HMM, 1–2 Stellen HH.
 * Ungültige Eingaben ergeben null.
 */
export function parseZeitEingabe(eingabe: string): number | null {
  const roh = eingabe.trim();
  if (roh === "") return null;

  let h: number, m: number, s: number;
  if (roh.includes(":") || roh.includes(".")) {
    const teile = roh.split(/[:.]/);
    if (teile.length < 2 || teile.length > 3 || teile.some((t) => !/^\d{1,2}$/.test(t))) {
      return null;
    }
    [h, m, s] = [Number(teile[0]), Number(teile[1]), Number(teile[2] ?? 0)];
  } else {
    if (!/^\d{1,6}$/.test(roh)) return null;
    // HHMMSS von rechts interpretiert: fehlende hintere Blöcke sind 0
    const gefuellt = roh.length <= 2 ? roh + "0000" : roh.length <= 4 ? roh.padStart(4, "0") + "00" : roh.padStart(6, "0");
    h = Number(gefuellt.slice(0, gefuellt.length - 4));
    m = Number(gefuellt.slice(-4, -2));
    s = Number(gefuellt.slice(-2));
  }

  if (h > 23 || m > 59 || s > 59) return null;
  return h * 3600 + m * 60 + s;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Sekunden seit Mitternacht → "15:40:23" */
export function formatUhrzeit(sekunden: number): string {
  const s = Math.round(sekunden) % 86400;
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

/** Dauer in Sekunden → "2:55:11" (Stunden ohne führende Null) */
export function formatDauer(sekunden: number): string {
  const s = Math.round(sekunden);
  return `${Math.floor(s / 3600)}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}
