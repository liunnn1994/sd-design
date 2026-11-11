import { translateA2UI_0_9_1ToJsonFormSchemas } from '@sdata/web-core/json-form/schema';
import { createElement, useImperativeHandle, useRef } from 'react';

import type { JsonFormProps, JsonFormModel } from './types.js';

import { getRenderItems } from '../_shared/children.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Form, type FormInstance } from '../form/index.js';
import { resolveJsonFormComponents } from './components.js';
import { JsonFormItem, type JsonFormItemSchema } from './item.js';
import { JsonFormModelBridge } from './model-bridge.js';
import { useJsonForm } from './use-json-form.js';

export function JsonForm({
  schemas,
  value,
  modelValue,
  model,
  adapter,
  hideLabel = false,
  hideAsterisk = false,
  showColon = false,
  component = Form,
  onValueChange,
  onModelChange,
  children,
  slots,
  ref,
  className,
  ...attrs
}: JsonFormProps) {
  const config = useConfig();
  const prefix = usePrefix('json-form');
  const form = useRef<FormInstance>(null);
  const state = useJsonForm<JsonFormItemSchema>(
    { schemas, value: value ?? modelValue, model, adapter, onValueChange },
    (nodes, current) => translateA2UI_0_9_1ToJsonFormSchemas(nodes, current, () => prefix),
    config.jsonForm?.adapter,
  );
  const components = resolveJsonFormComponents(config.jsonForm?.components);
  useImperativeHandle(
    ref,
    () => ({
      validate: (...args: Parameters<FormInstance['validate']>) =>
        form.current?.validate?.(...args),
      validateField: (...args: Parameters<FormInstance['validateField']>) =>
        form.current?.validateField?.(...args),
      resetFields: (...args: Parameters<FormInstance['resetFields']>) =>
        form.current?.resetFields?.(...args),
      clearValidate: (...args: Parameters<FormInstance['clearValidate']>) =>
        form.current?.clearValidate?.(...args),
      setFields: (...args: Parameters<FormInstance['setFields']>) =>
        form.current?.setFields?.(...args),
      scrollToField: (...args: Parameters<FormInstance['scrollToField']>) =>
        form.current?.scrollToField?.(...args),
    }),
    [],
  );
  return createElement(
    component,
    {
      autoLabelWidth: true,
      ...attrs,
      ref: form,
      model: state.model,
      className: [prefix, `${prefix}--${state.adapter}`, className].filter(Boolean).join(' '),
      onModelChange: (next: JsonFormModel) => {
        state.publish(next);
        onModelChange?.(next);
      },
    },
    <JsonFormModelBridge refresh={state.refresh}>
      {getRenderItems(children).length
        ? children
        : state.schemas.map((schema) => (
            <JsonFormItem
              key={schema.field}
              model={state.model}
              schema={schema}
              adapter={state.adapter}
              components={components}
              prefixCls={prefix}
              hideLabel={hideLabel}
              hideAsterisk={hideAsterisk}
              showColon={showColon}
              onValueChange={state.publish}
              slots={slots}
            />
          ))}
    </JsonFormModelBridge>,
  );
}
