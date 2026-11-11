import type { ClipboardOptions } from '@sdata/web-core/clipboard';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ReactNode, MouseEvent, MouseEventHandler } from 'react';
import type { DistributedOmit } from 'type-fest';

import copy from '@sdata/web-core/clipboard';
import { createCopyFoundation, getCopyDisabled } from '@sdata/web-core/copy/foundation';
import { useLayoutEffect, useRef, useState } from 'react';

import { Button, type ButtonProps } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Link, type LinkProps } from '../link/index.js';
import { useI18n } from '../locale/index.js';
import { useMessage } from '../message/index.js';
import { Tooltip, type TooltipProps } from '../tooltip/index.js';

export interface CopyBaseProps {
  content?: string;
  tooltip?: string;
  tooltipProps?: Omit<TooltipProps, 'children'>;
  clipboardProps?: ClipboardOptions;
  textInherit?: boolean;
  successMessage?: string;
  icon?: ReactNode;
  onCopy?: (content: string) => void;
  onClick?: MouseEventHandler<HTMLElement>;
}
export type CopyLinkProps = CopyBaseProps &
  Omit<LinkProps, keyof CopyBaseProps> & { component?: 'link' };
export type CopyButtonProps = CopyBaseProps &
  DistributedOmit<ButtonProps, Extract<keyof CopyBaseProps, keyof ButtonProps>> & {
    component: 'button';
  };
export type CopyProps = CopyLinkProps | CopyButtonProps;
export type CopyComponentType = NonNullable<CopyProps['component']>;

export function Copy(props: CopyProps) {
  const {
    content = '',
    tooltip,
    tooltipProps,
    clipboardProps,
    textInherit = true,
    successMessage,
    onCopy,
    icon,
    children,
    className,
    ...triggerProps
  } = props;
  const prefix = usePrefix('copy');
  const iconPrefix = usePrefix('icon');
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [message, holder] = useMessage();
  const current = useRef({
    content,
    clipboardProps,
    disabled: props.disabled,
    copied,
    onCopy,
    successMessage,
    t,
  });
  current.current = {
    content,
    clipboardProps,
    disabled: props.disabled,
    copied,
    onCopy,
    successMessage,
    t,
  };
  const foundation = useRef<ReturnType<typeof createCopyFoundation> | null>(null);
  useLayoutEffect(() => {
    const instance = createCopyFoundation(
      {
        get props() {
          return current.current;
        },
        get isDisabled() {
          return getCopyDisabled(current.current.disabled);
        },
        get copied() {
          return current.current.copied;
        },
        set copied(value) {
          setCopied(value);
        },
      },
      {
        copy,
        success: () =>
          message.success(current.current.successMessage ?? current.current.t('copy.copied')),
        copied: (value) => current.current.onCopy?.(value),
      },
    );
    foundation.current = instance;
    return () => {
      instance.dispose();
      foundation.current = null;
    };
  }, [message]);
  const label = tooltip ?? t(copied ? 'copy.copied' : 'copy.copy');
  const shared = {
    'disabled': getCopyDisabled(props.disabled),
    'className': [
      prefix,
      props.component !== 'button' && textInherit && `${prefix}-inherit`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
    'aria-label':
      props['aria-label'] ??
      (children == null || typeof children === 'boolean' ? label : undefined),
    'icon': icon ?? (
      <svg
        className={`${iconPrefix} ${iconPrefix}-${copied ? 'check' : 'copy'}${copied ? ` ${prefix}-feedback` : ''}`}
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        aria-hidden="true"
      >
        <path
          d={
            copied
              ? 'M41.678 11.05 19.05 33.678 6.322 20.95'
              : 'M20 6h18a2 2 0 0 1 2 2v22M8 16v24c0 1.105.891 2 1.996 2h20.007A1.99 1.99 0 0 0 32 40.008V15.997A1.997 1.997 0 0 0 30 14H10a2 2 0 0 0-2 2Z'
          }
        />
      </svg>
    ),
  };
  let trigger;
  if (triggerProps.component === 'button') {
    const { component: _, onClick, ...attrs } = triggerProps;
    trigger = (
      <Button
        {...attrs}
        {...shared}
        onClick={(event: MouseEvent<HTMLElement>) => {
          onClick?.(event);
          void foundation.current?.handleCopy();
        }}
      >
        {children}
      </Button>
    );
  } else {
    const { component: _, onClick, ...attrs } = triggerProps;
    trigger = (
      <Link
        {...attrs}
        {...shared}
        onClick={(event: MouseEvent<HTMLElement>) => {
          onClick?.(event);
          void foundation.current?.handleCopy();
        }}
      >
        {children}
      </Link>
    );
  }
  return (
    <>
      <Tooltip {...tooltipProps} content={tooltipProps?.content ?? label}>
        {trigger}
      </Tooltip>
      {holder}
    </>
  );
}
export default Copy;

export type CopyInstance = ReactComponentRef<typeof Copy>;
