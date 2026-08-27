import type { Regatta } from "@race-manager/core";
import { formatDatum } from "../lib/zeitHelfer";
import { RegattaBanner } from "./RegattaBanner";

/**
 * Listenkopf für Bildschirm und Druck: Banner mit Veranstalterlogo,
 * "Regatta - Jahr" und Regatta-Logo, darunter — nur am Bildschirm — der
 * Seitentitel. Unter der Trennlinie folgt zentriert der Listentitel mit
 * Datum; auf dem Ausdruck kommt der Druckzeitpunkt dazu, damit erkennbar
 * bleibt, welcher Stand auf dem Papier ist.
 */
export function PrintKopf({
  regatta,
  titel,
  untertitel,
  seitentitel,
}: {
  regatta: Regatta;
  titel: string;
  untertitel?: string;
  seitentitel?: string;
}) {
  return (
    <header className="druck-kopf">
      <div className="druck-kopf__oben">
        <RegattaBanner regatta={regatta} />
        {seitentitel && <h1 className="druck-kopf__seitentitel no-print">{seitentitel}</h1>}
      </div>
      <div className="druck-kopf__zeile">
        <span className="druck-kopf__titel">{titel}</span>
        {untertitel && <span className="druck-kopf__untertitel"> — {untertitel}</span>}
        <span className="druck-kopf__meta">
          {regatta.datum && <span> · {formatDatum(regatta.datum)}</span>}
          <span className="print-only">
            {" "}
            · Stand:{" "}
            {new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
          </span>
        </span>
      </div>
    </header>
  );
}
