/**
 * Druckt die aktuelle Ansicht. Das Seitenformat wird für den Druckvorgang
 * per @page-Regel gesetzt: Startlisten hochkant, Ergebnis- und
 * Meldelisten quer. Der Dateiname im PDF-Dialog kommt aus dem
 * Dokumenttitel.
 *
 * Hinweis: Safari ignoriert die Formatvorgabe — dort wird die Ausrichtung
 * im Druckdialog gewählt.
 */
export function drucken(titel: string, format: "hoch" | "quer") {
  const style = document.createElement("style");
  style.textContent = `@page { size: A4 ${format === "hoch" ? "portrait" : "landscape"}; margin: 12mm; }`;
  document.head.appendChild(style);

  const vorher = document.title;
  document.title = titel;
  window.print();
  setTimeout(() => {
    document.title = vorher;
    style.remove();
  }, 500);
}
