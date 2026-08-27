import type { Regatta } from "@race-manager/core";
import { RegattaBanner } from "./RegattaBanner";

/**
 * Standard-Seitenkopf: Banner mit Veranstalterlogo, "Regatta - Jahr" und
 * Regatta-Logo, darunter der Seitentitel — beides über der Trennlinie.
 * Unter der Linie steht zentriert der Listentitel; beim Ausdruck kommt
 * rechts der Druckzeitpunkt dazu, damit erkennbar bleibt, welcher Stand
 * auf dem Papier ist.
 */
export function PrintKopf({
  regatta,
  titel,
  untertitel,
  seitentitel,
}: {
  regatta: Regatta;
  titel?: string;
  untertitel?: string;
  seitentitel?: string;
}) {
  return (
    <header className="druck-kopf">
      <div className="druck-kopf__oben">
        <RegattaBanner regatta={regatta} />
        {/* Der Seitentitel benennt den Reiter, nicht die Liste — auf dem
            Papier steht stattdessen der Listentitel unter der Linie. */}
        {seitentitel && <h1 className="druck-kopf__seitentitel no-print">{seitentitel}</h1>}
      </div>
      {titel && (
        <div className="druck-kopf__zeile">
          <span className="druck-kopf__titel">
            {titel}
            {untertitel && <span className="druck-kopf__untertitel"> — {untertitel}</span>}
          </span>
          <span className="druck-kopf__stand print-only">
            Stand:{" "}
            {new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
      )}
    </header>
  );
}
