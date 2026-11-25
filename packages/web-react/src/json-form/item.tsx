import type { JsonFormAdapter, JsonFormModel } from '@sdata/web-core/json-form/types';
import type { ElementType, ReactNode } from 'react';

import {
  filterJsonFormSlots,
  getJsonFormColProps,
  getJsonFormRules,
} from '@sdata/web-core/json-form/field';

import { FormItem, type FormItemProps } from '../form/index.js';
import { Col, Row, type ColProps } from '../grid/index.js';
import { useI18n } from '../locale/index.js';
import { JsonFormControl, type JsonFormControlSchema } from './control.js';
import { mergeJsonFormEvents } from './events.js';
import { useJsonFormField } from './use-json-form.js';

export interface JsonFormItemSchema extends JsonFormControlSchema {
  field: string;
  hidden?: boolean;
  required?: boolean;
  slotName?: string;
  render?: ElementType;
  formItemRules?: FormItemProps['rules'];
  formItemProps?: FormItemProps;
  formItemEvents?: Record<string, unknown>;
  colProps?: ColProps;
  span?: number;
  children?: JsonFormItemSchema[];
}
export interface JsonFormItemSlotProps {
  [key: string]: unknown;
  record: JsonFormItemSchema;
  value: unknown;
}
export interface JsonFormItemProps {
  model: JsonFormModel;
  schema: JsonFormItemSchema;
  adapter: JsonFormAdapter;
  components: Record<string, ElementType>;
  prefixCls: string;
  hideLabel?: boolean;
  hideAsterisk?: boolean;
  showColon?: boolean;
  onValueChange(model: JsonFormModel): void;
  slots?: Record<string, (props: JsonFormItemSlotProps) => ReactNode> | undefined;
}

export function JsonFormItem(props: JsonFormItemProps) {
  const { schema, slots = {}, components, prefixCls } = props;
  const { t } = useI18n();
  const field = useJsonFormField({ ...props, field: schema.field });
  const slotProps = { record: schema, value: field.value };
  if (schema.hidden) return slots[schema.slotName || 'hidden']?.(slotProps);
  if (schema.type === 'noFormItem') return slots[schema.slotName || 'default']?.(slotProps);

  const namedSlot = schema.slotName ? slots[schema.slotName] : undefined;
  const Renderer = schema.render;
  if (!namedSlot && !Renderer && schema.type === 'row') {
    const className =
      schema.componentProps && 'className' in schema.componentProps
        ? schema.componentProps.className
        : undefined;
    return (
      <Row
        {...mergeJsonFormEvents(schema.componentProps, schema.componentEvents)}
        className={[`${prefixCls}-row`, typeof className === 'string' ? className : undefined]
          .filter(Boolean)
          .join(' ')}
      >
        {schema.children?.map((child) => (
          <Col key={child.field} {...getJsonFormColProps(child)}>
            <JsonFormItem {...props} schema={child} />
          </Col>
        ))}
      </Row>
    );
  }
  const forwarded = filterJsonFormSlots(Object.keys(slots), [schema.slotName, 'hidden']);
  const itemSlots = Object.fromEntries(
    forwarded
      .filter((name) => ['label', 'help', 'extra'].includes(name))
      .map((name) => [name, slots[name]!(slotProps)]),
  );
  const controlSlots = Object.fromEntries(
    filterJsonFormSlots(forwarded, ['label', 'help', 'extra'], schema.componentSlots).map(
      (name) => [name, (scope: object | undefined) => slots[name]!({ ...scope, ...slotProps })],
    ),
  );
  return (
    <FormItem
      label={schema.label}
      field={field.field}
      hideLabel={props.hideLabel}
      hideAsterisk={props.hideAsterisk}
      showColon={props.showColon}
      rules={getJsonFormRules(schema, t)}
      {...mergeJsonFormEvents(schema.formItemProps, schema.formItemEvents)}
      {...itemSlots}
    >
      {namedSlot ? (
        namedSlot(slotProps)
      ) : Renderer ? (
        <Renderer />
      ) : (
        <JsonFormControl
          schema={schema}
          components={components}
          prefixCls={prefixCls}
          value={field.value}
          onValueChange={field.foundation.setValue}
          slots={controlSlots}
        />
      )}
    </FormItem>
  );
}
