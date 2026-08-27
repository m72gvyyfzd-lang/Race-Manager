import { useState } from "react";

/**
 * Zahleneingabe mit einer Nachkommastelle und nachgestellter Einheit
 * (z.B. "12,5 nm"). Akzeptiert Komma und Punkt als Trennzeichen.
 */
export function DezimalInput({
  wert,
  onWert,
  einheit,
}: {
  wert?: number;
  onWert: (wert: number | undefined) => void;
  einheit: string;
}) {
  const anzeige = (w?: number) => (w === undefined ? "" : w.toFixed(1).replace(".", ","));
  const [text, setText] = useState(() => anzeige(wert));
  const [letzterWert, setLetzterWert] = useState(wert);

  // Wert von außen geändert → Anzeige während des Renderns nachziehen
  if (wert !== letzterWert) {
    setLetzterWert(wert);
    setText(anzeige(wert));
  }

  const uebernehmen = () => {
    const roh = text.trim().replace(",", ".");
    if (roh === "") {
      setText("");
      if (wert !== undefined) onWert(undefined);
      return;
    }
    const zahl = Number(roh);
    if (!Number.isFinite(zahl) || zahl < 0) {
      setText(anzeige(wert));
      return;
    }
    const gerundet = Math.round(zahl * 10) / 10;
    setText(anzeige(gerundet));
    if (gerundet !== wert) onWert(gerundet);
  };

  return (
    <span className="dezimal-feld">
      <input
        className="dezimal-feld__input"
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={uebernehmen}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
      <span className="dezimal-feld__einheit">{einheit}</span>
    </span>
  );
}
