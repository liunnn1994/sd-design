import type {
  ToolbarModelValue,
  ToolbarResetEventHandler,
  ToolbarSearchEventHandler,
} from '@sdata/web-core/toolbar/types';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref, MouseEvent } from 'react';

import { createToolbarFoundation } from '@sdata/web-core/toolbar/foundation';
import {
  createElement,
  useImperativeHandle,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import { getRenderItems } from '../_shared/children.js';
import { Button, type ButtonProps } from '../button/index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { IconDown } from '../icon/icon-down.js';
import {
  JsonForm,
  type JsonFormInstance,
  type JsonFormProps,
  type JsonFormSchema,
} from '../json-form/index.js';
import { Link } from '../link/index.js';
import { useI18n } from '../locale/index.js';
import { Spin, type SpinProps } from '../spin/index.js';

export type {
  ToolbarModelValue,
  ToolbarEmits,
  ToolbarResetEventHandler,
  ToolbarSearchEventHandler,
} from '@sdata/web-core/toolbar/types';
export interface ToolbarInstance {
  search(): void;
  reset(emitReset?: unknown): void;
}
export interface ToolbarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onReset' | 'defaultValue'
> {
  ref?: Ref<ToolbarInstance>;
  value?: ToolbarModelValue;
  modelValue?: ToolbarModelValue;
  defaultValue?: ToolbarModelValue;
  onValueChange?(value: ToolbarModelValue): void;
  schemas?: JsonFormSchema<string>[];
  loading?: boolean;
  spinProps?: SpinProps;
  showSearch?: boolean;
  showReset?: boolean;
  searchBtn?: ButtonProps | undefined;
  resetBtn?: ButtonProps | undefined;
  showActions?: boolean;
  searchText?: string;
  resetText?: string;
  expandText?: string;
  collapseText?: string;
  allowExpand?: boolean;
  defaultExpand?: boolean;
  itemHeight?: number;
  spanWidth?: number;
  itemMaxWidth?: string;
  showBorderBottom?: boolean;
  resetSkipKeys?: string[];
  onSearch?: ToolbarSearchEventHandler;
  onReset?: ToolbarResetEventHandler;
  slots?: JsonFormProps['slots'];
  expandIcon?: ReactNode;
  extra?: ReactNode;
  actionPrepend?: ReactNode;
  actionAppend?: ReactNode;
}

export function Toolbar(props: ToolbarProps) {
  const {
    ref,
    value,
    modelValue,
    defaultValue = {},
    onValueChange: _onValueChange,
    schemas: _schemas,
    loading = false,
    spinProps,
    showSearch = true,
    showReset = true,
    searchBtn,
    resetBtn,
    showActions = true,
    searchText,
    resetText,
    expandText,
    collapseText,
    allowExpand = false,
    defaultExpand = false,
    itemHeight = 32,
    spanWidth = 230,
    itemMaxWidth = 'unset',
    showBorderBottom = true,
    resetSkipKeys: _resetSkipKeys,
    onSearch: _onSearch,
    onReset: _onReset,
    slots = {},
    expandIcon,
    extra,
    actionPrepend,
    actionAppend,
    children,
    className,
    style,
    onKeyDown,
    ...attrs
  } = props;
  const prefix = usePrefix('toolbar');
  const config = useConfig();
  const { t } = useI18n();
  const [, redraw] = useReducer((version: number) => version + 1, 0);
  const [internal, setInternal] = useState(defaultValue);
  const model = value ?? modelValue ?? internal;
  const body = useRef<HTMLDivElement>(null);
  const form = useRef<JsonFormInstance>(null);
  const expansion = useRef({ isExpand: defaultExpand, isOverflow: false, bodyHeight: 0 });
  const current = useRef({ props, model });
  current.current = { props, model };
  const publish = (next: ToolbarModelValue) => {
    if (
      current.current.props.value === undefined &&
      current.current.props.modelValue === undefined
    ) {
      current.current.model = next;
    }
    setInternal(next);
    current.current.props.onValueChange?.(next);
  };
  const [foundation] = useState(() =>
    createToolbarFoundation<JsonFormSchema<string>>(
      {
        props: {
          get schemas() {
            return current.current.props.schemas ?? [];
          },
          get resetSkipKeys() {
            return current.current.props.resetSkipKeys ?? [];
          },
          get allowExpand() {
            return current.current.props.allowExpand ?? false;
          },
          get itemHeight() {
            return current.current.props.itemHeight ?? 32;
          },
        },
        get modelValue() {
          return current.current.model;
        },
        set modelValue(next) {
          publish(next);
        },
        get isExpand() {
          return expansion.current.isExpand;
        },
        set isExpand(next) {
          if (expansion.current.isExpand !== next) {
            expansion.current.isExpand = next;
            redraw();
          }
        },
        get isOverflow() {
          return expansion.current.isOverflow;
        },
        set isOverflow(next) {
          if (expansion.current.isOverflow !== next) {
            expansion.current.isOverflow = next;
            redraw();
          }
        },
        get bodyHeight() {
          return expansion.current.bodyHeight;
        },
        set bodyHeight(next) {
          if (expansion.current.bodyHeight !== next) {
            expansion.current.bodyHeight = next;
            redraw();
          }
        },
      },
      {
        search: (next) => current.current.props.onSearch?.(next),
        reset: () => current.current.props.onReset?.(),
        clearValidate: () => {
          form.current?.clearValidate();
        },
      },
    ),
  );
  useImperativeHandle(ref, () => ({ search: foundation.handleSearch, reset: foundation.reset }), [
    foundation,
  ]);
  useLayoutEffect(() => {
    const element = body.current;
    if (!element) return;
    const measure = () => foundation.measure({ target: element });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [foundation]);
  useLayoutEffect(() => {
    if (body.current) foundation.measure({ target: body.current });
  });
  const resolvedSchemas = foundation.getResolvedSchemas();
  const schemaSlots = Object.fromEntries(
    foundation
      .getSchemaSlotNames()
      .filter((name) => slots[name])
      .map((name) => [name, slots[name]]),
  );
  const variables = {
    '--toolbar-item-height': `${itemHeight}px`,
    '--toolbar-span-width': `${spanWidth}px`,
    '--toolbar-item-max-width': itemMaxWidth,
    '--toolbar-body-max-height': foundation.getBodyMaxHeight(),
    ...style,
  } as CSSProperties;
  const actionButton = (
    options: ButtonProps | undefined,
    text: string,
    action: () => void,
    primary = false,
  ) =>
    createElement(
      Button,
      {
        ...(primary ? { type: 'primary' } : {}),
        ...options,
        onClick(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
          if (options?.href !== undefined)
            options.onClick?.(event as MouseEvent<HTMLAnchorElement>);
          else options?.onClick?.(event as MouseEvent<HTMLButtonElement>);
          action();
        },
      } as ButtonProps,
      text,
    );
  return (
    <div
      {...attrs}
      className={[prefix, showBorderBottom && `${prefix}-with-border`, className]
        .filter(Boolean)
        .join(' ')}
      style={variables}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === 'Enter') foundation.onEnter(event.nativeEvent);
      }}
    >
      <Spin
        {...config.toolbarSpinProps}
        {...spinProps}
        loading={loading}
        className={[`${prefix}-inner`, spinProps?.className ?? config.toolbarSpinProps?.className]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          ref={body}
          className={[
            `${prefix}-body`,
            resolvedSchemas.length > 0 && `${prefix}-body--schema`,
            itemMaxWidth !== 'unset' && `${prefix}-body--max-width`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {getRenderItems(children).length ? (
            children
          ) : resolvedSchemas.length > 0 ? (
            <JsonForm
              ref={form}
              value={model}
              onValueChange={publish}
              schemas={resolvedSchemas}
              hideLabel
              hideAsterisk
              slots={schemaSlots}
            />
          ) : null}
        </div>
        {showActions && (
          <div className={`${prefix}-actions`}>
            {allowExpand && expansion.current.isOverflow && (
              <Link className={`${prefix}-expand`} onClick={foundation.toggleExpand}>
                <span className={`${prefix}-expand-text`}>
                  {expansion.current.isExpand
                    ? (collapseText ?? t('toolbar.collapse'))
                    : (expandText ?? t('toolbar.expand'))}
                </span>
                {expandIcon ?? (
                  <IconDown
                    className={[
                      `${prefix}-expand-icon`,
                      expansion.current.isExpand && `${prefix}-expand-icon--up`,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                )}
              </Link>
            )}
            {extra !== undefined ? (
              extra
            ) : (
              <>
                {actionPrepend}
                {showSearch &&
                  actionButton(
                    searchBtn,
                    searchText ?? t('toolbar.search'),
                    foundation.handleSearch,
                    true,
                  )}
                {showReset &&
                  actionButton(resetBtn, resetText ?? t('toolbar.reset'), foundation.reset)}
                {actionAppend}
              </>
            )}
          </div>
        )}
      </Spin>
    </div>
  );
}
export default Toolbar;
