import { InjectionKey } from 'vue';

import type { SiderTheme } from './interface';

/**
 * @zh Layout 向 Sider 暴露的注册钩子，用于动态感知 Sider 的挂载与卸载
 * @en Registration hook exposed by Layout to Sider, used to dynamically
 *     detect the mount and unmount of Sider
 */
export interface SiderHook {
  addSider: (id: string) => void;
  removeSider: (id: string) => void;
}

export interface LayoutContextProps {
  siderHook: SiderHook;
}

/**
 * @zh Layout 上下文注入键
 * @en Layout context injection key
 */
export const LayoutContextInjectionKey: InjectionKey<LayoutContextProps> = Symbol('LayoutContext');

/**
 * @zh Sider 向后代组件暴露的折叠状态与主题
 * @en Collapsed state and theme exposed by Sider to descendant components
 */
export interface SiderContextProps {
  siderCollapsed?: boolean;
  siderRail?: boolean;
  siderRailWidth?: number;
  theme?: SiderTheme;
}

/**
 * @zh Sider 上下文注入键
 * @en Sider context injection key
 */
export const SiderContextInjectionKey: InjectionKey<SiderContextProps> = Symbol('SiderContext');
