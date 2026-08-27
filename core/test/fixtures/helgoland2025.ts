/**
 * Reale Daten der Helgoland Double 2025 aus dem bisherigen Excel-Tool —
 * dienen als Abnahme-Fixtures: die App muss dieselben Ergebnisse liefern.
 */
import type { Boot, Regatta, Start, Zeiteintrag } from "../../src/types";

const boot = (
  id: string,
  name: string,
  skipper: string,
  crew: string,
  verein: string,
  bootstyp: string,
  yardstick: number,
): Boot => ({
  id,
  name,
  skipper,
  crew,
  verein,
  bootstyp,
  yardstick,
  meldungErhalten: true,
  meldegeldBezahlt: false,
  anzahlEssen: 0,
  essenBezahlt: false,
});

export const boote: Boot[] = [
  boot("allin", "ALL IN", "Nils Theuerkauf", "Thorsten Pösch", "SVB", "Van de Stadt 34", 102),
  boot("cooldown", "COOL DOWN", "Christian Niefert", "Jordi, Julius", "BSV", "Dehler 34", 97),
  boot("elbfuchs", "ELBFUCHS", "Klaus Arndt", "Simon Arndt-Wiebe", "SVB", "Hanse 341", 98),
  boot("eska", "ESKA", "Torge Langmaack", "Reiner Langmaack", "BSV", "First 31.7", 98),
  boot("grandcru", "GRAND CRU", "Reiner Gosch", "Christian Petersen", "SVB", "Dufour 34", 94),
  boot("maxime", "MAXIME", "Michael Warnecke", "1Crew", "SVB", "X-40", 86),
  boot("spontan", "SPONTAN", "Benjamin Petzold", "Thorben Beuth", "SVB", "Luffe 37", 91),
];

export const starts: Start[] = [
  { id: "s1", nummer: 1, bezeichnung: "Brunsbüttel - Stade", aktiv: true },
  { id: "s2", nummer: 2, bezeichnung: "2. Start", aktiv: true },
];

const hms = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;

export const zeiten: Zeiteintrag[] = [
  // 1. Start (ArbeitsListe Spalten S/U)
  { startId: "s1", bootId: "allin", startzeit: hms(15, 40, 23), zielzeit: hms(18, 35, 34) },
  { startId: "s1", bootId: "cooldown", startzeit: hms(15, 37, 0), zielzeit: hms(18, 31, 0) },
  { startId: "s1", bootId: "elbfuchs", startzeit: hms(15, 33, 43), zielzeit: hms(18, 28, 57) },
  { startId: "s1", bootId: "eska", startzeit: hms(15, 35, 38), zielzeit: hms(18, 31, 52) },
  { startId: "s1", bootId: "grandcru", startzeit: hms(15, 54, 49), zielzeit: hms(18, 35, 0) },
  { startId: "s1", bootId: "maxime", startzeit: hms(15, 53, 0), zielzeit: hms(18, 37, 28) },
  { startId: "s1", bootId: "spontan", startzeit: hms(15, 44, 59), zielzeit: hms(18, 33, 53) },
  // 2. Start (ArbeitsListe Spalten AD/AF)
  { startId: "s2", bootId: "allin", startzeit: hms(10, 55, 31), zielzeit: hms(12, 24, 32) },
  { startId: "s2", bootId: "cooldown", startzeit: hms(10, 45, 47), zielzeit: hms(12, 21, 6) },
  { startId: "s2", bootId: "elbfuchs", startzeit: hms(10, 50, 55), zielzeit: hms(12, 13, 27) },
  { startId: "s2", bootId: "eska", startzeit: hms(10, 51, 37), zielzeit: hms(12, 19, 23) },
  { startId: "s2", bootId: "grandcru", startzeit: hms(11, 19, 57), zielzeit: hms(12, 39, 57) },
  { startId: "s2", bootId: "maxime", startzeit: hms(11, 2, 13), zielzeit: hms(12, 23, 20) },
  { startId: "s2", bootId: "spontan", startzeit: hms(10, 50, 34), zielzeit: hms(12, 10, 33) },
];

export const helgoland2025: Regatta = {
  id: "helgoland-2025",
  name: "Helgoland Double",
  symbol: "⛵",
  jahr: 2025,
  datum: "2025-09-14",
  startmodus: "normal",
  streicher: 0,
  boote,
  starts,
  zeiten,
};
