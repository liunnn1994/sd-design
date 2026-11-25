import type { ReactNode } from 'react';

import { Button } from '../button/index.js';
import { Link } from '../link/index.js';
import { useDatePickerTranslate } from './context.js';

export interface DatePanelFooterProps {
  prefixCls: string;
  showTodayBtn?: boolean | undefined;
  showConfirmBtn?: boolean | undefined;
  confirmBtnDisabled?: boolean | undefined;
  extra?: ReactNode;
  buttons?: ReactNode;
  onTodayClick?(): void;
  onConfirmClick?: (() => void) | undefined;
}

export function DatePanelFooter({
  prefixCls: prefix,
  showTodayBtn,
  showConfirmBtn,
  confirmBtnDisabled,
  extra,
  buttons,
  onTodayClick,
  onConfirmClick,
}: DatePanelFooterProps) {
  const t = useDatePickerTranslate();
  return (
    <div className={`${prefix}-footer`}>
      {extra != null && <div className={`${prefix}-footer-extra-wrapper`}>{extra}</div>}
      {showTodayBtn && (
        <div className={`${prefix}-footer-now-wrapper`}>
          <Link onClick={() => onTodayClick?.()}>{t('datePicker.today')}</Link>
        </div>
      )}
      {(buttons != null || showConfirmBtn) && (
        <div className={`${prefix}-footer-btn-wrapper`}>
          {buttons}
          {showConfirmBtn && (
            <Button
              className={`${prefix}-btn-confirm`}
              type="primary"
              size="mini"
              disabled={confirmBtnDisabled}
              onClick={() => onConfirmClick?.()}
            >
              {t('datePicker.ok')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
