export type MenuTheme = 'light' | 'dark';
export type MenuMode = 'vertical' | 'horizontal' | 'pop' | 'popButton';
export type PopupMenuMaxHeightType = boolean | number;
export interface SubMenuChildDataType {
  key: string;
  children?: SubMenuChildDataType[];
}
export interface MenuDataItem {
  key: string;
  children?: MenuData;
}
export type MenuData = MenuDataItem[];
export type MenuCollapseTrigger = 'clickTrigger' | 'responsive';
export type MenuCollapseHandler = (collapsed: boolean, type: MenuCollapseTrigger) => void;
export type MenuItemClickHandler = (key: string) => void;
export type MenuSubMenuClickHandler = (key: string, openKeys: string[]) => void;
export type MenuOpenKeys = string[];
export type MenuSelectedKeys = string[];
export type MenuMapType = Map<string, string[]>;
