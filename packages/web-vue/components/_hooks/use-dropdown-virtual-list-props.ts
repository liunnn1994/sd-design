import { computed, getCurrentInstance, inject, onBeforeUpdate, Ref, shallowRef } from 'vue';

import type { VirtualListProps } from '../_components/virtual-list/interface';

import { configProviderInjectionKey } from '../config-provider/context';

const DROPDOWN_VIRTUAL_LIST_PROP_NAMES = ['virtualListProps', 'virtual-list-props'] as const;

export const useDropdownVirtualListProps = (
  virtualListProps?: Ref<VirtualListProps | undefined>,
) => {
  const instance = getCurrentInstance();
  const vnodeProps = shallowRef(instance?.vnode.props);
  onBeforeUpdate(() => {
    vnodeProps.value = instance?.vnode.props;
  });
  const configProviderCtx = inject(configProviderInjectionKey, undefined);

  const hasVirtualListProp = computed(() => {
    const rawProps = vnodeProps.value;

    if (!rawProps) {
      return false;
    }

    return DROPDOWN_VIRTUAL_LIST_PROP_NAMES.some((propName) => Object.hasOwn(rawProps, propName));
  });

  const mergedDropdownVirtualListProps = computed(() => {
    const localVirtualListProps = virtualListProps?.value;

    if (hasVirtualListProp.value || localVirtualListProps !== undefined) {
      return localVirtualListProps;
    }

    return configProviderCtx?.virtualListProps ?? localVirtualListProps;
  });

  return {
    mergedDropdownVirtualListProps,
  };
};
