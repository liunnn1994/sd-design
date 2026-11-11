// Derived from ReactDrops liquid-glass-logo, commit b3924b92ebfce15152cf6f04ad85301c9f343672.
// ReactDrops Component License 1.0; see REACTDROPS-LICENSE.txt.
export type LiquidGlassLogoTuning = {
  /** @zh 标志图片地址。 @en Image URL (SVG, PNG, data URL…) for the logo. */
  logo: string;
  /** @zh 字标前的图片，logo 复用标志，空字符串隐藏。 @en Image placed before the wordmark: "logo" reuses the logo, an empty string hides it. */
  mark: string;
  /** @zh 字标文字。 @en text */
  text: string;
  /** @zh 动画结束内容。 @en Reveal the full wordmark, or finish on the original logo alone. */
  ending: 'logo' | 'wordmark';
  /** @zh 拟合前底板边长，24–1024。 @en Lens edge in CSS pixels before fitting. */
  logoSize: number;
  /** @zh 标志占底板比例，0.1–1。 @en Logo width or height as a fraction of the plate edge. */
  logoScale: number;
  /** @zh 最终标志缩放，0.1–1。 @en Resting logo scale; 1 holds its normal size while the glass disappears. */
  finalLogoScale: number;
  /** @zh 显示图标底板，背景图存在时强制关闭。 @en Draw the logo on an icon plate. */
  tile: boolean;
  /** @zh 字标字号，8–400。 @en fontSize */
  fontSize: number;
  /** @zh 字标字体。 @en fontFamily */
  fontFamily: string;
  /** @zh 字重，100–1000。 @en fontWeight */
  fontWeight: number;
  /** @zh Canvas 字体拉伸关键字。 @en Canvas font stretch keyword, such as "normal" or "expanded". */
  fontStretch: string;
  /** @zh 字间距，单位 em，-0.3–1。 @en Letter spacing in em. */
  letterSpacing: number;
  /** @zh 图案与文字间距，单位 em，0–2。 @en Gap between the mark and the text in em. */
  markGap: number;
  /** @zh 配色主题。 @en Color scheme for the logo, plate and background when they are not set. */
  theme: 'dark' | 'light';
  /** @zh 标志颜色，original 保留原色。 @en Recolor the logo silhouette; "original" keeps the image colors. */
  logoColor: string;
  /** @zh 标志浮雕强度，0–1。 @en Rounded shading on a recolored logo or wordmark: 0 is flat, 1 is full relief. */
  logoRelief: number;
  /** @zh 字标颜色。 @en textColor */
  textColor: string;
  /** @zh 底板颜色。 @en tileColor */
  tileColor: string;
  /** @zh 背景颜色，使用浏览器可解析的颜色。 @en background */
  background: string;
  /** @zh 玻璃光学深度，0–6。 @en Optical depth as a multiple of the lens edge; deeper glass bends more. */
  depth: number;
  /** @zh 色散强度，0–4。 @en Spread between the wavelengths' indices of refraction. */
  dispersion: number;
  /** @zh 背面折射强度，0–3。 @en Intensity of the inset glass back face and its second refracted image. */
  relief: number;
  /** @zh 焦散亮度，0–4。 @en Brightness of light focused onto the artwork by the lens. */
  caustics: number;
  /** @zh 反射强度，0–4。 @en Strength of reflections caught by the glass reliefs. */
  highlights: number;
  /** @zh 边缘辉光，0–2。 @en Diffused light around bright glass and image edges. */
  bloom: number;
  /** @zh 字标透镜初始比例，0.05–1.5。 @en Initial wordmark lens radius as a fraction of the plate edge. */
  dropSize: number;
  /** @zh 透镜曲率强度，0–4。 @en Strength of the lens curvature. */
  dropStrength: number;
  /** @zh 外缘染色比例，0–1。 @en How much the faint line just outside the rim takes the plate color (0–1). */
  echoTint: number;
  /** @zh 内壁聚焦程度，0–1。 @en 0 draws the full inner wall; 1 keeps it to the upper-left and lower-right corners. */
  innerWallFocus: number;
  /** @zh 次级玻璃环衰减时间，秒，0.1–10。 @en Seconds for the secondary glass rings to fade. */
  decay: number;
  /** @zh 速度倍率，0.1–4。 @en speed */
  speed: number;
  /** @zh 循环播放。 @en loop */
  loop: boolean;
  /** @zh 循环间隔，秒，0–30。 @en Seconds the finished wordmark holds before a loop restarts. */
  loopDelay: number;
  /** @zh 暂停动画，实例 play/pause 可临时覆盖，后续 props 更新以 paused 为准。 @en paused */
  paused: boolean;
  /** @zh 最大渲染像素比，0.5–4。 @en maxDpr */
  maxDpr: number;
};

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
