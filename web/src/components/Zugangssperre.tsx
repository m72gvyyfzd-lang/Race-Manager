import { useState, type FormEvent, type ReactNode } from "react";
import { veranstalterLogoUrl } from "../data/logos";
import { pruefeZugang, zugangGemerkt } from "../lib/zugang";
import { useData } from "../state/DataContext";

/**
 * Fragt beim ersten Öffnen auf einem Gerät nach dem Zugangswort und gibt
 * die App danach dauerhaft frei (siehe lib/zugang zu den Grenzen dieses
 * Schutzes).
 */
export function Zugangssperre({ children }: { children: ReactNode }) {
  const { aktiveRegatta } = useData();
  const [frei, setFrei] = useState(zugangGemerkt);
  const [eingabe, setEingabe] = useState("");
  const [fehler, setFehler] = useState(false);
  const [pruefe, setPruefe] = useState(false);

  if (frei) return <>{children}</>;

  // Veranstalterlogo der aktiven Regatta, sonst das App-Icon
  const logo =
    veranstalterLogoUrl(aktiveRegatta?.veranstalterLogo) ??
    `${import.meta.env.BASE_URL}icons/icon-192.png`;

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
        <img className="sperre__logo" src={logo} alt="" />
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
