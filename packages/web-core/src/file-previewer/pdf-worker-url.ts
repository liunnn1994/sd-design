// Kept behind a dynamic import so the worker asset loads only for PDF previews.
export default new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).href;
