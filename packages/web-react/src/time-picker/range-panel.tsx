import type { Dayjs } from 'dayjs';

import { createTimeRangePanel } from '@sdata/web-core/time-picker/panel';
import { useLayoutEffect, useState } from 'react';

import { TimePanel, type TimePanelProps } from './panel.js';

export interface TimeRangePanelProps extends Omit<
  TimePanelProps,
  'value' | 'onSelect' | 'onConfirm'
> {
  value?: Array<Dayjs | undefined>;
  displayIndex?: number;
  onSelect(value: Array<Dayjs | undefined>): void;
  onConfirm(value: Dayjs[] | undefined): void;
  onDisplayIndexChange?(index: number): void;
  onUpdateDisplayIndex?(index: number): void;
}

export function TimeRangePanel({
  value,
  displayIndex = 0,
  onSelect,
  onConfirm,
  onDisplayIndexChange,
  onUpdateDisplayIndex,
  ...props
}: TimeRangePanelProps) {
  const [index, setIndex] = useState(displayIndex);
  useLayoutEffect(() => setIndex(displayIndex), [displayIndex]);
  const foundation = createTimeRangePanel({
    getValue: () => value,
    getIndex: () => index,
    setIndex,
    onSelect,
    onConfirm,
    onIndexChange: (next) => onDisplayIndexChange?.(next),
    onUpdateIndex: (next) => onUpdateDisplayIndex?.(next),
  });
  return (
    <TimePanel
      {...props}
      isRange
      value={value?.[index]}
      onSelect={foundation.select}
      onConfirm={foundation.confirm}
    />
  );
}
