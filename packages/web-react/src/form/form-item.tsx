import type { FieldRule, ValidateStatus, ValidateTrigger } from '@sdata/web-core/form/types';
import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react';

import { getValueByPath } from '@sdata/web-core/_utils/get-value-by-path';
import {
  createFieldFoundation,
  createValidationEventHandlers,
  mergeFieldRules,
} from '@sdata/web-core/form/field';
import {
  getFinalValidateMessage,
  getFinalValidateStatus,
  getFormElementId,
} from '@sdata/web-core/form/utils';
import { runCssTransition } from '@sdata/web-core/transition/css';
import { createElement, useContext, useId, useLayoutEffect, useRef, useState } from 'react';

import type { ColProps, RowProps } from '../grid/index.js';
import type { FormItemContextValue } from './context.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { usePrefix } from '../config-provider/index.js';
import { Col, Row } from '../grid/index.js';
import { useI18n } from '../locale/index.js';
import { Tooltip } from '../tooltip/index.js';
import { FormContext, FormItemContext } from './context.js';

export interface FormItemProps extends ComponentPropsWithoutRef<'div'> {
  field?: string;
  label?: ReactNode;
  tooltip?: string;
  showColon?: boolean;
  noStyle?: boolean;
  disabled?: boolean;
  help?: ReactNode;
  extra?: ReactNode;
  required?: boolean;
  asteriskPosition?: 'start' | 'end';
  rules?: FieldRule | FieldRule[];
  validateStatus?: ValidateStatus;
  validateTrigger?: ValidateTrigger | ValidateTrigger[];
  labelColProps?: ColProps;
  wrapperColProps?: ColProps;
  hideLabel?: boolean;
  hideAsterisk?: boolean;
  labelColStyle?: CSSProperties;
  wrapperColStyle?: CSSProperties;
  rowProps?: RowProps;
  rowClass?: string;
  contentClass?: string;
  contentFlex?: boolean;
  /** @deprecated Retained for Vue compatibility; has no effect. */
  mergeProps?: boolean | ((...args: unknown[]) => unknown);
  labelColFlex?: number | string;
  feedback?: boolean;
  labelComponent?: ElementType;
  labelAttrs?: ComponentPropsWithoutRef<'label'>;
}

