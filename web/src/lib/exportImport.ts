import type { Regatta } from "@race-manager/core";

interface ExportDatei {
  app: "race-manager";
  format: 1;
  exportiert: string;
  /** Einzel-Export */
  regatta?: Regatta;
  /** Komplett-Backup */
  regatten?: Regatta[];
}

const BACKUP_KEY = "race-manager:letztesBackup";

function ladeDateiHerunter(inhalt: unknown, dateiname: string): void {
  const blob = new Blob([JSON.stringify(inhalt, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = dateiname;
  a.click();
  URL.revokeObjectURL(url);
  merkeBackupZeitpunkt();
}

/** Lädt die Regatta als JSON-Datei herunter (für den Import auf einem anderen Gerät). */
export function exportiereRegatta(regatta: Regatta): void {
  const datei: ExportDatei = {
    app: "race-manager",
    format: 1,
    exportiert: new Date().toISOString(),
    regatta,
  };
  ladeDateiHerunter(datei, `${regatta.name.replace(/[^\wäöüÄÖÜß-]+/g, "_")}_${regatta.jahr}.json`);
}

/** Komplett-Backup: alle Regatten in einer Datei. */
export function exportiereAlle(regatten: Regatta[]): void {
  const datei: ExportDatei = {
    app: "race-manager",
    format: 1,
    exportiert: new Date().toISOString(),
    regatten,
  };
  const datum = new Date().toISOString().slice(0, 10);
  ladeDateiHerunter(datei, `race-manager-backup_${datum}.json`);
}

function pruefeRegatta(r: Partial<Regatta>): Regatta {
  if (
    typeof r.id !== "string" ||
    typeof r.name !== "string" ||
    !Array.isArray(r.boote) ||
    !Array.isArray(r.starts) ||
    !Array.isArray(r.zeiten)
  ) {
    throw new Error("Der Export ist unvollständig oder beschädigt.");
  }
  return r as Regatta;
}

/**
 * Liest eine Exportdatei (Einzel-Export oder Komplett-Backup) ein und
 * liefert die enthaltenen Regatten; wirft bei ungültigem Inhalt einen
 * Fehler mit Meldung.
 */
export function parseImport(text: string): Regatta[] {
  let daten: unknown;
  try {
    daten = JSON.parse(text);
  } catch {
    throw new Error("Die Datei ist kein gültiges JSON.");
  }
  const datei = daten as Partial<ExportDatei>;
  if (datei.app !== "race-manager" || datei.format !== 1) {
    throw new Error("Die Datei ist kein Race-Manager-Export.");
  }
  const liste = datei.regatten ?? (datei.regatta ? [datei.regatta] : []);
  if (liste.length === 0) {
    throw new Error("Die Datei enthält keine Regatta.");
  }
  return liste.map(pruefeRegatta);
}

function merkeBackupZeitpunkt(): void {
  try {
    localStorage.setItem(BACKUP_KEY, new Date().toISOString());
  } catch {
    // nicht kritisch
  }
}

/** true, wenn noch nie exportiert wurde oder das letzte Backup älter als 7 Tage ist. */
export function backupIstVeraltet(): boolean {
  const backup = letztesBackup();
  return !backup || Date.now() - backup.getTime() > 7 * 24 * 3600 * 1000;
}

/** Zeitpunkt des letzten Exports (egal ob einzeln oder komplett), oder null. */
export function letztesBackup(): Date | null {
  try {
    const roh = localStorage.getItem(BACKUP_KEY);
    if (!roh) return null;
    const datum = new Date(roh);
    return Number.isNaN(datum.getTime()) ? null : datum;
  } catch {
    return null;
  }
}
