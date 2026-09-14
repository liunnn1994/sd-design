import type { CSSProperties } from 'vue';

// PanelGroup / Panel / PanelSeparator 公共类型。
export type PanelSize = number | `${number}%`;

/**
 * @zh 自定义过渡配置，时长单位毫秒
 * @en Custom transition config, duration in milliseconds
 */
export interface PanelTransition {
  /** @zh 动画类型 @en Animation type */
  type?: 'tween' | 'spring';
  /** @zh 弹簧回弹强度（0 到 1） @en Spring bounce (0 to 1) */
  bounce?: number;
  /** @zh 弹簧刚度 @en Spring stiffness */
  stiffness?: number;
  /** @zh 弹簧阻尼 @en Spring damping */
  damping?: number;
  /** @zh 弹簧质量 @en Spring mass */
  mass?: number;
  /** @zh 动画时长（毫秒），0 表示无动画 @en Animation duration in ms, 0 disables animation */
  duration?: number;
  /** @zh cubic-bezier 缓动曲线 [x1, y1, x2, y2] @en cubic-bezier easing tuple [x1, y1, x2, y2] */
  easing?: [number, number, number, number];
}

/** 折叠姿态：应用到内容元素上的样式对象。 */
export type PanelPose = CSSProperties;

/** 折叠时的内容姿态。 */
export interface PanelFold {
  /** @zh 展开时的内容样式 @en Content style while expanded */
  shown?: PanelPose;
  /** @zh 折叠时的内容样式（如 opacity、transform）@en Content style while collapsed */
  hidden?: PanelPose;
}

/**
 * @zh 面板状态快照，通过默认插槽的插槽参数暴露
 * @en Panel state snapshot exposed via the default slot props
 */
export interface PanelSlotProps {
  collapsed: boolean;
  dragging: boolean;
  folding: boolean;
}
