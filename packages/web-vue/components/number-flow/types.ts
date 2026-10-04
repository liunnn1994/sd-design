import type { CSSProperties } from 'vue';

export type NumberFlowValue = number | string;

export type NumberFlowFormat = Omit<Intl.NumberFormatOptions, 'notation'> & {
  notation?: Exclude<Intl.NumberFormatOptions['notation'], 'scientific' | 'engineering'>;
};

export type NumberFlowTrend = number | ((oldValue: number, value: number) => number);

export type NumberFlowDigitOptions = { max?: number };
export type NumberFlowDigits = Record<number, NumberFlowDigitOptions>;

export interface NumberFlowDigitContext {
  position: number;
  length: number;
  trend: number;
  highestChangedPosition?: number;
}

export interface NumberFlowPluginContext {
  value: number;
  previousValue: number;
  trend: number;
}

export interface NumberFlowPlugin {
  onUpdate?(context: NumberFlowPluginContext): void;
  getDelta?(value: number, previousValue: number, context: NumberFlowDigitContext): number | void;
}

export interface NumberFlowProps {
  /**
   * @zh 要显示的数值
   * @en The number to display
   */
  value: NumberFlowValue;
  /**
   * @zh 数字本地化区域，如 en-US、zh-CN
   * @en Locale used to format the number, e.g. en-US, zh-CN
   */
  locales?: Intl.LocalesArgument;
  /**
   * @zh 数字格式化配置，如小数位与分组
   * @en Number formatting options such as decimals and grouping
   */
  format?: NumberFlowFormat;
  /**
   * @zh 数值前缀
   * @en Prefix rendered before the number
   */
  prefix?: string;
  /**
   * @zh 数值后缀
   * @en Suffix rendered after the number
   */
  suffix?: string;
  /**
   * @zh 数值变化趋势，指定后各数字按该方向滚动
   * @en Direction the digits scroll in; fixing it makes all changes follow one direction
   */
  trend?: NumberFlowTrend;
  /**
   * @zh 用于接管数值渲染的插件列表
   * @en Plugins that take over how the number is rendered
   */
  plugins?: NumberFlowPlugin[];
  /**
   * @zh 数值变化时是否播放动画
   * @en Whether to animate value changes
   */
  animated?: boolean;
  /**
   * @zh 位移动画参数
   * @en Timing options of the transform animation
   */
  transformTiming?: KeyframeAnimationOptions;
  /**
   * @zh 数字滚动动画参数
   * @en Timing options of the digit spin animation
   */
  spinTiming?: KeyframeAnimationOptions;
  /**
   * @zh 淡入淡出动画参数
   * @en Timing options of the opacity animation
   */
  opacityTiming?: KeyframeAnimationOptions;
  /**
   * @zh 是否遵循系统的「减弱动态效果」设置
   * @en Whether to respect the reduced-motion system setting
   */
  respectMotionPreference?: boolean;
  /**
   * @zh 每个数位显示的字符
   * @en Characters rendered for each digit position
   */
  digits?: NumberFlowDigits;
  /**
   * @zh 是否提示浏览器做绘制优化
   * @en Whether to hint the browser to optimise painting
   */
  willChange?: boolean;
  /** CSP nonce for strict-dynamic environments */
  nonce?: string;
}

export interface NumberFlowExposed {
  el: HTMLElement | null;
}

export type NumberFlowStyle = CSSProperties & Record<`--${string}`, string | number>;
