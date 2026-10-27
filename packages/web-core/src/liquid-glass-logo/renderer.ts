import { clearCache } from '@chenglou/pretext';

// Derived from ReactDrops liquid-glass-logo, commit b3924b92ebfce15152cf6f04ad85301c9f343672.
// ReactDrops Component License 1.0; see REACTDROPS-LICENSE.txt.
import type { LiquidGlassLogoTuning } from './types.js';

import { liquidGlassLogoDuration, getLiquidGlassLogoScale } from './foundation.js';
import { getLiquidGlassLogoFont as font, measureLiquidGlassLogoText } from './layout.js';
import {
  liquidGlassLogoComposite,
  liquidGlassLogoRender,
  liquidGlassLogoVertex,
} from './shaders.js';
const logoFinishTime = 1.8;

type Keys = readonly (readonly [number, number])[];

/** Smooth curve through [time, value] keys (Catmull-Rom with uneven spacing). */
function track(keys: Keys, t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (t >= last[0]) return last[1];
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const [t1, v1] = keys[i];
  const [t2, v2] = keys[i + 1];
  const [t0, v0] = keys[i - 1] ?? [t1 - (t2 - t1), v1];
  const [t3, v3] = keys[i + 2] ?? [t2 + (t2 - t1), v2];
  const span = t2 - t1;
  const m1 = ((v2 - v0) / (t2 - t0)) * span;
  const m2 = ((v3 - v1) / (t3 - t1)) * span;
  const x = (t - t1) / span;
  const x2 = x * x;
  const x3 = x2 * x;
  return (
    (2 * x3 - 3 * x2 + 1) * v1 + (x3 - 2 * x2 + x) * m1 + (-2 * x3 + 3 * x2) * v2 + (x3 - x2) * m2
  );
}

// Size of the artwork under the glass relative to its resting size, measured from the
// reference: magnified by the young drop, slowly receding as the glass settles, then
// drawn into the second drop. Independent of the artwork itself.
const artworkScale: Keys = [
  [0.12, 1.4],
  [0.33, 1.45],
  [0.46, 1.44],
  [0.63, 1.33],
  [0.79, 1.24],
  [0.96, 1.2],
  [1.13, 1.11],
  [1.25, 1.0],
  [1.335, 0.865],
  [1.376, 0.81],
  [1.418, 0.735],
  [1.46, 0.41],
];

// The second drop, in wordmark half-widths (W) from the reference: its radius, the
// radius of its magnifying core, how slowly its rim stretches the image (1 = not at
// all), the core's center factor (negative inverts) and its edge magnification.
const dropRadius: Keys = [
  [1.46, 0.32],
  [1.55, 0.36],
  [1.67, 0.49],
  [1.75, 0.52],
  [1.84, 0.56],
  [1.92, 0.68],
  [2.0, 0.88],
  [2.15, 0.95],
  [2.4, 1.06],
  [2.95, 1.3],
];
const dropCore: Keys = [
  [1.46, 1.5],
  [1.84, 1.5],
  [1.92, 0.55],
  [2.0, 0.6],
  [2.09, 0.68],
  [2.17, 0.78],
  [2.3, 0.85],
  [2.5, 0.9],
  [2.75, 0.93],
  [2.95, 0.97],
  [3.02, 1.03],
];
const dropStretch: Keys = [
  [1.46, 0.3],
  [1.84, 0.3],
  [2.0, 0.25],
  [2.1, 0.2],
  [2.2, 0.2],
  [2.4, 0.25],
  [2.7, 0.3],
  [2.85, 0.45],
  [2.95, 0.8],
  [3.02, 1],
];
const dropCenter: Keys = [
  [1.46, -0.6],
  [1.6, -0.5],
  [1.75, -0.3],
  [1.8, 0.4],
  [1.84, 1],
];
const dropMagnify: Keys = [
  [1.46, 1.5],
  [1.6, 1.5],
  [1.75, 2.2],
  [1.84, 1.4],
  [1.92, 1.2],
  [2.0, 1.05],
  [2.1, 1],
];
const smooth = (from: number, to: number, value: number) => {
  const x = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return x * x * (3 - 2 * x);
};

