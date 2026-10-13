import type { SdThemeConfig, ThemeTokenMap } from './theme';

import { generateThemePalette } from './color-palette';

// 白色与近黑色中选取对比度较高者，保证自定义品牌色仍有可读的按钮文字。
export function primaryForeground(channels: string): string {
  const linear = channels.split(',').map((channel) => {
    const value = Number(channel.trim()) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  const whiteContrast = 1.05 / (luminance + 0.05);
  const inkLuminance = ((11 / 255 + 0.055) / 1.055) ** 2.4 * 0.9278 + (10 / 255 / 12.92) * 0.0722;
  const inkContrast = (luminance + 0.05) / (inkLuminance + 0.05);
  if (whiteContrast >= inkContrast) return '#ffffff';
  return inkContrast >= 4.5 ? '#0b0b0a' : '#000000';
}

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
    if (name === 'primary') {
      tokens['color-primary-on'] = primaryForeground(palette[5]);
      tokens['color-primary-on-hover'] = primaryForeground(palette[4]);
      tokens['color-primary-on-active'] = primaryForeground(palette[6]);
    }
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
      ['large', 8],
    ] as const) {
      tokens[`size-${name}`] = `${base + delta}px`;
    }
  }
  if (compact) tokens['spacing-7'] = '12px';
  return tokens;
}
