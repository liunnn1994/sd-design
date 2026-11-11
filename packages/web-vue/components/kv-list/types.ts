import type AutoComplete from '../auto-complete';
import type Input from '../input';
import type { InputPassword } from '../input';

type ComponentPropsOf<T> = T extends new (...args: never[]) => { $props: infer P } ? P : never;
type ControlledFieldProps = 'modelValue' | 'defaultValue' | 'onUpdate:modelValue';

export type KvListKeyProps = Partial<
  Omit<ComponentPropsOf<typeof Input> & ComponentPropsOf<typeof AutoComplete>, ControlledFieldProps>
>;

export type KvListValueProps = Partial<
  Omit<
    ComponentPropsOf<typeof Input> & ComponentPropsOf<typeof InputPassword>,
    ControlledFieldProps
  >
>;

export type {
  KvListType,
  KvListItem,
  KvListFieldSlotProps,
  KvListRowActionsSlotProps,
  KvListWorkingItem,
} from '@sdata/web-core/kv-list/types';