type Raster = { canvas: HTMLCanvasElement; box: [number, number] };

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) return resolve(null);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

const nextPowerOfTwo = (value: number) => 2 ** Math.ceil(Math.log2(Math.max(2, value)));

function drawTinted(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  if (color === 'original') {
    context.drawImage(image, x, y, width, height);
    return;
  }
  const layer = document.createElement('canvas');
  layer.width = Math.max(1, Math.ceil(width));
  layer.height = Math.max(1, Math.ceil(height));
  const ink = layer.getContext('2d')!;
  ink.drawImage(image, 0, 0, layer.width, layer.height);
  ink.globalCompositeOperation = 'source-in';
  ink.fillStyle = color;
  ink.fillRect(0, 0, layer.width, layer.height);
  context.drawImage(layer, x, y, width, height);
}

function imageSize(image: HTMLImageElement) {
  const width = image.naturalWidth || image.width || 1;
  const height = image.naturalHeight || image.height || 1;
  return { width, height };
}

// A shallow relief follows the uploaded alpha silhouette, rather than any hard-coded
// glyph. A distance transform supplies a rounded shoulder for the diffuse studio light.
function shadeLogo(canvas: HTMLCanvasElement, radius: number, strength: number) {
  if (strength <= 0) return;
  const context = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const image = context.getImageData(0, 0, width, height);
  const pixels = image.data;
  const distance = new Float32Array(width * height);
  for (let i = 0; i < distance.length; i++) distance[i] = pixels[i * 4 + 3] > 127 ? 1e6 : 0;
  const diagonal = Math.SQRT2;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      distance[i] = Math.min(
        distance[i],
        distance[i - 1] + 1,
        distance[i - width] + 1,
        distance[i - width - 1] + diagonal,
        distance[i - width + 1] + diagonal,
      );
    }
  }
  for (let y = height - 2; y > 0; y--) {
    for (let x = width - 2; x > 0; x--) {
      const i = y * width + x;
      distance[i] = Math.min(
        distance[i],
        distance[i + 1] + 1,
        distance[i + width] + 1,
        distance[i + width - 1] + diagonal,
        distance[i + width + 1] + diagonal,
      );
    }
  }
  for (let i = 0; i < distance.length; i++) {
    const q = Math.max(0, 1 - distance[i] / radius);
    distance[i] = Math.sqrt(Math.max(0, 1 - q * q)) * radius * 0.4;
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (!pixels[i * 4 + 3]) continue;
      const nx = (distance[i - 1] - distance[i + 1]) * 0.5;
      const ny = (distance[i - width] - distance[i + width]) * 0.5;
      const diffuse = Math.max(0, (-nx * 0.45 - ny * 0.6 + 0.8) / Math.hypot(nx, ny, 1));
      const shaded = (0.74 + diffuse * 0.26) / (0.74 + 0.8 * 0.26);
      const light = 1 + (shaded - 1) * strength;
      for (let c = 0; c < 3; c++) pixels[i * 4 + c] *= light;
    }
  }
  context.putImageData(image, 0, 0);
}

// The logo fills a square box one plate edge wide.
function rasterLogo(
  image: HTMLImageElement | null,
  tuning: LiquidGlassLogoTuning,
  dpr: number,
): Raster {
  const size = Math.min(2048, nextPowerOfTwo(tuning.logoSize * dpr * 2));
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  if (image) {
    const { width, height } = imageSize(image);
    const fit = (size * tuning.logoScale) / Math.max(width, height);
    const w = width * fit;
    const h = height * fit;
    drawTinted(context, image, (size - w) / 2, (size - h) / 2, w, h, tuning.logoColor);
  }
  if (image && tuning.logoColor !== 'original') {
    shadeLogo(canvas, canvas.width * 0.03, tuning.logoRelief);
  }
  return { canvas, box: [tuning.logoSize, tuning.logoSize] };
}

