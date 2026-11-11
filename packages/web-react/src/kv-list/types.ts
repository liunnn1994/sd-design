import type {
  KvListOptions,
  KvListItem,
  KvListFieldSlotProps,
  KvListRowActionsSlotProps,
} from '@sdata/web-core/kv-list/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import type { AutoCompleteProps } from '../auto-complete/index.js';
import type { InputProps, InputPasswordProps } from '../input/index.js';
export type {
  KvListItem,
  KvListType,
  KvListFieldSlotProps,
  KvListRowActionsSlotProps,
} from '@sdata/web-core/kv-list/types';
type ControlledFieldProps = 'value' | 'modelValue' | 'defaultValue' | 'onValueChange';
export type KvListKeyProps = Partial<Omit<InputProps & AutoCompleteProps, ControlledFieldProps>>;
export type KvListValueProps = Partial<Omit<InputProps & InputPasswordProps, ControlledFieldProps>>;
export interface KvListProps
  extends
    KvListOptions<KvListKeyProps, KvListValueProps>,
    Omit<ComponentPropsWithRef<'div'>, 'children'> {
  json?: KvListItem[];
  bulk?: string;
  defaultJson?: KvListItem[];
  defaultBulk?: string;
  onJsonChange?(value: KvListItem[]): void;
  onBulkChange?(value: string): void;
  renderKey?(props: KvListFieldSlotProps): ReactNode;
  renderValue?(props: KvListFieldSlotProps): ReactNode;
  toolbarExtra?: ReactNode;
  renderRowActions?(props: KvListRowActionsSlotProps): ReactNode;
}
