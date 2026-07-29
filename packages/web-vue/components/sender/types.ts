import type { UnknownRecord } from 'type-fest';

import type { CSSProperties, Component, VNodeChild } from 'vue';

import type { TooltipProps } from '../tooltip';
import type { RecorderCore, RecorderCoreInstance, RecorderCoreOptions } from './recorder-core';

export type SenderSubmitType = 'enter' | 'shiftEnter';
export type SenderInsertPosition = 'start' | 'end' | 'cursor';
export type SenderSuffixPlacement = 'content' | 'footer';
export type SenderSemanticType =
  | 'root'
  | 'prefix'
  | 'input'
  | 'suffix'
  | 'footer'
  | 'switch'
  | 'content';

export interface SenderComponents {
  input?: Component;
}

export type SenderAllowSpeech = boolean | RecorderCoreOptions | UnknownRecord;

export interface SenderSkillClosableConfig {
  closeIcon?: VNodeChild;
  onClose?: (event: MouseEvent) => void;
  disabled?: boolean;
}

export interface SenderSkill {
  title?: VNodeChild;
  value: string;
  tooltip?: string | TooltipProps;
  closable?: boolean | SenderSkillClosableConfig;
}

export interface SenderSlotConfigBase {
  type: 'text' | 'input' | 'select' | 'tag' | 'custom' | 'content';
  formatResult?: (value: unknown) => string;
}

export interface SenderTextSlotConfig extends SenderSlotConfigBase {
  type: 'text';
  value?: string;
  editable?: boolean;
  placeholder?: string;
  key?: string;
}

export interface SenderInputSlotConfig extends SenderSlotConfigBase {
  type: 'input';
  key: string;
  props?: {
    defaultValue?: string | number;
    placeholder?: string;
  };
}

export interface SenderSelectSlotConfig extends SenderSlotConfigBase {
  type: 'select';
  key: string;
  props?: {
    defaultValue?: string;
    options: string[];
    placeholder?: string;
  };
}

export interface SenderTagSlotConfig extends SenderSlotConfigBase {
  type: 'tag';
  key: string;
  props?: {
    label: string | number;
    value?: string;
  };
}

export interface SenderContentSlotConfig extends SenderSlotConfigBase {
  type: 'content';
  key: string;
  props?: {
    defaultValue?: unknown;
    placeholder?: string;
  };
}

export interface SenderCustomSlotState {
  disabled?: boolean;
  readonly?: boolean;
}

export type SenderCustomSlotRender = (
  value: unknown,
  onChange: (value: unknown) => void,
  state: SenderCustomSlotState,
  item: SenderCustomSlotConfig,
) => VNodeChild;

export interface SenderCustomSlotConfig extends SenderSlotConfigBase {
  type: 'custom';
  key: string;
  props?: {
    defaultValue?: unknown;
    [key: string]: unknown;
  };
  customRender?: SenderCustomSlotRender;
}

export type SenderSlotConfig =
  | SenderTextSlotConfig
  | SenderInputSlotConfig
  | SenderSelectSlotConfig
  | SenderTagSlotConfig
  | SenderContentSlotConfig
  | SenderCustomSlotConfig;

export type SenderResolvedSlotConfig = SenderSlotConfig & { value?: unknown };

export interface SenderValue {
  value: string;
  slotConfig: SenderResolvedSlotConfig[];
  skill?: SenderSkill;
}

export interface SenderFocusOptions {
  preventScroll?: boolean;
  cursor?: 'start' | 'end' | 'all' | 'slot';
  key?: string;
}

export interface SenderRef {
  readonly Recorder: RecorderCore;
  readonly recorder: RecorderCoreInstance | null;
  readonly recording: boolean;
  readonly inputElement: HTMLTextAreaElement | HTMLDivElement | null;
  readonly nativeElement: HTMLDivElement | null;
  focus: (options?: SenderFocusOptions) => void;
  blur: () => void;
  insert: (
    value: string | SenderSlotConfig[],
    position?: SenderInsertPosition,
    replaceCharacters?: string,
    preventScroll?: boolean,
  ) => void;
  clear: () => void;
  getValue: () => SenderValue;
}

export interface SenderActionContext {
  send: () => void;
  clear: () => void;
  cancel: () => void;
  speech: () => void;
  submitDisabled: boolean;
  clearDisabled: boolean;
  cancelDisabled: boolean;
  speechDisabled: boolean;
  recording: boolean;
  loading: boolean;
}

