import type { Regatta } from "@race-manager/core";

interface ExportDatei {
  app: "race-manager";
  format: 1;
  exportiert: string;
  regatta: Regatta;
}

/** Lädt die Regatta als JSON-Datei herunter (für den Import auf einem anderen Gerät). */
export function exportiereRegatta(regatta: Regatta): void {
  const datei: ExportDatei = {
    app: "race-manager",
    format: 1,
    exportiert: new Date().toISOString(),
    regatta,
  };
  const blob = new Blob([JSON.stringify(datei, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${regatta.name.replace(/[^\wäöüÄÖÜß-]+/g, "_")}_${regatta.jahr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Liest eine Exportdatei ein; wirft bei ungültigem Inhalt einen Fehler mit Meldung. */
export function parseImport(text: string): Regatta {
  let daten: unknown;
  try {
    daten = JSON.parse(text);
  } catch {
    throw new Error("Die Datei ist kein gültiges JSON.");
  }
  const datei = daten as Partial<ExportDatei>;
  if (datei.app !== "race-manager" || datei.format !== 1 || !datei.regatta) {
    throw new Error("Die Datei ist kein Race-Manager-Export.");
  }
  const r = datei.regatta;
  if (
    typeof r.id !== "string" ||
    typeof r.name !== "string" ||
    !Array.isArray(r.boote) ||
    !Array.isArray(r.starts) ||
    !Array.isArray(r.zeiten)
  ) {
    throw new Error("Der Export ist unvollständig oder beschädigt.");
  }
  return r;
}
