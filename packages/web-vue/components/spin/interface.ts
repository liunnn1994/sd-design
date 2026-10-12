export interface SpinProps {
  /**
   * @zh 尺寸
   * @en Size
   */
  size?: number;
  /**
   * @zh 是否为加载中状态（仅在容器模式下生效）
   * @en Whether it is loading state (Only effective in container mode)
   */
  loading?: boolean;
  /**
   * @zh 加载指示器显示前的延迟时间。设置为 `true` 时延迟 400ms
   * @en Delay before showing the loading indicator. Uses 400ms when set to `true`
   */
  delay?: boolean | number;
  /**
   * @zh 是否使用点类型的动画
   * @en Whether to use dot type animation
   */
  dot?: boolean;
  /**
   * @zh 提示内容
   * @en Prompt content
   */
  tip?: string;
  /**
   * @zh 是否隐藏图标
   * @en Whether to hide the icon
   */
  hideIcon?: boolean;
}
