import type { ResultStatus } from '@sdata/web-core/result/utils';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { getResultIllustration } from '@sdata/web-core/result/illustrations';
import { resolveResultStatus } from '@sdata/web-core/result/utils';
import { useId } from 'react';

import { usePrefix } from '../config-provider/index.js';

export type { ResultStatus } from '@sdata/web-core/result/utils';
export interface ResultProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  status?: ResultStatus;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
}

function ResultIcon({ status }: { status: ResultStatus }) {
  const prefix = usePrefix('icon');
  const id = useId();
  if (status === null) return null;
  if (status === '403' || status === '404' || status === '500') {
    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 213 213"
        style={{
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          strokeLinejoin: 'round',
          strokeMiterlimit: 2,
        }}
        dangerouslySetInnerHTML={{ __html: getResultIllustration(status, id) }}
      />
    );
  }
  const name = { info: 'info', success: 'check', warning: 'exclamation', error: 'close' }[status];
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      viewBox="0 0 48 48"
      className={`${prefix} ${prefix}-${name}`}
    >
      {status === 'success' ? (
        <path d="M41.678 11.05 19.05 33.678 6.322 20.95" />
      ) : status === 'error' ? (
        <path d="M9.857 9.858 24 24m0 0 14.142 14.142M24 24 38.142 9.858M24 24 9.857 38.142" />
      ) : (
        <>
          <path d={status === 'info' ? 'M25 39h-2V18h2z' : 'M23 9h2v21h-2z'} />
          <path
            fill="currentColor"
            stroke="none"
            d={status === 'info' ? 'M25 39h-2V18h2z' : 'M23 9h2v21h-2z'}
          />
          <path d={status === 'info' ? 'M25 11h-2V9h2z' : 'M23 37h2v2h-2z'} />
          <path
            fill="currentColor"
            stroke="none"
            d={status === 'info' ? 'M25 11h-2V9h2z' : 'M23 37h2v2h-2z'}
          />
        </>
      )}
    </svg>
  );
}

export function Result({
  status = 'info',
  title,
  subtitle,
  icon,
  extra,
  children,
  className,
  ...attrs
}: ResultProps) {
  const prefix = usePrefix('result');
  const resolved = resolveResultStatus(status);
  return (
    <div {...attrs} className={[prefix, className].filter(Boolean).join(' ')}>
      <div
        aria-hidden="true"
        className={`${prefix}-icon ${prefix}-icon-${resolved === null ? 'custom' : resolved}`}
      >
        <div className={`${prefix}-icon-tip`}>
          {icon === undefined ? <ResultIcon status={resolved} /> : icon}
        </div>
      </div>
      {Boolean(title) && <div className={`${prefix}-title`}>{title}</div>}
      {Boolean(subtitle) && <div className={`${prefix}-subtitle`}>{subtitle}</div>}
      {extra != null && <div className={`${prefix}-extra`}>{extra}</div>}
      {children != null && <div className={`${prefix}-content`}>{children}</div>}
    </div>
  );
}

export default Result;

export type ResultInstance = ReactComponentRef<typeof Result>;