export function FormItem(props: FormItemProps) {
  const form = useContext(FormContext);
  const parent = useContext(FormItemContext);
  const { i18nMessage } = useI18n();
  const prefix = usePrefix('form-item');
  const iconPrefix = usePrefix('icon');
  const uid = useId();
  const fieldId = `sd-form-item-${uid}`;
  const {
    field = '',
    label,
    tooltip,
    showColon = false,
    noStyle = false,
    disabled,
    help,
    extra,
    required = false,
    asteriskPosition = 'start',
    rules,
    validateStatus,
    validateTrigger = 'change',
    labelColProps,
    wrapperColProps,
    hideLabel = false,
    hideAsterisk = false,
    labelColStyle,
    wrapperColStyle,
    rowProps,
    rowClass,
    contentClass,
    contentFlex = true,
    mergeProps: _mergeProps,
    labelColFlex,
    feedback = false,
    labelComponent = 'label',
    labelAttrs,
    children,
    className,
    ...attributes
  } = props;
  const [states, setStates] = useState<
    Record<string, { status: ValidateStatus | ''; message: string }>
  >({});
  const statuses = Object.fromEntries(
    Object.entries(states).map(([name, state]) => [name, state.status]),
  );
  const messages = getFinalValidateMessage(
    Object.fromEntries(Object.entries(states).map(([name, state]) => [name, state.message])),
  );
  const finalStatus = getFinalValidateStatus(statuses);
  const status = validateStatus ?? finalStatus;
  const mergedRules = mergeFieldRules(rules, form?.rules?.[field], required);
  const afterRender = useAfterRender();
  const current = useRef({
    form,
    parent,
    field,
    label,
    noStyle,
    finalStatus,
    mergedRules,
    i18nMessage,
  });
  current.current = { form, parent, field, label, noStyle, finalStatus, mergedRules, i18nMessage };
  const [updateValidateState] = useState(
    () => (name: string, state: { status: ValidateStatus | ''; message: string }) => {
      setStates((previous) => ({ ...previous, [name]: state }));
      if (current.current.noStyle) current.current.parent?.updateValidateState(name, state);
    },
  );
  const [foundation] = useState(() =>
    createFieldFoundation({
      getField: () => current.current.field,
      getLabel: () =>
        typeof current.current.label === 'string' ? current.current.label : undefined,
      getValue: (name) =>
        getValueByPath(current.current.form?.model, name ?? current.current.field),
      setValue: (value) => current.current.form?.setValue(current.current.field, value),
      getRules: () => current.current.mergedRules,
      getStatus: () => current.current.finalStatus,
      getMessages: () => current.current.i18nMessage.form?.validateMessages,
      updateState: updateValidateState,
      defer: (callback) => {
        void afterRender().then(callback);
      },
      register: () => current.current.form?.addField(info),
      unregister: () => current.current.form?.removeField(info),
    }),
  );
  const [info] = useState(() => ({
    get field() {
      return current.current.field;
    },
    ...foundation,
  }));
  const previousField = useRef(field);
  const mounted = useRef(false);
  useLayoutEffect(() => {
    if (previousField.current !== field) {
      foundation.changeField(field, previousField.current);
      previousField.current = field;
    }
  }, [field, foundation]);
  useLayoutEffect(() => {
    mounted.current = true;
    foundation.mount();
    return () => {
      mounted.current = false;
      foundation.unmount();
    };
  }, [foundation]);
  const eventHandlers = createValidationEventHandlers(
    ([] as ValidateTrigger[]).concat(validateTrigger),
    () => {
      void afterRender().then(() => {
        if (mounted.current) void foundation.validate();
      });
    },
    (callback) => {
      void afterRender().then(callback);
    },
  );
  const context: FormItemContextValue = {
    size: form?.size,
    disabled: !!(disabled ?? form?.disabled),
    error: status === 'error',
    feedback: feedback && status ? status : undefined,
    fieldId,
    eventHandlers,
    updateValidateState,
  };
  const labelRef = useRef<HTMLElement>(null);
  const setLabelWidth = form?.setLabelWidth;
  useLayoutEffect(() => {
    const node = labelRef.current;
    if (!node || !setLabelWidth) return;
    const measure = () => setLabelWidth(uid, node.offsetWidth);
    const observer = new ResizeObserver(measure);
    measure();
    observer.observe(node);
    return () => {
      observer.disconnect();
      setLabelWidth(uid);
    };
  }, [uid, setLabelWidth, noStyle, hideLabel, labelComponent]);
  if (noStyle)
    return <FormItemContext.Provider value={context}>{children}</FormItemContext.Provider>;
  const flexible = !!(labelColFlex || form?.autoLabelWidth);
  const labelCol = { ...(labelColProps ?? form?.labelColProps) };
  if (labelColFlex) labelCol.flex = labelColFlex;
  else if (form?.autoLabelWidth) labelCol.flex = `${form.maxLabelWidth}px`;
  const wrapperCol = { ...(wrapperColProps ?? form?.wrapperColProps) };
  if (field) wrapperCol.id = getFormElementId(form?.id, field);
  if (flexible) wrapperCol.flex = 'auto';
  const symbol = !hideAsterisk && mergedRules.some((rule) => rule.required) && (
    <strong className={`${prefix}-label-required-symbol`}>
      <svg fill="currentColor" viewBox="0 0 1024 1024" width="1em" height="1em">
        <path d="M583.338667 17.066667c18.773333 0 34.133333 15.36 34.133333 34.133333v349.013333l313.344-101.888a34.133333 34.133333 0 0 1 43.008 22.016l42.154667 129.706667a34.133333 34.133333 0 0 1-21.845334 43.178667l-315.733333 102.4 208.896 287.744a34.133333 34.133333 0 0 1-7.509333 47.786666l-110.421334 80.213334a34.133333 34.133333 0 0 1-47.786666-7.509334L505.685333 706.218667 288.426667 1005.226667a34.133333 34.133333 0 0 1-47.786667 7.509333l-110.421333-80.213333a34.133333 34.133333 0 0 1-7.509334-47.786667l214.186667-295.253333L29.013333 489.813333a34.133333 34.133333 0 0 1-22.016-43.008l42.154667-129.877333a34.133333 34.133333 0 0 1 43.008-22.016l320.512 104.106667L412.672 51.2c0-18.773333 15.36-34.133333 34.133333-34.133333h136.533334z" />
      </svg>
    </strong>
  );
  return (
    <FormItemContext.Provider value={context}>
      <Row
        {...attributes}
        wrap={!flexible}
        div={form?.layout !== 'horizontal' || hideLabel}
        {...rowProps}
        className={[
          prefix,
          `${prefix}-layout-${form?.layout}`,
          status === 'error' && `${prefix}-error`,
          status && `${prefix}-status-${status}`,
          status === 'error' && messages.length > 0 && `${prefix}-has-message`,
          !!help && `${prefix}-has-help`,
          rowClass,
          className,
          rowProps?.className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!hideLabel && (
          <Col
            style={labelColStyle ?? form?.labelColStyle}
            {...labelCol}
            className={[
              `${prefix}-label-col`,
              form?.labelAlign === 'left' && `${prefix}-label-col-left`,
              flexible && `${prefix}-label-col-flex`,
              labelCol.className,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {createElement(
              labelComponent,
              {
                ref: labelRef,
                htmlFor: fieldId,
                ...labelAttrs,
                className: [`${prefix}-label`, labelAttrs?.className].filter(Boolean).join(' '),
              },
              asteriskPosition === 'start' && symbol,
              label,
              tooltip && (
                <Tooltip content={tooltip}>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4}
                    viewBox="0 0 48 48"
                    className={`${iconPrefix} ${iconPrefix}-question-circle ${prefix}-label-tooltip`}
                    tabIndex={0}
                    aria-label={tooltip}
                  >
                    <path d="M42 24c0 9.941-8.059 18-18 18S6 33.941 6 24 14.059 6 24 6s18 8.059 18 18Z" />
                    <path d="M24.006 31v4.008m0-6.008L24 28c0-3 3-4 4.78-6.402C30.558 19.195 28.288 15 23.987 15c-4.014 0-5.382 2.548-5.388 4.514v.465" />
                  </svg>
                </Tooltip>
              ),
              asteriskPosition === 'end' && symbol,
              showColon ? ':' : '',
            )}
          </Col>
        )}
        <Col
          style={wrapperColStyle ?? form?.wrapperColStyle}
          {...wrapperCol}
          className={[`${prefix}-wrapper-col`, wrapperCol.className].filter(Boolean).join(' ')}
        >
          <div className={`${prefix}-content-wrapper`}>
            <div
              className={[
                `${prefix}-content`,
                contentFlex && `${prefix}-content-flex`,
                contentClass,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {children}
            </div>
          </div>
          {(status === 'error' || !!help) &&
            (messages.length
              ? messages.map((message, index) => (
                  <FormMessage
                    key={`${index}:${message}`}
                    role="alert"
                    className={`${prefix}-message`}
                  >
                    {message}
                  </FormMessage>
                ))
              : help && (
                  <FormMessage className={`${prefix}-message ${prefix}-message-help`}>
                    {help}
                  </FormMessage>
                ))}
          {!!extra && <div className={`${prefix}-extra`}>{extra}</div>}
        </Col>
      </Row>
    </FormItemContext.Provider>
  );
}

function FormMessage(props: ComponentPropsWithoutRef<'div'>) {
  const element = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!element.current) return;
    return runCssTransition(element.current, { name: 'form-blink', enter: true, finish() {} });
  }, []);
  return <div {...props} ref={element} />;
}
