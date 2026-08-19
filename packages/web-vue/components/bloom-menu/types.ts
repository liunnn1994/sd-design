import type { Component } from 'vue';

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
export interface BloomMenuItem {
  /** 唯一值，用于渲染 key 与选择结果 Unique value used as the render key and selection result */
  value: string | number;
  /** 展示文本 Display label */
  label: string;
  /** 可选图标组件 Optional icon component */
  icon?: Component;
  /** 是否禁用 Whether the item is disabled */
  disabled?: boolean;
}
