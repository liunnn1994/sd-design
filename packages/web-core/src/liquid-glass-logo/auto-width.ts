import { clearCache } from '@chenglou/pretext';

import type { LiquidGlassLogoTuning } from './types.js';

import { getLiquidGlassLogoAutoWidth, getLiquidGlassLogoScale } from './foundation.js';
import { getLiquidGlassLogoFont, measureLiquidGlassLogoText } from './layout.js';

export interface LiquidGlassLogoAutoWidthAdapter {
  getElement(): HTMLElement | null;
  getTuning(): LiquidGlassLogoTuning;
  isEnabled(): boolean;
  onWidth(width: number | undefined, scale: number): void;
}

export function createLiquidGlassLogoAutoWidth(adapter: LiquidGlassLogoAutoWidthAdapter) {
  let observer: ResizeObserver | undefined;
  let fonts: FontFaceSet | undefined;
  let disposed = false;
  let epoch = 0;
  let lastHeight = 0;
  let frame = 0;
  let image: HTMLImageElement | null = null;
  let imageSource = '';
  let cancelImage = () => {};

  function loadMark(source: string) {
    if (source === imageSource && image) return Promise.resolve(image);
    cancelImage();
    imageSource = source;
    image = null;
    if (!source) return Promise.resolve(null);
    return new Promise<HTMLImageElement | null>((resolve) => {
      const pending = new Image();
      pending.crossOrigin = 'anonymous';
      const finish = (value: HTMLImageElement | null) => {
        pending.onload = null;
        pending.onerror = null;
        cancelImage = () => {};
        image = value;
        resolve(value);
      };
      pending.onload = () => finish(pending);
      pending.onerror = () => finish(null);
      cancelImage = () => {
        pending.removeAttribute('src');
        finish(null);
      };
      pending.src = source;
    });
  }

  async function update() {
    const version = ++epoch;
    if (disposed) return;
    const element = adapter.getElement();
    if (!adapter.isEnabled() || !element) {
      cancelImage();
      adapter.onWidth(undefined, 1);
      return;
    }
    const tuning = { ...adapter.getTuning() };
    const height = Math.max(
      1,
      Number.parseFloat(getComputedStyle(element).height) || element.clientHeight,
    );
    lastHeight = height;
    const source =
      tuning.ending === 'wordmark' ? (tuning.mark === 'logo' ? tuning.logo : tuning.mark) : '';
    const [mark] = await Promise.all([
      loadMark(source),
      fonts?.load(getLiquidGlassLogoFont(tuning), tuning.text || 'x').catch(() => undefined),
    ]);
    if (disposed || version !== epoch) return;
    const width =
      tuning.ending === 'wordmark' ? measureLiquidGlassLogoText(mark, tuning).contentWidth : 0;
    adapter.onWidth(
      getLiquidGlassLogoAutoWidth(tuning, height, width),
      getLiquidGlassLogoScale(tuning, height),
    );
  }

  const onFontsLoaded = () => {
    if (disposed) return;
    clearCache();
    void update();
  };
  return {
    update,
    connect() {
      const element = adapter.getElement();
      if (!element) return;
      fonts = document.fonts;
      fonts?.addEventListener('loadingdone', onFontsLoaded);
      observer = new ResizeObserver(() => {
        const height = Math.max(
          1,
          Number.parseFloat(getComputedStyle(element).height) || element.clientHeight,
        );
        if (height !== lastHeight && !frame) {
          lastHeight = height;
          frame = requestAnimationFrame(() => {
            frame = 0;
            void update();
          });
        }
      });
      observer.observe(element);
      void update();
    },
    dispose() {
      disposed = true;
      epoch++;
      cancelImage();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      fonts?.removeEventListener('loadingdone', onFontsLoaded);
    },
  };
}
