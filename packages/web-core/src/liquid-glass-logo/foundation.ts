// Derived from ReactDrops liquid-glass-logo, commit b3924b92ebfce15152cf6f04ad85301c9f343672.
// ReactDrops Component License 1.0; see REACTDROPS-LICENSE.txt.
import type { LiquidGlassLogoTuning } from './types.js';

const noteLogo = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 104"><path fill="#fff" d="M35 24c0-2.6 1.7-4.8 4.2-5.5L79.6 7.6C82.6 6.8 85 9 85 12.1V64c0 8.9-7.3 17-16.5 19.2C59.3 85.4 52 81 52 73.2c0-9 7.5-16.9 16.7-19.1 3.3-.8 6.3-.9 8.3-.2V28.8L43 38.1V77c0 8.9-7.3 17-16.5 19.2C17.3 98.4 10 94 10 86.2c0-9 7.5-16.9 16.7-19.1 3.3-.8 6.3-.9 8.3-.2V24Z"/></svg>',
)}`;

const referenceMark = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>',
)}`;

export const liquidGlassLogoDefaults: LiquidGlassLogoTuning = {
  logo: noteLogo,
  mark: referenceMark,
  text: 'music',
  ending: 'logo',
  logoSize: 256,
  logoScale: 0.72,
  finalLogoScale: 1,
  tile: true,
  fontSize: 64,
  fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  fontWeight: 850,
  fontStretch: 'expanded',
  letterSpacing: -0.01,
  markGap: 0.12,
  theme: 'dark',
  logoColor: '#ffffff',
  logoRelief: 1,
  textColor: '#e2e6ee',
  tileColor: '#060c18',
  background: '#000000',
  depth: 1.2,
  dispersion: 1,
  relief: 1,
  caustics: 1,
  highlights: 1,
  bloom: 0.55,
  dropSize: 0.32,
  dropStrength: 1,
  echoTint: 0.5,
  innerWallFocus: 0,
  decay: 1.4,
  speed: 1,
  loop: false,
  loopDelay: 1.6,
  paused: false,
  maxDpr: 2,
};

export const liquidGlassLogoNoteLogo = noteLogo;
export const liquidGlassLogoReferenceMark = referenceMark;

/** Length of the scripted sequence at speed 1, in seconds. */
export const liquidGlassLogoDuration = 3.3;

export const liquidGlassLogoThemes = {
  dark: { logoColor: '#ffffff', textColor: '#e2e6ee', tileColor: '#060c18', background: '#000000' },
  light: {
    logoColor: '#09111b',
    textColor: '#09111b',
    tileColor: '#e4e6ea',
    background: '#e2e2e5',
  },
} as const satisfies Record<LiquidGlassLogoTuning['theme'], Partial<LiquidGlassLogoTuning>>;

export function normalizeLiquidGlassLogo(value: LiquidGlassLogoTuning): LiquidGlassLogoTuning {
  const finite = (input: number, fallback: number, min: number, max: number) =>
    Number.isFinite(input) ? Math.min(max, Math.max(min, input)) : fallback;
  const d = liquidGlassLogoDefaults;
  return {
    ...value,
    ending: value.ending === 'wordmark' ? 'wordmark' : 'logo',
    theme: value.theme === 'light' ? 'light' : 'dark',
    logoSize: finite(value.logoSize, d.logoSize, 24, 1024),
    logoScale: finite(value.logoScale, d.logoScale, 0.1, 1),
    finalLogoScale: finite(value.finalLogoScale, d.finalLogoScale, 0.1, 1),
    fontSize: finite(value.fontSize, d.fontSize, 8, 400),
    fontWeight: finite(value.fontWeight, d.fontWeight, 100, 1000),
    letterSpacing: finite(value.letterSpacing, d.letterSpacing, -0.3, 1),
    markGap: finite(value.markGap, d.markGap, 0, 2),
    depth: finite(value.depth, d.depth, 0, 6),
    dispersion: finite(value.dispersion, d.dispersion, 0, 4),
    relief: finite(value.relief, d.relief, 0, 3),
    caustics: finite(value.caustics, d.caustics, 0, 4),
    highlights: finite(value.highlights, d.highlights, 0, 4),
    bloom: finite(value.bloom, d.bloom, 0, 2),
    dropSize: finite(value.dropSize, d.dropSize, 0.05, 1.5),
    dropStrength: finite(value.dropStrength, d.dropStrength, 0, 4),
    echoTint: finite(value.echoTint, d.echoTint, 0, 1),
    logoRelief: finite(value.logoRelief, d.logoRelief, 0, 1),
    innerWallFocus: finite(value.innerWallFocus, d.innerWallFocus, 0, 1),
    decay: finite(value.decay, d.decay, 0.1, 10),
    speed: finite(value.speed, d.speed, 0.1, 4),
    loopDelay: finite(value.loopDelay, d.loopDelay, 0, 30),
    maxDpr: finite(value.maxDpr, d.maxDpr, 0.5, 4),
  };
}

/** 合并主题与显式参数；背景图模式关闭不透明底板。 */
export function resolveLiquidGlassLogo(
  options: Partial<LiquidGlassLogoTuning>,
  backgroundImage = false,
): LiquidGlassLogoTuning {
  const defined = Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined),
  );
  return normalizeLiquidGlassLogo({
    ...liquidGlassLogoDefaults,
    ...liquidGlassLogoThemes[options.theme === 'light' ? 'light' : 'dark'],
    ...defined,
    ...(backgroundImage ? { tile: false } : {}),
  });
}

/** 根据高度与字标宽度保留渲染器所需的折射边缘空间，避免横向再次缩小内容。 */
export function getLiquidGlassLogoAutoWidth(
  tuning: LiquidGlassLogoTuning,
  height: number,
  wordmarkWidth: number,
) {
  const scale = getLiquidGlassLogoScale(tuning, height);
  return Math.ceil(getLiquidGlassLogoFrameWidth(tuning, wordmarkWidth) * scale);
}

function getLiquidGlassLogoFrameWidth(tuning: LiquidGlassLogoTuning, wordmarkWidth: number) {
  return Math.max(tuning.logoSize * 1.9, tuning.ending === 'wordmark' ? wordmarkWidth * 1.22 : 0);
}

export function getLiquidGlassLogoScale(
  tuning: LiquidGlassLogoTuning,
  height: number,
  width = Infinity,
  wordmarkWidth = 0,
) {
  return Math.min(
    1,
    Math.max(1, height) / (tuning.logoSize * 1.5),
    width / getLiquidGlassLogoFrameWidth(tuning, wordmarkWidth),
  );
}
