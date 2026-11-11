import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { onActivate } from '@sdata/web-core/_utils/keyboard';

import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';

export interface PageHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  showBack?: boolean;
  backIcon?: ReactNode;
  breadcrumb?: ReactNode;
  extra?: ReactNode;
  onBack?: (event: Event) => void;
}

export function PageHeader({
  title,
  subtitle,
  showBack = true,
  backIcon,
  breadcrumb,
  extra,
  onBack,
  children,
  className,
  ...attrs
}: PageHeaderProps) {
  const prefix = usePrefix('page-header');
  const hoverPrefix = usePrefix('icon-hover');
  const iconPrefix = usePrefix('icon');
  const { t } = useI18n();
  const back = (event: Event) => onBack?.(event);
  const backKeydown = onActivate(back);
  return (
    <div
      {...attrs}
      className={[
        prefix,
        breadcrumb != null && `${prefix}-with-breadcrumb`,
        children != null && `${prefix}-with-content`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={`${prefix}-wrapper`}>
        {breadcrumb != null && <div className={`${prefix}-breadcrumb`}>{breadcrumb}</div>}
        <div className={`${prefix}-header`}>
          <span className={`${prefix}-main`}>
            {showBack && (
              <span
                className={`${hoverPrefix} ${prefix}-icon-hover ${prefix}-back-btn`}
                role="button"
                tabIndex={0}
                aria-label={t('a11y.back')}
                onClick={(event) => back(event.nativeEvent)}
                onKeyDown={(event) => backKeydown(event.nativeEvent)}
              >
                {backIcon === undefined ? (
                  <svg
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4}
                    viewBox="0 0 48 48"
                    className={`${iconPrefix} ${iconPrefix}-left`}
                  >
                    <path d="M32 8.4 16.444 23.956 32 39.513" />
                  </svg>
                ) : (
                  backIcon
                )}
              </span>
            )}
            <span className={`${prefix}-title`}>{title}</span>
            {Boolean(subtitle) && (
              <>
                <span className={`${prefix}-divider`} aria-hidden="true" />
                <span className={`${prefix}-subtitle`}>{subtitle}</span>
              </>
            )}
          </span>
          {extra != null && <span className={`${prefix}-extra`}>{extra}</span>}
        </div>
      </div>
      {children != null && <div className={`${prefix}-content`}>{children}</div>}
    </div>
  );
}

export default PageHeader;

export type PageHeaderInstance = ReactComponentRef<typeof PageHeader>;
