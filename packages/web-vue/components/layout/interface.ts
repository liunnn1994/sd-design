import type { CSSProperties } from 'vue';

import type { SiderBreakpoint } from '../_utils/responsive-observe';
import type { DrawerProps } from '../drawer';
import type { ScrollbarProps } from '../scrollbar';

/**
 * @zh Sider 主题
 * @en Sider theme
 */
export type SiderTheme = 'light' | 'dark';

/**
 * @zh 触发折叠的类型
 * @en Trigger type of collapsing
 */
export type CollapseType = 'clickTrigger' | 'responsive';

/**
 * @zh Layout 容器属性
 * @en Layout container props
 */
export interface LayoutProps {
  /**
   * @zh 是否包含 Sider（设为布尔值时强制覆盖自动检测）
   * @en Whether contains Sider (when set to a boolean, overrides auto detection)
   */
  hasSider?: boolean;
}

/**
 * @zh Sider 属性，完整对齐 antd Layout.Sider 能力
 * @en Sider props, fully aligned with antd Layout.Sider
 */
export interface SiderProps {
  /**
   * @zh 是否可折叠
   * @en Whether can be collapsed
   */
  collapsible?: boolean;
  /**
   * @zh 当前折叠状态（受控）
   * @en Current collapsed state (controlled)
   */
  collapsed?: boolean;
  /**
   * @zh 默认折叠状态（非受控）
   * @en Default collapsed state (uncontrolled)
   */
  defaultCollapsed?: boolean;
  /**
   * @zh 折叠时是否反转箭头方向（在右侧 Sider 上使用）
   * @en Reverse arrow direction when collapsed (used on right Sider)
   */
  reverseArrow?: boolean;
  /**
   * @zh collapsedWidth 为 0 时零宽触发器的自定义样式
   * @en Custom style of zero-width trigger when collapsedWidth is 0
   */
  zeroWidthTriggerStyle?: CSSProperties;
  /**
   * @zh 是否隐藏内置折叠触发器，配合受控的 collapsed 自行控制折叠
   * @en Whether to hide the built-in collapse trigger, control collapse via collapsed
   */
  hideTrigger?: boolean;
  /**
   * @zh 展开时的宽度
   * @en Width when expanded
   */
  width?: number | string;
  /**
   * @zh 折叠时的宽度
   * @en Width when collapsed
   */
  collapsedWidth?: number | string;
  /**
   * @zh 响应式断点，命中断点时自动折叠
   * @en Responsive breakpoint, auto collapse when matched
   */
  breakpoint?: SiderBreakpoint;
  /**
   * @zh 主题颜色
   * @en Theme color
   */
  theme?: SiderTheme;
  /**
   * @zh 滚动配置，默认使用组件库 Scrollbar；设为 false 使用原生 overflow:auto，传对象可配置 Scrollbar
   * @en Scroll config, use the component Scrollbar by default; set to false for native overflow:auto, pass an object to configure Scrollbar
   */
  scrollbar?: boolean | ScrollbarProps;
  /**
   * @zh 临时模式：使用 Drawer 渲染悬浮菜单，由 collapsed 控制开合（collapsed=true 关闭，false 展开）
   * @en Temporary mode: render as a floating Drawer, opened/closed via collapsed (collapsed=true closes, false opens)
   */
  temporary?: boolean;
  /**
   * @zh temporary 模式下透传给 Drawer 的配置（仅 temporary=true 时生效）。已排除与 Sider 语义冲突的字段（visible/defaultVisible/width 等）
   * @en Drawer passthrough config (only effective when temporary=true). Fields clashing with Sider semantics (visible/defaultVisible/width, etc.) are omitted
   */
  drawerProps?: SiderTemporaryDrawerProps;
}

/**
 * @zh temporary 模式下透传给 Drawer 的配置类型。排除由 Sider 接管的字段：
 * - `visible` / `defaultVisible`：由 collapsed 派生
 * - `width`：复用 Sider 的 width
 * - `footer` 及确认/取消相关字段：导航抽屉不需要
 * - `onBeforeOk` / `onBeforeCancel`：与导航场景无关
 * @en Drawer passthrough config type for temporary mode. Omits fields owned by Sider:
 * - `visible` / `defaultVisible`: derived from collapsed
 * - `width`: reused from Sider width
 * - `footer` and ok/cancel related fields: a nav drawer has none
 * - `onBeforeOk` / `onBeforeCancel`: not relevant to a nav drawer
 */
export type SiderTemporaryDrawerProps = Omit<
  DrawerProps,
  | 'visible'
  | 'defaultVisible'
  | 'width'
  | 'footer'
  | 'okText'
  | 'cancelText'
  | 'okLoading'
  | 'okButtonProps'
  | 'cancelButtonProps'
  | 'hideCancel'
  | 'onBeforeOk'
  | 'onBeforeCancel'
>;
