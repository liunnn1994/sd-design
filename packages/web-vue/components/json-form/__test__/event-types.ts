import { defineComponent } from 'vue';

import type { JsonFormSchema } from '../index';

const checkbox: JsonFormSchema<'checkbox'> = {
  field: 'enabled',
  type: 'checkbox',
  componentEvents: { change: (value) => value },
  formItemEvents: { click: (event: MouseEvent) => event.preventDefault() },
};

const Custom = defineComponent({ emits: { change: (value: string) => Boolean(value) } });
const custom: JsonFormSchema<'custom', { custom: typeof Custom }> = {
  field: 'name',
  type: 'custom',
  componentEvents: { change: (value: string) => value },
};

const invalid: JsonFormSchema<'checkbox'> = {
  field: 'enabled',
  type: 'checkbox',
  // @ts-expect-error Checkbox change is not restricted to string values.
  componentEvents: { change: (value: string) => value },
};

void [checkbox, custom, invalid];
