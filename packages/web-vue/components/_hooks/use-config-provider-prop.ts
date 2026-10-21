import { computed, getCurrentInstance, inject, onBeforeUpdate, Ref, shallowRef } from 'vue';

import { resolveConfigProp } from '@sdata/web-core/config/prop-values';

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

  const mergedValue = computed<T | undefined>(() =>
    resolveConfigProp({
      get hasLocalProp() {
        return hasLocalProp.value;
      },
      get localValue() {
        return propValue.value;
      },
      get globalValue() {
        return options.getGlobalValue(configProviderCtx);
      },
    }),
  );

  return {
    mergedValue,
  };
};
