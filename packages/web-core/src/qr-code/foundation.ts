import type { QrCodeErrorLevel, QrCodeIconSize, QrCodeType, QrCodeValue } from './types.js';

import { QRCode } from './engine.js';

export function mergeQrCodeValue(value: QrCodeValue | undefined) {
  return Array.isArray(value) ? value.join('\n') : (value ?? '');
}

export function getQrCodeIconStyle(size: QrCodeIconSize) {
  return {
    width: `${typeof size === 'number' ? size : size.width}px`,
    height: `${typeof size === 'number' ? size : size.height}px`,
  };
}

export function getQrCodeStyle(size: number, bgColor: string) {
  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: bgColor === 'transparent' ? undefined : bgColor,
  };
}

export function getQrCodeOptions(
  props: {
    color: string;
    bgColor: string;
    errorLevel: QrCodeErrorLevel;
    marginSize: number;
    size: number;
    boostLevel: boolean;
  },
  themeMode: string,
) {
  return {
    errorCorrectionLevel: props.errorLevel,
    margin: props.marginSize,
    width: props.size,
    boostLevel: props.boostLevel,
    color: {
      dark: props.color || (themeMode === 'dark' ? '#f6f6f6' : '#0b0b0a'),
      light:
        props.bgColor !== 'transparent'
          ? props.bgColor
          : themeMode === 'dark'
            ? '#20201e'
            : '#ffffff',
    },
  };
}

export function createQrCode(adapter: {
  readonly value: string;
  readonly type: QrCodeType;
  readonly options: ReturnType<typeof getQrCodeOptions>;
  readonly canvas: HTMLCanvasElement | undefined;
  nextRender(): Promise<unknown>;
  createCanvas(): HTMLCanvasElement;
  setSvg(markup: string): void;
  engine?: {
    toCanvas(
      canvas: HTMLCanvasElement,
      value: string,
      options: ReturnType<typeof getQrCodeOptions>,
    ): Promise<unknown>;
    toString(
      value: string,
      options: ReturnType<typeof getQrCodeOptions> & { type: 'svg' },
    ): Promise<string>;
  };
}) {
  let renderGeneration = 0;
  const engine = adapter.engine ?? QRCode;

  const renderCanvas = async (generation: number) => {
    const targetCanvas = adapter.canvas;
    if (!targetCanvas || !adapter.value) return;

    try {
      const nextCanvas = adapter.createCanvas();
      await engine.toCanvas(nextCanvas, adapter.value, { ...adapter.options });
      if (
        generation !== renderGeneration ||
        adapter.canvas !== targetCanvas ||
        adapter.type !== 'canvas' ||
        !adapter.value
      )
        return;
      targetCanvas.width = nextCanvas.width;
      targetCanvas.height = nextCanvas.height;
      targetCanvas.getContext('2d')?.drawImage(nextCanvas, 0, 0);
    } catch {
      // Keep the last successful canvas on encoding failure.
    }
  };

  const renderSvg = async (generation: number) => {
    if (!adapter.value) {
      adapter.setSvg('');
      return;
    }
    try {
      const markup = await engine.toString(adapter.value, { ...adapter.options, type: 'svg' });
      if (generation === renderGeneration && adapter.type === 'svg' && adapter.value) {
        adapter.setSvg(markup);
      }
    } catch {
      if (generation === renderGeneration) adapter.setSvg('');
    }
  };

  return {
    async render() {
      const generation = ++renderGeneration;
      if (!adapter.value) {
        adapter.setSvg('');
        return;
      }
      await adapter.nextRender();
      if (generation !== renderGeneration) return;
      if (adapter.type === 'canvas') {
        await renderCanvas(generation);
        return;
      }
      await renderSvg(generation);
    },
  };
}
