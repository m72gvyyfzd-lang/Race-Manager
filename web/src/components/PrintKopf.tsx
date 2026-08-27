import type { Regatta } from "@race-manager/core";
import { formatDatum } from "../lib/zeitHelfer";

/**
 * Listenkopf für Bildschirm und Druck: Listentitel links, Regatta-Daten
 * rechts. Auf dem Ausdruck kommt zusätzlich der Druckzeitpunkt dazu, damit
 * erkennbar bleibt, welcher Stand auf dem Papier ist.
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
      <div>
        <h1 className="druck-kopf__titel">{titel}</h1>
        {untertitel && <p className="druck-kopf__untertitel">{untertitel}</p>}
      </div>
      <div className="druck-kopf__meta">
        <div className="druck-kopf__regatta">
          {regatta.symbol} {regatta.name} {regatta.jahr}
        </div>
        {regatta.datum && <div>{formatDatum(regatta.datum)}</div>}
        <div className="print-only">
          Stand: {new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
        </div>
      </div>
    </header>
  );
}
