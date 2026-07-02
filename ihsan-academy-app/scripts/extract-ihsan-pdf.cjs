// One-off script to extract text from the ihsan-soul PDF using pdfjs-dist (legacy build for Node)
const fs = require("node:fs");
const path = require("node:path");

(async () => {
  const pdfPath = path.resolve(__dirname, "..", "public", "ihsan-soul-reference.pdf");
  if (!fs.existsSync(pdfPath)) {
    console.error("missing", pdfPath);
    process.exit(1);
  }
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
  const allLines = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const pageLines = [];
    let currentY = null;
    let buffer = [];
    const flush = () => {
      if (buffer.length) pageLines.push(buffer.join(" ").trim());
      buffer = [];
    };
    for (const item of tc.items) {
      const y = item.transform?.[5] ?? 0;
      if (currentY === null) currentY = y;
      if (Math.abs(y - currentY) > 2) {
        flush();
        currentY = y;
      }
      buffer.push(item.str);
    }
    flush();
    allLines.push(`\n\n----- PAGE ${i} -----\n` + pageLines.join("\n"));
  }
  const out = allLines.join("\n");
  const outPath = path.resolve(__dirname, "ihsan-soul-pdf-text.txt");
  fs.writeFileSync(outPath, out, "utf8");
  console.log("Wrote", outPath, "pages=" + doc.numPages, "chars=" + out.length);
})();
