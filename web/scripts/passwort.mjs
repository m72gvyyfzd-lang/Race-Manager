#!/usr/bin/env node
/**
 * Setzt das Zugangswort der App: erzeugt den SHA-256-Hash und trägt ihn
 * in src/lib/zugang.ts ein.
 *
 *   npm run passwort -w web -- "neues Zugangswort"
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const passwort = process.argv[2];
if (!passwort) {
  console.error('Aufruf: npm run passwort -w web -- "neues Zugangswort"');
  process.exit(1);
}

const hash = createHash("sha256").update(passwort.trim()).digest("hex");
const datei = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "zugang.ts");
const inhalt = readFileSync(datei, "utf8");
const neu = inhalt.replace(/(ZUGANG_HASH = ")[0-9a-f]{64}(")/, `$1${hash}$2`);

if (neu === inhalt) {
  console.error(`Hash-Zeile in ${datei} nicht gefunden — bitte von Hand eintragen: ${hash}`);
  process.exit(1);
}

writeFileSync(datei, neu);
console.log(`Zugangswort gesetzt. Hash: ${hash}`);
console.log("Nicht vergessen: committen und pushen, damit es live gilt.");
