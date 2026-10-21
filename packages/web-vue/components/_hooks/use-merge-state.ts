import { Ref, toRefs, computed, watch, ComputedRef } from 'vue';

import {
  resolveLegacyMergedValue,
  syncLegacyMergedValue,
} from '@sdata/web-core/state/legacy-merge';

import useState from './use-state';

export default function useMergeState<T, E = T | undefined>(
  defaultValue: T,
  props: { value: E },
): [ComputedRef<T>, (val: E) => void, Ref<T>] {
  const { value } = toRefs(props);
  const [localValue, setLocalValue] = useState(
    resolveLegacyMergedValue({
      get value() {
        return value.value;
      },
      get fallback() {
        return defaultValue;
      },
    }),
  );
  watch(value, (newVal) => {
    syncLegacyMergedValue(newVal, () => setLocalValue(undefined));
  });

  const mergeValue = computed(() =>
    resolveLegacyMergedValue({
      get value() {
        return value.value;
      },
      get fallback() {
        return localValue.value;
      },
    }),
  );

  return [mergeValue, setLocalValue, localValue];
}
