import { describe, expect, it } from "vitest";
import { kangarooStartzeiten, streckenzeitSek } from "../src/kangaroo";
import { berechneStartErgebnis } from "../src/wettfahrt";
import { formatUhrzeit } from "../src/zeit";
import type { Regatta } from "../src/types";
import { boote } from "./fixtures/helgoland2025";

const hms = (h: number, m: number, s = 0) => h * 3600 + m * 60 + s;

describe("streckenzeitSek", () => {
  it("rechnet Strecke und Schnitt in eine Streckenzeit um", () => {
    expect(streckenzeitSek(12, 6)).toBe(7200); // 12 sm bei 6 kn = 2 h
    expect(streckenzeitSek(18.5, 5.5)).toBe(Math.round((18.5 / 5.5) * 3600));
  });

  it("liefert null bei unvollständigen oder unbrauchbaren Angaben", () => {
    expect(streckenzeitSek(undefined, 6)).toBeNull();
    expect(streckenzeitSek(12, undefined)).toBeNull();
    expect(streckenzeitSek(12, 0)).toBeNull();
    expect(streckenzeitSek(-3, 6)).toBeNull();
  });
});

describe("kangarooStartzeiten", () => {
  it("lässt das langsamste Boot zuerst starten, schnellere entsprechend später", () => {
    // Basiszeit 2 h für YS 100, geplanter Start 10:00
    const zeilen = kangarooStartzeiten(boote, hms(10, 0), 7200);

    // Langsamstes Boot: ALL IN (YS 102) → geplante Startzeit
    expect(zeilen[0].boot.name).toBe("ALL IN");
    expect(zeilen[0].offsetSek).toBe(0);
    expect(formatUhrzeit(zeilen[0].startzeit)).toBe("10:00:00");

    // ELBFUCHS/ESKA (YS 98): 7200 × 4 / 100 = 288 s später
    const elbfuchs = zeilen.find((z) => z.boot.name === "ELBFUCHS")!;
    expect(elbfuchs.offsetSek).toBe(288);
    expect(formatUhrzeit(elbfuchs.startzeit)).toBe("10:04:48");

    // Schnellstes Boot: MAXIME (YS 86): 7200 × 16 / 100 = 1152 s
    const maxime = zeilen.at(-1)!;
    expect(maxime.boot.name).toBe("MAXIME");
    expect(maxime.offsetSek).toBe(1152);
  });
});

describe("Kangaroo-Wertung", () => {
  const regatta: Regatta = {
    id: "k",
    name: "Kangaroo Cup",
    symbol: "🦘",
    jahr: 2026,
    startmodus: "kangaroo",
    streicher: 0,
    boote,
    starts: [
      {
        id: "k1",
        nummer: 1,
        bezeichnung: "Verfolgung",
        aktiv: true,
        geplanteStartzeit: hms(10, 0),
        basiszeit: 7200,
      },
    ],
    zeiten: [
      // Zieleinlauf: SPONTAN zuerst, dann ALL IN, MAXIME
      { startId: "k1", bootId: "spontan", zielzeit: hms(12, 10, 0) },
      { startId: "k1", bootId: "allin", zielzeit: hms(12, 11, 30) },
      { startId: "k1", bootId: "maxime", zielzeit: hms(12, 12, 0) },
      { startId: "k1", bootId: "cooldown", status: "DNF" },
    ],
  };

  it("wertet nach Zieleinlauf und nutzt die berechneten Startzeiten", () => {
    const ergebnis = berechneStartErgebnis(regatta, regatta.starts[0], "gesegelt");
    expect(ergebnis.slice(0, 3).map((z) => z.boot.name)).toEqual(["SPONTAN", "ALL IN", "MAXIME"]);
    expect(ergebnis[0].punkte).toBe(1);

    // Startzeit kommt aus der Kangaroo-Berechnung: ALL IN (langsamstes, YS 102) = 10:00
    const allin = ergebnis.find((z) => z.boot.name === "ALL IN")!;
    expect(formatUhrzeit(allin.startzeit!)).toBe("10:00:00");
    expect(allin.gesegeltSek).toBe(hms(12, 11, 30) - hms(10, 0));

    // DNF und nicht angetretene Boote: 7 gemeldete + 1 = 8 Punkte
    expect(ergebnis.find((z) => z.boot.name === "COOL DOWN")!.punkte).toBe(8);
    expect(ergebnis.find((z) => z.boot.name === "ESKA")!.status).toBe("DNC");
  });
});
