import { computed, nextTick, reactive, toRefs } from 'vue';

import {
  fixRangeHeaders,
  sortSelectedRangeHeaders,
  canShortenRangeHeaders,
  rangeHeaderOperationKeys,
  setDateRangeHeader,
} from '@sdata/web-core/date-picker/header';
import { Dayjs } from 'dayjs';

import pick from '../../_utils/pick';
import { CalendarValue, Mode } from '../interface';
import useHeaderValue from './use-header-value';
import usePanelSpan from './use-panel-span';

interface RangeHeaderValueProps {
  mode: Mode;
  startHeaderMode?: Mode;
  endHeaderMode?: Mode;
  value: CalendarValue[] | undefined;
  defaultValue: CalendarValue[] | undefined;
  selectedValue: (Dayjs | undefined)[];
  format: string;
  utcOffset?: number;
  timezone?: string;
  onChange?: (newVal: Dayjs[]) => void;
}

export default function useRangeHeaderValue(props: RangeHeaderValueProps) {
  const {
    startHeaderMode,
    endHeaderMode,
    mode,
    value,
    defaultValue,
    selectedValue,
    format,
    utcOffset,
    timezone,
    onChange,
  } = toRefs(props);

  const { span, superSpan } = usePanelSpan(
    reactive({
      mode,
    }),
  );

  const startMode = computed(() => startHeaderMode?.value || mode.value);
  const endMode = computed(() => endHeaderMode?.value || mode.value);

  const startValue = computed(() => value.value?.[0]);
  const endValue = computed(() => value.value?.[1]);

  const startDefaultValue = computed(() => defaultValue.value?.[0]);
  const endDefaultValue = computed(() => defaultValue.value?.[1]);

  const emitChange = (newVal: Dayjs[]) => {
    onChange?.value && onChange.value(newVal);
  };
  const {
    headerValue: startHeaderValue,
    setHeaderValue: setStartHeaderValue,
    headerOperations: startHeaderOperations,
    getDefaultLocalValue: getDefaultStartHeaderValue,
  } = useHeaderValue(
    reactive({
      mode: startMode,
      value: startValue,
      defaultValue: startDefaultValue,
      selectedValue: undefined,
      format,
      utcOffset,
      timezone,
      onChange: (newVal: Dayjs) => {
        emitChange([newVal, endHeaderValue.value]);
      },
    }),
  );

  const {
    headerValue: endHeaderValue,
    setHeaderValue: setEndHeaderValue,
    headerOperations: endHeaderOperations,
    getDefaultLocalValue: getDefaultEndHeaderValue,
  } = useHeaderValue(
    reactive({
      mode: endMode,
      value: endValue,
      defaultValue: endDefaultValue,
      selectedValue: undefined,
      format,
      utcOffset,
      timezone,
      onChange: (newVal: Dayjs) => {
        emitChange([startHeaderValue.value, newVal]);
      },
    }),
  );

  const headerAdapter = {
    get mode() {
      return mode.value;
    },
    get start() {
      return startHeaderValue.value;
    },
    get end() {
      return endHeaderValue.value;
    },
    setStart: setStartHeaderValue,
    setEnd: setEndHeaderValue,
    onChange: emitChange,
  };
  const setHeaderValue = (value: Dayjs[]) => setDateRangeHeader(headerAdapter, value);
  const getFixedValue = (values: Dayjs[]) => fixRangeHeaders(values, span.value, mode.value);
  const getFormSelectedValue = () => sortSelectedRangeHeaders(selectedValue.value);

  // 1. 目前为此，在非受控情况下，start 和 end 的值是一样的，所以需要 fix 一下
  // 2. 附加 selectedValue 处理
  const [selected0, selected1] = getFormSelectedValue();
  const [header0, header1] = getFixedValue([
    selected0 || startHeaderValue.value,
    selected1 || endHeaderValue.value,
  ]);
  setStartHeaderValue(header0, false);
  setEndHeaderValue(header1, false);

  const resetHeaderValue = () => {
    const defaultStartHeaderValue = getDefaultStartHeaderValue();
    const defaultEndHeaderValue = getDefaultEndHeaderValue();

    // Because selectedValue is used, it may not be updated in time, so add nextTick
    nextTick(() => {
      const [selected0, selected1] = getFormSelectedValue();
      const [header0, header1] = getFixedValue([
        selected0 || defaultStartHeaderValue,
        selected1 || defaultEndHeaderValue,
      ]);
      setHeaderValue([header0, header1]);
    });
  };

  /** ************* 以下为操作 ****************** */

  const canShortenMonth = computed(() =>
    canShortenRangeHeaders(startHeaderValue.value, endHeaderValue.value, span.value, mode.value),
  );
  const canShortenYear = computed(() =>
    canShortenRangeHeaders(
      startHeaderValue.value,
      endHeaderValue.value,
      superSpan.value,
      mode.value,
    ),
  );
  const computedStartHeaderOperations = computed(() =>
    pick(
      startHeaderOperations.value,
      rangeHeaderOperationKeys(mode.value, canShortenMonth.value, canShortenYear.value, false),
    ),
  );
  const computedEndHeaderOperations = computed(() =>
    pick(
      endHeaderOperations.value,
      rangeHeaderOperationKeys(mode.value, canShortenMonth.value, canShortenYear.value, true),
    ),
  );

  return {
    startHeaderValue,
    endHeaderValue,
    startHeaderOperations: computedStartHeaderOperations,
    endHeaderOperations: computedEndHeaderOperations,
    setHeaderValue,
    resetHeaderValue,
  };
}
