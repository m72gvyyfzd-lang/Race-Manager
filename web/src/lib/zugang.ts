/**
 * Einfacher Zugangsschutz ohne Server.
 *
 * WICHTIG — was das leistet und was nicht: Die Prüfung läuft im Browser,
 * der Vergleichs-Hash steckt im ausgelieferten JavaScript. Das hält
 * Zufallsbesucher und neugierige Blicke ab, ist aber kein echter Schutz:
 * Wer sich auskennt, kann ihn umgehen. Für echte Vertraulichkeit bräuchte
 * es einen Server, der die Daten erst nach Anmeldung herausgibt.
 */

/** SHA-256 des Zugangsworts, als Hex. Zum Ändern: `npm run passwort -w web`. */
export const ZUGANG_HASH = "b63c3a1bf484038eba8e231ea2d64f0a318cdbf7faedc440414d3dcfa63f4001";

const SPEICHER_KEY = "race-manager:zugang";

/** SHA-256 eines Textes als Hex-String. */
export async function hashe(text: string): Promise<string> {
  const daten = new TextEncoder().encode(text);
  const puffer = await crypto.subtle.digest("SHA-256", daten);
  return [...new Uint8Array(puffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Prüft das eingegebene Wort und merkt sich bei Erfolg den Zugang. */
export async function pruefeZugang(eingabe: string): Promise<boolean> {
  const hash = await hashe(eingabe.trim());
  if (hash !== ZUGANG_HASH) return false;
  try {
    localStorage.setItem(SPEICHER_KEY, hash);
  } catch {
    // Ohne Speicher fragt die App beim nächsten Start erneut — kein Fehler.
  }
  return true;
}

/**
 * true, wenn dieses Gerät bereits freigeschaltet ist. Nach einem
 * Passwortwechsel passt der gemerkte Hash nicht mehr und es wird erneut
 * gefragt.
 */
export function zugangGemerkt(): boolean {
  try {
    return localStorage.getItem(SPEICHER_KEY) === ZUGANG_HASH;
  } catch {
    return false;
  }
}
