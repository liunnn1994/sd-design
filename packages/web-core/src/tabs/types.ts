export type TabKey = string | number;
export type TabsPosition = 'left' | 'right' | 'top' | 'bottom';
export type TabsType = 'line' | 'card' | 'card-gutter' | 'text' | 'rounded' | 'capsule';
export type TabTriggerEvent = 'click' | 'hover';
export type ScrollPosition = 'start' | 'end' | 'center' | 'auto' | number;
export interface TabItem {
  key: TabKey;
  title?: string;
  disabled?: boolean;
  closable?: boolean;
}
export interface TabData<TSlots = unknown> extends TabItem {
  slots: TSlots;
}
