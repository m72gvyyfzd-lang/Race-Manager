import { useState } from "react";
import { formatUhrzeit, parseZeitEingabe } from "@race-manager/core";

/**
 * Uhrzeit-Eingabe mit der Ziffern-Schnelleingabe aus dem Excel-Tool:
 * "154023" → 15:40:23. Wert in Sekunden seit Mitternacht.
 */
export function TimeInput({
  wert,
  onWert,
  placeholder,
}: {
  wert?: number;
  onWert: (wert: number | undefined) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(wert !== undefined ? formatUhrzeit(wert) : "");
  const [ungueltig, setUngueltig] = useState(false);
  const [letzterWert, setLetzterWert] = useState(wert);

  // Wert von außen geändert → Anzeige während des Renderns nachziehen
  if (wert !== letzterWert) {
    setLetzterWert(wert);
    setText(wert !== undefined ? formatUhrzeit(wert) : "");
    setUngueltig(false);
  }

  const uebernehmen = () => {
    if (text.trim() === "") {
      setUngueltig(false);
      if (wert !== undefined) onWert(undefined);
      return;
    }
    const sekunden = parseZeitEingabe(text);
    if (sekunden === null) {
      setUngueltig(true);
      return;
    }
    setUngueltig(false);
    setText(formatUhrzeit(sekunden));
    if (sekunden !== wert) onWert(sekunden);
  };

  return (
    <input
      className={`time-input${ungueltig ? " is-invalid" : ""}`}
      type="text"
      inputMode="numeric"
      value={text}
      placeholder={placeholder ?? "hhmmss"}
      onChange={(e) => setText(e.target.value)}
      onBlur={uebernehmen}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}
