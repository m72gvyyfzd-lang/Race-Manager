/**
 * Domänentypen der Regattaverwaltung.
 * Datenmodell destilliert aus dem bisherigen Excel-Tool
 * (Helgoland_Double_2025: ArbeitsListe + Ergebnisblätter).
 */

/** Sonderstatus statt Zielzeit — wertet nach RRS mit "gemeldete Boote + 1" Punkten. */
export type Sonderstatus = "DNC" | "DNS" | "DSQ" | "DNF" | "RET" | "OCS";

export type Startmodus = "normal" | "kangaroo";

export type Wertungsart = "gesegelt" | "berechnet";

export interface Boot {
  id: string;
  name: string;
  skipper: string;
  crew: string;
  verein: string;
  bootstyp: string;
  yardstick: number;
  /** Orga: Meldung eingegangen */
  meldungErhalten: boolean;
  /** Orga: Meldegeld bezahlt */
  meldegeldBezahlt: boolean;
  /** Orga: Anzahl bestellter Essen */
  anzahlEssen: number;
  /** Orga: Essen bezahlt */
  essenBezahlt: boolean;
  bemerkung?: string;
}

export interface Start {
  id: string;
  nummer: number;
  bezeichnung: string;
  /** Zählt zur Gesamtwertung ("aktiv" / "nicht gewertet" im Excel) */
  aktiv: boolean;
  /** Kangaroo: geplante Startzeit des ersten (langsamsten) Boots, Sek. seit Mitternacht */
  geplanteStartzeit?: number;
  /** Kangaroo: kalkulierte Streckenzeit eines Yardstick-100-Boots in Sekunden */
  basiszeit?: number;
  /** Kangaroo: Streckenlänge in Seemeilen — Grundlage für die Streckenzeit */
  streckeNm?: number;
  /** Kangaroo: angenommene Durchschnittsgeschwindigkeit in Knoten */
  schnittKn?: number;
}

/** Erfasste Zeiten eines Boots in einem Start. Alle Zeiten in Sek. seit Mitternacht. */
export interface Zeiteintrag {
  startId: string;
  bootId: string;
  startzeit?: number;
  zielzeit?: number;
  status?: Sonderstatus;
  /** Manuelle Punktvergabe der Wettfahrtleitung — überschreibt die berechneten Punkte */
  punkteManuell?: number;
  /** Bemerkung der Wettfahrtleitung, erscheint in der Ergebnisliste */
  bemerkung?: string;
}

/** Essen-Anmeldung (unabhängig von den Booten — z.B. Begleitung, Helfer). */
export interface EssenAnmeldung {
  id: string;
  name: string;
  essenErwachsen: number;
  essenKind: number;
  bezahlt: boolean;
  bemerkung?: string;
}

export interface Regatta {
  id: string;
  name: string;
  /** Regatta-Symbol: id eines Regatta-Logos, bei Alt-Daten ein Emoji */
  symbol: string;
  /** id des Veranstalterlogos (optional, erscheint im Listenkopf) */
  veranstalterLogo?: string;
  jahr: number;
  /** ISO-Datum (YYYY-MM-DD) */
  datum?: string;
  startmodus: Startmodus;
  /** Gewünschte Anzahl Streichergebnisse (wirksam max. aktive Starts − 2) */
  streicher: number;
  boote: Boot[];
  starts: Start[];
  zeiten: Zeiteintrag[];
  /** Essen-Anmeldungen (fehlt in Alt-Daten → wie leer behandeln) */
  essenAnmeldungen?: EssenAnmeldung[];
}
