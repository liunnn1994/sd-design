import { computed, toRefs, watch } from 'vue';

import {
  getEmptyTimeValue,
  getInitialTimeValue,
  normalizeTimeValue,
} from '@sdata/web-core/time-picker/state';
import { Dayjs } from 'dayjs';

import useState from '../../_hooks/use-state';
import { getDayjsValue } from '../../_utils/date';
import { isUndefined } from '../../_utils/is';
import { TimeValue } from '../interface';

export default function useTimeState(props: {
  modelValue: TimeValue | TimeValue[] | undefined;
  defaultValue: TimeValue | TimeValue[] | undefined;
  format: string;
  isRange: boolean;
}) {
  const { modelValue, defaultValue, format, isRange } = toRefs(props);

  // 转为 dayjs 的 modelValue
  const computedModelValue = computed(() => {
    const time = normalizeTimeValue(modelValue.value, isRange.value);
    return getDayjsValue(time, format.value);
  });

  // 转为 dayjs 的 defaultValue
  const computedDefaultValue = computed(() => {
    const time = normalizeTimeValue(defaultValue.value, isRange.value);
    return getDayjsValue(time, format.value);
  });

  const [localValue, setLocalValue] = useState<Dayjs | Array<Dayjs | undefined> | undefined>(
    getInitialTimeValue(computedModelValue.value, () => computedDefaultValue.value, isRange.value),
  );

  watch(computedModelValue, () => {
    if (isUndefined(computedModelValue.value)) {
      setLocalValue(getEmptyTimeValue(isRange.value));
    }
  });

  // 混合的最终值：如果外部有传的话，就用外部的值，不然就使用内部维护的值
  const computedValue = computed(() => computedModelValue.value || localValue.value);

  // 用于操作过程中 panel 展示的值
  // 1. 跟随最终值变化
  // 2. 面板选择后手动更新
  // 3. 输入框输入格式正确后手动更新
  const [panelValue, setPanelValue] = useState<Dayjs | Array<Dayjs | undefined> | undefined>(
    computedValue.value,
  );

  watch([computedValue], () => {
    setPanelValue(computedValue.value);
  });

  // 用于操作 input 的过程中 input 展示的值
  // 1. 最终值变化后置空
  // 2. 面板选择后置空
  // 3. 输入框变化后手动更新
  const [inputValue, setInputValue] = useState<string | Array<string | undefined> | undefined>();
  watch([panelValue], () => {
    setInputValue(undefined);
  });

  return {
    computedValue,
    panelValue,
    inputValue,
    setValue: setLocalValue,
    setPanelValue,
    setInputValue,
  };
}
