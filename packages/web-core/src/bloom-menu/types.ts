export interface BloomMenuOffset {
  /** 水平偏移，正值向右 Horizontal offset, positive values move right */
  left?: number;
  /** 垂直偏移，正值向下 Vertical offset, positive values move down */
  top?: number;
}

/**
 * BloomMenu 项的数据结构
 *
 * Data shape for a BloomMenu item
 */
export interface BloomMenuItem<Icon = unknown> {
  /** 唯一值，用于渲染 key 与选择结果 Unique value used as the render key and selection result */
  value: string | number;
  /** 展示文本 Display label */
  label: string;
  /** 可选图标组件 Optional icon component */
  icon?: Icon;
  /** 是否禁用 Whether the item is disabled */
  disabled?: boolean;
}

export interface TriggerStyleSnapshot {
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
  boxShadow: string;
  color: string;
}
export type BloomMenuMotionTarget = {
  width?: string | undefined;
  height?: string | undefined;
  color?: string | undefined;
  backgroundColor?: string | undefined;
  borderColor?: string | undefined;
  borderRadius?: string | undefined;
  boxShadow?: string | undefined;
  opacity?: number | undefined;
};
export interface BloomMenuTransition {
  duration?: number;
  delay?: number;
  type?: 'spring';
  stiffness?: number;
  damping?: number;
  mass?: number;
  ease?: [number, number, number, number];
}
export interface BloomMenuCenterState {
  rects: {
    reference: { x: number; y: number; width: number; height: number };
    floating: { width: number; height: number };
  };
}

export interface BloomMenuProps<ButtonProps = unknown, Icon = unknown> {
  /**
   * @zh 菜单项
   * @en Menu items
   */
  items: readonly BloomMenuItem<Icon>[];
  /**
   * @zh 是否展开
   * @en Whether the menu is open
   */
  modelValue?: boolean;
  /**
   * @zh 非受控模式下的初始展开状态
   * @en Initial open state in uncontrolled mode
   */
  defaultOpen?: boolean;
  /**
   * @zh 每行列数
   * @en Number of columns per row
   */
  columns?: number;
  /**
   * @zh 面板标题
   * @en Panel title
   */
  title?: string;
  /**
   * @zh 默认触发器文本
   * @en Default trigger text
   */
  triggerText?: string;
  /**
   * @zh 触发按钮属性
   * @en Trigger button props
   */
  buttonProps?: ButtonProps;
  /**
   * @zh 浮层中心相对触发按钮中心的偏移
   * @en Popup center offset relative to the trigger center
   */
  offset?: BloomMenuOffset;
  /**
   * @zh 关闭按钮的无障碍标签,默认取国际化文案
   * @en Accessible label for the close button, defaults to the locale text
   */
  closeAriaLabel?: string;
}
