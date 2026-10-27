import type { LiquidGlassLogoTuning } from '@sdata/web-core/liquid-glass-logo/types';

export interface LiquidGlassLogoProps extends Partial<Omit<LiquidGlassLogoTuning, 'theme'>> {
  /** @zh 配色主题，默认 auto，优先继承组件库或页面主题，再使用浏览器偏好。 @en Color scheme; auto inherits the library or page theme, then the browser preference. */
  theme?: 'auto' | LiquidGlassLogoTuning['theme'];
  /** @zh 自动测量图标与字标的宽度，默认开启；关闭后铺满容器。显式 CSS 宽度优先。 @en Automatically size the logo and wordmark, enabled by default. Explicit CSS width takes precedence. */
  autoWidth?: boolean;
  /** @zh 容器高度，数字单位为像素，默认 32px，无最小高度限制。 @en Container height, numbers in pixels, defaults to 32px with no minimum. */
  height?: number | string;
  /** @zh 背景图片地址，使用时底板透明。 @en Background image URL, disables the opaque plate. */
  backgroundImage?: string;
  /** @zh 背景横向偏移百分比。 @en Horizontal background offset in percent. */
  backgroundX?: number;
  /** @zh 背景纵向偏移百分比。 @en Vertical background offset in percent. */
  backgroundY?: number;
  /** @zh 背景缩放比例，范围 1–3。 @en Background scale, from 1 to 3. */
  backgroundScale?: number;
  /** @zh 背景遮罩颜色。 @en Background overlay color. */
  backgroundTint?: string;
  /** @zh 背景遮罩透明度，范围 0–1。 @en Background overlay opacity, from 0 to 1. */
  backgroundTintOpacity?: number;
}

export interface LiquidGlassLogoExposed {
  /** @zh 从头播放。 @en Replay from the beginning. */
  replay(): void;
  /** @zh 跳转到指定秒数。 @en Seek to a time in seconds. */
  seek(seconds: number): void;
  /** @zh 暂停播放。 @en Pause playback. */
  pause(): void;
  /** @zh 继续播放。 @en Resume playback. */
  play(): void;
}
