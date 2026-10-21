import type { TreeNodeKey } from '../tree/types.js';
export interface LabelValue {
  value: TreeNodeKey;
  label: string | number;
}
export type TreeSelectValue = TreeNodeKey | TreeNodeKey[] | LabelValue | LabelValue[];
export type FallbackOption<T> = boolean | ((key: TreeNodeKey) => T | boolean);
