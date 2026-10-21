import { computed, reactive, ComputedRef, toRefs, watch, ref } from 'vue';

import { createDateHeader } from '@sdata/web-core/date-picker/header';
import { Dayjs } from 'dayjs';

import { getDayjsValue, getNow } from '../../_utils/date';
import { Mode, HeaderOperations, CalendarValue } from '../interface';
import usePanelSpan from './use-panel-span';

interface HeaderValueProps {
  mode?: Mode;
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  selectedValue?: Dayjs;
  format: string;
  utcOffset?: number;
  timezone?: string;
  onChange?: (newVal: Dayjs) => void;
}

export default function useHeaderValue(props: HeaderValueProps): {
  headerValue: ComputedRef<Dayjs>;
  setHeaderValue: (val: Dayjs | undefined, emitChange?: boolean) => void;
  headerOperations: ComputedRef<HeaderOperations>;
  resetHeaderValue: (emitChange?: boolean) => void;
  getDefaultLocalValue: () => Dayjs;
} {
  const { mode, value, defaultValue, selectedValue, format, utcOffset, timezone, onChange } =
    toRefs(props);

  const computedMode = computed(() => mode?.value || 'date');

  const { span, superSpan } = usePanelSpan(
    reactive({
      mode: computedMode,
    }),
  );

  const computedValue = computed(() =>
    getDayjsValue(value?.value, format.value, utcOffset?.value, timezone?.value),
  );

  const computedDefaultValue = computed(() =>
    getDayjsValue(defaultValue?.value, format.value, utcOffset?.value, timezone?.value),
  );

  const localValue = ref(computedDefaultValue.value || getNow(utcOffset?.value, timezone?.value));
  const headerValue = computed(() => computedValue.value || localValue.value);

  const setLocalValue = (newVal: Dayjs | undefined) => {
    if (!newVal) return;
    localValue.value = newVal;
  };

  const foundation = createDateHeader({
    get mode() {
      return computedMode.value;
    },
    get value() {
      return headerValue.value;
    },
    get span() {
      return span.value;
    },
    get superSpan() {
      return superSpan.value;
    },
    setLocalValue,
    onChange: (value) => onChange?.value?.(value),
  });
  const setHeaderValue = foundation.setValue;

  // Additional processing of selectedValue
  if (selectedValue?.value) {
    setLocalValue(selectedValue.value);
  }
  watch(
    () => selectedValue?.value,
    (newVal) => {
      setHeaderValue(newVal);
    },
  );

  function getDefaultLocalValue() {
    return (
      selectedValue?.value ||
      computedDefaultValue.value ||
      getNow(utcOffset?.value, timezone?.value)
    );
  }
  function resetHeaderValue(emitChange = true) {
    const defaultLocalValue = getDefaultLocalValue();
    if (emitChange) {
      setHeaderValue(defaultLocalValue);
    } else {
      setLocalValue(defaultLocalValue);
    }
  }

  const headerOperations = computed(foundation.getOperations);

  return {
    headerValue,
    setHeaderValue,
    headerOperations,
    resetHeaderValue,
    getDefaultLocalValue,
  };
}
