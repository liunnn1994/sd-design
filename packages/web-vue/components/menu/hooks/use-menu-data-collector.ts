import { ref, provide, inject, computed, onMounted, onUnmounted } from 'vue';

import {
  createMenuCollector,
  getMenuKeys,
  type MenuCollectorOptions,
} from '@sdata/web-core/menu/collector';

import type { MenuData } from '../interface';

import { DataCollectorInjectionKey } from '../context';
export function useMenuDataCollectorContext(isRoot = false) {
  return isRoot ? undefined : inject(DataCollectorInjectionKey);
}
export default function useMenuDataCollector(props: MenuCollectorOptions) {
  const data = ref<MenuData>([]);
  const menuContext = useMenuDataCollectorContext(props.type === 'menu');
  const foundation = createMenuCollector({
    options: props,
    get data() {
      return data.value;
    },
    parent: menuContext,
    replace(value) {
      data.value = value;
    },
  });
  provide(DataCollectorInjectionKey, foundation.context);
  onMounted(foundation.mount);
  onUnmounted(foundation.unmount);
  return {
    menuData: data,
    subMenuKeys: computed(() => getMenuKeys(data.value, (item) => !!item.children)),
    menuItemKeys: computed(() => getMenuKeys(data.value, (item) => !item.children)),
  };
}
