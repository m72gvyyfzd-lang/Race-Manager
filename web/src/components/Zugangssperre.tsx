import { useState, type FormEvent, type ReactNode } from "react";
import { pruefeZugang, zugangGemerkt } from "../lib/zugang";
import icon from "../assets/logos/regatta-helgoland-double.jpg";

/**
 * Fragt beim ersten Öffnen auf einem Gerät nach dem Zugangswort und gibt
 * die App danach dauerhaft frei (siehe lib/zugang zu den Grenzen dieses
 * Schutzes).
 */
export function Zugangssperre({ children }: { children: ReactNode }) {
  const [frei, setFrei] = useState(zugangGemerkt);
  const [eingabe, setEingabe] = useState("");
  const [fehler, setFehler] = useState(false);
  const [pruefe, setPruefe] = useState(false);

  if (frei) return <>{children}</>;

  const absenden = async (e: FormEvent) => {
    e.preventDefault();
    if (!eingabe.trim() || pruefe) return;
    setPruefe(true);
    const ok = await pruefeZugang(eingabe);
    setPruefe(false);
    if (ok) {
      setFrei(true);
    } else {
      setFehler(true);
      setEingabe("");
    }
  };

  return (
    <div className="sperre">
      <form className="kachel kachel--legende sperre__karte" onSubmit={absenden}>
        <h2 className="kachel__legende">Race Manager</h2>
        <img className="sperre__logo" src={icon} alt="" />
        <label className="sperre__feld">
          <span className="form-label">Zugangswort</span>
          <input
            type="password"
            autoFocus
            value={eingabe}
            onChange={(e) => {
              setEingabe(e.target.value);
              setFehler(false);
            }}
          />
        </label>
        {fehler && <p className="hinweis hinweis--warnung">Zugangswort stimmt nicht.</p>}
        <button type="submit" className="primary" disabled={!eingabe.trim() || pruefe}>
          Öffnen
        </button>
        <p className="hinweis sperre__fuss">
          Wird nur beim ersten Öffnen auf diesem Gerät abgefragt.
        </p>
      </form>
    </div>
  );
}
