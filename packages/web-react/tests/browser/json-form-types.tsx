import type { InputProps } from '../../src/input/index.js';

import {
  JsonForm,
  defineJsonFormComponents,
  defineJsonFormSchemas,
  type JsonFormSchema,
} from '../../src/json-form/index.js';

// @ts-expect-error Input disabled is boolean.
const direct: InputProps = { disabled: 'yes' };
void direct;

const input: JsonFormSchema<'input'> = {
  field: 'name',
  componentProps: { maxLength: 10 },
  componentEvents: { 'update:modelValue': (value) => value.toUpperCase() },
};
const invalidInput: JsonFormSchema<'input'> = {
  field: 'name',
  // @ts-expect-error Input disabled is boolean.
  componentProps: { disabled: 'yes' },
};
const components = defineJsonFormComponents({
  custom: ({ count }: { count: number }) => <b>{count}</b>,
});
const schemas = defineJsonFormSchemas<typeof components>()([
  { field: 'counter', type: 'custom', componentProps: { count: 1 } },
]);
const custom: JsonFormSchema<'custom', typeof components> = {
  field: 'counter',
  // @ts-expect-error Custom component count is numeric.
  componentProps: { count: '1' },
};
void invalidInput;
void custom;
const assign: JsonFormSchema<string> = input;
void assign;
export const fixture = <JsonForm schemas={[input, ...schemas]} />;
