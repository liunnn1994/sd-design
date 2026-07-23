import type AutoComplete from '../auto-complete';
import type Input from '../input';
import type { InputPassword } from '../input';

type ComponentPropsOf<T> = T extends new (...args: never[]) => { $props: infer P } ? P : never;
type ControlledFieldProps = 'modelValue' | 'defaultValue' | 'onUpdate:modelValue';

export type KvListType = 'http-header' | 'secret';

export interface KvListItem {
  /**
   * @zh 键
   * @en Key
   */
  key: string;
  /**
   * @zh 值
   * @en Value
   */
  value: string;
}

export type KvListKeyProps = Partial<
  Omit<ComponentPropsOf<typeof Input> & ComponentPropsOf<typeof AutoComplete>, ControlledFieldProps>
>;

export type KvListValueProps = Partial<
  Omit<
    ComponentPropsOf<typeof Input> & ComponentPropsOf<typeof InputPassword>,
    ControlledFieldProps
  >
>;

export interface KvListFieldSlotProps {
  value: string;
  item: Readonly<KvListItem>;
  index: number;
  props: Readonly<Record<string, unknown>>;
  update: (value: string) => void;
}

export interface KvListRowActionsSlotProps {
  item: Readonly<KvListItem>;
  index: number;
}

export interface KvListWorkingItem extends KvListItem {
  id: number;
}
