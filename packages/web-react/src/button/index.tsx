import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, MouseEvent, Ref, ReactElement } from 'react';

import {
  createButtonTextFoundation,
  getButtonText,
  observeButtonIconSpacing,
} from '@sdata/web-core/button/text';
import { createPressableFoundation } from '@sdata/web-core/interaction/pressable';
import {
  createContext,
  useContext,
  useRef,
  useState,
  useLayoutEffect,
  useImperativeHandle,
} from 'react';

import type { PerformantEllipsisExposed } from '../ellipsis/index.js';
import type { ButtonOptions, ButtonProps, ButtonGroupProps } from './types.js';

import { LoadingIcon } from '../_shared/loading-icon.js';
import { usePrefix, useConfig } from '../config-provider/index.js';
import { PerformantEllipsis } from '../ellipsis/index.js';
import { useFormItem } from '../form/context.js';
import { Tooltip } from '../tooltip/index.js';

export type { ButtonProps, ButtonGroupProps } from './types.js';
const ButtonGroupContext = createContext<ButtonOptions>({});

export function ButtonGroup({
  type,
  shape,
  status,
  size,
  disabled,
  children,
  className,
  ...attributes
}: ButtonGroupProps) {
  const prefix = usePrefix('btn');
  return (
    <ButtonGroupContext.Provider value={{ type, shape, status, size, disabled }}>
      <div {...attributes} className={[`${prefix}-group`, className].filter(Boolean).join(' ')}>
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
}

function ButtonView(props: ButtonProps) {
  const prefix = usePrefix('btn');
  const ellipsisContentClass = usePrefix('ellipsis-content');
  const config = useConfig();
  const group = useContext(ButtonGroupContext);
  const formItem = useFormItem({
    size: props.size ?? group.size,
    disabled: props.disabled || group.disabled,
  });
  const {
    type = group.type ?? 'secondary',
    shape = group.shape ?? 'square',
    status = group.status ?? 'normal',
    size = formItem.mergedSize ?? config.size ?? 'medium',
    disabled: _disabled,
    loading = false,
    loadingFixedWidth = false,
    long = false,
    icon,
    srOnly,
    tooltip,
    tooltipContent,
    ellipsis = true,
    ellipsisLineClamp,
    ellipsisExpandTrigger,
    ellipsisTooltip = true,
    ellipsisTooltipContent,
    children,
    className,
    href,
    htmlType = 'button',
    onClick: _onClick,
    ref,
    ...attributes
  } = props;
  const element = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const ellipsisRef = useRef<PerformantEllipsisExposed>(null);
  const hasIcon = loading || icon != null;
  const hasEllipsis = ellipsis && children != null;
  const hasTooltip = tooltip != null || tooltipContent != null;
  const [twoChineseChars, setTwoChineseChars] = useState(false);
  useImperativeHandle(ref as Ref<HTMLButtonElement | HTMLAnchorElement>, () => element.current!, [
    href,
  ]);
  useLayoutEffect(() => {
    if (hasIcon && hasEllipsis && iconRef.current) {
      return observeButtonIconSpacing(iconRef.current, `${prefix}-content`, ellipsisContentClass);
    }
  }, [hasIcon, hasEllipsis, href, hasTooltip, prefix, ellipsisContentClass]);
  useLayoutEffect(() => {
    createButtonTextFoundation(
      {
        autoInsertSpace: !!config.autoInsertSpaceInButton,
        get isTwoCNChar() {
          return twoChineseChars;
        },
        set isTwoCNChar(next) {
          setTwoChineseChars(next);
        },
      },
      () => getButtonText(element.current),
    ).updateIsTwoCNChar();
  });
  const setElement = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
    element.current = node;
  };
  const blocked = formItem.mergedDisabled;
  const classes = [
    `${prefix}`,
    `${prefix}-${type}`,
    `${prefix}-shape-${shape}`,
    `${prefix}-size-${size}`,
    `${prefix}-status-${status}`,
    twoChineseChars && `${prefix}-two-chinese-chars`,
    long && `${prefix}-long`,
    loading && `${prefix}-loading`,
    loadingFixedWidth && `${prefix}-loading-fixed-width`,
    blocked && `${prefix}-disabled`,
    typeof href === 'string' && `${prefix}-link`,
    icon != null && children == null && `${prefix}-only-icon`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {hasIcon && (
        <span ref={iconRef} className={`${prefix}-icon`}>
          {loading ? <LoadingIcon spin /> : icon}
        </span>
      )}
      {hasEllipsis ? (
        <PerformantEllipsis
          ref={ellipsisRef}
          className={`${prefix}-content`}
          lineClamp={ellipsisLineClamp}
          expandTrigger={ellipsisExpandTrigger}
          tooltip={hasTooltip ? false : ellipsisTooltip}
          tooltipContent={ellipsisTooltipContent}
          title={hasTooltip ? '' : undefined}
        >
          {children}
        </PerformantEllipsis>
      ) : twoChineseChars ? (
        <span>{children}</span>
      ) : (
        children
      )}
      {srOnly != null && <span className={`${prefix}-sr-only`}>{srOnly}</span>}
    </>
  );
  const wrapTooltip = (target: ReactElement) => {
    if (tooltip == null && tooltipContent == null) return target;
    const options = typeof tooltip === 'string' ? { content: tooltip } : tooltip;
    return (
      <Tooltip {...options} content={tooltipContent ?? options?.content}>
        {target}
      </Tooltip>
    );
  };
  if (href) {
    const handleClick = createPressableFoundation<MouseEvent<HTMLAnchorElement>>(
      { disabled: blocked, loading },
      (event) => {
        if (props.href) props.onClick?.(event);
      },
    ).handleClick;
    return wrapTooltip(
      <a
        {...(attributes as ComponentPropsWithRef<'a'>)}
        ref={setElement}
        className={classes}
        href={blocked || loading ? undefined : href}
        onClick={handleClick}
        onFocus={(event) => {
          if (event.target !== event.currentTarget) return;
          (attributes as ComponentPropsWithRef<'a'>).onFocus?.(event);
          void ellipsisRef.current?.setFocused(true);
        }}
        onBlur={(event) => {
          if (event.target !== event.currentTarget) return;
          (attributes as ComponentPropsWithRef<'a'>).onBlur?.(event);
          void ellipsisRef.current?.setFocused(false);
        }}
      >
        {content}
      </a>,
    );
  }
  const handleClick = createPressableFoundation<MouseEvent<HTMLButtonElement>>(
    { disabled: blocked, loading },
    (event) => {
      if (!props.href) (props.onClick as ComponentPropsWithRef<'button'>['onClick'])?.(event);
    },
  ).handleClick;
  return wrapTooltip(
    <button
      {...(attributes as ComponentPropsWithRef<'button'>)}
      ref={setElement}
      className={classes}
      type={htmlType}
      disabled={blocked}
      onClick={handleClick}
      onFocus={(event) => {
        if (event.target !== event.currentTarget) return;
        (attributes as ComponentPropsWithRef<'button'>).onFocus?.(event);
        void ellipsisRef.current?.setFocused(true);
      }}
      onBlur={(event) => {
        if (event.target !== event.currentTarget) return;
        (attributes as ComponentPropsWithRef<'button'>).onBlur?.(event);
        void ellipsisRef.current?.setFocused(false);
      }}
    >
      {content}
    </button>,
  );
}

export const Button = Object.assign(ButtonView, { Group: ButtonGroup });
export default Button;

export type ButtonInstance = ReactComponentRef<typeof Button>;
export type ButtonGroupInstance = ReactComponentRef<typeof ButtonGroup>;
