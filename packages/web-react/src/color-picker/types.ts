import type {
  ColorFormat,
  LegacyFormat,
  ColorModes,
  RecentColorsValue,
  ColorObject,
  ColorPickerChangeTrigger,
  ColorPickerTriggerSlotProps,
} from '@sdata/web-core/color-picker/types';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import type { InputProps } from '../input/index.js';
import type { TriggerProps } from '../trigger/index.js';

export * from '@sdata/web-core/color-picker/types';
export interface ColorPickerProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange' | 'children'
> {
  value?: string;
  defaultValue?: string;
  borderless?: boolean;
  clearable?: boolean;
  colorModes?: ColorModes;
  enableMultipleGradient?: boolean;
  format?: ColorFormat | LegacyFormat;
  size?: 'mini' | 'small' | 'medium' | 'large';
  enableAlpha?: boolean;
  showPrimaryColorPreview?: boolean;
  inputProps?: InputProps;
  recentColors?: RecentColorsValue;
  defaultRecentColors?: RecentColorsValue;
  swatchColors?: string[] | null;
  disabled?: boolean;
  readonly?: boolean | string;
  hideTrigger?: boolean;
  triggerProps?: Partial<TriggerProps>;
  floatingOptions?: TriggerProps['floatingOptions'];
  children?: ReactElement;
  renderTrigger?: (params: ColorPickerTriggerSlotProps) => ReactElement;
  onValueChange?: (value: string) => void;
  onChange?: (
    value: string,
    context: { color: ColorObject; trigger: ColorPickerChangeTrigger },
  ) => void;
  onPopupVisibleChange?: (visible: boolean, displayValue: string) => void;
  onClear?: (context: { e: MouseEvent }) => void;
  onPaletteBarChange?: (context: { color: ColorObject }) => void;
  onRecentColorsChange?: (colors: string[]) => void;
}
