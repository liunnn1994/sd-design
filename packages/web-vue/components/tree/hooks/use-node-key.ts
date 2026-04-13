import { getCurrentInstance, ref, onUpdated, Ref } from 'vue';

import { TreeNodeKey } from '../interface';
import { generateKey } from '../utils/tree-data';

export default function useNodeKey(): Ref<TreeNodeKey> {
  const instance = getCurrentInstance();

  const getKey = () => (instance?.vnode.key ?? generateKey()) as TreeNodeKey;

  const key = ref(getKey());

  onUpdated(() => {
    key.value = getKey();
  });

  return key;
}
