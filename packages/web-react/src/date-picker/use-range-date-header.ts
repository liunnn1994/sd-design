import type { CalendarValue, HeaderOperations, Mode } from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';

import { getDayjsValue, getNow } from '@sdata/web-core/_utils/date';
import {
  canShortenRangeHeaders,
  fixRangeHeaders,
  getPanelSpan,
  getPanelSuperSpan,
  rangeHeaderOperationKeys,
  setDateRangeHeader,
  sortSelectedRangeHeaders,
} from '@sdata/web-core/date-picker/header';
import { useLayoutEffect, useRef, useState } from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useDateHeader } from './use-date-header.js';

export interface RangeDateHeaderOptions {
  mode: Mode;
  startHeaderMode?: Mode;
  endHeaderMode?: Mode;
  value?: CalendarValue[];
  defaultValue?: CalendarValue[];
  selectedValue: Array<Dayjs | undefined>;
  format: string;
  utcOffset?: number;
  timezone?: string;
  onChange?(value: Dayjs[]): void;
}

export function useRangeDateHeader(props: RangeDateHeaderOptions) {
  const span = getPanelSpan(props.mode);
  const getDefault = (index: number) =>
    getDayjsValue(props.defaultValue?.[index], props.format, props.utcOffset, props.timezone) ??
    getNow(props.utcOffset, props.timezone);
  const [initial] = useState(() => {
    const selected = sortSelectedRangeHeaders(props.selectedValue);
    return fixRangeHeaders(
      [0, 1].map(
        (index) =>
          selected[index] ??
          getDayjsValue(props.value?.[index], props.format, props.utcOffset, props.timezone) ??
          getDefault(index),
      ),
      span,
      props.mode,
    );
  });
  const common = { format: props.format, utcOffset: props.utcOffset, timezone: props.timezone };
  const start: ReturnType<typeof useDateHeader> = useDateHeader({
    ...common,
    mode: props.startHeaderMode ?? props.mode,
    value: props.value?.[0],
    defaultValue: props.defaultValue?.[0],
    selectedValue: initial[0],
    onChange: (value) => props.onChange?.([value, end.value]),
  });
  const end: ReturnType<typeof useDateHeader> = useDateHeader({
    ...common,
    mode: props.endHeaderMode ?? props.mode,
    value: props.value?.[1],
    defaultValue: props.defaultValue?.[1],
    selectedValue: initial[1],
    onChange: (value) => props.onChange?.([start.value, value]),
  });
  const current = useRef({ props, start, end });
  current.current = { props, start, end };
  const afterRender = useAfterRender();
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const setValue = (value: Dayjs[]) => {
    const latest = current.current;
    setDateRangeHeader(
      {
        mode: latest.props.mode,
        start: latest.start.value,
        end: latest.end.value,
        setStart: latest.start.setValue,
        setEnd: latest.end.setValue,
        onChange: (next) => latest.props.onChange?.(next),
      },
      value,
    );
  };
  const resetValue = () => {
    const defaults = [getDefault(0), getDefault(1)];
    void afterRender().then(() => {
      if (!mounted.current) return;
      const latest = current.current.props;
      const selected = sortSelectedRangeHeaders(latest.selectedValue);
      setValue(
        fixRangeHeaders(
          [selected[0] ?? defaults[0], selected[1] ?? defaults[1]],
          getPanelSpan(latest.mode),
          latest.mode,
        ),
      );
    });
  };
  const canShortenMonth = canShortenRangeHeaders(start.value, end.value, span, props.mode);
  const canShortenYear = canShortenRangeHeaders(
    start.value,
    end.value,
    getPanelSuperSpan(props.mode),
    props.mode,
  );
  const operations = (header: typeof start, isEnd: boolean): HeaderOperations =>
    Object.fromEntries(
      rangeHeaderOperationKeys(props.mode, canShortenMonth, canShortenYear, isEnd).map((key) => [
        key,
        header.operations[key],
      ]),
    );
  return {
    startValue: start.value,
    endValue: end.value,
    startOperations: operations(start, false),
    endOperations: operations(end, true),
    setValue,
    resetValue,
  };
}
