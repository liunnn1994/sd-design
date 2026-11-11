import type { TimeDateValue, TimeInputValue } from '@sdata/web-core/time-picker/foundation';
import type {
  BasePanelProps,
  TimePickerTriggerSlotProps,
  TimeValue,
} from '@sdata/web-core/time-picker/types';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from 'react';

import type { PickerInputInstance, PickerInputProps } from '../_shared/picker-input.js';
import type { TriggerProps } from '../trigger/types.js';

export type { TimeValue, TimePickerTriggerSlotProps, TimeInputValue, TimeDateValue };
export type TimePickerInstance = PickerInputInstance;
export interface TimePickerProps
  extends
    Partial<BasePanelProps>,
    Omit<
      ComponentPropsWithoutRef<'div'>,
      'defaultValue' | 'onChange' | 'onSelect' | 'prefix' | 'children'
    > {
  ref?: Ref<TimePickerInstance>;
  type?: 'time' | 'time-range';
  value?: TimeValue | TimeValue[];
  defaultValue?: TimeValue | TimeValue[];
  placeholder?: string | string[];
  disabled?: boolean;
  allowClear?: boolean;
  readonly?: boolean | string;
  error?: boolean;
  format?: string;
  size?: 'mini' | 'small' | 'medium' | 'large';
  position?: 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br';
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  popupContainer?: string | HTMLElement;
  triggerProps?: Partial<TriggerProps>;
  floatingOptions?: TriggerProps['floatingOptions'];
  unmountOnClose?: boolean;
  fitWidth?: boolean;
  maxWFull?: boolean;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  extra?: ReactNode;
  inputProps?: PickerInputProps['inputProps'];
  renderTrigger?: (context: TimePickerTriggerSlotProps) => ReactElement;
  children?: ReactElement;
  onValueChange?(value: TimeInputValue): void;
  onChange?(value: TimeInputValue, date: TimeDateValue): void;
  onSelect?(
    value: Exclude<TimeInputValue, undefined>,
    date: Exclude<TimeDateValue, undefined>,
  ): void;
  onClear?(): void;
  onPopupVisibleChange?(visible: boolean): void;
  onUpdatePopupVisible?(visible: boolean): void;
}
