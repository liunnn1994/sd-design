import { measureNaturalWidth, prepareWithSegments } from '@chenglou/pretext';

export interface FitWidthOptions {
  whiteSpace?: 'normal' | 'pre-wrap';
  additionalWidth?: number;
}

function getFont(style: CSSStyleDeclaration) {
  if (style.font) return style.font;
  return [
    style.fontStyle,
    style.fontVariant,
    style.fontWeight,
    style.fontStretch,
    style.fontSize,
    style.fontFamily,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Text metrics are shared; adapters decide when DOM styles and fonts are ready. */
export function createFitWidthMeasurer() {
  let measurementKey = '';
  let measuredWidth = 0;
  return {
    invalidate() {
      measurementKey = '';
    },
    measure(text: string, style: CSSStyleDeclaration, options: FitWidthOptions = {}) {
      const font = getFont(style);
      const parsedLetterSpacing = Number.parseFloat(style.letterSpacing);
      const letterSpacing = Number.isFinite(parsedLetterSpacing) ? parsedLetterSpacing : 0;
      const key = [text, font, letterSpacing, options.whiteSpace, options.additionalWidth].join(
        '\0',
      );
      if (key !== measurementKey) {
        const prepared = prepareWithSegments(text, font, {
          whiteSpace: options.whiteSpace,
          letterSpacing,
        });
        measuredWidth = measureNaturalWidth(prepared) + (options.additionalWidth ?? 0);
        measurementKey = key;
      }
      return measuredWidth;
    },
  };
}