// The wordmark box is padded so refracted rays sample transparent texels past its edges.
function rasterText(mark: HTMLImageElement | null, tuning: LiquidGlassLogoTuning, dpr: number) {
  const { spacing, ascent, descent, markWidth, markHeight, gap, contentWidth } =
    measureLiquidGlassLogoText(mark, tuning);
  const pad = tuning.fontSize * 0.5;
  const box: [number, number] = [contentWidth + pad * 2, tuning.fontSize * 2];
  const scale = Math.min(dpr * 2, 4096 / box[0], 4096 / box[1]);
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(4096, nextPowerOfTwo(box[0] * scale));
  canvas.height = Math.min(4096, nextPowerOfTwo(box[1] * scale));
  const context = canvas.getContext('2d')!;
  context.scale(canvas.width / box[0], canvas.height / box[1]);
  // Center the ink box vertically.
  const baseline = box[1] / 2 + (ascent - descent) / 2;
  let x = pad;
  if (mark) {
    const color = tuning.logoColor === 'original' ? 'original' : tuning.textColor;
    drawTinted(context, mark, x, baseline - markHeight, markWidth, markHeight, color);
    x += markWidth + gap;
  }
  context.font = font(tuning);
  context.fontStretch = tuning.fontStretch as CanvasFontStretch;
  context.fillStyle = tuning.textColor;
  context.textBaseline = 'alphabetic';
  context.letterSpacing = `${spacing}px`;
  context.textAlign = 'left';
  context.fillText(tuning.text, x, baseline);
  if (tuning.logoColor !== 'original') {
    shadeLogo(canvas, (tuning.fontSize * 0.04 * canvas.height) / box[1], tuning.logoRelief);
  }
  return { canvas, box, contentWidth };
}

