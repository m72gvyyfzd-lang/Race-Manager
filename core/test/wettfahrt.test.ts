import { describe, expect, it } from "vitest";
import { berechneStartErgebnis } from "../src/wettfahrt";
import { formatDauer } from "../src/zeit";
import { helgoland2025 } from "./fixtures/helgoland2025";

const start1 = helgoland2025.starts[0];

describe("berechneStartErgebnis — Abnahme gegen Excel (1. Start Helgoland Double 2025)", () => {
  it("liefert die gesegelten Zeiten aus der ArbeitsListe", () => {
    const ergebnis = berechneStartErgebnis(helgoland2025, start1, "gesegelt");
    const zeit = (name: string) =>
      formatDauer(ergebnis.find((z) => z.boot.name === name)!.gesegeltSek!);
    expect(zeit("ALL IN")).toBe("2:55:11");
    expect(zeit("COOL DOWN")).toBe("2:54:00");
    expect(zeit("ELBFUCHS")).toBe("2:55:14");
    expect(zeit("ESKA")).toBe("2:56:14");
    expect(zeit("GRAND CRU")).toBe("2:40:11");
    // Excel zeigte 2:43:48 — dessen Cache war veraltet: die gespeicherten
    // Eingaben (15:53:00 → 18:37:28) ergeben 2:44:28.
    expect(zeit("MAXIME")).toBe("2:44:28");
    expect(zeit("SPONTAN")).toBe("2:48:54");
  });

  it("liefert die Yardstick-berechneten Zeiten (kaufmännisch gerundet)", () => {
    const ergebnis = berechneStartErgebnis(helgoland2025, start1, "berechnet");
    const zeit = (name: string) =>
      formatDauer(ergebnis.find((z) => z.boot.name === name)!.berechnetSek!);
    expect(zeit("GRAND CRU")).toBe("2:50:24");
    expect(zeit("ELBFUCHS")).toBe("2:58:49");
    expect(zeit("COOL DOWN")).toBe("2:59:23");
    expect(zeit("ESKA")).toBe("2:59:50");
    expect(zeit("SPONTAN")).toBe("3:05:36");
    // Excel-Cache veraltet (siehe gesegelte Zeit): 9868 s × 100 / 86 = 11474
    expect(zeit("MAXIME")).toBe("3:11:14");
    expect(zeit("ALL IN")).toBe("2:51:45");
  });

  it("platziert nach gesegelter Zeit wie das Excel-Ergebnisblatt", () => {
    const ergebnis = berechneStartErgebnis(helgoland2025, start1, "gesegelt");
    expect(ergebnis.map((z) => z.boot.name)).toEqual([
      "GRAND CRU",
      "MAXIME",
      "SPONTAN",
      "COOL DOWN",
      "ALL IN",
      "ELBFUCHS",
      "ESKA",
    ]);
    expect(ergebnis.map((z) => z.punkte)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("platziert nach berechneter Zeit wie das Excel-Ergebnisblatt", () => {
    const ergebnis = berechneStartErgebnis(helgoland2025, start1, "berechnet");
    expect(ergebnis.map((z) => z.boot.name)).toEqual([
      "GRAND CRU",
      "ALL IN",
      "ELBFUCHS",
      "COOL DOWN",
      "ESKA",
      "SPONTAN",
      "MAXIME",
    ]);
  });
});

describe("berechneStartErgebnis — Sonderfälle", () => {
  it("wertet Sonderstatus und fehlende Zeiten mit 'gemeldete Boote + 1' Punkten", () => {
    const regatta = structuredClone(helgoland2025);
    const eintrag = regatta.zeiten.find((z) => z.startId === "s1" && z.bootId === "maxime")!;
    eintrag.status = "DNF";
    regatta.zeiten = regatta.zeiten.filter((z) => !(z.startId === "s1" && z.bootId === "eska"));

    const ergebnis = berechneStartErgebnis(regatta, regatta.starts[0], "gesegelt");
    const maxime = ergebnis.find((z) => z.boot.name === "MAXIME")!;
    const eska = ergebnis.find((z) => z.boot.name === "ESKA")!;

    expect(maxime.status).toBe("DNF");
    expect(maxime.punkte).toBe(8);
    expect(maxime.platz).toBeUndefined();
    expect(eska.status).toBe("DNC");
    expect(eska.punkte).toBe(8);
    // reguläre Boote rücken auf
    expect(ergebnis.filter((z) => !z.status).map((z) => z.punkte)).toEqual([1, 2, 3, 4, 5]);
  });

  it("teilt Platz und Punkte bei Zeitgleichheit und überspringt Folgeplätze", () => {
    const regatta = structuredClone(helgoland2025);
    // COOL DOWN auf exakt die gesegelte Zeit von GRAND CRU setzen (2:40:11)
    const eintrag = regatta.zeiten.find((z) => z.startId === "s1" && z.bootId === "cooldown")!;
    eintrag.startzeit = 15 * 3600 + 37 * 60;
    eintrag.zielzeit = eintrag.startzeit + (2 * 3600 + 40 * 60 + 11);

    const ergebnis = berechneStartErgebnis(regatta, regatta.starts[0], "gesegelt");
    expect(ergebnis[0].platz).toBe(1);
    expect(ergebnis[1].platz).toBe(1);
    expect(ergebnis[2].platz).toBe(3);
  });

  it("wertet auch RET und OCS mit 'gemeldete Boote + 1' Punkten", () => {
    const regatta = structuredClone(helgoland2025);
    regatta.zeiten.find((z) => z.startId === "s1" && z.bootId === "maxime")!.status = "OCS";
    regatta.zeiten.find((z) => z.startId === "s1" && z.bootId === "eska")!.status = "RET";

    const ergebnis = berechneStartErgebnis(regatta, regatta.starts[0], "gesegelt");
    expect(ergebnis.find((z) => z.boot.name === "MAXIME")!.punkte).toBe(8);
    expect(ergebnis.find((z) => z.boot.name === "ESKA")!.punkte).toBe(8);
  });

  it("lässt manuelle Punktvergabe die Berechnung überschreiben", () => {
    const regatta = structuredClone(helgoland2025);
    const eintrag = regatta.zeiten.find((z) => z.startId === "s1" && z.bootId === "grandcru")!;
    eintrag.punkteManuell = 3.5; // z.B. Wiedergutmachung nach RRS 62
    eintrag.bemerkung = "Wiedergutmachung";

    const ergebnis = berechneStartErgebnis(regatta, regatta.starts[0], "gesegelt");
    const grandcru = ergebnis.find((z) => z.boot.name === "GRAND CRU")!;
    expect(grandcru.punkte).toBe(3.5);
    expect(grandcru.punkteManuell).toBe(true);
    expect(grandcru.bemerkung).toBe("Wiedergutmachung");
    expect(grandcru.platz).toBe(1); // Platzierung nach Zeit bleibt
    // andere Boote unverändert
    expect(ergebnis.find((z) => z.boot.name === "MAXIME")!.punkte).toBe(2);
  });

  it("rechnet Läufe über Mitternacht korrekt", () => {
    const regatta = structuredClone(helgoland2025);
    const eintrag = regatta.zeiten.find((z) => z.startId === "s1" && z.bootId === "allin")!;
    eintrag.startzeit = 23 * 3600;
    eintrag.zielzeit = 1 * 3600 + 30 * 60;

    const ergebnis = berechneStartErgebnis(regatta, regatta.starts[0], "gesegelt");
    const allin = ergebnis.find((z) => z.boot.name === "ALL IN")!;
    expect(formatDauer(allin.gesegeltSek!)).toBe("2:30:00");
  });
});
