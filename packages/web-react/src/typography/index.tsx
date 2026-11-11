import type { BaseProps, EllipsisConfig } from '@sdata/web-core/typography/types';
import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, Ref } from 'react';

import copy from '@sdata/web-core/clipboard';
import {
  getTypographyContentTags,
  getTypographyMarkStyle,
  getTypographyRichHtml,
  normalizeTypographyEllipsis,
} from '@sdata/web-core/typography/data';
import { createTypographyEditFoundation } from '@sdata/web-core/typography/edit';
import { createTypographyFoundation } from '@sdata/web-core/typography/foundation';
import {
  createTypographyTextContainer,
  measureTypographyInnerText,
} from '@sdata/web-core/typography/measure';
import {
  createTypographyOperations,
  getTypographyShowExpand,
} from '@sdata/web-core/typography/operations';
import { createElement, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import { StatusIcon } from '../_shared/status-icon.js';
import { RichLineClamp, type RichLineClampProps } from '../clamp/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Input } from '../input/index.js';
import { useI18n } from '../locale/index.js';
import { Popover } from '../popover/index.js';
import { Tooltip, type TooltipProps } from '../tooltip/index.js';

export type { EllipsisConfig, EllipsisConfig as TypographyEllipsisConfig };
export type TypographyInstance = HTMLElement;
export type TypographyTextInstance = HTMLElement;
export type TypographyTitleInstance = HTMLHeadingElement;
export type TypographyParagraphInstance = HTMLElement;
export interface TypographyTextProps
  extends
    Partial<BaseProps>,
    Omit<HTMLAttributes<HTMLElement>, keyof BaseProps | 'onChange' | 'onCopy'> {
  ref?: Ref<HTMLElement>;
  editTooltipProps?: Omit<TooltipProps, 'children'>;
  copyTooltipProps?: Omit<TooltipProps, 'children'>;
  copyTooltip?: (copied: boolean) => ReactNode;
  copyIcon?: (copied: boolean) => ReactNode;
  expandNode?: (expanded: boolean) => ReactNode;
  onEditingChange?: (editing: boolean) => void;
  onEditTextChange?: (text: string) => void;
  onChange?: (text: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  onCopy?: (text: string) => void;
  onEllipsis?: (clamped: boolean) => void;
  onExpand?: (expanded: boolean) => void;
}
export interface TypographyTitleProps extends TypographyTextProps {
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
}
export interface TypographyParagraphProps extends TypographyTextProps {
  blockquote?: boolean;
  cite?: string;
  spacing?: 'default' | 'close';
}
export type TypographyProps = ComponentPropsWithRef<'article'>;

function ClampedText({
  ref,
  ...props
}: Omit<RichLineClampProps, 'ref' | 'rootRef'> & { ref?: Ref<HTMLElement> }) {
  return <RichLineClamp {...props} rootRef={ref} />;
}
function EditContent({
  ready,
  text,
  onChange,
  onEnd,
}: {
  ready: boolean;
  text: string;
  onChange(text: string): void;
  onEnd(): void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const prefix = usePrefix('typography');
  const { t } = useI18n();
  const latest = useRef({ onChange, onEnd });
  latest.current = { onChange, onEnd };
  const [edit] = useState(() =>
    createTypographyEditFoundation(
      {
        get rootElement() {
          return root.current ?? undefined;
        },
      },
      {
        update() {},
        change: (value) => latest.current.onChange(value),
        end: () => latest.current.onEnd(),
      },
    ),
  );
  useLayoutEffect(() => {
    if (ready) edit.focusInput();
  }, [edit, ready]);
  return (
    <div ref={root} className={`${prefix}-edit-content`}>
      <Input
        value={text}
        inputAttrs={{ 'aria-label': t('a11y.editText') }}
        onInput={edit.onChange}
        onBlur={edit.onEnd}
        onPressEnter={edit.onEnter}
      />
    </div>
  );
}
function TypographyBase(props: TypographyTextProps & { component: keyof HTMLElementTagNameMap }) {
  const {
    component,
    type,
    bold = false,
    mark = false,
    underline = false,
    delete: deleted = false,
    code = false,
    disabled = false,
    ellipsis = false,
    copyable = false,
    copyDelay: _copyDelay,
    copyText: _copyText,
    clipboardProps: _clipboardProps,
    editable = false,
    editing: _editing,
    defaultEditing = false,
    editText,
    editTooltipProps,
    copyTooltipProps,
    copyTooltip,
    copyIcon,
    expandNode,
    onEditingChange: _onEditingChange,
    onEditTextChange: _onEditTextChange,
    onChange: _onChange,
    onEditStart: _onEditStart,
    onEditEnd: _onEditEnd,
    onCopy: _onCopy,
    onEllipsis: _onEllipsis,
    onExpand: _onExpand,
    children,
    className,
    ref,
    ...attrs
  } = props;
  const prefix = usePrefix('typography');
  const iconPrefix = usePrefix('icon');
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const source = useRef<HTMLSpanElement>(null);
  const [, render] = useState(0);
  const local = useRef({
    fullText: '',
    isEllipsis: false,
    expanded: false,
    isCopied: false,
    editing: defaultEditing,
    measured: false,
  });
  const config = normalizeTypographyEllipsis(typeof ellipsis === 'object' ? ellipsis : {}, {
    tooltip: 'tooltip',
    popover: 'popover',
  });
  const current = useRef({ props, config });
  current.current = { props, config };
  const update = <K extends keyof typeof local.current>(
    key: K,
    value: (typeof local.current)[K],
  ) => {
    if (local.current[key] !== value) {
      local.current[key] = value;
      render((value) => value + 1);
    }
  };
  const [foundation] = useState(() =>
    createTypographyFoundation(
      {
        get props() {
          return {
            ...current.current.props,
            ellipsis: current.current.props.ellipsis ?? false,
            copyable: current.current.props.copyable ?? false,
            editable: current.current.props.editable ?? false,
            copyDelay: current.current.props.copyDelay ?? 3000,
          };
        },
        slots: {},
        get fullText() {
          return local.current.fullText;
        },
        set fullText(value) {
          update('fullText', value);
        },
        get isEllipsis() {
          return local.current.isEllipsis;
        },
        set isEllipsis(value) {
          update('isEllipsis', value);
        },
        get expanded() {
          return local.current.expanded;
        },
        set expanded(value) {
          update('expanded', value);
        },
        get isCopied() {
          return local.current.isCopied;
        },
        set isCopied(value) {
          update('isCopied', value);
        },
        get editing() {
          return current.current.props.editing ?? local.current.editing;
        },
        get editTextValue() {
          return current.current.props.editText ?? local.current.fullText;
        },
        get ellipsisConfig() {
          return current.current.config;
        },
      },
      {
        getInnerText() {
          if (source.current) return source.current.innerText;
          if (!root.current) return local.current.fullText;
          const clone = root.current.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('[data-typography-operation]').forEach((node) => node.remove());
          const container = createTypographyTextContainer();
          return measureTypographyInnerText(
            container,
            () => container.appendChild(clone),
            () => {},
          );
        },
        copy,
        setEditing: (value) => update('editing', value),
        updateEditing: (value) => current.current.props.onEditingChange?.(value),
        editStart: () => current.current.props.onEditStart?.(),
        updateEditText: (value) => current.current.props.onEditTextChange?.(value),
        change: (value) => current.current.props.onChange?.(value),
        editEnd: () => current.current.props.onEditEnd?.(),
        copied: (value) => current.current.props.onCopy?.(value),
        ellipsis: (value) => current.current.props.onEllipsis?.(value),
        expand: (value) => current.current.props.onExpand?.(value),
      },
    ),
  );
  const mergeEditing = foundation.getMergeEditing();
  useLayoutEffect(() => {
    foundation.updateFullText();
    update('measured', true);
    const observed = source.current ?? root.current;
    if (!observed || !(ellipsis || editable || copyable)) return;
    const observer = new MutationObserver(foundation.updateFullText);
    observer.observe(observed, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  });
  useLayoutEffect(() => () => foundation.dispose(), [foundation]);
  useImperativeHandle(ref, () => root.current!, [component, mergeEditing, ellipsis]);
  const operations = createTypographyOperations({
    edit: () => {
      foundation.updateFullText();
      foundation.onEditStart();
    },
    copy: foundation.onCopyClick,
    expand: foundation.onExpandClick,
  });
  const icon = (kind: 'edit' | 'copy') => (
    <svg
      className={`${iconPrefix} ${iconPrefix}-${kind}`}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      aria-hidden="true"
    >
      <path
        d={
          kind === 'edit'
            ? 'm30.48 19.038 5.733-5.734a1 1 0 0 0 0-1.414l-5.586-5.586a1 1 0 0 0-1.414 0l-5.734 5.734m7 7L15.763 33.754a1 1 0 0 1-.59.286l-6.048.708a1 1 0 0 1-1.113-1.069l.477-6.31a1 1 0 0 1 .29-.631l14.7-14.7m7 7-7-7M6 42h36'
            : 'M20 6h18a2 2 0 0 1 2 2v22M8 16v24c0 1.105.891 2 1.996 2h20.007A1.99 1.99 0 0 0 32 40.008V15.997A1.997 1.997 0 0 0 30 14H10a2 2 0 0 0-2 2Z'
        }
      />
    </svg>
  );
  const copied = local.current.isCopied;
  const operationNodes = (
    <>
      {editable && (
        <Tooltip content={t('typography.edit')} {...editTooltipProps}>
          <span
            data-typography-operation
            role="button"
            tabIndex={0}
            aria-label={t('typography.edit')}
            className={`${prefix}-operation-edit`}
            onClick={(event) => {
              event.stopPropagation();
              operations.onEditClick();
            }}
            onKeyDown={(event) => operations.onEditKeydown(event.nativeEvent)}
          >
            {icon('edit')}
          </span>
        </Tooltip>
      )}
      {copyable && (
        <Tooltip
          {...copyTooltipProps}
          content={
            copyTooltip ? copyTooltip(copied) : t(copied ? 'typography.copied' : 'typography.copy')
          }
        >
          <span
            data-typography-operation
            role="button"
            tabIndex={0}
            aria-label={t(copied ? 'typography.copied' : 'typography.copy')}
            className={`${prefix}-operation-${copied ? 'copied' : 'copy'}`}
            onClick={(event) => {
              event.stopPropagation();
              operations.onCopyClick();
            }}
            onKeyDown={(event) => operations.onCopyKeydown(event.nativeEvent)}
          >
            {copyIcon ? copyIcon(copied) : copied ? <StatusIcon type="success" /> : icon('copy')}
          </span>
        </Tooltip>
      )}
      {getTypographyShowExpand(
        Boolean(ellipsis) && local.current.expanded,
        config.expandable,
        Boolean(ellipsis) && local.current.isEllipsis,
      ) && (
        <a
          data-typography-operation
          role="button"
          tabIndex={0}
          aria-expanded={local.current.expanded}
          className={`${prefix}-operation-expand`}
          onClick={(event) => {
            event.stopPropagation();
            operations.onExpandClick();
          }}
          onKeyDown={(event) => operations.onExpandKeydown(event.nativeEvent)}
        >
          {expandNode
            ? expandNode(local.current.expanded)
            : t(local.current.expanded ? 'typography.collapse' : 'typography.expand')}
        </a>
      )}
    </>
  );
  const tags = getTypographyContentTags({ bold, mark, underline, delete: deleted, code });
  const markStyle = getTypographyMarkStyle({ mark });
  const rootAttrs = {
    ...foundation.getRootAttrs(attrs),
    className: [prefix, type && `${prefix}-${type}`, disabled && `${prefix}-disabled`, className]
      .filter(Boolean)
      .join(' '),
  };
  let display = ellipsis ? (
    <ClampedText
      {...rootAttrs}
      ref={root}
      as={component}
      html={getTypographyRichHtml(tags, markStyle, local.current.fullText)}
      maxLines={config.rows}
      ellipsis={config.ellipsisStr}
      expanded={local.current.expanded}
      onClampChange={foundation.handleClampChange}
      after={
        <>
          {config.suffix}
          {operationNodes}
        </>
      }
    />
  ) : (
    createElement(
      component,
      { ...rootAttrs, ref: root },
      tags.reduce<ReactNode>(
        (content, tag) => createElement(tag, tag === 'mark' ? { style: markStyle } : null, content),
        children,
      ),
      operationNodes,
    )
  );
  if (ellipsis && config.showTooltip) {
    const Popup = config.TooltipComponent === 'popover' ? Popover : Tooltip;
    display = (
      <Popup
        {...config.tooltipProps}
        disabled={!local.current.isEllipsis}
        content={local.current.fullText}
      >
        {display}
      </Popup>
    );
  }
  return (
    <>
      {(ellipsis || mergeEditing) && (
        <span
          ref={source}
          aria-hidden="true"
          inert
          style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }}
        >
          {children}
        </span>
      )}
      {mergeEditing ? (
        <EditContent
          ready={local.current.measured}
          text={editText ?? local.current.fullText}
          onChange={foundation.handleEditContentChange}
          onEnd={foundation.onEditEnd}
        />
      ) : (
        display
      )}
    </>
  );
}
export function TypographyText(props: TypographyTextProps) {
  return <TypographyBase {...props} component={props.ellipsis ? 'div' : 'span'} />;
}
export function TypographyTitle({ heading = 1, ...props }: TypographyTitleProps) {
  return <TypographyBase {...props} component={`h${heading}`} />;
}
export function TypographyParagraph({
  blockquote = false,
  spacing = 'default',
  className,
  ...props
}: TypographyParagraphProps) {
  const prefix = usePrefix('typography');
  return (
    <TypographyBase
      {...props}
      component={blockquote ? 'blockquote' : 'div'}
      className={[spacing === 'close' && `${prefix}-spacing-close`, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
function TypographyRoot({ className, ...props }: TypographyProps) {
  const prefix = usePrefix('typography');
  return <article {...props} className={[prefix, className].filter(Boolean).join(' ')} />;
}
export const Typography = Object.assign(TypographyRoot, {
  Text: TypographyText,
  Title: TypographyTitle,
  Paragraph: TypographyParagraph,
});
