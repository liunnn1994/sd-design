import type { DateShortcutValue } from '@sdata/web-core/date-picker/values';
import type { ReactNode } from 'react';

import { Button } from '../button/index.js';
import { useDatePickerTranslate } from './context.js';

export interface DatePickerShortcut extends DateShortcutValue {
  label: ReactNode | (() => ReactNode);
}
export interface DatePanelShortcutsProps {
  prefixCls: string;
  shortcuts?: DatePickerShortcut[];
  showNowBtn?: boolean;
  onItemClick?(item: DatePickerShortcut): void;
  onItemMouseEnter?(item: DatePickerShortcut): void;
  onItemMouseLeave?(item: DatePickerShortcut): void;
  onNowClick?(): void;
}

export function DatePanelShortcuts({
  prefixCls: prefix,
  shortcuts = [],
  showNowBtn,
  onItemClick,
  onItemMouseEnter,
  onItemMouseLeave,
  onNowClick,
}: DatePanelShortcutsProps) {
  const t = useDatePickerTranslate();
  return (
    <div className={`${prefix}-shortcuts`}>
      {showNowBtn && (
        <Button size="mini" onClick={() => onNowClick?.()}>
          {t('datePicker.now')}
        </Button>
      )}
      {shortcuts.map((item, index) => (
        <Button
          key={index}
          size="mini"
          onClick={() => onItemClick?.(item)}
          onMouseEnter={() => onItemMouseEnter?.(item)}
          onMouseLeave={() => onItemMouseLeave?.(item)}
        >
          {typeof item.label === 'function' ? item.label() : item.label}
        </Button>
      ))}
    </div>
  );
}
