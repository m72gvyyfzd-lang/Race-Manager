import type { Regatta } from "@race-manager/core";
import { formatDatum } from "../lib/zeitHelfer";
import { RegattaBanner } from "./RegattaBanner";

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
  return (
    <header className="druck-kopf">
      <RegattaBanner regatta={regatta} />
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
