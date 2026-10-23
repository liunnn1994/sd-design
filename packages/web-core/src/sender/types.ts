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
  /** Remove this custom slot from the editor. Disabled and readonly slots are preserved. */
  remove?: () => void;
  disabled?: boolean;
  readonly?: boolean;
}

export interface SenderFocusOptions {
  preventScroll?: boolean;
  cursor?: 'start' | 'end' | 'all' | 'slot';
  key?: string;
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
export interface SenderCustomSlotData extends SenderSlotConfigBase {
  type: 'custom';
  key: string;
  props?: {
    defaultValue?: unknown;
    [key: string]: unknown;
  };
}
export type SenderSlotData =
  | SenderTextSlotConfig
  | SenderInputSlotConfig
  | SenderSelectSlotConfig
  | SenderTagSlotConfig
  | SenderContentSlotConfig
  | SenderCustomSlotData;
