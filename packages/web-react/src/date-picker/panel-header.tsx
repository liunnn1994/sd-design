import type { Mode } from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

import { createDatePanelHeaderLabels } from '@sdata/web-core/date-picker/header';

import { IconDoubleLeft } from '../icon/icon-double-left.js';
import { IconDoubleRight } from '../icon/icon-double-right.js';
import { IconLeft } from '../icon/icon-left.js';
import { IconRight } from '../icon/icon-right.js';
import { useDatePickerTranslate } from './context.js';

export interface DatePanelHeaderProps {
  prefixCls: string;
  title: string;
  mode?: Mode;
  value?: Dayjs;
  icons?:
    | { prev?: ReactNode; prevDouble?: ReactNode; next?: ReactNode; nextDouble?: ReactNode }
    | undefined;
  onPrev?: ((event: MouseEvent) => void) | undefined;
  onSuperPrev?: ((event: MouseEvent) => void) | undefined;
  onNext?: ((event: MouseEvent) => void) | undefined;
  onSuperNext?: ((event: MouseEvent) => void) | undefined;
  onLabelClick?: ((label: 'year' | 'month') => void) | undefined;
}

export function DatePanelHeader({
  prefixCls: prefix,
  mode = 'date',
  value,
  title,
  icons,
  onPrev,
  onSuperPrev,
  onNext,
  onSuperNext,
  onLabelClick,
}: DatePanelHeaderProps) {
  const t = useDatePickerTranslate();
  const labels = createDatePanelHeaderLabels({ mode, value }, t);
  const year = labels.getYear();
  const month = labels.getMonth();
  const arrow = (onClick: ((event: MouseEvent) => void) | undefined, content: ReactNode) => (
    <div
      className={[`${prefix}-header-icon`, !onClick && `${prefix}-header-icon-hidden`]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) => onClick?.(event.nativeEvent)}
    >
      {onClick && content}
    </div>
  );
  return (
    <div className={`${prefix}-header`}>
      {arrow(onSuperPrev, icons?.prevDouble ?? <IconDoubleLeft />)}
      {arrow(onPrev, icons?.prev ?? <IconLeft />)}
      <div className={`${prefix}-header-title`}>
        {onLabelClick && (year || month) ? (
          <>
            {year && (
              <span className={`${prefix}-header-label`} onClick={() => onLabelClick('year')}>
                {year}
              </span>
            )}
            {year && month && <span>-</span>}
            {month && (
              <span className={`${prefix}-header-label`} onClick={() => onLabelClick('month')}>
                {month}
              </span>
            )}
          </>
        ) : (
          title
        )}
      </div>
      {arrow(onNext, icons?.next ?? <IconRight />)}
      {arrow(onSuperNext, icons?.nextDouble ?? <IconDoubleRight />)}
    </div>
  );
}
