import type { Boot } from "./types";

export interface KangarooStartzeile {
  boot: Boot;
  /** Verzögerung gegenüber der geplanten (ersten) Startzeit in Sekunden */
  offsetSek: number;
  /** Individuelle Startzeit in Sek. seit Mitternacht */
  startzeit: number;
}

/**
 * Kangaroo-Start (Verfolgungsstart): Das langsamste Boot (höchster Yardstick)
 * startet zur geplanten Startzeit, jedes schnellere Boot um
 * basiszeit × (YS_max − YS) / 100 später — bei korrekten Yardstickzahlen
 * kommen dann rechnerisch alle gleichzeitig ins Ziel, der Zieleinlauf
 * ist die Platzierung.
 *
 * @param basiszeit kalkulierte Streckenzeit eines Yardstick-100-Boots in Sekunden
 */
export function kangarooStartzeiten(
  boote: Boot[],
  geplanteStartzeit: number,
  basiszeit: number,
): KangarooStartzeile[] {
  const maxYs = Math.max(...boote.map((b) => b.yardstick));
  return boote
    .map((boot) => {
      const offsetSek = Math.round((basiszeit * (maxYs - boot.yardstick)) / 100);
      return { boot, offsetSek, startzeit: geplanteStartzeit + offsetSek };
    })
    .sort((a, b) => a.offsetSek - b.offsetSek || a.boot.name.localeCompare(b.boot.name, "de"));
}
