import type { Platzierung, Wettfahrt, Yacht } from "@race-manager/core";

/**
 * Frei erfundene Platzhalterdaten, bis die echte Bootsliste/Wertung
 * (aus der Excel-Vorlage) angebunden ist.
 */
export const yachten: Yacht[] = [
  { id: "y1", segelnummer: "GER 401", name: "Windgeist", klasse: "ORC", skipper: "A. Berg" },
  { id: "y2", segelnummer: "GER 217", name: "Sturmvogel", klasse: "ORC", skipper: "B. Fluss" },
  { id: "y3", segelnummer: "GER 88", name: "Kiellinie", klasse: "Yardstick", skipper: "C. Meer" },
  { id: "y4", segelnummer: "GER 12", name: "Nordlicht", klasse: "Yardstick", skipper: "D. Wind" },
];

export const wettfahrten: Wettfahrt[] = [
  { id: "w1", nummer: 1, bezeichnung: "Wettfahrt 1", datum: "2026-06-06" },
  { id: "w2", nummer: 2, bezeichnung: "Wettfahrt 2", datum: "2026-06-06" },
  { id: "w3", nummer: 3, bezeichnung: "Wettfahrt 3", datum: "2026-06-07" },
];

export const platzierungen: Platzierung[] = [
  { wettfahrtId: "w1", yachtId: "y1", platz: 1 },
  { wettfahrtId: "w1", yachtId: "y2", platz: 2 },
  { wettfahrtId: "w1", yachtId: "y3", platz: 3 },
  { wettfahrtId: "w1", yachtId: "y4", platz: 4 },

  { wettfahrtId: "w2", yachtId: "y1", platz: 2 },
  { wettfahrtId: "w2", yachtId: "y2", platz: 1 },
  { wettfahrtId: "w2", yachtId: "y3", status: "DNF" },
  { wettfahrtId: "w2", yachtId: "y4", platz: 3 },

  { wettfahrtId: "w3", yachtId: "y1", platz: 1 },
  { wettfahrtId: "w3", yachtId: "y2", platz: 3 },
  { wettfahrtId: "w3", yachtId: "y3", platz: 2 },
  { wettfahrtId: "w3", yachtId: "y4", platz: 4 },
];
