// PDF export via the browser print pipeline.
//
// This is the brief's "print-to-PDF CSS" option. It renders Thai text with the
// system font stack (perfect glyphs, no font-embedding needed) and includes the
// on-page SVG spatial preview directly. The print stylesheet (see global.css
// @media print) hides chrome and shows only the report.

export function exportToPdf(filenameBase: string): void {
  const prevTitle = document.title;
  // Chrome/Edge use document.title as the default PDF filename.
  document.title = filenameBase;
  window.print();
  window.setTimeout(() => {
    document.title = prevTitle;
  }, 1500);
}
