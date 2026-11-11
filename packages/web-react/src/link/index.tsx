import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode, MouseEvent } from 'react';

import { createPressableFoundation } from '@sdata/web-core/interaction/pressable';

import type { EllipsisTooltipProps } from '../ellipsis/index.js';

import { LoadingIcon } from '../_shared/loading-icon.js';
import { usePrefix } from '../config-provider/index.js';
import { PerformantEllipsis } from '../ellipsis/index.js';
import { Tooltip } from '../tooltip/index.js';

export interface LinkProps extends ComponentPropsWithRef<'a'> {
  status?: 'normal' | 'warning' | 'success' | 'danger';
  hoverable?: boolean;
  icon?: boolean | ReactNode;
  iconTooltip?: string;
  loading?: boolean;
  disabled?: boolean;
  ellipsis?: boolean;
  ellipsisLineClamp?: number | string;
  ellipsisExpandTrigger?: 'click';
  ellipsisTooltip?: boolean | EllipsisTooltipProps;
  tooltipContent?: ReactNode;
}

export function Link({
  status = 'normal',
  hoverable,
  icon = false,
  iconTooltip,
  loading = false,
  disabled = false,
  ellipsis = true,
  ellipsisLineClamp,
  ellipsisExpandTrigger,
  ellipsisTooltip = true,
  tooltipContent,
  children,
  href,
  onClick,
  className,
  ...attrs
}: LinkProps) {
  const prefix = usePrefix('link');
  const iconPrefix = usePrefix('icon');
  const hasContent = children != null && typeof children !== 'boolean';
  const showIcon = icon !== false && icon != null;
  const glyph =
    icon === true ? (
      <svg
        className={`${iconPrefix} ${iconPrefix}-link`}
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        aria-hidden="true"
      >
        <path d="m14.1 25.414-4.95 4.95a6 6 0 0 0 8.486 8.485l8.485-8.485a6 6 0 0 0 0-8.485m7.779.707 4.95-4.95a6 6 0 1 0-8.486-8.485l-8.485 8.485a6 6 0 0 0 0 8.485" />
      </svg>
    ) : (
      icon
    );
  const { handleClick } = createPressableFoundation<MouseEvent<HTMLAnchorElement>>(
    { disabled, loading },
    (event) => onClick?.(event),
  );
  return (
    <a
      {...attrs}
      href={disabled ? undefined : href}
      onClick={handleClick}
      className={[
        prefix,
        `${prefix}-status-${status}`,
        disabled && `${prefix}-disabled`,
        loading && `${prefix}-loading`,
        !(hoverable ?? hasContent) && `${prefix}-hoverless`,
        (loading || showIcon) && `${prefix}-with-icon`,
        !hasContent && (loading || showIcon) && `${prefix}-icon-only`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(loading || showIcon) && (
        <span className={`${prefix}-icon`}>
          {loading ? (
            <LoadingIcon />
          ) : iconTooltip ? (
            <Tooltip content={iconTooltip}>
              <span>{glyph}</span>
            </Tooltip>
          ) : (
            glyph
          )}
        </span>
      )}
      {hasContent &&
        (ellipsis ? (
          <PerformantEllipsis
            className={`${prefix}-content`}
            lineClamp={ellipsisLineClamp}
            expandTrigger={ellipsisExpandTrigger}
            tooltip={ellipsisTooltip}
            tooltipContent={tooltipContent}
          >
            {children}
          </PerformantEllipsis>
        ) : (
          <span className={`${prefix}-content`}>{children}</span>
        ))}
    </a>
  );
}

export default Link;

export type LinkInstance = ReactComponentRef<typeof Link>;
