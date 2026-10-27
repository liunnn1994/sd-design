import { measureNaturalWidth, prepareWithSegments } from '@chenglou/pretext';

import type { LiquidGlassLogoTuning } from './types.js';

export function getLiquidGlassLogoFont(tuning: LiquidGlassLogoTuning) {
  return `${tuning.fontWeight} ${tuning.fontSize}px ${tuning.fontFamily}`;
}

/** 与纹理绘制共用字体和图案几何；Pretext 保留字标中的空格与字间距。 */
export function measureLiquidGlassLogoText(
  mark: HTMLImageElement | null,
  tuning: LiquidGlassLogoTuning,
) {
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = getLiquidGlassLogoFont(tuning);
  probe.fontStretch = tuning.fontStretch as CanvasFontStretch;
  const spacing = tuning.letterSpacing * tuning.fontSize;
  const textWidth = Math.max(
    0,
    measureNaturalWidth(
      prepareWithSegments(tuning.text, probe.font, {
        whiteSpace: 'pre-wrap',
        letterSpacing: spacing,
      }),
    ),
  );
  const metrics = probe.measureText(tuning.text || 'x');
  const ascent = metrics.actualBoundingBoxAscent || tuning.fontSize * 0.72;
  const descent = metrics.actualBoundingBoxDescent || tuning.fontSize * 0.2;
  const xHeight = probe.measureText('x').actualBoundingBoxAscent || tuning.fontSize * 0.52;
  const markHeight = mark ? Math.max(ascent, xHeight * 1.3) : 0;
  const markWidth = mark
    ? ((mark.naturalWidth || mark.width || 1) / (mark.naturalHeight || mark.height || 1)) *
      markHeight
    : 0;
  const gap = mark && tuning.text.length ? tuning.markGap * tuning.fontSize : 0;
  return {
    spacing,
    ascent,
    descent,
    markWidth,
    markHeight,
    gap,
    contentWidth: markWidth + gap + textWidth,
  };
}
