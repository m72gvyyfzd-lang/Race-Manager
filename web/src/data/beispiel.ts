import type { Boot, Regatta } from "@race-manager/core";

/**
 * Beispiel-Regatta mit den echten Daten der Helgoland Double 2025 aus dem
 * bisherigen Excel-Tool — zum Ausprobieren und zum Abgleich der Ergebnisse.
 */

const boot = (
  id: string,
  name: string,
  skipper: string,
  crew: string,
  verein: string,
  bootstyp: string,
  yardstick: number,
): Boot => ({
  id: `beispiel-${id}`,
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

const hms = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;

export function beispielRegatta(): Regatta {
  return {
    id: "beispiel-helgoland-2025",
    name: "Helgoland Double",
    symbol: "⛵",
    jahr: 2025,
    datum: "2025-09-14",
    startmodus: "normal",
    streicher: 0,
    boote: [
      boot("allin", "ALL IN", "Nils Theuerkauf", "Thorsten Pösch", "SVB", "Van de Stadt 34", 102),
      boot("cooldown", "COOL DOWN", "Christian Niefert", "Jordi, Julius", "BSV", "Dehler 34", 97),
      boot("elbfuchs", "ELBFUCHS", "Klaus Arndt", "Simon Arndt-Wiebe", "SVB", "Hanse 341", 98),
      boot("eska", "ESKA", "Torge Langmaack", "Reiner Langmaack", "BSV", "First 31.7", 98),
      boot("grandcru", "GRAND CRU", "Reiner Gosch", "Christian Petersen", "SVB", "Dufour 34", 94),
      boot("maxime", "MAXIME", "Michael Warnecke", "1Crew", "SVB", "X-40", 86),
      boot("spontan", "SPONTAN", "Benjamin Petzold", "Thorben Beuth", "SVB", "Luffe 37", 91),
    ],
    starts: [
      { id: "beispiel-s1", nummer: 1, bezeichnung: "Brunsbüttel - Stade", aktiv: true },
      { id: "beispiel-s2", nummer: 2, bezeichnung: "2. Start", aktiv: true },
    ],
    zeiten: [
      { startId: "beispiel-s1", bootId: "beispiel-allin", startzeit: hms(15, 40, 23), zielzeit: hms(18, 35, 34) },
      { startId: "beispiel-s1", bootId: "beispiel-cooldown", startzeit: hms(15, 37, 0), zielzeit: hms(18, 31, 0) },
      { startId: "beispiel-s1", bootId: "beispiel-elbfuchs", startzeit: hms(15, 33, 43), zielzeit: hms(18, 28, 57) },
      { startId: "beispiel-s1", bootId: "beispiel-eska", startzeit: hms(15, 35, 38), zielzeit: hms(18, 31, 52) },
      { startId: "beispiel-s1", bootId: "beispiel-grandcru", startzeit: hms(15, 54, 49), zielzeit: hms(18, 35, 0) },
      { startId: "beispiel-s1", bootId: "beispiel-maxime", startzeit: hms(15, 53, 0), zielzeit: hms(18, 37, 28) },
      { startId: "beispiel-s1", bootId: "beispiel-spontan", startzeit: hms(15, 44, 59), zielzeit: hms(18, 33, 53) },
      { startId: "beispiel-s2", bootId: "beispiel-allin", startzeit: hms(10, 55, 31), zielzeit: hms(12, 24, 32) },
      { startId: "beispiel-s2", bootId: "beispiel-cooldown", startzeit: hms(10, 45, 47), zielzeit: hms(12, 21, 6) },
      { startId: "beispiel-s2", bootId: "beispiel-elbfuchs", startzeit: hms(10, 50, 55), zielzeit: hms(12, 13, 27) },
      { startId: "beispiel-s2", bootId: "beispiel-eska", startzeit: hms(10, 51, 37), zielzeit: hms(12, 19, 23) },
      { startId: "beispiel-s2", bootId: "beispiel-grandcru", startzeit: hms(11, 19, 57), zielzeit: hms(12, 39, 57) },
      { startId: "beispiel-s2", bootId: "beispiel-maxime", startzeit: hms(11, 2, 13), zielzeit: hms(12, 23, 20) },
      { startId: "beispiel-s2", bootId: "beispiel-spontan", startzeit: hms(10, 50, 34), zielzeit: hms(12, 10, 33) },
    ],
  };
}
