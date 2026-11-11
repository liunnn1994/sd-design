import type { SwitchBeforeChange, SwitchValue } from '@sdata/web-core/switch/foundation';
import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';

export type { SwitchBeforeChange, SwitchValue } from '@sdata/web-core/switch/foundation';
export type SwitchChangeHandler = NonNullable<SwitchProps['onChange']>;

export interface SwitchProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'type' | 'onChange' | 'value'
> {
  value?: SwitchValue;
  defaultChecked?: boolean;
  checkedValue?: SwitchValue;
  uncheckedValue?: SwitchValue;
  loading?: boolean;
  autoLoading?: boolean;
  type?: 'circle' | 'round' | 'line';
  size?: 'small' | 'medium';
  checkedColor?: string;
  uncheckedColor?: string;
  checkedText?: ReactNode;
  uncheckedText?: ReactNode;
  checkedIcon?: ReactNode;
  uncheckedIcon?: ReactNode;
  beforeChange?: SwitchBeforeChange;
  onChange?: (value: SwitchValue, event: MouseEvent<HTMLButtonElement>) => void;
}
