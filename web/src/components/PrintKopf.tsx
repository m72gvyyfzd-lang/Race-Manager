import type { Regatta } from "@race-manager/core";
import { veranstalterLogoUrl } from "../data/logos";
import { formatDatum } from "../lib/zeitHelfer";
import { RegattaSymbol } from "./RegattaSymbol";

/**
 * Listenkopf für Bildschirm und Druck:
 * Veranstalterlogo links, "Regatta - Jahr" groß in der Mitte, Regatta-Logo
 * rechts; darunter Listentitel und Datum. Auf dem Ausdruck kommt der
 * Druckzeitpunkt dazu, damit erkennbar bleibt, welcher Stand auf dem
 * Papier ist.
 */
export function PrintKopf({
  regatta,
  titel,
  untertitel,
}: {
  regatta: Regatta;
  titel: string;
  untertitel?: string;
}) {
  const veranstalter = veranstalterLogoUrl(regatta.veranstalterLogo);
  return (
    <header className="druck-kopf">
      <div className="druck-kopf__banner">
        <div className="druck-kopf__logo">
          {veranstalter && <img src={veranstalter} alt="Veranstalterlogo" />}
        </div>
        <div className="druck-kopf__name">
          {regatta.name} - {regatta.jahr}
        </div>
        <div className="druck-kopf__logo druck-kopf__logo--rechts">
          <RegattaSymbol symbol={regatta.symbol} className="druck-kopf__symbol" />
        </div>
      </div>
      <div className="druck-kopf__zeile">
        <div>
          <span className="druck-kopf__titel">{titel}</span>
          {untertitel && <span className="druck-kopf__untertitel"> — {untertitel}</span>}
        </div>
        <div className="druck-kopf__meta">
          {regatta.datum && <span>{formatDatum(regatta.datum)}</span>}
          <span className="print-only">
            {" "}
            · Stand:{" "}
            {new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
      </div>
    </header>
  );
}
