/**
 * Zentrierter Listentitel mit dem Druckzeitpunkt rechts. Steht je nach
 * Seite direkt im Kopf (siehe PrintKopf) oder — wie bei Teilnehmer &
 * Orga — weiter unten über der Liste. Auf dem Bildschirm ist nur der
 * Titel sichtbar, der Stand kommt beim Ausdruck dazu.
 */
export function ListenTitel({
  titel,
  untertitel,
  className,
}: {
  titel: string;
  untertitel?: string;
  className?: string;
}) {
  return (
    <div className={`druck-kopf__zeile${className ? ` ${className}` : ""}`}>
      <span className="druck-kopf__titel">
        {titel}
        {untertitel && <span className="druck-kopf__untertitel"> — {untertitel}</span>}
      </span>
      <span className="druck-kopf__stand print-only">
        Stand: {new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
      </span>
    </div>
  );
}