export interface SenderProps {
  /**
   * @zh 绑定值。词槽模式下请通过 change/submit 或实例方法读取结构化内容。
   * @en Bound value. In slot mode, read structured content from events or instance methods.
   */
  modelValue?: string;
  /**
   * @zh 非受控模式的默认值
   * @en Default value in uncontrolled mode
   */
  defaultValue?: string;
  /**
   * @zh 是否加载中；加载中时发送按钮切换为停止按钮
   * @en Whether the sender is loading; the send button becomes a stop button while loading
   */
  loading?: boolean;
  /**
   * @zh 是否只读
   * @en Whether the input is read-only
   */
  readonly?: boolean | string;
  /**
   * @zh 提交快捷键
   * @en Keyboard shortcut used to submit
   */
  submitType?: SenderSubmitType;
  /**
   * @zh 是否禁用
   * @en Whether the sender is disabled
   */
  disabled?: boolean;
  /**
   * @zh 结构化词槽配置
   * @en Structured slot configuration
   */
  slotConfig?: readonly SenderSlotConfig[];
  /**
   * @zh 是否启用录音；对象值会作为 recorder-core 原生配置
   * @en Whether recording is enabled; an object value is passed to recorder-core as-is
   */
  allowSpeech?: SenderAllowSpeech;
  /**
   * @zh 文本域自适应高度配置
   * @en Textarea auto-size configuration
   */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /**
   * @zh 技能标签配置
   * @en Skill tag configuration
   */
  skill?: SenderSkill;
  /**
   * @zh 占位文本
   * @en Placeholder text
   */
  placeholder?: string;
  /**
   * @zh 是否显示默认操作区
   * @en Whether to show the default action area
   */
  showActions?: boolean;
  /**
   * @zh 后缀操作区的渲染位置
   * @en Render location of the suffix action area
   */
  suffixPlacement?: SenderSuffixPlacement;
  /**
   * @zh 替换内部输入组件
   * @en Replace internal input components
   */
  components?: SenderComponents;
  /**
   * @zh 语义化节点类名
   * @en Semantic node class names
   */
  classNames?: Partial<Record<SenderSemanticType, string>>;
  /**
   * @zh 语义化节点样式
   * @en Semantic node styles
   */
  styles?: Partial<Record<SenderSemanticType, CSSProperties>>;
  onKeydown?: (event: KeyboardEvent) => void | false;
  onKeyup?: (event: KeyboardEvent) => void;
}

export interface SenderEmits {
  'update:modelValue': [value: string];
  'change': [
    value: string,
    event: Event | undefined,
    slotConfig: SenderResolvedSlotConfig[],
    skill: SenderSkill | undefined,
  ];
  'submit': [value: string, slotConfig: SenderResolvedSlotConfig[], skill: SenderSkill | undefined];
  'cancel': [];
  'paste': [event: ClipboardEvent];
  'pasteFile': [files: FileList];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
  'speechEnd': [blob: Blob, duration: number, mime: string];
  'speechError': [message: string, isUserNotAllow: boolean];
}

export type SenderHeaderSemanticType = 'header' | 'content';

export interface SenderHeaderProps {
  /**
   * @zh 是否展开
   * @en Whether the header is expanded
   */
  open?: boolean;
  /**
   * @zh 是否始终渲染内容
   * @en Whether to always render the content
   */
  forceRender?: boolean;
  /**
   * @zh 标题
   * @en Header title
   */
  title?: VNodeChild;
  /**
   * @zh 是否显示关闭按钮
   * @en Whether to show the close button
   */
  closable?: boolean;
  classNames?: Partial<Record<SenderHeaderSemanticType, string>>;
  styles?: Partial<Record<SenderHeaderSemanticType, CSSProperties>>;
}

export interface SenderSwitchProps {
  /**
   * @zh 绑定值
   * @en Bound value
   */
  modelValue?: boolean;
  /**
   * @zh 非受控模式默认值
   * @en Default value in uncontrolled mode
   */
  defaultValue?: boolean;
  disabled?: boolean;
  loading?: boolean;
  classNames?: Partial<Record<'root' | 'content' | 'icon' | 'title', string>>;
  styles?: Partial<Record<'root' | 'content' | 'icon' | 'title', CSSProperties>>;
}
