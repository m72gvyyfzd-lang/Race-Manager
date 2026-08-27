/** Aktuelle Uhrzeit als Sekunden seit Mitternacht (für den "Jetzt"-Stempel). */
export function jetztSekunden(): number {
  const jetzt = new Date();
  return jetzt.getHours() * 3600 + jetzt.getMinutes() * 60 + jetzt.getSeconds();
}

/** ISO-Datum (YYYY-MM-DD) → "14.09.2025"; sonst unverändert. */
export function formatDatum(iso?: string): string {
  if (!iso) return "";
  const [jahr, monat, tag] = iso.split("-");
  return tag && monat && jahr ? `${tag}.${monat}.${jahr}` : iso;
}
