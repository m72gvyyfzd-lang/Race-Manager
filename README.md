# Race Manager

Web-App zur Verwaltung von Segelregatten: Boote, Wettfahrten und die
Wertung (Ergebnisliste) einer Regattaserie.

## Live

https://m72gvyyfzd-lang.github.io/Race-Manager/ (aktueller Stand von `main`,
automatisch deployed über `.github/workflows/deploy-pages.yml`)

**Einmalige Einrichtung** (falls die Seite 404 zeigt): GitHub Pages muss im
Repo einmal manuell aktiviert werden — der Workflow kann das nicht selbst,
das GITHUB_TOKEN hat dafür keine Berechtigung. Unter *Settings → Pages →
Build and deployment → Source* auf **"GitHub Actions"** stellen, danach
läuft jeder weitere Deploy automatisch.

## Projektstruktur

- [`web/`](web) — React + Vite PWA, das App-Grundgerüst. Navigations-Shell
  mit Dashboard, Bootsliste, Wettfahrten und Ergebnissen. An `core/`
  angebunden über npm-Workspaces — aktuell noch mit frei erfundenen
  Platzhalterdaten statt einer echten Datenquelle.
- [`core/`](core) — framework-unabhängige TypeScript-Kernlogik
  (Wertungsberechnung nach dem Low-Point-System).

## Status

Frühe Konzept-/Testphase. Grundgerüst und Wertungslogik stehen und sind
miteinander verdrahtet; es fehlt noch die echte Boots-/Wertungsliste
(bislang als Excel geführt) statt der Platzhalterdaten.
