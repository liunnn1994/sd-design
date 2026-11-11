import type { LiquidGlassLogoRenderer } from './renderer.js';
import type { LiquidGlassLogoTuning } from './types.js';

import { createLiquidGlassLogoAutoWidth } from './auto-width.js';
import { createLiquidGlassLogoRenderer } from './renderer.js';

export interface LiquidGlassLogoAdapter {
  getElement(): HTMLElement | null;
  getCanvas(): HTMLCanvasElement | null;
  getTuning(): LiquidGlassLogoTuning;
  isAutoWidth(): boolean;
  onWidth(width: number | undefined, scale: number): void;
  onReady(): void;
  onError(error: Error): void;
}

/** One controller per mounted connection; disposal also invalidates asynchronous work. */
export function createLiquidGlassLogoController(adapter: LiquidGlassLogoAdapter) {
  let engine: LiquidGlassLogoRenderer | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let disposed = false;
  const width = createLiquidGlassLogoAutoWidth({
    getElement: adapter.getElement,
    getTuning: adapter.getTuning,
    isEnabled: adapter.isAutoWidth,
    onWidth: adapter.onWidth,
  });
  function fail(error: Error) {
    if (disposed) return;
    engine?.dispose();
    engine = null;
    adapter.onError(error);
  }
  function lost(event: Event) {
    event.preventDefault();
    fail(new Error('WebGL context lost.'));
  }
  return {
    connect() {
      canvas = adapter.getCanvas();
      width.connect();
      if (!canvas) return;
      canvas.addEventListener('webglcontextlost', lost);
      try {
        engine = createLiquidGlassLogoRenderer(
          canvas,
          adapter.getTuning(),
          () => {
            if (!disposed) adapter.onReady();
          },
          fail,
        );
        if (!engine) throw new Error('WebGL2 is unavailable.');
      } catch (error) {
        fail(error instanceof Error ? error : new Error(String(error)));
      }
    },
    updateTuning: () => engine?.update(adapter.getTuning()),
    updateWidth: () => {
      void width.update();
    },
    replay: () => engine?.replay(),
    seek: (seconds: number) => engine?.seek(seconds),
    pause: () => engine?.pause(),
    play: () => engine?.play(),
    dispose() {
      disposed = true;
      canvas?.removeEventListener('webglcontextlost', lost);
      width.dispose();
      engine?.dispose();
      engine = null;
    },
  };
}
