import type { CalendarValue, Mode } from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';

import { getDayjsValue, getNow } from '@sdata/web-core/_utils/date';
import {
  createDateHeader,
  getPanelSpan,
  getPanelSuperSpan,
} from '@sdata/web-core/date-picker/header';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface DateHeaderOptions {
  mode?: Mode | undefined;
  value?: CalendarValue | undefined;
  defaultValue?: CalendarValue | undefined;
  selectedValue?: Dayjs | undefined;
  format: string;
  utcOffset?: number | undefined;
  timezone?: string | undefined;
  onChange?(value: Dayjs): void;
}

export function useDateHeader(props: DateHeaderOptions) {
  const mode = props.mode ?? 'date';
  const model = useMemo(
    () => getDayjsValue(props.value, props.format, props.utcOffset, props.timezone),
    [props.value, props.format, props.utcOffset, props.timezone],
  );
  const getDefaultValue = () =>
    props.selectedValue ??
    getDayjsValue(props.defaultValue, props.format, props.utcOffset, props.timezone) ??
    getNow(props.utcOffset, props.timezone);
  const [localValue, setLocalValue] = useState(getDefaultValue);
  const value = model ?? localValue;
  const current = useRef({ props, mode, value });
  current.current = { props, mode, value };
  const [foundation] = useState(() =>
    createDateHeader({
      get mode() {
        return current.current.mode;
      },
      get value() {
        return current.current.value;
      },
      get span() {
        return getPanelSpan(current.current.mode);
      },
      get superSpan() {
        return getPanelSuperSpan(current.current.mode);
      },
      setLocalValue,
      onChange: (next) => current.current.props.onChange?.(next),
    }),
  );
  const previousSelection = useRef(props.selectedValue);
  useLayoutEffect(() => {
    if (previousSelection.current !== props.selectedValue) {
      previousSelection.current = props.selectedValue;
      foundation.setValue(props.selectedValue);
    }
  }, [props.selectedValue, foundation]);
  return {
    value,
    setValue: foundation.setValue,
    operations: foundation.getOperations(),
    getDefaultValue,
    resetValue: (emitChange = true) => foundation.setValue(getDefaultValue(), emitChange),
  };
}
