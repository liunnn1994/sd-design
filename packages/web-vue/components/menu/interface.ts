import { StyleValue } from 'vue';

import type { FloatingOptions } from '../_utils/floating';

import { Breakpoint } from '../_utils/responsive-observe';
import { Data } from '../_utils/types';
import { EllipsisTooltipProps } from '../ellipsis';
import { TriggerProps } from '../trigger';

export type MenuTheme = 'light' | 'dark';

export type MenuMode = 'vertical' | 'horizontal' | 'pop' | 'popButton';

export interface SubMenuChildDataType {
  key: string;
  children?: SubMenuChildDataType[];
}

export type PopupMenuMaxHeightType = boolean | number;

export interface MenuEllipsisProps {
  lineClamp?: number | string;
  expandTrigger?: 'click';
  tooltip?: boolean | EllipsisTooltipProps;
}

export interface MenuProps {
  /**
   * @zh 菜单容器的行内样式
   * @en Inline style of the menu container
   */
  /**
   * @zh 菜单容器的行内样式
   * @en Inline style of the menu container
   */
  style: StyleValue | undefined;
  theme: MenuTheme | undefined;
  mode: MenuMode;
  /**
   * @zh 每一级菜单的缩进宽度（像素）
   * @en Indent width of each menu level in pixels
   */
  /**
   * @zh 每一级菜单的缩进宽度（像素）
   * @en Indent width of each menu level in pixels
   */
  levelIndent: number | undefined;
  /**
   * @zh 是否默认展开所有子菜单
   * @en Whether all submenus are expanded by default
   */
  /**
   * @zh 是否默认展开所有子菜单
   * @en Whether all submenus are expanded by default
   */
  autoOpen: boolean;
  /**
   * @zh 是否折叠为图标模式（受控）
   * @en Whether the menu is collapsed to icons (controlled)
   */
  /**
   * @zh 是否折叠为图标模式（受控）
   * @en Whether the menu is collapsed to icons (controlled)
   */
  collapsed: boolean | undefined;
  /**
   * @zh 是否默认折叠为图标模式（非受控状态）
   * @en Whether the menu is collapsed to icons by default (uncontrolled state)
   */
  /**
   * @zh 是否默认折叠为图标模式（非受控状态）
   * @en Whether the menu is collapsed to icons by default (uncontrolled state)
   */
  defaultCollapsed: boolean;
  /**
   * @zh 折叠态的宽度（像素）
   * @en Width of the collapsed menu in pixels
   */
  /**
   * @zh 折叠态的宽度（像素）
   * @en Width of the collapsed menu in pixels
   */
  collapsedWidth: number | undefined;
  /**
   * @zh 同一时间是否只展开一个子菜单
   * @en Whether only one submenu can be open at a time
   */
  /**
   * @zh 同一时间是否只展开一个子菜单
   * @en Whether only one submenu can be open at a time
   */
  accordion: boolean;
  /**
   * @zh 选中项是否自动滚动到可视区域
   * @en Whether the selected item scrolls into view
   */
  /**
   * @zh 选中项是否自动滚动到可视区域
   * @en Whether the selected item scrolls into view
   */
  autoScrollIntoView: boolean;
  /**
   * @zh 是否显示折叠/展开按钮
   * @en Whether the collapse/expand button is shown
   */
  /**
   * @zh 是否显示折叠/展开按钮
   * @en Whether the collapse/expand button is shown
   */
  showCollapseButton: boolean;
  /**
   * @zh 选中的菜单项 key（受控）
   * @en Keys of the selected menu items (controlled)
   */
  /**
   * @zh 选中的菜单项 key（受控）
   * @en Keys of the selected menu items (controlled)
   */
  selectedKeys: string[] | undefined;
  /**
   * @zh 默认选中的菜单项 key（非受控状态）
   * @en Keys of the menu items selected by default (uncontrolled state)
   */
  /**
   * @zh 默认选中的菜单项 key（非受控状态）
   * @en Keys of the menu items selected by default (uncontrolled state)
   */
  defaultSelectedKeys: string[];
  /**
   * @zh 展开的子菜单 key（受控）
   * @en Keys of the expanded submenus (controlled)
   */
  /**
   * @zh 展开的子菜单 key（受控）
   * @en Keys of the expanded submenus (controlled)
   */
  openKeys: string[] | undefined;
  /**
   * @zh 默认展开的子菜单 key（非受控状态）
   * @en Keys of the submenus expanded by default (uncontrolled state)
   */
  /**
   * @zh 默认展开的子菜单 key（非受控状态）
   * @en Keys of the submenus expanded by default (uncontrolled state)
   */
  defaultOpenKeys: string[];
  /**
   * @zh 虚拟滚动的配置
   * @en Configuration of the virtual scrolling
   */
  /**
   * @zh 虚拟滚动的配置
   * @en Configuration of the virtual scrolling
   */
  scrollConfig: Record<string, unknown> | undefined;
  /**
   * @zh 触发器的组件属性
   * @en Props forwarded to the trigger
   */
  /**
   * @zh 触发器的组件属性
   * @en Props forwarded to the trigger
   */
  triggerProps: TriggerProps | undefined;
  floatingOptions: FloatingOptions | undefined;
  /**
   * @zh 折叠态提示浮层的组件属性
   * @en Props forwarded to the tooltip shown in collapsed mode
   */
  /**
   * @zh 折叠态提示浮层的组件属性
   * @en Props forwarded to the tooltip shown in collapsed mode
   */
  tooltipProps: Data | undefined;
  ellipsis: boolean;
  ellipsisProps: MenuEllipsisProps | undefined;
  /**
   * @zh 是否自动展开选中项的父级菜单
   * @en Whether the parents of the selected item are expanded automatically
   */
  /**
   * @zh 是否自动展开选中项的父级菜单
   * @en Whether the parents of the selected item are expanded automatically
   */
  autoOpenSelected: boolean;
  /**
   * @zh 触发折叠的响应式断点
   * @en Responsive breakpoint that triggers collapsing
   */
  /**
   * @zh 触发折叠的响应式断点
   * @en Responsive breakpoint that triggers collapsing
   */
  breakpoint: Breakpoint | undefined;
  /**
   * @zh 弹出子菜单的最大高度
   * @en Maximum height of the popup submenus
   */
  /**
   * @zh 弹出子菜单的最大高度
   * @en Maximum height of the popup submenus
   */
  popupMaxHeight: PopupMenuMaxHeightType;
}

export interface InternalMenuProps extends MenuProps {
  prefixCls: string | undefined;
  inTrigger: boolean;
  siderCollapsed: boolean;
  isRoot: boolean;
}

export interface SubMenuProps {
  key: string | undefined;
  title: string | undefined;
  selectable: boolean;
  popup: boolean | ((level: number) => boolean);
  popupMaxHeight: PopupMenuMaxHeightType | undefined;
}

export interface MenuItemGroupProps {
  title: string | undefined;
}

export interface MenuItemProps {
  key: string | undefined;
  disabled?: boolean;
}

export interface SubMenuInlineProps {
  title: string | undefined;
  isChildrenSelected: boolean;
}

export interface SubMenuPopProps {
  title: string | undefined;
  selectable: boolean;
  isChildrenSelected: boolean;
  popupMaxHeight: PopupMenuMaxHeightType | undefined;
}

export interface MenuDataItem {
  key: string;
  children?: MenuData;
}

export type MenuData = MenuDataItem[];
