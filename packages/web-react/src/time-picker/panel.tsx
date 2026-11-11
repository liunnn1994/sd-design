import type { PanelProps } from '@sdata/web-core/time-picker/types';
import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

import { dayjs } from '@sdata/web-core/_utils/date';
import {
  getTimeHours,
  getTimeMinutes,
  getTimeSeconds,
  getTimeAmpm,
} from '@sdata/web-core/time-picker/options';
import {
  getSelectedTime,
  getSelectedTimeAmpm,
  getSelectedTimeHour,
  type TimeUnit,
} from '@sdata/web-core/time-picker/panel';
import {
  getColumnsFromFormat,
  resolveTimeFormat,
  isDisabledTimeValue,
} from '@sdata/web-core/time-picker/values';
import { useLayoutEffect, useState } from 'react';

import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
import { TimeColumn } from './time-column.js';

export interface TimePanelProps extends Partial<PanelProps> {
  extra?: ReactNode;
  onSelect(value: Dayjs): void;
  onConfirm(value: Dayjs): void;
}

export function TimePanel(props: TimePanelProps) {
  const { value, visible, hideFooter, isRange, disabled, extra, onSelect, onConfirm } = props;
  const prefix = usePrefix('timepicker');
  const { t } = useI18n();
  const format = resolveTimeFormat(props.format, 'HH:mm:ss', props.use12Hours);
  const config = getColumnsFromFormat(format);
  const use12Hours = !!(props.use12Hours || config.use12Hours);
  const [selected, setSelected] = useState(value);
  useLayoutEffect(() => {
    if (visible) setSelected(value);
  }, [visible, value]);
  const selectedHour = getSelectedTimeHour(selected, use12Hours);
  const selectedMinute = selected?.minute();
  const selectedSecond = selected?.second();
  const selectedAmpm = getSelectedTimeAmpm(selected);
  const options = {
    ...props,
    format,
    use12Hours,
    hideDisabledOptions: !!props.hideDisabledOptions,
    selectedHour,
    selectedMinute,
    selectedSecond,
    selectedAmpm,
  };
  const select = (next: Dayjs) => {
    if (disabled) return;
    setSelected(next);
    onSelect(next);
  };
  const selectUnit = (next: number | string, unit: TimeUnit) =>
    select(getSelectedTime(selected, next, unit, use12Hours));
  return (
    <>
      <div className={prefix}>
        {(config.list.includes('H') || config.list.includes('h')) && (
          <TimeColumn
            prefix={prefix}
            value={selectedHour}
            list={getTimeHours(options)}
            visible={visible}
            onSelect={(next) => selectUnit(next, 'hour')}
          />
        )}
        {config.list.includes('m') && (
          <TimeColumn
            prefix={prefix}
            value={selectedMinute}
            list={getTimeMinutes(options)}
            visible={visible}
            onSelect={(next) => selectUnit(next, 'minute')}
          />
        )}
        {config.list.includes('s') && (
          <TimeColumn
            prefix={prefix}
            value={selectedSecond}
            list={getTimeSeconds(options)}
            visible={visible}
            onSelect={(next) => selectUnit(next, 'second')}
          />
        )}
        {use12Hours && (
          <TimeColumn
            prefix={prefix}
            value={selectedAmpm}
            list={getTimeAmpm(options)}
            visible={visible}
            onSelect={(next) => selectUnit(next, 'ampm')}
          />
        )}
      </div>
      {extra != null && <div className={`${prefix}-footer-extra-wrapper`}>{extra}</div>}
      {!hideFooter && (
        <div className={`${prefix}-footer-btn-wrapper`}>
          {!isRange && (
            <Button size="mini" disabled={disabled} onClick={() => select(dayjs())}>
              {t('datePicker.now')}
            </Button>
          )}
          <Button
            type="primary"
            size="mini"
            disabled={
              disabled ||
              !selected ||
              isDisabledTimeValue(selected, {
                disabledHours: props.disabledHours,
                disabledMinutes: props.disabledMinutes,
                disabledSeconds: props.disabledSeconds,
              })
            }
            onClick={() => {
              if (selected) onConfirm(selected);
            }}
          >
            {t('datePicker.ok')}
          </Button>
        </div>
      )}
    </>
  );
}
