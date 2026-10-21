import { computed, getCurrentInstance, inject, onBeforeUpdate, Ref, shallowRef } from 'vue';

import { resolveAllowSearch } from '@sdata/web-core/config/prop-values';

import { configProviderInjectionKey } from '../config-provider/context';

const ALLOW_SEARCH_PROP_NAMES = ['allowSearch', 'allow-search'] as const;

interface UseAllowSearchOptions<T> {
  compatPropNames?: readonly string[];
  getCompatValue?: () => T | undefined;
  getDefaultValue?: () => T | undefined;
}

export const useAllowSearch = <T>(
  allowSearch?: Ref<T | undefined>,
  options: UseAllowSearchOptions<T> = {},
) => {
  const instance = getCurrentInstance();
  const vnodeProps = shallowRef(instance?.vnode.props);
  onBeforeUpdate(() => {
    vnodeProps.value = instance?.vnode.props;
  });
  const configProviderCtx = inject(configProviderInjectionKey, undefined);

  const hasAllowSearchProp = computed(() => {
    const rawProps = vnodeProps.value;

    if (!rawProps) {
      return false;
    }

    return ALLOW_SEARCH_PROP_NAMES.some((propName) => Object.hasOwn(rawProps, propName));
  });

  const hasCompatProp = computed(() => {
    const rawProps = vnodeProps.value;

    if (!rawProps || !options.compatPropNames?.length) {
      return false;
    }

    return options.compatPropNames.some((propName) => Object.hasOwn(rawProps, propName));
  });

  const mergedAllowSearch = computed<T | undefined>(() =>
    resolveAllowSearch({
      get hasLocalProp() {
        return hasAllowSearchProp.value;
      },
      get hasCompatProp() {
        return hasCompatProp.value;
      },
      get localValue() {
        return allowSearch?.value;
      },
      get compatValue() {
        return options.getCompatValue?.();
      },
      get globalValue() {
        return configProviderCtx?.allowSearch;
      },
      get defaultValue() {
        return options.getDefaultValue?.();
      },
    }),
  );

  return {
    mergedAllowSearch,
  };
};