function parseColor(value: string): [number, number, number] {
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.fillStyle = '#000';
  probe.fillStyle = value;
  const hex = String(probe.fillStyle);
  if (hex.startsWith('#')) {
    const n = parseInt(hex.slice(1, 7), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const parts = hex.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

export type LiquidGlassLogoRenderer = {
  update: (tuning: LiquidGlassLogoTuning) => void;
  replay: () => void;
  seek: (seconds: number) => void;
  pause: () => void;
  play: () => void;
  dispose: () => void;
};

export function createLiquidGlassLogoRenderer(
  canvas: HTMLCanvasElement,
  initial: LiquidGlassLogoTuning,
  onReady?: () => void,
  onError?: (error: Error) => void,
): LiquidGlassLogoRenderer | null {
  const gl = canvas.getContext('webgl2', {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false,
  });
  if (!gl) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message ?? 'Liquid Glass Logo shader failed to compile.');
    }
    return shader;
  };
  const link = (fragment: string) => {
    const result = gl.createProgram()!;
    let vertex: WebGLShader | null = null;
    let pixel: WebGLShader | null = null;
    try {
      vertex = compile(gl.VERTEX_SHADER, liquidGlassLogoVertex);
      pixel = compile(gl.FRAGMENT_SHADER, fragment);
      gl.attachShader(result, vertex);
      gl.attachShader(result, pixel);
      gl.bindAttribLocation(result, 0, 'aPosition');
      gl.linkProgram(result);
      if (!gl.getProgramParameter(result, gl.LINK_STATUS)) {
        throw new Error(
          gl.getProgramInfoLog(result) ?? 'Liquid Glass Logo program failed to link.',
        );
      }
      return result;
    } catch (error) {
      gl.deleteProgram(result);
      throw error;
    } finally {
      gl.deleteShader(vertex);
      gl.deleteShader(pixel);
    }
  };
  const program = link(liquidGlassLogoRender);
  let composite: WebGLProgram;
  try {
    composite = link(liquidGlassLogoComposite);
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  }
  const compositeUniform = Object.fromEntries(
    [
      'uScene',
      'uResolution',
      'uDpr',
      'uUnit',
      'uSettle',
      'uBloom',
      'uTime',
      'uFinish',
      'uPageLight',
    ].map((name) => [name, gl.getUniformLocation(composite, name)]),
  );
  const locations = new Map<string, WebGLUniformLocation | null>();
  const uniform = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name)!;
  };
  const quad = gl.createVertexArray();
  gl.bindVertexArray(quad);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const texture = () => {
    const value = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, value);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return value;
  };
  const logoTexture = texture();
  const textTexture = texture();
  const sceneTexture = texture();
  const sceneFramebuffer = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  let sceneWidth = 0;
  let sceneHeight = 0;
  const resizeScene = () => {
    if (sceneWidth === canvas.width && sceneHeight === canvas.height) return;
    sceneWidth = canvas.width;
    sceneHeight = canvas.height;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      sceneWidth,
      sceneHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
  };
  const upload = (value: WebGLTexture, source: HTMLCanvasElement) => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, value);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
  };

  let tuning = initial;
  let dpr = 1;
  let width = 1;
  let height = 1;
  let textBox: [number, number] = [1, 1];
  let textWidth = 0;
  let loaded = false;
  let disposed = false;
  let rasterKey = '';
  let rasterVersion = 0;
  let logoCache: { key: string; raster: Raster } | null = null;
  let clock = 0;
  let last = 0;
  let playing = !initial.paused;
  let visible = true;
  let frame = 0;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  const fit = () => getLiquidGlassLogoScale(tuning, height, width, textWidth);
  const draw = () => {
    if (!loaded || disposed) return;
    const scale = fit();
    resizeScene();
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.bindVertexArray(quad);
    [logoTexture, textTexture].forEach((value, index) => {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, value);
    });
    gl.uniform1i(uniform('uLogo'), 0);
    gl.uniform1i(uniform('uText'), 1);
    gl.uniform2f(uniform('uResolution'), canvas.width, canvas.height);
    gl.uniform1f(uniform('uDpr'), canvas.width / width);
    gl.uniform1f(uniform('uUnit'), tuning.logoSize * scale);
    // The logo always occupies one plate edge. Its bounds must follow the
    // current size immediately, even while a sharper texture loads asynchronously.
    gl.uniform2f(uniform('uLogoBox'), tuning.logoSize * scale, tuning.logoSize * scale);
    gl.uniform2f(uniform('uTextBox'), textBox[0] * scale, textBox[1] * scale);
    gl.uniform1f(uniform('uTextWidth'), textWidth * scale);
    const finishTime = tuning.ending === 'logo' ? logoFinishTime : liquidGlassLogoDuration;
    const sequenceTime = reduced?.matches ? finishTime : clock;
    const displayTime =
      tuning.ending === 'logo' ? Math.min(logoFinishTime, sequenceTime) : sequenceTime;
    gl.uniform1f(uniform('uTime'), displayTime);
    gl.uniform1f(uniform('uWordmarkEnabled'), tuning.ending === 'wordmark' ? 1 : 0);
    const settle =
      tuning.ending === 'logo' ? Math.max(0, Math.min(1, (sequenceTime - 1.16) / (1.4 - 1.16))) : 0;
    // The wordmark drop scales with the measured wordmark so any text gets the same optics.
    const unitPx = tuning.logoSize * scale;
    const reach = Math.max((textWidth * scale) / 2, unitPx * 0.3);
    const t = displayTime;
    const settleWaves = 1 - smooth(2.85, 3.02, t);
    gl.uniform4f(
      uniform('uDrop'),
      reach * track(dropRadius, t),
      reach * track(dropCore, t),
      Math.max(0.02, Math.min(1, track(dropStretch, t))),
      1 + (track(dropCenter, t) - 1) * tuning.dropStrength,
    );
    gl.uniform4f(
      uniform('uDropLens'),
      1 + (track(dropMagnify, t) - 1) * tuning.dropStrength,
      2 + 4 * smooth(1.74, 1.84, t),
      unitPx *
        (0.009 * Math.exp(-Math.max(t - 1.46, 0) / 0.5) * (1 - smooth(1.85, 1.95, t)) +
          0.012 * smooth(2.2, 2.4, t)) *
        settleWaves,
      unitPx * (0.07 + (0.03 - 0.07) * smooth(1.9, 2.4, t)),
    );
    gl.uniform4f(
      uniform('uDropWave'),
      (t - 1.45) * 42,
      1 - smooth(1.85, 2.0, t),
      2 * (0.12 + 1.6 * smooth(1.86, 2.0, t) - 0.9 * smooth(2.25, 2.5, t)) * settleWaves,
      0,
    );
    const artworkSettle = smooth(1.13, 1.28, sequenceTime);
    const artScale =
      tuning.ending === 'logo' && sequenceTime > 1.13
        ? track(artworkScale, 1.13) * (1 - artworkSettle) + tuning.finalLogoScale * artworkSettle
        : track(artworkScale, displayTime);
    gl.uniform1f(uniform('uArtScale'), artScale);
    // The logo reaches its resting size first, then holds while the glass clears.
    gl.uniform1f(uniform('uSettle'), settle);
    gl.uniform3fv(uniform('uTile'), parseColor(tuning.tileColor));
    const [pageR, pageG, pageB] = parseColor(tuning.background);
    const pageLuma = 0.299 * pageR + 0.587 * pageG + 0.114 * pageB;
    const pageLight = Math.min(1, Math.max(0, (pageLuma - 0.35) / 0.4));
    gl.uniform1f(uniform('uPageLight'), pageLight);
    gl.uniform1f(uniform('uTileEnabled'), tuning.tile ? 1 : 0);
    gl.uniform1f(uniform('uDepth'), tuning.depth);
    gl.uniform1f(uniform('uDispersion'), tuning.dispersion);
    gl.uniform1f(uniform('uRelief'), tuning.relief);
    gl.uniform1f(uniform('uCaustics'), tuning.caustics);
    gl.uniform1f(uniform('uHighlights'), tuning.highlights);
    gl.uniform1f(uniform('uEchoTint'), tuning.echoTint);
    gl.uniform1f(uniform('uInnerWallFocus'), tuning.innerWallFocus);
    gl.uniform1f(uniform('uDropSize'), tuning.dropSize);
    gl.uniform1f(uniform('uDropStrength'), tuning.dropStrength);
    gl.uniform1f(uniform('uDecay'), tuning.decay);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // A mip pyramid supplies soft light at several scales without a costly blur kernel.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(composite);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(compositeUniform.uScene, 0);
    gl.uniform2f(compositeUniform.uResolution, canvas.width, canvas.height);
    gl.uniform1f(compositeUniform.uDpr, canvas.width / width);
    gl.uniform1f(compositeUniform.uUnit, unitPx);
    gl.uniform1f(compositeUniform.uSettle, settle);
    gl.uniform1f(compositeUniform.uBloom, tuning.bloom);
    gl.uniform1f(compositeUniform.uPageLight, pageLight);
    gl.uniform1f(compositeUniform.uTime, displayTime);
    gl.uniform1f(
      compositeUniform.uFinish,
      tuning.ending === 'logo'
        ? Math.max(0, Math.min(1, (sequenceTime - 1.05) / (logoFinishTime - 1.05)))
        : Math.max(0, Math.min(1, (sequenceTime - 2.8) / (liquidGlassLogoDuration - 2.8))),
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const raster = async () => {
    const key = JSON.stringify([
      tuning.logo,
      tuning.mark,
      tuning.text,
      tuning.logoSize,
      tuning.logoScale,
      tuning.fontSize,
      tuning.fontFamily,
      tuning.fontWeight,
      tuning.fontStretch,
      tuning.letterSpacing,
      tuning.markGap,
      tuning.logoColor,
      tuning.logoRelief,
      tuning.textColor,
      dpr,
    ]);
    if (key === rasterKey) return;
    rasterKey = key;
    const version = ++rasterVersion;
    // Snapshot the options: a late image or font load must never rasterize newer props.
    const options = { ...tuning };
    const markSource = options.mark === 'logo' ? options.logo : options.mark;
    const [logo, mark] = await Promise.all([
      loadImage(options.logo),
      markSource === options.logo ? null : loadImage(markSource),
      document.fonts?.load(font(options), options.text || 'x').catch(() => undefined),
    ]);
    if (disposed || version !== rasterVersion) return;
    const markImage = markSource === options.logo ? logo : mark;
    const logoKey = JSON.stringify([
      options.logo,
      options.logoSize,
      options.logoScale,
      options.logoColor,
      options.logoRelief,
      dpr,
    ]);
    const logoRaster =
      logoCache?.key === logoKey ? logoCache.raster : rasterLogo(logo, options, dpr);
    logoCache = { key: logoKey, raster: logoRaster };
    const textRaster = rasterText(markSource ? markImage : null, options, dpr);
    upload(logoTexture, logoRaster.canvas);
    upload(textTexture, textRaster.canvas);
    textBox = textRaster.box;
    textWidth = textRaster.contentWidth;
    if (!loaded) {
      loaded = true;
      last = 0;
      onReady?.();
    }
    draw();
    request();
  };

  const tick = (now: number) => {
    frame = 0;
    const delta = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const moving = playing && visible && !reduced?.matches && loaded;
    if (moving) {
      clock += delta * tuning.speed;
      const cycle =
        (tuning.ending === 'logo' ? logoFinishTime : liquidGlassLogoDuration) + tuning.loopDelay;
      if (tuning.loop && clock >= cycle) clock %= cycle;
    }
    draw();
    if (
      moving &&
      (tuning.loop || clock < (tuning.ending === 'logo' ? logoFinishTime : liquidGlassLogoDuration))
    )
      request();
    else last = 0;
  };
  function request() {
    if (!frame && !disposed) frame = requestAnimationFrame(tick);
  }

  const resize = () => {
    // CSS transforms can move and scale the preview without changing its layout.
    // Keep WebGL coordinates tied to that layout throughout the animation.
    const style = getComputedStyle(canvas);
    width = Math.max(1, Number.parseFloat(style.width) || canvas.clientWidth);
    height = Math.max(1, Number.parseFloat(style.height) || canvas.clientHeight);
    const nextDpr = Math.min(window.devicePixelRatio || 1, tuning.maxDpr);
    canvas.width = Math.max(1, Math.round(width * nextDpr));
    canvas.height = Math.max(1, Math.round(height * nextDpr));
    if (nextDpr !== dpr) {
      dpr = nextDpr;
      void raster().catch((error: unknown) => {
        if (!disposed) onError?.(error instanceof Error ? error : new Error(String(error)));
      });
    }
    draw();
    request();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    last = 0;
    if (visible) request();
  });
  visibility.observe(canvas);
  const onMotion = () => {
    last = 0;
    request();
  };
  reduced?.addEventListener?.('change', onMotion);
  const onFontsLoaded = () => {
    if (disposed) return;
    clearCache();
    rasterKey = '';
    void raster().catch((error: unknown) => {
      if (!disposed) onError?.(error instanceof Error ? error : new Error(String(error)));
    });
  };
  document.fonts?.addEventListener('loadingdone', onFontsLoaded);
  resize();
  void raster().catch((error: unknown) => {
    if (!disposed) onError?.(error instanceof Error ? error : new Error(String(error)));
  });

  return {
    update(next) {
      const wasPlaying = playing;
      tuning = next;
      playing = !next.paused;
      if (!wasPlaying && playing) last = 0;
      resize();
      void raster().catch((error: unknown) => {
        if (!disposed) onError?.(error instanceof Error ? error : new Error(String(error)));
      });
    },
    replay() {
      clock = 0;
      last = 0;
      draw();
      request();
    },
    seek(seconds) {
      clock = Number.isFinite(seconds) ? Math.max(0, Math.min(3600, seconds)) : 0;
      last = 0;
      draw();
    },
    pause() {
      playing = false;
      last = 0;
    },
    play() {
      playing = true;
      last = 0;
      request();
    },
    dispose() {
      disposed = true;
      logoCache = null;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      reduced?.removeEventListener?.('change', onMotion);
      document.fonts?.removeEventListener('loadingdone', onFontsLoaded);
      gl.deleteTexture(logoTexture);
      gl.deleteTexture(textTexture);
      gl.deleteTexture(sceneTexture);
      gl.deleteFramebuffer(sceneFramebuffer);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(quad);
      gl.deleteProgram(program);
      gl.deleteProgram(composite);
    },
  };
}
