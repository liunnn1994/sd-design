import type { ComponentPropsWithRef, ReactNode } from 'react';

import { usePrefix } from '../config-provider/index.js';

export function ImageFooter({
  title,
  description,
  extra,
  className,
  ...attrs
}: ComponentPropsWithRef<'div'> & { description?: string | undefined; extra?: ReactNode }) {
  const prefix = usePrefix('image-footer');
  return (
    <div {...attrs} className={[prefix, className].filter(Boolean).join(' ')}>
      {(title || description) && (
        <div className={`${prefix}-caption`}>
          {title && (
            <div className={`${prefix}-caption-title`} title={title}>
              {title}
            </div>
          )}
          {description && (
            <div className={`${prefix}-caption-description`} title={description}>
              {description}
            </div>
          )}
        </div>
      )}
      {extra != null && <div className={`${prefix}-extra`}>{extra}</div>}
    </div>
  );
}
