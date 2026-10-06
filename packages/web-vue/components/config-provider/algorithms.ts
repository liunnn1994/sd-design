import type { SdThemeConfig, ThemeTokenMap } from './theme';

import { generateThemePalette } from './color-palette';

export interface SdThemeSeed {
  primary?: string;
  success?: string;
  warning?: string;
  danger?: string;
  radius?: number;
  fontSize?: number;
  controlHeight?: number;
}

/** 基础 token 派生为现有 CSS 协议，显式 tokens 始终拥有更高优先级。 */
export function deriveThemeTokens(theme: SdThemeConfig): ThemeTokenMap {
  const tokens: ThemeTokenMap = {};
  const seed = theme.seed ?? {};
  const dark = theme.algorithm?.includes('dark') ?? false;
  for (const name of ['primary', 'success', 'warning', 'danger'] as const) {
    const color = seed[name];
    if (!color || !/^#[\da-f]{6}$/i.test(color)) continue;
    const palette = generateThemePalette(color, dark);
    palette.forEach((channels, index) => {
      tokens[`${name}-${index + 1}`] = channels;
      if (name === 'primary') tokens[`link-${index + 1}`] = channels;
    });
  }
  if (seed.radius !== undefined) {
    tokens['border-radius-small'] = `${seed.radius}px`;
    tokens['border-radius-medium'] = `${seed.radius * 1.5}px`;
    tokens['border-radius-large'] = `${seed.radius * 2}px`;
  }
  if (seed.fontSize !== undefined) {
    for (const [index, delta] of [-2, -1, 0].entries())
      tokens[`font-size-body-${index + 1}`] = `${seed.fontSize + delta}px`;
  }
  const compact = theme.algorithm?.includes('compact') ?? false;
  if (seed.controlHeight !== undefined || compact) {
    const base = (seed.controlHeight ?? 32) * (compact ? 0.875 : 1);
    for (const [name, delta] of [
      ['mini', -8],
      ['small', -4],
      ['default', 0],
      ['medium', 0],
      ['large', 4],
    ] as const) {
      tokens[`size-${name}`] = `${base + delta}px`;
    }
  }
  if (compact) tokens['spacing-7'] = '12px';
  return tokens;
}
