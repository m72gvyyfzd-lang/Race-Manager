import type { Regatta } from "@race-manager/core";
import { veranstalterLogoUrl } from "../data/logos";
import { RegattaSymbol } from "./RegattaSymbol";

/**
 * Markanter Regatta-Banner: Veranstalterlogo links, "Name - Jahr" groß
 * in der Mitte, Regatta-Logo rechts. Wird im Listenkopf (Druck) und auf
 * der Einstellungen-Seite verwendet.
 */
export function RegattaBanner({ regatta }: { regatta: Regatta }) {
  const veranstalter = veranstalterLogoUrl(regatta.veranstalterLogo);
  return (
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
  );
}
