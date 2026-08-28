# Race Manager

Web-App zur Verwaltung von Yardstick-Segelregatten: Teilnehmer & Orga,
Zeiterfassung je Start, Wertung nach gesegelter und berechneter Zeit sowie
Gesamtwertung mit Streichergebnissen. Ersetzt das bisherige Excel-Tool
(Vorlage: Helgoland Double 2025).

## Live

https://m72gvyyfzd-lang.github.io/Race-Manager/ (aktueller Stand von `main`,
automatisch deployed über `.github/workflows/deploy-pages.yml`)

**Einmalige Einrichtung** (falls die Seite 404 zeigt): GitHub Pages muss im
Repo einmal manuell aktiviert werden — unter *Settings → Pages → Build and
deployment → Source* auf **"GitHub Actions"** stellen.

## Funktionsumfang

- **Regatten**: mehrere Regatten mit Name + Regatta-Logo und
  Veranstalterlogo, Export/Import als JSON-Datei (Datenaustausch zwischen
  Geräten), Komplett-Backup aller Regatten mit Backup-Erinnerung, Import
  mit Vorschau, Beispiel-Regatta mit den echten Daten der Helgoland
  Double 2025
- **Teilnehmer & Orga**: Anmeldung (Regatta) mit Yardstick und
  Meldung/Meldegeld, separate Anmeldungen (Essen) mit
  Erwachsenen-/Kinder-Essen und Bezahlt-Status, Dashboard mit
  Regatta- und Essen-Zählern
- **Wertungen**: beliebig viele Starts, je Start Karteikarten mit
  Startliste, Zeiterfassung, Ergebnis gesegelt und Ergebnis berechnet.
  Zeiterfassung mit Ziffern-Schnelleingabe (`154023` → 15:40:23) und
  „Jetzt“-Stempel für die Ziellinie, Startzeit für alle auf einmal,
  Sonderstatus DNC/DNS/DSQ/DNF/RET/OCS (Punkte = gemeldete Boote + 1),
  manuelle Punktvergabe und Bemerkungen durch die Wettfahrtleitung,
  Gesamtwertung mit Streichern (Gleichstand nach RRS Anhang A8),
  druckfertige Listen mit Logo-Kopf (A4 quer) über den Browserdruck
- **Startmodus**: Yardstick Regatta (gemeinsamer Start) oder
  Kangaroo-Start (Verfolgungsstart — individuelle Startzeiten aus
  Streckenzeit und Yardstick, das langsamste Boot startet zuerst,
  Zieleinlauf = Platzierung)
- Daten liegen lokal im Browser (localStorage); Weitergabe per Export/Import

## Projektstruktur

- [`web/`](web) — React + Vite PWA mit Kachel-Navigation (Teilnehmer & Orga,
  Einstellungen, Regatten, Wertungen). An `core/` angebunden über
  npm-Workspaces.
- [`core/`](core) — framework-unabhängige TypeScript-Kernlogik: Zeitparser,
  gesegelte/berechnete Zeit (Sekunden × 100 / Yardstick), Kangaroo-Startzeiten,
  Wettfahrts- und Gesamtwertung. Die Tests nutzen die echten Zahlen aus dem
  Excel-Tool der Helgoland Double 2025 als Abnahme-Fixtures.

## Zugangswort

Beim ersten Öffnen fragt die App auf jedem Gerät nach einem Zugangswort
und schaltet sich danach dauerhaft frei.

**Das ist ein Sichtschutz, kein echter Schutz:** Die Prüfung läuft im
Browser, der Vergleichs-Hash steckt im ausgelieferten JavaScript. Das
hält Zufallsbesucher ab, lässt sich aber mit etwas Wissen umgehen — die
Regattadaten liegen ohnehin lokal im Browser des jeweiligen Geräts. Für
echte Vertraulichkeit bräuchte es einen Server, der die Daten erst nach
Anmeldung herausgibt.

Zugangswort ändern:

```
npm run passwort -w web -- "neues Zugangswort"
```

Danach committen und pushen — mit dem nächsten Deploy gilt das neue Wort,
und alle Geräte fragen einmalig erneut.

## Entwicklung

```
npm install
npm test -w core       # Kernlogik-Tests
npm run dev -w web     # Dev-Server
npm run build -w web   # Produktions-Build
```
