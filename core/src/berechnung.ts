/** Zeitberechnung: gesegelte und Yardstick-berechnete Zeit. */

/**
 * Gesegelte Zeit in Sekunden. Liegt die Zielzeit vor der Startzeit,
 * wird ein Lauf über Mitternacht angenommen (+24 h) — das Excel-Tool
 * konnte das nicht, produzierte dann einen Fehler.
 */
export function gesegelteZeitSek(startzeit: number, zielzeit: number): number {
  const diff = zielzeit - startzeit;
  return diff < 0 ? diff + 86400 : diff;
}

/**
 * Yardstick-berechnete Zeit: gesegelte Sekunden × 100 / Yardstickzahl,
 * kaufmännisch auf ganze Sekunden gerundet. (Das Excel rundete durch seine
 * INT-Kaskade uneinheitlich; die gespeicherten Werte weichen dadurch
 * vereinzelt um 1 s ab.)
 */
export function berechneteZeitSek(gesegeltSek: number, yardstick: number): number {
  return Math.round((gesegeltSek * 100) / yardstick);
}
