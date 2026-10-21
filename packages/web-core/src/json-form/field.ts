import type { FieldRule } from '../form/types.js';
import type { JsonFormAdapter } from './types.js';

import {
  parseJsonFormPath,
  mergeJsonFormClassName,
  shouldStretchJsonFormControl,
} from './schema.js';
import { JSON_FORM_COMPONENT_TYPES } from './types.js';

export function normalizeJsonFormField(field: string, adapter: JsonFormAdapter) {
  if (adapter !== 'a2ui-0.9.1') return field;
  const segments = parseJsonFormPath(field, adapter);
  if (segments.some((segment) => !segment || /[.[\]]/.test(segment))) {
    return segments
      .map((segment) => `["${segment.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"]`)
      .join('');
  }
  return segments.join('.');
}
export function getJsonFormRules(
  schema: { formItemRules?: FieldRule | FieldRule[]; required?: boolean; label?: string },
  translate: (key: string, label?: string) => string,
) {
  if (schema.formItemRules) {
    return schema.formItemRules;
  }

  if (schema.required) {
    return [
      {
        required: true,
        message: schema.label
          ? translate('jsonForm.requiredField', schema.label)
          : translate('jsonForm.required'),
      },
    ];
  }

  return undefined;
}
export function getJsonFormColProps<T>(schema: {
  colProps?: T;
  span?: number;
}): T | { span: number } | undefined {
  if (schema.colProps) {
    return schema.colProps;
  }

  if (schema.span !== undefined) {
    return { span: schema.span };
  }

  return undefined;
}
export function getJsonFormPlaceholder(
  componentType: string | undefined,
  label: string | undefined,
  translate: (key: string, label?: string) => string,
) {
  const type = componentType ?? JSON_FORM_COMPONENT_TYPES.input;

  if (
    (
      [
        JSON_FORM_COMPONENT_TYPES.input,
        JSON_FORM_COMPONENT_TYPES.inputMask,
        JSON_FORM_COMPONENT_TYPES.inputSearch,
        JSON_FORM_COMPONENT_TYPES.inputNumber,
        JSON_FORM_COMPONENT_TYPES.inputPassword,
        JSON_FORM_COMPONENT_TYPES.textarea,
        JSON_FORM_COMPONENT_TYPES.autoComplete,
        JSON_FORM_COMPONENT_TYPES.inputTag,
        JSON_FORM_COMPONENT_TYPES.mention,
      ] as string[]
    ).includes(type)
  ) {
    return label ? translate('jsonForm.inputPlaceholder', label) : undefined;
  }

  if (
    (
      [
        JSON_FORM_COMPONENT_TYPES.select,
        JSON_FORM_COMPONENT_TYPES.cascader,
        JSON_FORM_COMPONENT_TYPES.treeSelect,
        JSON_FORM_COMPONENT_TYPES.datePicker,
        JSON_FORM_COMPONENT_TYPES.rangePicker,
        JSON_FORM_COMPONENT_TYPES.timePicker,
      ] as string[]
    ).includes(type)
  ) {
    return label ? translate('jsonForm.selectPlaceholder', label) : undefined;
  }

  return undefined;
}
export function getJsonFormComponentProps(
  schema: { componentProps?: Record<string, unknown>; type?: string },
  prefixCls: string,
  getPlaceholder: () => string | undefined,
) {
  const componentProps = { ...schema.componentProps } as Record<string, unknown>;

  if (componentProps.placeholder === undefined && getPlaceholder()) {
    componentProps.placeholder = getPlaceholder();
  }

  componentProps.class = mergeJsonFormClassName(
    componentProps.class,
    shouldStretchJsonFormControl(schema.type)
      ? `${prefixCls}-control`
      : `${prefixCls}-control--inline`,
  );

  return componentProps;
}

export function filterJsonFormSlots(
  names: string[],
  reserved: readonly (string | undefined)[],
  componentSlots?: Record<string, unknown>,
) {
  const schemaSlots = new Set(Object.keys(componentSlots ?? {}));
  return names.filter((name) => !reserved.includes(name) && !schemaSlots.has(name));
}
export function resolveJsonFormComponent<T>(components: Record<string, T>, type?: string) {
  return components[type ?? JSON_FORM_COMPONENT_TYPES.input] ?? components.input;
}
