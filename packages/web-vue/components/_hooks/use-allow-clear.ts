import { computed, getCurrentInstance, inject, onBeforeUpdate, Ref, shallowRef } from 'vue';

import { configProviderInjectionKey } from '../config-provider/context';

const ALLOW_CLEAR_PROP_NAMES = ['allowClear', 'allow-clear'] as const;

export const useAllowClear = (
  allowClear?: Ref<boolean | undefined>,
  extraPropNames: readonly string[] = [],
) => {
  const instance = getCurrentInstance();
  const vnodeProps = shallowRef(instance?.vnode.props);
  onBeforeUpdate(() => {
    vnodeProps.value = instance?.vnode.props;
  });
  const configProviderCtx = inject(configProviderInjectionKey, undefined);

  const hasAllowClearProp = computed(() => {
    const rawProps = vnodeProps.value;

    if (!rawProps) {
      return false;
    }

    return [...ALLOW_CLEAR_PROP_NAMES, ...extraPropNames].some((propName) =>
      Object.hasOwn(rawProps, propName),
    );
  });

  const mergedAllowClear = computed(() => {
    if (hasAllowClearProp.value) {
      return allowClear?.value;
    }

    if (configProviderCtx?.allowClear === true) {
      return true;
    }

    return allowClear?.value;
  });

  return {
    mergedAllowClear,
  };
};
