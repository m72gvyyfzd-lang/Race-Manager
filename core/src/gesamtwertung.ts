import { berechneStartErgebnis } from "./wettfahrt";
import type { Boot, Regatta, Sonderstatus, Start, Wertungsart } from "./types";

export interface GesamtEinzelwertung {
  start: Start;
  punkte: number;
  status?: Sonderstatus;
  gestrichen: boolean;
}

export interface GesamtZeile {
  boot: Boot;
  einzel: GesamtEinzelwertung[];
  gesamtpunkte: number;
  platz: number;
}

/** Wirksame Streicheranzahl: gewünschte Zahl, gedeckelt auf aktive Starts − 2. */
export function maxStreicher(regatta: Regatta): number {
  return Math.max(0, regatta.starts.filter((s) => s.aktiv).length - 2);
}

/**
 * Gesamtwertung der Serie (Low-Point über alle aktiven Starts, minus
 * Streichergebnisse). Punktgleichstand wird nach RRS Anhang A8 gebrochen:
 * erst die sortierten Einzelergebnisse ohne Streicher vergleichen (A8.1),
 * dann entscheidet die letzte Wettfahrt (A8.2).
 */
export function berechneGesamtwertung(regatta: Regatta, wertungsart: Wertungsart): GesamtZeile[] {
  const aktiveStarts = regatta.starts.filter((s) => s.aktiv).sort((a, b) => a.nummer - b.nummer);
  const streicher = Math.min(Math.max(0, regatta.streicher), maxStreicher(regatta));

  const punkteJeStart = aktiveStarts.map((start) => ({
    start,
    ergebnis: berechneStartErgebnis(regatta, start, wertungsart),
  }));

  const zeilen: GesamtZeile[] = regatta.boote.map((boot) => {
    const einzel: GesamtEinzelwertung[] = punkteJeStart.map(({ start, ergebnis }) => {
      const zeile = ergebnis.find((z) => z.boot.id === boot.id)!;
      return { start, punkte: zeile.punkte, status: zeile.status, gestrichen: false };
    });

    // Die schlechtesten N Ergebnisse streichen
    [...einzel]
      .sort((a, b) => b.punkte - a.punkte)
      .slice(0, streicher)
      .forEach((e) => {
        e.gestrichen = true;
      });

    const gesamtpunkte = einzel.filter((e) => !e.gestrichen).reduce((sum, e) => sum + e.punkte, 0);
    return { boot, einzel, gesamtpunkte, platz: 0 };
  });

  const wertungspunkte = (zeile: GesamtZeile): number[] =>
    zeile.einzel.filter((e) => !e.gestrichen).map((e) => e.punkte);

  zeilen.sort((a, b) => {
    if (a.gesamtpunkte !== b.gesamtpunkte) return a.gesamtpunkte - b.gesamtpunkte;
    // RRS A8.1: Einzelergebnisse (ohne Streicher) aufsteigend vergleichen
    const punkteA = wertungspunkte(a).sort((x, y) => x - y);
    const punkteB = wertungspunkte(b).sort((x, y) => x - y);
    for (let i = 0; i < Math.min(punkteA.length, punkteB.length); i++) {
      if (punkteA[i] !== punkteB[i]) return punkteA[i] - punkteB[i];
    }
    // RRS A8.2: von der letzten Wettfahrt rückwärts vergleichen (inkl. Streicher)
    for (let i = a.einzel.length - 1; i >= 0; i--) {
      const diff = a.einzel[i].punkte - b.einzel[i].punkte;
      if (diff !== 0) return diff;
    }
    return a.boot.name.localeCompare(b.boot.name, "de");
  });

  // RRS A8 bricht jeden Gleichstand — die Plätze laufen einfach durch.
  zeilen.forEach((zeile, index) => {
    zeile.platz = index + 1;
  });

  return zeilen;
}
