// Upstream exposes a mixed browser/Node timer handle as any; preserve its public signature.
// oxlint-disable-next-line typescript/no-explicit-any
export function safeRaf(callback: FrameRequestCallback): any {
  try {
    if (
      typeof globalThis !== 'undefined' &&
      typeof globalThis.requestAnimationFrame === 'function'
    ) {
      return globalThis.requestAnimationFrame(callback);
    }
  } catch {
    // Fall back when native scheduling is unavailable in the current environment.
  }
  return globalThis.setTimeout(callback, 0);
}

export function safeCancelRaf(id: number | null): void {
  if (id == null) return;
  try {
    if (
      typeof globalThis !== 'undefined' &&
      typeof globalThis.cancelAnimationFrame === 'function'
    ) {
      globalThis.cancelAnimationFrame(id);
      return;
    }
  } catch {
    // A throwing native canceller must still try the timeout fallback.
  }
  try {
    globalThis.clearTimeout(id);
  } catch {}
}
