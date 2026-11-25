import type { FormField } from '@sdata/web-core/form/foundation';
import type { FieldRule, FormItemEventHandler, ValidateStatus } from '@sdata/web-core/form/types';
import type { CSSProperties } from 'react';

import { createContext, useContext } from 'react';

import type { ConfigProviderProps } from '../config-provider/index.js';
import type { ColProps } from '../grid/index.js';

export interface FormContextValue {
  model: Record<string, unknown>;
  rules?: Record<string, FieldRule | FieldRule[]> | undefined;
  size?: ConfigProviderProps['size'];
  disabled?: boolean | undefined;
  layout?: 'horizontal' | 'vertical' | 'inline';
  id?: string | undefined;
  labelAlign?: 'left' | 'right';
  labelColProps?: ColProps;
  wrapperColProps?: ColProps;
  labelColStyle?: CSSProperties | undefined;
  wrapperColStyle?: CSSProperties | undefined;
  autoLabelWidth?: boolean;
  maxLabelWidth?: number;
  setValue(field: string, value: unknown): void;
  addField(field: FormField): void;
  removeField(field: FormField): void;
  setLabelWidth(id: string, width?: number): void;
}

export interface FormItemContextValue {
  size?: ConfigProviderProps['size'];
  disabled: boolean;
  error: boolean;
  feedback?: ValidateStatus | undefined;
  fieldId: string;
  eventHandlers: FormItemEventHandler;
  updateValidateState(field: string, state: { status: ValidateStatus | ''; message: string }): void;
}

export const FormContext = createContext<FormContextValue | undefined>(undefined);
export const FormItemContext = createContext<FormItemContextValue | undefined>(undefined);

export function useFormItem(
  props: {
    size?: ConfigProviderProps['size'];
    disabled?: boolean | undefined;
    error?: boolean | undefined;
    uninject?: boolean;
  } = {},
) {
  const context = useContext(FormItemContext);
  const formItemCtx = props.uninject ? undefined : context;
  return {
    formItemCtx,
    mergedSize: props.size ?? formItemCtx?.size,
    mergedDisabled: !!(props.disabled || formItemCtx?.disabled),
    mergedError: !!(props.error || formItemCtx?.error),
    feedback: formItemCtx?.feedback,
    eventHandlers: formItemCtx?.eventHandlers,
  };
}
