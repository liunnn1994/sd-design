import { computed, getCurrentInstance, inject, onBeforeUpdate, Ref, shallowRef } from 'vue';

import { ConfigProvider, configProviderInjectionKey } from '../config-provider/context';

interface UseConfigProviderPropOptions<T> {
  propNames: readonly string[];
  getGlobalValue: (configProviderCtx: ConfigProvider | undefined) => T | undefined;
}

export const useConfigProviderProp = <T>(
  propValue: Ref<T>,
  options: UseConfigProviderPropOptions<T>,
) => {
  const instance = getCurrentInstance();
  const vnodeProps = shallowRef(instance?.vnode.props);
  onBeforeUpdate(() => {
    vnodeProps.value = instance?.vnode.props;
  });
  const configProviderCtx = inject(configProviderInjectionKey, undefined);

  const hasLocalProp = computed(() => {
    const rawProps = vnodeProps.value;

    if (!rawProps) {
      return false;
    }

    return options.propNames.some((propName) => Object.hasOwn(rawProps, propName));
  });

  const mergedValue = computed<T | undefined>(() => {
    if (hasLocalProp.value) {
      return propValue.value;
    }

    return options.getGlobalValue(configProviderCtx) ?? propValue.value;
  });

  return {
    mergedValue,
  };
};
