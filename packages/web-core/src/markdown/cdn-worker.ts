export function createCdnWorker(
  source: string,
  mode: 'classic' | 'module',
  workerOptions?: WorkerOptions,
  debug?: boolean,
): { worker: Worker | null; dispose: () => void; source: string } {
  if (typeof Worker === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    return { worker: null, dispose: () => {}, source };
  }
  const blob = new Blob([source], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  let revoked = false;
  const dispose = () => {
    if (revoked) return;
    revoked = true;
    try {
      URL.revokeObjectURL(url);
    } catch {}
  };
  const options = mode === 'module' ? { ...workerOptions, type: 'module' as const } : workerOptions;
  let worker: Worker;
  try {
    worker = new Worker(url, options);
  } finally {
    dispose();
  }
  if (debug) {
    try {
      worker.postMessage({ type: 'init', debug: true });
    } catch {}
  }
  return { worker, dispose, source };
}
