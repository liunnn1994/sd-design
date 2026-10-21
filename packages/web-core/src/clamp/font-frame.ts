// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
let pending = new Set<() => void>();
let frame: number | null = null;

export function scheduleFontFrame(callback: () => void): () => void {
  const scheduled = pending;
  scheduled.add(callback);
  frame ??= requestAnimationFrame(() => {
    const jobs = pending;
    pending = new Set();
    frame = null;
    for (const job of jobs) {
      try {
        job();
      } catch (error) {
        reportError(error);
      }
    }
  });
  return () => {
    scheduled.delete(callback);
    if (pending.size === 0 && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  };
}
