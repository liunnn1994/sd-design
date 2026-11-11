import { createCdnWorker } from './cdn-worker.js';

export type KaTeXCDNWorkerMode = 'classic' | 'module';
export interface KaTeXCDNWorkerOptions {
  katexUrl: string;
  mhchemUrl?: string;
  mode?: KaTeXCDNWorkerMode;
  debug?: boolean;
  workerOptions?: WorkerOptions;
  renderOptions?: { throwOnError?: boolean; output?: string; strict?: string };
}
export interface KaTeXCDNWorkerHandle {
  worker: Worker | null;
  dispose: () => void;
  source: string;
}

export function buildKaTeXCDNWorkerSource(options: KaTeXCDNWorkerOptions): string {
  const katexUrl = JSON.stringify(options.katexUrl);
  const mhchemUrl = options.mhchemUrl ? JSON.stringify(options.mhchemUrl) : '""';
  const renderOptions = JSON.stringify({
    throwOnError: true,
    displayMode: true,
    output: 'html',
    strict: 'ignore',
    ...(options.renderOptions || {}),
  });
  return (options.mode ?? 'classic') === 'module'
    ? `let DEBUG = false
let katex = null
let katexLoadError = null
let loadPromise = null

function normalizeKaTeX(mod) {
  const resolved = (mod && mod.default) ? mod.default : mod
  if (resolved && typeof resolved.renderToString === 'function')
    return resolved
  return null
}

async function loadKaTeX() {
  if (katex || katexLoadError)
    return
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const mod = await import(${katexUrl})
        katex = normalizeKaTeX(mod) || null
        const mhchemUrl = ${mhchemUrl}
        if (mhchemUrl) {
          try {
            await import(mhchemUrl)
          }
          catch (e) {
            // ignore optional mhchem load failures
            if (DEBUG)
              console.warn('[katex-cdn-worker] failed to load mhchem', e)
          }
        }
      }
      catch (e) {
        katexLoadError = e
      }
    })()
  }
  await loadPromise
}

globalThis.addEventListener('message', async (ev) => {
  const data = ev.data || {}
  if (data.type === 'init') {
    DEBUG = !!data.debug
    if (DEBUG)
      console.debug('[katex-cdn-worker] debug enabled')
    return
  }
  const id = data.id ?? ''
  const content = data.content ?? ''
  const displayMode = data.displayMode ?? true

  await loadKaTeX()

  if (!katex) {
    const reason = katexLoadError ? String(katexLoadError?.message || katexLoadError) : 'KaTeX is not available in worker'
    globalThis.postMessage({ id, error: reason, content, displayMode })
    return
  }

  try {
    const opts = ${renderOptions}
    const html = katex.renderToString(content, { ...opts, displayMode: !!displayMode })
    globalThis.postMessage({ id, html, content, displayMode })
  }
  catch (err) {
    const msg = String(err?.message || err)
    globalThis.postMessage({ id, error: msg, content, displayMode })
  }
})
`
    : `let DEBUG = false
let katex = null
let katexLoadError = null

function normalizeKaTeX(val) {
  const resolved = (val && val.default) ? val.default : val
  if (resolved && typeof resolved.renderToString === 'function')
    return resolved
  return null
}

function loadKaTeXClassic() {
  if (katex || katexLoadError)
    return
  try {
    importScripts(${katexUrl})
    const mhchemUrl = ${mhchemUrl}
    if (mhchemUrl) {
      try {
        importScripts(mhchemUrl)
      }
      catch (e) {
        // ignore optional mhchem load failures
        if (DEBUG)
          console.warn('[katex-cdn-worker] failed to load mhchem', e)
      }
    }
    katex = normalizeKaTeX(globalThis.katex)
  }
  catch (e) {
    katexLoadError = e
  }
}

loadKaTeXClassic()

globalThis.addEventListener('message', (ev) => {
  const data = ev.data || {}
  if (data.type === 'init') {
    DEBUG = !!data.debug
    if (DEBUG)
      console.debug('[katex-cdn-worker] debug enabled')
    return
  }
  const id = data.id ?? ''
  const content = data.content ?? ''
  const displayMode = data.displayMode ?? true

  if (!katex && !katexLoadError)
    loadKaTeXClassic()

  if (!katex) {
    const reason = katexLoadError ? String(katexLoadError?.message || katexLoadError) : 'KaTeX is not available in worker'
    globalThis.postMessage({ id, error: reason, content, displayMode })
    return
  }

  try {
    const opts = ${renderOptions}
    const html = katex.renderToString(content, { ...opts, displayMode: !!displayMode })
    globalThis.postMessage({ id, html, content, displayMode })
  }
  catch (err) {
    const msg = String(err?.message || err)
    globalThis.postMessage({ id, error: msg, content, displayMode })
  }
})
`;
}

export function createKaTeXWorkerFromCDN(options: KaTeXCDNWorkerOptions): KaTeXCDNWorkerHandle {
  return createCdnWorker(
    buildKaTeXCDNWorkerSource(options),
    options.mode ?? 'classic',
    options.workerOptions,
    options.debug,
  );
}
