import { describe, expect, it } from "vitest";
import { berechneGesamtwertung, maxStreicher } from "../src/gesamtwertung";
import { helgoland2025 } from "./fixtures/helgoland2025";

describe("berechneGesamtwertung — Abnahme gegen Excel (Helgoland Double 2025)", () => {
  it("liefert die Gesamtpunkte nach gesegelter Zeit aus dem Gesamtergebnis-Blatt", () => {
    const wertung = berechneGesamtwertung(helgoland2025, "gesegelt");
    const punkte = (name: string) => wertung.find((z) => z.boot.name === name)!.gesamtpunkte;
    expect(punkte("GRAND CRU")).toBe(3); // 1 + 2
    expect(punkte("SPONTAN")).toBe(4); // 3 + 1
    expect(punkte("MAXIME")).toBe(5); // 2 + 3
    expect(punkte("ELBFUCHS")).toBe(10); // 6 + 4
    expect(punkte("ALL IN")).toBe(11); // 5 + 6
    expect(punkte("COOL DOWN")).toBe(11); // 4 + 7
    expect(punkte("ESKA")).toBe(12); // 7 + 5
  });

  it("bricht Punktgleichstand nach RRS A8.1 (bestes Einzelergebnis)", () => {
    const wertung = berechneGesamtwertung(helgoland2025, "gesegelt");
    // ALL IN (5+6) und COOL DOWN (4+7) haben je 11 Punkte —
    // COOL DOWN hat das bessere Einzelergebnis (4) und gewinnt den Vergleich.
    // (Das Excel war hier von Hand sortiert und hatte ALL IN vorn.)
    expect(wertung.map((z) => z.boot.name)).toEqual([
      "GRAND CRU",
      "SPONTAN",
      "MAXIME",
      "ELBFUCHS",
      "COOL DOWN",
      "ALL IN",
      "ESKA",
    ]);
    expect(wertung.map((z) => z.platz)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("liefert die Gesamtwertung nach berechneter Zeit inkl. A8.1-Entscheid", () => {
    const wertung = berechneGesamtwertung(helgoland2025, "berechnet");
    // SPONTAN (6+4) vor ESKA (5+5): beide 10 Punkte, SPONTAN hat die bessere 4.
    expect(wertung.map((z) => z.boot.name)).toEqual([
      "GRAND CRU",
      "ELBFUCHS",
      "ALL IN",
      "SPONTAN",
      "ESKA",
      "COOL DOWN",
      "MAXIME",
    ]);
  });

  it("greift bei identischen Einzelergebnissen auf die letzte Wettfahrt zurück (A8.2)", () => {
    const regatta = structuredClone(helgoland2025);
    // ESKA-Zeiten so setzen, dass ESKA im 1. Start Platz 5 und im 2. Start Platz 6 holt
    // → gleiche Einzelergebnisse {5,6} wie ALL IN, aber ALL IN ist im 2. Start besser (6 < ... )
    const s1 = regatta.zeiten.find((z) => z.startId === "s1" && z.bootId === "eska")!;
    const s2 = regatta.zeiten.find((z) => z.startId === "s2" && z.bootId === "eska")!;
    // Platz 5 im 1. Start: zwischen ALL IN (2:55:11) — ESKA bekommt 2:55:12,
    // damit ALL IN Platz 5 → nein: wir tauschen gezielt. Einfacher:
    // ESKA gesegelt 2:55:12 → hinter ALL IN (5) = Platz 6; ALL IN behält 5.
    s1.startzeit = 15 * 3600;
    s1.zielzeit = s1.startzeit + (2 * 3600 + 55 * 60 + 12);
    // 2. Start: ESKA auf Platz 5 vor ALL IN (1:29:01) → 1:28:00 = Platz 5, ALL IN Platz 6
    s2.startzeit = 10 * 3600;
    s2.zielzeit = s2.startzeit + (1 * 3600 + 28 * 60);

    const wertung = berechneGesamtwertung(regatta, "gesegelt");
    const eska = wertung.find((z) => z.boot.name === "ESKA")!;
    const allin = wertung.find((z) => z.boot.name === "ALL IN")!;
    expect(eska.gesamtpunkte).toBe(11); // 6 + 5
    expect(allin.gesamtpunkte).toBe(11); // 5 + 6
    // A8.1 unentschieden ({5,6} beidseitig) → A8.2: letzte Wettfahrt: ESKA 5 < ALL IN 6
    expect(wertung.indexOf(eska)).toBeLessThan(wertung.indexOf(allin));
  });

  it("streicht die schlechtesten Ergebnisse, gedeckelt auf aktive Starts − 2", () => {
    const regatta = structuredClone(helgoland2025);
    expect(maxStreicher(regatta)).toBe(0);
    regatta.streicher = 1; // wird gedeckelt: bei 2 aktiven Starts kein Streicher
    let wertung = berechneGesamtwertung(regatta, "gesegelt");
    expect(wertung.find((z) => z.boot.name === "ESKA")!.gesamtpunkte).toBe(12);

    // 3. Start ergänzen: identische Zeiten wie der 2. Start
    regatta.starts.push({ id: "s3", nummer: 3, bezeichnung: "3. Start", aktiv: true });
    regatta.zeiten.push(
      ...regatta.zeiten
        .filter((z) => z.startId === "s2")
        .map((z) => ({ ...z, startId: "s3" })),
    );
    expect(maxStreicher(regatta)).toBe(1);
    wertung = berechneGesamtwertung(regatta, "gesegelt");
    const eska = wertung.find((z) => z.boot.name === "ESKA")!;
    // ESKA: 7 + 5 + 5 → 7 gestrichen → 10
    expect(eska.gesamtpunkte).toBe(10);
    expect(eska.einzel.filter((e) => e.gestrichen).map((e) => e.punkte)).toEqual([7]);
  });

  it("ignoriert nicht gewertete Starts", () => {
    const regatta = structuredClone(helgoland2025);
    regatta.starts[1].aktiv = false;
    const wertung = berechneGesamtwertung(regatta, "gesegelt");
    expect(wertung.find((z) => z.boot.name === "GRAND CRU")!.gesamtpunkte).toBe(1);
    expect(wertung[0].einzel).toHaveLength(1);
  });
});
