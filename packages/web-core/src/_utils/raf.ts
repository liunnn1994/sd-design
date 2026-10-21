const target = typeof window === 'undefined' ? globalThis : window;

const raf = target.requestAnimationFrame;
const caf = target.cancelAnimationFrame;

export { raf, caf };
