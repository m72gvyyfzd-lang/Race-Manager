import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { RegattaSymbol } from "../components/RegattaSymbol";
import { useData } from "../state/DataContext";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/regatten", symbol: "🏆", label: "Regatten" },
  { to: "/einstellungen", symbol: "⚙️", label: "Einstellungen" },
  { to: "/teilnehmer", symbol: "👥", label: "Teilnehmer & Orga" },
  { to: "/wertungen", symbol: "🏁", label: "Wertungen" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { aktiveRegatta } = useData();

  return (
    <div className="app-shell">
      <aside className="app-sidebar no-print">
        <div className="app-sidebar__brand">Race Manager</div>
        <nav className="app-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-tile is-active" : "nav-tile")}
            >
              <span className="nav-tile__symbol" aria-hidden>
                {item.symbol}
              </span>
              <span className="nav-tile__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {aktiveRegatta && (
          <div className="app-sidebar__regatta" title="Aktive Regatta">
            <RegattaSymbol symbol={aktiveRegatta.symbol} className="app-sidebar__regatta-symbol" />
            <span className="app-sidebar__regatta-name">
              {aktiveRegatta.name} {aktiveRegatta.jahr}
            </span>
          </div>
        )}
      </aside>
      <main className="app-content">{children}</main>
    </div>
  );
}
