import type { VNodeChild } from 'vue';

import type { Flag, Node as ParserNode, RegexError as ParserError } from './parser/ast';

export type RegexVisFlag = Flag;
export type RegexVisNode = ParserNode;
export type RegexVisError = ParserError;

export type RegexVisTranslate = (key: string, ...args: unknown[]) => string;

export type RegexVisSelectInfo = {
  node: RegexVisNode;
  label: string;
};

export type RegexVisProps = {
  /**
   * @zh 输入值（v-model）
   * @en Input value (v-model)
   */
  modelValue?: string;
  /**
   * @zh 正则标志（v-model:flags）
   * @en Regular expression flags (v-model:flags)
   */
  flags?: RegexVisFlag[];
  /**
   * @zh 是否只读
   * @en Whether the visualizer is read-only
   */
  readonly?: boolean;
  /**
   * @zh 是否显示正则输入框
   * @en Whether to show the regular expression input
   */
  showInput?: boolean;
  /**
   * @zh 是否显示正则标志选项
   * @en Whether to show regular expression flag controls
   */
  showFlags?: boolean;
  /**
   * @zh 是否允许选择可视图节点
   * @en Whether graph nodes can be selected
   */
  selectable?: boolean;
  /**
   * @zh 输入框占位文本
   * @en Input placeholder
   */
  placeholder?: string;
  /**
   * @zh 空状态文本
   * @en Empty state text
   */
  emptyText?: string;
  /**
   * @zh SVG 可视图的无障碍名称
   * @en Accessible label of the SVG visualization
   */
  ariaLabel?: string;
};

export type RegexVisSlots = {
  empty?: (props: { text: string }) => VNodeChild;
  error?: (props: { error: RegexVisError }) => VNodeChild;
  footer?: (props: { value: string; flags: RegexVisFlag[] }) => VNodeChild;
};
