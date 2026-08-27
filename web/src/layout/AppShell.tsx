import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/boote", label: "Boote" },
  { to: "/wettfahrten", label: "Wettfahrten" },
  { to: "/ergebnisse", label: "Ergebnisse" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-shell__topbar">
        <span className="app-shell__title">Race Manager</span>
        <nav className="app-shell__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "app-shell__link is-active" : "app-shell__link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-shell__content">{children}</main>
    </div>
  );
}
