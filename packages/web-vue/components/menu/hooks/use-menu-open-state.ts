import { computed, toRef, watch, onMounted, ref } from 'vue';

import {
  createMenuOpenFoundation,
  initialMenuOpenValue,
  type MenuOpenStateProps,
} from '@sdata/web-core/menu/open';
export default function useMenuOpenState(props: MenuOpenStateProps) {
  const localValue = ref(initialMenuOpenValue(props));
  const setLocalValue = (value: string[]) => {
    localValue.value = value;
  };
  const openKeys = computed(() => props.modelValue || localValue.value);
  const foundation = createMenuOpenFoundation({
    props,
    get openKeys() {
      return openKeys.value;
    },
    setLocal: setLocalValue,
  });
  watch(toRef(props, 'modelValue'), foundation.syncModel);
  onMounted(foundation.mount);
  watch(toRef(props, 'subMenuKeys'), foundation.syncKeys);
  return { openKeys, localOpenKeys: localValue, setOpenKeys: setLocalValue, open: foundation.open };
}
