/** Domänentypen der Regattaverwaltung. */

export interface Yacht {
  id: string;
  segelnummer: string;
  name: string;
  klasse: string;
  skipper: string;
}

export interface Wettfahrt {
  id: string;
  nummer: number;
  bezeichnung: string;
  /** ISO-Datum (YYYY-MM-DD) */
  datum: string;
}

/** Status einer Yacht in einer Wettfahrt, wenn sie nicht regulär platziert wurde. */
export type Platzierungsstatus = "DNF" | "DNS" | "DSQ" | "OCS" | "RET" | "DNC";

export interface Platzierung {
  wettfahrtId: string;
  yachtId: string;
  /** Zielplatz bei regulärer Durchfahrt. */
  platz?: number;
  /** Gesetzt statt `platz`, wenn die Yacht nicht regulär im Ziel war. */
  status?: Platzierungsstatus;
}

export interface Wertungszeile {
  yachtId: string;
  /** Punkte je Wettfahrt (vor Streichung), nur für gemeldete Wettfahrten. */
  punkteProWettfahrt: Record<string, number>;
  /** IDs der gestrichenen (schlechtesten) Wettfahrten. */
  gestrichen: string[];
  /** Punktsumme nach Streichung — niedriger ist besser. */
  gesamtpunkte: number;
  /** Gesamtplatzierung in der Serie, 1 = Sieger. */
  platz: number;
}
