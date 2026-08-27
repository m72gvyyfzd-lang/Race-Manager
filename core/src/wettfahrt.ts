import { berechneteZeitSek, gesegelteZeitSek } from "./berechnung";
import { kangarooStartzeiten } from "./kangaroo";
import type { Boot, Regatta, Sonderstatus, Start, Wertungsart, Zeiteintrag } from "./types";

export interface ErgebnisZeile {
  boot: Boot;
  startzeit?: number;
  zielzeit?: number;
  gesegeltSek?: number;
  berechnetSek?: number;
  /** Gesetzt statt Platz, wenn das Boot nicht regulär im Ziel war.
   *  Boote ganz ohne Zeiten/Status werden als DNC gewertet. */
  status?: Sonderstatus;
  /** Zielplatz, nur für regulär gewertete Boote */
  platz?: number;
  /** Low-Point: Platz, bzw. gemeldete Boote + 1 bei Sonderstatus (RRS A5) */
  punkte: number;
  /** true, wenn die Punkte manuell von der Wettfahrtleitung vergeben wurden */
  punkteManuell?: boolean;
  /** Bemerkung der Wettfahrtleitung aus dem Zeiteintrag */
  bemerkung?: string;
}

function eintragFuer(regatta: Regatta, start: Start, bootId: string): Zeiteintrag | undefined {
  return regatta.zeiten.find((z) => z.startId === start.id && z.bootId === bootId);
}

/**
 * Effektive Startzeit eines Boots: die erfasste Zeit, im Kangaroo-Modus
 * ersatzweise die berechnete individuelle Startzeit.
 */
export function effektiveStartzeit(
  regatta: Regatta,
  start: Start,
  bootId: string,
): number | undefined {
  const eintrag = eintragFuer(regatta, start, bootId);
  if (eintrag?.startzeit !== undefined) return eintrag.startzeit;
  if (
    regatta.startmodus === "kangaroo" &&
    start.geplanteStartzeit !== undefined &&
    start.basiszeit !== undefined
  ) {
    return kangarooStartzeiten(regatta.boote, start.geplanteStartzeit, start.basiszeit).find(
      (z) => z.boot.id === bootId,
    )?.startzeit;
  }
  return undefined;
}

/**
 * Ergebnisliste eines Starts. Sortiert nach der maßgeblichen Zeit der
 * Wertungsart — im Kangaroo-Modus nach Zieleinlauf (die Vergütung steckt
 * dort bereits in der Startverzögerung, beide Wertungsarten sind identisch).
 * Zeitgleiche Boote teilen sich Platz und Punkte, die Folgeplätze werden
 * übersprungen. Sonderstatus-Boote stehen am Ende mit "gemeldete Boote + 1"
 * Punkten; Boote ohne Zeiten und Status zählen als DNC.
 */
export function berechneStartErgebnis(
  regatta: Regatta,
  start: Start,
  wertungsart: Wertungsart,
): ErgebnisZeile[] {
  const zeilen: ErgebnisZeile[] = regatta.boote.map((boot) => {
    const eintrag = eintragFuer(regatta, start, boot.id);
    const startzeit = effektiveStartzeit(regatta, start, boot.id);
    const zielzeit = eintrag?.zielzeit;
    const zeile: ErgebnisZeile = {
      boot,
      startzeit,
      zielzeit,
      punkte: 0,
      bemerkung: eintrag?.bemerkung,
    };

    if (eintrag?.status) {
      zeile.status = eintrag.status;
    } else if (startzeit === undefined || zielzeit === undefined) {
      zeile.status = "DNC";
    } else {
      zeile.gesegeltSek = gesegelteZeitSek(startzeit, zielzeit);
      zeile.berechnetSek = berechneteZeitSek(zeile.gesegeltSek, boot.yardstick);
    }
    return zeile;
  });

  const massgeblich = (z: ErgebnisZeile): number =>
    regatta.startmodus === "kangaroo"
      ? z.zielzeit!
      : wertungsart === "gesegelt"
        ? z.gesegeltSek!
        : z.berechnetSek!;

  const gewertet = zeilen
    .filter((z) => !z.status)
    .sort((a, b) => massgeblich(a) - massgeblich(b));
  const rest = zeilen
    .filter((z) => z.status)
    .sort((a, b) => a.boot.name.localeCompare(b.boot.name, "de"));

  gewertet.forEach((zeile, index) => {
    const vorgaenger = gewertet[index - 1];
    zeile.platz =
      vorgaenger && massgeblich(vorgaenger) === massgeblich(zeile) ? vorgaenger.platz! : index + 1;
    zeile.punkte = zeile.platz;
  });
  for (const zeile of rest) {
    zeile.punkte = regatta.boote.length + 1;
  }

  // Manuelle Punktvergabe der Wettfahrtleitung sticht die Berechnung
  for (const zeile of [...gewertet, ...rest]) {
    const eintrag = eintragFuer(regatta, start, zeile.boot.id);
    if (eintrag?.punkteManuell !== undefined) {
      zeile.punkte = eintrag.punkteManuell;
      zeile.punkteManuell = true;
    }
  }

  return [...gewertet, ...rest];
}
