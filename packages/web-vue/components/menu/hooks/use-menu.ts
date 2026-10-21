import { computed, getCurrentInstance, ComputedRef } from 'vue';

import { generateMenuId } from '@sdata/web-core/menu/foundation';

export default function useMenu(): {
  key: ComputedRef<string>;
} {
  const instance = getCurrentInstance();
  const key = computed(() => (instance?.vnode.key as string | null) ?? generateMenuId('__sd_menu'));

  return {
    key,
  };
}
