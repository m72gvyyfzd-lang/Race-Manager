import { describe, expect, it } from "vitest";
import { formatDauer, formatUhrzeit, parseZeitEingabe } from "../src/zeit";

describe("parseZeitEingabe", () => {
  it("parst die Ziffern-Schnelleingabe aus dem Excel-Tool", () => {
    expect(parseZeitEingabe("154023")).toBe(15 * 3600 + 40 * 60 + 23);
    expect(parseZeitEingabe("121531")).toBe(12 * 3600 + 15 * 60 + 31);
    expect(parseZeitEingabe("94023")).toBe(9 * 3600 + 40 * 60 + 23);
  });

  it("ergänzt kürzere Eingaben zu vollen Minuten/Stunden", () => {
    expect(parseZeitEingabe("1540")).toBe(15 * 3600 + 40 * 60);
    expect(parseZeitEingabe("940")).toBe(9 * 3600 + 40 * 60);
    expect(parseZeitEingabe("9")).toBe(9 * 3600);
  });

  it("parst Doppelpunkt-Schreibweisen", () => {
    expect(parseZeitEingabe("15:40:23")).toBe(15 * 3600 + 40 * 60 + 23);
    expect(parseZeitEingabe("9:05")).toBe(9 * 3600 + 5 * 60);
  });

  it("weist Unsinn zurück", () => {
    expect(parseZeitEingabe("")).toBeNull();
    expect(parseZeitEingabe("246000")).toBeNull();
    expect(parseZeitEingabe("156099")).toBeNull();
    expect(parseZeitEingabe("12:75")).toBeNull();
    expect(parseZeitEingabe("abc")).toBeNull();
  });
});

describe("formatUhrzeit / formatDauer", () => {
  it("formatiert Uhrzeiten mit führenden Nullen", () => {
    expect(formatUhrzeit(15 * 3600 + 40 * 60 + 23)).toBe("15:40:23");
    expect(formatUhrzeit(9 * 3600 + 5 * 60)).toBe("09:05:00");
  });

  it("formatiert Dauern ohne führende Stunden-Null", () => {
    expect(formatDauer(2 * 3600 + 55 * 60 + 11)).toBe("2:55:11");
  });
});
