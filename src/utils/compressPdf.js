import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";

// Target ~4.9MB to stay safely under 5MB limit
const MAX_SIZE_KB = 4900;
// Compression presets: start with high quality, step down only if over limit
const PRESETS = [
  { quality: 0.92, scale: 1 },
  { quality: 0.88, scale: 0.95 },
  { quality: 0.82, scale: 0.9 },
  { quality: 0.75, scale: 0.85 },
  { quality: 0.68, scale: 0.8 },
  { quality: 0.6, scale: 0.75 },
  { quality: 0.52, scale: 0.7 },
  { quality: 0.45, scale: 0.65 },
  { quality: 0.4, scale: 0.6 },
];

// Worker from public folder - use absolute URL so pdfjs resolves it correctly
if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions) {
  const base = window.location.origin + (process.env.PUBLIC_URL || "");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.mjs`;
}

/**
 * Render PDF to compressed File using given quality/scale.
 */
async function renderCompressed(pdfjsLib, arrayBuffer, file, quality, scale) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pdfDoc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdfDoc.internal.pageSize.getWidth();
  const pageHeight = pdfDoc.internal.pageSize.getHeight();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = canvas.toDataURL("image/jpeg", quality);
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (i > 1) pdfDoc.addPage();
    pdfDoc.addImage(imgData, "JPEG", 0, 0, pageWidth, Math.min(imgHeight, pageHeight));
  }

  const blob = pdfDoc.output("blob");
  return new File([blob], file.name, { type: "application/pdf" });
}

/**
 * Compress a PDF file to under MAX_SIZE_KB (~4.9MB) for upload.
 * Uses PDF.js + jspdf. Tries increasingly aggressive settings until under limit.
 * @param {File} file - PDF file to compress
 * @returns {Promise<File>} Compressed PDF as File
 * @throws {Error} If compression cannot meet size limit
 */
export async function compressPdf(file) {
  const sizeKb = file.size / 1024;
  if (sizeKb <= MAX_SIZE_KB) return file;

  const arrayBuffer = await file.arrayBuffer();

  for (const { quality, scale } of PRESETS) {
    const result = await renderCompressed(pdfjsLib, arrayBuffer, file, quality, scale);
    if (result.size / 1024 <= MAX_SIZE_KB) return result;
  }

  throw new Error(
    "Could not compress PDF to under 5MB. Try using an online PDF compressor or a file with fewer pages."
  );
}
