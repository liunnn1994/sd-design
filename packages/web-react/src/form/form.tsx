import type { FormErrors } from '@sdata/web-core/form/foundation';
import type { ComponentPropsWithoutRef, Ref } from 'react';

import { createFormFoundation } from '@sdata/web-core/form/foundation';
import { setFormModelValue } from '@sdata/web-core/form/model';
import { getFormElementId } from '@sdata/web-core/form/utils';
import { useImperativeHandle, useRef, useState } from 'react';

import type { FormContextValue } from './context.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { FormContext } from './context.js';

type Foundation = ReturnType<typeof createFormFoundation>;
export type FormInstance = Pick<
  Foundation,
  'validate' | 'validateField' | 'resetFields' | 'clearValidate' | 'setFields'
> & {
  scrollToField(field: string, options?: ScrollIntoViewOptions): void;
};

export interface FormProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends
    Omit<ComponentPropsWithoutRef<'form'>, 'onSubmit'>,
    Pick<
      FormContextValue,
      | 'rules'
      | 'size'
      | 'disabled'
      | 'layout'
      | 'labelAlign'
      | 'labelColProps'
      | 'wrapperColProps'
      | 'labelColStyle'
      | 'wrapperColStyle'
      | 'autoLabelWidth'
    > {
  model: T;
  onModelChange?: (model: T) => void;
  scrollToFirstError?: boolean | ScrollIntoViewOptions;
  onSubmit?: (result: { values: T; errors?: FormErrors }, event: Event) => void;
  onSubmitSuccess?: (values: T, event: Event) => void;
  onSubmitFailed?: (result: { values: T; errors: FormErrors }, event: Event) => void;
  ref?: Ref<FormInstance>;
}

export function FormRoot<T extends Record<string, unknown>>(props: FormProps<T>) {
  const config = useConfig();
  const prefix = usePrefix('form');
  const {
    model,
    onModelChange: _onModelChange,
    rules,
    size = config.size ?? 'medium',
    disabled,
    layout = 'horizontal',
    labelAlign = 'right',
    labelColProps = { span: 5, offset: 0 },
    wrapperColProps = { span: 19, offset: 0 },
    labelColStyle,
    wrapperColStyle,
    autoLabelWidth = false,
    scrollToFirstError: _scrollToFirstError,
    onSubmit: _onSubmit,
    onSubmitSuccess: _onSubmitSuccess,
    onSubmitFailed: _onSubmitFailed,
    ref,
    id,
    className,
    children,
    ...attributes
  } = props;
  const root = useRef<HTMLFormElement>(null);
  const current = useRef(props);
  current.current = props;
  const afterRender = useAfterRender();
  const draft = useRef<T | undefined>(undefined);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [setLabelWidth] = useState(() => (key: string, width?: number) => {
    setWidths((previous) => {
      if (previous[key] === width) return previous;
      const next = { ...previous };
      if (width === undefined) delete next[key];
      else next[key] = width;
      return next;
    });
  });
  const [scrollToField] = useState(() => (field: string, options?: ScrollIntoViewOptions) => {
    root.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(getFormElementId(current.current.id, field))}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', ...options });
  });
  const [foundation] = useState(() =>
    createFormFoundation({
      getModel: () => current.current.model,
      shouldScrollToError: () => !!current.current.scrollToFirstError,
      scrollToError: (field) =>
        scrollToField(
          field,
          typeof current.current.scrollToFirstError === 'object'
            ? current.current.scrollToFirstError
            : undefined,
        ),
      onSubmit: (values, errors, event) => {
        if (root.current) current.current.onSubmit?.({ values: values as T, errors }, event);
      },
      onSubmitSuccess: (values, event) => {
        if (root.current) current.current.onSubmitSuccess?.(values as T, event);
      },
      onSubmitFailed: (values, errors, event) => {
        if (root.current) current.current.onSubmitFailed?.({ values: values as T, errors }, event);
      },
    }),
  );
  useImperativeHandle(ref, () => ({ ...foundation, scrollToField }), [foundation, scrollToField]);
  const [setValue] = useState(() => (field: string, value: unknown) => {
    // Accumulate all fields in one imperative batch before React commits the controlled model.
    const next = setFormModelValue(draft.current ?? current.current.model, field, value);
    draft.current = next;
    current.current.onModelChange?.(next);
    void afterRender().then(() => {
      draft.current = undefined;
    });
  });
  const context: FormContextValue = {
    model,
    rules,
    size,
    disabled,
    layout,
    id,
    labelAlign,
    labelColProps,
    wrapperColProps,
    labelColStyle,
    wrapperColStyle,
    autoLabelWidth: autoLabelWidth && layout === 'horizontal',
    maxLabelWidth: Math.max(0, ...Object.values(widths)),
    setLabelWidth,
    setValue,
    addField: foundation.addField,
    removeField: foundation.removeField,
  };
  return (
    <FormContext.Provider value={context}>
      <form
        {...attributes}
        id={id}
        ref={root}
        className={[
          prefix,
          `${prefix}-layout-${layout}`,
          `${prefix}-size-${size}`,
          autoLabelWidth && `${prefix}-auto-label-width`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onSubmit={(event) => {
          event.preventDefault();
          foundation.submit(event.nativeEvent);
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}
