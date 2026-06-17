/**
 * Size/type preset for the border beam effect
 *
 * Rotate family (traveling/spinning beam):
 * - 'sm': Small button-sized with compact glow
 * - 'md': Medium card-sized with full border glow
 * - 'line': Bottom-only traveling glow with breathe and spike animations
 *
 * Pulse family (breathing glow, no rotation):
 * - 'pulse-outside': Glow blooms OUTWARD beyond the element (uncropped halo)
 * - 'pulse-inner': Glow breathes contained within the element's border
 *
 * 尺寸/类型预设
 *
 * 旋转系列（移动/旋转光束）:
 * - 'sm': 小型按钮尺寸，紧凑光晕
 * - 'md': 中型卡片尺寸，完整边框光晕
 * - 'line': 仅底部移动光晕，带呼吸和尖峰动画
 *
 * 脉冲系列（呼吸光晕，无旋转）:
 * - 'pulse-outside': 光晕向外绽放，超出元素边界
 * - 'pulse-inner': 光晕在元素边框内呼吸
 */
export type BorderBeamSize = 'sm' | 'md' | 'line' | 'pulse-outside' | 'pulse-inner';

/**
 * Theme mode for adapting beam colors to background
 *
 * 主题模式，用于适配光晕颜色与背景
 */
export type BorderBeamTheme = 'dark' | 'light' | 'auto';

/**
 * Color variant for the beam effect
 * - 'colorful': Full rainbow spectrum (default)
 * - 'mono': Monochromatic grayscale
 * - 'ocean': Blue and purple tones
 * - 'sunset': Warm orange, yellow, and red tones
 *
 * 光晕颜色变体
 * - 'colorful': 全彩虹光谱（默认）
 * - 'mono': 单色灰度
 * - 'ocean': 蓝紫色调
 * - 'sunset': 暖色调（橙、黄、红）
 */
export type BorderBeamColorVariant = 'colorful' | 'mono' | 'ocean' | 'sunset';

/**
 * Configuration for a size preset
 *
 * 尺寸预设配置
 */
export interface SizeConfig {
  borderRadius: number;
  borderWidth: number;
  width?: number;
  height?: number;
}

/**
 * Theme color configuration
 *
 * 主题颜色配置
 */
export interface ThemeColors {
  strokeOpacity: number;
  innerOpacity: number;
  bloomOpacity: number;
  innerShadow: string;
  saturation: number;
  /** Optional per-type default brightness (used by pulse types). Falls back to 1.3. */
  brightness?: number;
  /**
   * Optional opacity of the 1px hairline border that frames the element.
   * Used by 'pulse-outside' so the colored stroke rides a subtle outline.
   * Falls back to 0 (no hairline).
   */
  hairlineOpacity?: number;
}
