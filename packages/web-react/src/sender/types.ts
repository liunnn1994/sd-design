import type { SenderAllowSpeech } from '@sdata/web-core/sender/recorder';
import type { RecorderCore, RecorderCoreInstance } from '@sdata/web-core/sender/recorder-engine';
import type {
  SenderSubmitType,
  SenderInsertPosition,
  SenderSuffixPlacement,
  SenderSemanticType,
  SenderSlotConfigBase,
  SenderTextSlotConfig,
  SenderInputSlotConfig,
  SenderSelectSlotConfig,
  SenderTagSlotConfig,
  SenderContentSlotConfig,
  SenderCustomSlotState,
  SenderFocusOptions,
  SenderActionContext,
} from '@sdata/web-core/sender/types';
import type { CSSProperties, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';

import type { TooltipProps } from '../tooltip/index.js';
import type { VoiceGlowProps } from '../voice-glow/index.js';

export type * from '@sdata/web-core/sender/types';
export type { SenderAllowSpeech } from '@sdata/web-core/sender/recorder';
export type {
  RecorderCore as RecorderCoreConstructor,
  RecorderCoreInstance,
  RecorderCoreOptions,
} from '@sdata/web-core/sender/recorder-engine';
export interface SenderComponents {
  input?: ElementType;
}
export interface SenderSkillClosableConfig {
  closeIcon?: ReactNode;
  onClose?: (event: MouseEvent) => void;
  disabled?: boolean;
}
export interface SenderSkill {
  title?: ReactNode;
  value: string;
  tooltip?: string | TooltipProps;
  closable?: boolean | SenderSkillClosableConfig;
}
export type SenderCustomSlotRender = (
  value: unknown,
  onChange: (value: unknown) => void,
  state: SenderCustomSlotState,
  item: SenderCustomSlotConfig,
) => ReactNode;
export interface SenderCustomSlotConfig extends SenderSlotConfigBase {
  type: 'custom';
  key: string;
  props?: { defaultValue?: unknown; [key: string]: unknown };
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
export interface SenderRef {
  readonly Recorder: RecorderCore;
  readonly recorder: RecorderCoreInstance | null;
  readonly recording: boolean;
  readonly inputElement: HTMLTextAreaElement | HTMLDivElement | null;
  readonly nativeElement: HTMLDivElement | null;
  focus(options?: SenderFocusOptions): void;
  blur(): void;
  insert(
    value: string | SenderSlotConfig[],
    position?: SenderInsertPosition,
    replaceCharacters?: string,
    preventScroll?: boolean,
  ): void;
  clear(): void;
  getValue(): SenderValue;
}
export type SenderInstance = SenderRef;
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
export interface SenderSlots {
  'header'?: (context: { actions: SenderActionContext }) => ReactNode;
  'prefix'?: (context: { actions: SenderActionContext }) => ReactNode;
  'suffix'?: (context: { actions: SenderActionContext }) => ReactNode;
  'footer'?: (context: { actions: SenderActionContext }) => ReactNode;
  'skill-title'?: (context: { skill: SenderSkill }) => ReactNode;
  'skill-close-icon'?: (context: { skill: SenderSkill }) => ReactNode;
  [name: `slot-${string}`]:
    | ((context: {
        value: unknown;
        item: SenderCustomSlotConfig | undefined;
        disabled: boolean;
        readonly: boolean;
        onChange(value: unknown): void;
      }) => ReactNode)
    | undefined;
}
export interface SenderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'defaultValue'
  | 'onChange'
  | 'onSubmit'
  | 'onPaste'
  | 'onFocus'
  | 'onBlur'
  | 'onKeyDown'
  | 'onKeyUp'
> {
  ref?: Ref<SenderRef>;
  value?: string;
  modelValue?: string;
  defaultValue?: string;
  loading?: boolean;
  readonly?: boolean | string;
  submitType?: SenderSubmitType;
  disabled?: boolean;
  slotConfig?: readonly SenderSlotConfig[];
  allowSpeech?: SenderAllowSpeech;
  voiceGlow?: boolean | VoiceGlowProps;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  skill?: SenderSkill;
  placeholder?: string;
  showActions?: boolean;
  suffixPlacement?: SenderSuffixPlacement;
  components?: SenderComponents;
  classNames?: Partial<Record<SenderSemanticType, string>>;
  styles?: Partial<Record<SenderSemanticType, CSSProperties>>;
  slots?: SenderSlots;
  onKeydown?: (event: KeyboardEvent) => void | false;
  onKeyDown?: (event: KeyboardEvent) => void | false;
  onKeyup?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onValueChange?: (...args: SenderEmits['update:modelValue']) => void;
  onChange?: (...args: SenderEmits['change']) => void;
  onSubmit?: (...args: SenderEmits['submit']) => void;
  onCancel?: () => void;
  onPaste?: (...args: SenderEmits['paste']) => void;
  onPasteFile?: (...args: SenderEmits['pasteFile']) => void;
  onFocus?: (...args: SenderEmits['focus']) => void;
  onBlur?: (...args: SenderEmits['blur']) => void;
  onSpeechEnd?: (...args: SenderEmits['speechEnd']) => void;
  onSpeechError?: (...args: SenderEmits['speechError']) => void;
}
export type SenderHeaderSemanticType = 'header' | 'content';
export type SenderHeaderInstance = HTMLDivElement;
export interface SenderHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'onChange'
> {
  ref?: Ref<HTMLDivElement>;
  open?: boolean;
  forceRender?: boolean;
  title?: ReactNode;
  closable?: boolean;
  onOpenChange?: (open: boolean) => void;
  classNames?: Partial<Record<SenderHeaderSemanticType, string>>;
  styles?: Partial<Record<SenderHeaderSemanticType, CSSProperties>>;
  slots?: { title?: () => ReactNode };
}
export type SenderSwitchInstance = HTMLDivElement;
export interface SenderSwitchProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange' | 'children'
> {
  ref?: Ref<HTMLDivElement>;
  value?: boolean;
  modelValue?: boolean;
  defaultValue?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onValueChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  classNames?: Partial<Record<'root' | 'content' | 'icon' | 'title', string>>;
  styles?: Partial<Record<'root' | 'content' | 'icon' | 'title', CSSProperties>>;
  children?: ReactNode | ((context: { checked: boolean }) => ReactNode);
  slots?: { icon?: () => ReactNode; checked?: () => ReactNode; unchecked?: () => ReactNode };
}
