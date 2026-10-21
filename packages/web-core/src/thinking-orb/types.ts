/** 思考球支持的动画状态。 */
export type ThinkingOrbState =
  | 'working'
  | 'searching'
  | 'solving'
  | 'listening'
  | 'connecting'
  | 'weaving'
  | 'composing'
  | 'breathing'
  | 'shaping';

/** 针对聊天头像与行内文本分别调优的尺寸。 */
export type ThinkingOrbSize = 20 | 64;

/** 主题模式；auto 会跟随最近的 sd-theme 容器。 */
export type ThinkingOrbTheme = 'auto' | 'dark' | 'light';

/** @internal */
export type OrbState = ThinkingOrbState;
/** @internal */
export type OrbSize = ThinkingOrbSize;

export interface ThinkingOrbProps {
  /**
   * @zh 当前思考状态
   * @en Current thinking state
   */
  state?: ThinkingOrbState;
  /**
   * @zh 针对使用场景调优的尺寸
   * @en Purpose-tuned rendered size
   */
  size?: ThinkingOrbSize;
  /**
   * @zh 主题模式，auto 跟随最近的 sd-theme 容器
   * @en Theme mode; auto follows the nearest sd-theme container
   */
  theme?: ThinkingOrbTheme;
  /**
   * @zh 动画速度倍率
   * @en Animation speed multiplier
   */
  speed?: number;
  /**
   * @zh 是否暂停动画
   * @en Whether the animation is paused
   */
  paused?: boolean;
}
