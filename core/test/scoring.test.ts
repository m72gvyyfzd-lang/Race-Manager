import { describe, expect, it } from "vitest";
import { berechneWertung } from "../src/scoring";
import type { Platzierung, Wettfahrt, Yacht } from "../src/types";

const yachten: Yacht[] = [
  { id: "y1", segelnummer: "GER 1", name: "Windgeist", klasse: "ORC", skipper: "A. Berg" },
  { id: "y2", segelnummer: "GER 2", name: "Sturmvogel", klasse: "ORC", skipper: "B. Fluss" },
  { id: "y3", segelnummer: "GER 3", name: "Kiellinie", klasse: "ORC", skipper: "C. Meer" },
];

const wettfahrten: Wettfahrt[] = [
  { id: "w1", nummer: 1, bezeichnung: "Wettfahrt 1", datum: "2026-06-01" },
  { id: "w2", nummer: 2, bezeichnung: "Wettfahrt 2", datum: "2026-06-01" },
  { id: "w3", nummer: 3, bezeichnung: "Wettfahrt 3", datum: "2026-06-02" },
];

describe("berechneWertung", () => {
  it("summiert reguläre Platzierungen ohne Streicher", () => {
    const platzierungen: Platzierung[] = [
      { wettfahrtId: "w1", yachtId: "y1", platz: 1 },
      { wettfahrtId: "w1", yachtId: "y2", platz: 2 },
      { wettfahrtId: "w1", yachtId: "y3", platz: 3 },
      { wettfahrtId: "w2", yachtId: "y1", platz: 2 },
      { wettfahrtId: "w2", yachtId: "y2", platz: 1 },
      { wettfahrtId: "w2", yachtId: "y3", platz: 3 },
    ];

    const wertung = berechneWertung(wettfahrten, platzierungen, yachten);

    expect(wertung.find((z) => z.yachtId === "y1")?.gesamtpunkte).toBe(3);
    expect(wertung.find((z) => z.yachtId === "y2")?.gesamtpunkte).toBe(3);
    expect(wertung.find((z) => z.yachtId === "y3")?.gesamtpunkte).toBe(6);
    // y1 vor y2 (stabile Reihenfolge bei Punktgleichstand, keine Kursregel implementiert)
    expect(wertung[0].yachtId).toBe("y1");
    expect(wertung[2].yachtId).toBe("y3");
    expect(wertung[2].platz).toBe(3);
  });

  it("vergibt Starterzahl+1 Punkte für DNF/DSQ/OCS", () => {
    const platzierungen: Platzierung[] = [
      { wettfahrtId: "w1", yachtId: "y1", platz: 1 },
      { wettfahrtId: "w1", yachtId: "y2", status: "DNF" },
      { wettfahrtId: "w1", yachtId: "y3", platz: 2 },
    ];

    const wertung = berechneWertung(wettfahrten, platzierungen, yachten);

    // 3 Starter in w1 -> DNF zählt 4 Punkte
    expect(wertung.find((z) => z.yachtId === "y2")?.punkteProWettfahrt.w1).toBe(4);
  });

  it("streicht die schlechtesten N Ergebnisse", () => {
    const platzierungen: Platzierung[] = [
      { wettfahrtId: "w1", yachtId: "y1", platz: 1 },
      { wettfahrtId: "w2", yachtId: "y1", platz: 5 },
      { wettfahrtId: "w3", yachtId: "y1", platz: 2 },
    ];

    const wertung = berechneWertung(wettfahrten, platzierungen, yachten, 1);
    const y1 = wertung.find((z) => z.yachtId === "y1")!;

    expect(y1.gestrichen).toEqual(["w2"]);
    expect(y1.gesamtpunkte).toBe(3); // 1 + 2, w2 (Platz 5) gestrichen
  });

  it("ignoriert Wettfahrten, an denen die Yacht nicht gemeldet war", () => {
    const platzierungen: Platzierung[] = [{ wettfahrtId: "w1", yachtId: "y1", platz: 1 }];

    const wertung = berechneWertung(wettfahrten, platzierungen, yachten);
    const y1 = wertung.find((z) => z.yachtId === "y1")!;

    expect(Object.keys(y1.punkteProWettfahrt)).toEqual(["w1"]);
    expect(y1.gesamtpunkte).toBe(1);
  });
});
