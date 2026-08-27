import { regattaLogoUrl } from "../data/logos";

/**
 * Zeigt das Regatta-Symbol: als Logo-Bild, wenn `symbol` eine bekannte
 * Logo-id ist, sonst (Alt-Daten) als Emoji-Text.
 */
export function RegattaSymbol({ symbol, className }: { symbol: string; className?: string }) {
  const url = regattaLogoUrl(symbol);
  return url ? (
    <img className={className} src={url} alt="" />
  ) : (
    <span className={className}>{symbol}</span>
  );
}
