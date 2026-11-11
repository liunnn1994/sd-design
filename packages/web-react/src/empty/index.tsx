import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';

export interface EmptyProps extends ComponentPropsWithRef<'div'> {
  description?: string;
  imgSrc?: string;
  image?: ReactNode;
  inConfigProvider?: boolean;
}

export function Empty({
  description,
  imgSrc,
  image,
  inConfigProvider = false,
  children,
  className,
  ...attributes
}: EmptyProps) {
  const config = useConfig();
  const prefix = usePrefix('empty');
  const iconPrefix = usePrefix('icon');
  const { t } = useI18n();
  if (
    !inConfigProvider &&
    config.renderEmpty &&
    children == null &&
    image == null &&
    !imgSrc &&
    !description
  ) {
    const custom = config.renderEmpty({ component: 'empty' });
    if (custom != null)
      return (
        <div {...attributes} className={className}>
          {custom}
        </div>
      );
  }
  return (
    <div {...attributes} className={[prefix, className].filter(Boolean).join(' ')}>
      <div className={`${prefix}-image`}>
        {image ??
          (imgSrc ? (
            <img src={imgSrc} alt={description || 'empty'} />
          ) : (
            <svg
              className={`${iconPrefix} ${iconPrefix}-empty`}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path d="M24 5v6m7 1 4-4m-18 4-4-4m28.5 22H28s-1 3-4 3-4-3-4-3H6.5M40 41H8a2 2 0 0 1-2-2v-8.46a2 2 0 0 1 .272-1.007l6.15-10.54A2 2 0 0 1 14.148 18H33.85a2 2 0 0 1 1.728.992l6.149 10.541A2 2 0 0 1 42 30.541V39a2 2 0 0 1-2 2Z" />
            </svg>
          ))}
      </div>
      <div className={`${prefix}-description`}>
        {children ?? (description || t('empty.description'))}
      </div>
    </div>
  );
}

export default Empty;

export type EmptyInstance = ReactComponentRef<typeof Empty>;
