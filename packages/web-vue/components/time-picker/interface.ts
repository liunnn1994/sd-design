import type { BasePanelProps, TimeValue } from '@sdata/web-core/time-picker/types';

import type { FitWidthProps } from '../_hooks/use-fit-width';
export type * from '@sdata/web-core/time-picker/types';

export interface TimePickerProps extends BasePanelProps, FitWidthProps {
  type: 'time' | 'time-range';
  modelValue?: TimeValue | TimeValue[];
  defaultValue?: TimeValue | TimeValue[];
  placeholder?: string | string[];
  disabled: boolean;
  allowClear: boolean;
  readonly: boolean;
  error: boolean;
  format?: string;
  size: 'mini' | 'small' | 'medium' | 'large';
  position: 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br';
  popupVisible: boolean | undefined;
  defaultPopupVisible: boolean;
  triggerProps?: Record<string, unknown>;
  unmountOnClose: boolean;
}
