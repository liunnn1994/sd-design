import { activatePreviewAction } from '@sdata/web-core/image/foundation';
import { Children } from 'react';

import type { ImagePreviewActionProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import { Tooltip } from '../tooltip/index.js';

export function ImagePreviewAction({
  name,
  disabled = false,
  children,
  className,
  onMouseDown,
  onClick,
  ...attrs
}: ImagePreviewActionProps) {
  const prefix = usePrefix('image-preview-toolbar-action');
  if (!Children.toArray(children).length) return null;
  const content = (
    <div
      {...attrs}
      className={[prefix, disabled && `${prefix}-disabled`, className].filter(Boolean).join(' ')}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onClick={(event) => activatePreviewAction(disabled, event, (value) => onClick?.(value))}
    >
      <span className={`${prefix}-content`}>{children}</span>
    </div>
  );
  return name ? (
    <Tooltip className={`${prefix}-tooltip`} content={name}>
      {content}
    </Tooltip>
  ) : (
    content
  );
}
