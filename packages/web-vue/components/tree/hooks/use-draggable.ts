import { computed, type Ref } from 'vue';

import { TreeNodeKey } from '../interface';
import useTreeContext from './use-tree-context';

export default function useDraggable(key: Ref<TreeNodeKey>) {
  const context = useTreeContext();
  return {
    isDragging: computed(() => context.dragState?.sourceKey === key.value),
    isDragOver: computed(() => context.dragState?.targetKey === key.value),
    isAllowDrop: computed(() => context.dragState?.allowed ?? false),
    dropPosition: computed(() => context.dragState?.position ?? 0),
  };
}
