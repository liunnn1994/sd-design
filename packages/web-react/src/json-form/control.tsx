import type { ElementType, ReactNode } from 'react';

import {
  getJsonFormComponentProps,
  getJsonFormPlaceholder,
  resolveJsonFormComponent,
} from '@sdata/web-core/json-form/field';

import { useI18n } from '../locale/index.js';
import { mergeJsonFormEvents } from './events.js';
import { getJsonFormSlotProp } from './slots.js';

export interface JsonFormControlSchema {
  type?: string;
  label?: string;
  componentProps?: object;
  componentEvents?: Record<string, unknown>;
  componentSlots?: Record<string, ReactNode | ((...args: never[]) => ReactNode)>;
}
export interface JsonFormControlProps {
  schema: JsonFormControlSchema;
  components: Record<string, ElementType>;
  prefixCls: string;
  value: unknown;
  onValueChange(value: unknown): void;
  slots?: JsonFormControlSchema['componentSlots'];
}

export function JsonFormControl({
  schema,
  components,
  prefixCls,
  value,
  onValueChange,
  slots,
}: JsonFormControlProps) {
  const { t } = useI18n();
  const Component = resolveJsonFormComponent(components, schema.type);
  const suppliedProps = schema.componentProps as Record<string, unknown> | undefined;
  const originalClass = suppliedProps?.class;
  const className = suppliedProps?.className;
  const { class: classes, ...baseProps } = getJsonFormComponentProps(
    {
      ...schema,
      componentProps: {
        ...schema.componentProps,
        class: [
          typeof originalClass === 'string' ? originalClass : undefined,
          typeof className === 'string' ? className : undefined,
        ]
          .filter(Boolean)
          .join(' '),
      },
    },
    prefixCls,
    () => getJsonFormPlaceholder(schema.type, schema.label, t),
  );
  const modelProp = schema.type === 'checkbox' || schema.type === 'radio' ? 'modelValue' : 'value';
  const updateEvent = schema.type === 'switch' ? 'onChange' : 'onValueChange';
  const controlProps = mergeJsonFormEvents(baseProps, schema.componentEvents, updateEvent);
  controlProps.className = (classes as string[]).join(' ');
  const update = controlProps[updateEvent];
  controlProps[modelProp] = value;
  controlProps[updateEvent] = (...args: unknown[]) => {
    onValueChange(args[0]);
    if (typeof update === 'function') update(...args);
  };
  const renderProps = { ...slots, ...schema.componentSlots };
  for (const [name, renderer] of Object.entries(renderProps)) {
    const [prop, content] = getJsonFormSlotProp(schema.type, name, renderer);
    controlProps[prop] = content;
  }
  if (schema.type === 'checkbox' && schema.label && controlProps.children === undefined) {
    controlProps.children = suppliedProps?.label ?? schema.label;
  }
  return Component ? <Component {...controlProps} /> : null;
}
