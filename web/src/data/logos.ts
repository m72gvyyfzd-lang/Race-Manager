import regattaHelgolandDouble from "../assets/logos/regatta-helgoland-double.jpg";
import regattaSchweinerennen from "../assets/logos/regatta-schweinerennen.jpg";
import veranstalterSvb from "../assets/logos/veranstalter-svb.jpg";

export interface Logo {
  id: string;
  name: string;
  url: string;
}

/** Auswahl für das Regatta-Symbol (Regatta.symbol trägt die id). */
export const REGATTA_LOGOS: Logo[] = [
  { id: "helgoland-double", name: "Helgoland Double", url: regattaHelgolandDouble },
  { id: "schweinerennen", name: "Schweinerennen", url: regattaSchweinerennen },
];

/** Auswahl für das Veranstalterlogo (Regatta.veranstalterLogo trägt die id). */
export const VERANSTALTER_LOGOS: Logo[] = [
  { id: "svb", name: "SVB", url: veranstalterSvb },
];

/** Bild-URL zum Regatta-Symbol; undefined bei Alt-Daten (Emoji als Symbol). */
export function regattaLogoUrl(symbol: string): string | undefined {
  return REGATTA_LOGOS.find((l) => l.id === symbol)?.url;
}

export function veranstalterLogoUrl(id?: string): string | undefined {
  return VERANSTALTER_LOGOS.find((l) => l.id === id)?.url;
}
