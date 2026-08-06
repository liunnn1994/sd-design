import type { Component } from 'vue';

import { isPlainObject } from 'es-toolkit';

import AutoComplete from '../auto-complete';
import Cascader from '../cascader';
import Checkbox, { CheckboxGroup } from '../checkbox';
import DatePicker, { RangePicker } from '../date-picker';
import { Row } from '../grid';
import Input, { InputPassword, InputSearch } from '../input';
import InputMask from '../input-mask';
import InputNumber from '../input-number';
import InputTag from '../input-tag';
import Mention from '../mention';
import Radio, { RadioGroup } from '../radio';
import Rate from '../rate';
import Select from '../select';
import Slider from '../slider';
import Switch from '../switch';
import Textarea from '../textarea';
import TimePicker from '../time-picker';
import Transfer from '../transfer';
import TreeSelect from '../tree-select';
import VerificationCode from '../verification-code';
import {
  JSON_FORM_COMPONENT_TYPES,
  A2UI_0_9_1,
  type JsonFormA2UI_0_9_1ComponentNode,
  type JsonFormA2UI_0_9_1CardComponent,
  type JsonFormA2UI_0_9_1ChoicePickerComponent,
  type JsonFormA2UI_0_9_1ContainerComponent,
  type JsonFormA2UI_0_9_1DataBinding,
  type JsonFormA2UI_0_9_1DateTimeInputComponent,
  type JsonFormA2UI_0_9_1SliderComponent,
  type JsonFormA2UI_0_9_1TextFieldComponent,
  type JsonFormComponentRegistry,
  type JsonFormExternalComponentMap,
  type JsonFormModel,
  type JsonFormSchema,
} from './types';

const STRETCH_COMPONENT_TYPES = new Set<string>([
  JSON_FORM_COMPONENT_TYPES.autoComplete,
  JSON_FORM_COMPONENT_TYPES.cascader,
  JSON_FORM_COMPONENT_TYPES.datePicker,
  JSON_FORM_COMPONENT_TYPES.input,
  JSON_FORM_COMPONENT_TYPES.inputMask,
  JSON_FORM_COMPONENT_TYPES.inputNumber,
  JSON_FORM_COMPONENT_TYPES.inputPassword,
  JSON_FORM_COMPONENT_TYPES.inputSearch,
  JSON_FORM_COMPONENT_TYPES.inputTag,
  JSON_FORM_COMPONENT_TYPES.mention,
  JSON_FORM_COMPONENT_TYPES.rangePicker,
  JSON_FORM_COMPONENT_TYPES.select,
  JSON_FORM_COMPONENT_TYPES.textarea,
  JSON_FORM_COMPONENT_TYPES.timePicker,
  JSON_FORM_COMPONENT_TYPES.treeSelect,
  JSON_FORM_COMPONENT_TYPES.verificationCode,
]);

export const jsonFormBuiltInComponents: JsonFormComponentRegistry = {
  autoComplete: AutoComplete,
  cascader: Cascader,
  checkbox: Checkbox,
  checkboxGroup: CheckboxGroup,
  datePicker: DatePicker,
  input: Input,
  inputMask: InputMask,
  inputNumber: InputNumber,
  inputPassword: InputPassword,
  inputSearch: InputSearch,
  inputTag: InputTag,
  mention: Mention,
  radio: Radio,
  radioGroup: RadioGroup,
  rangePicker: RangePicker,
  rate: Rate,
  row: Row,
  select: Select,
  slider: Slider,
  switch: Switch,
  textarea: Textarea,
  timePicker: TimePicker,
  transfer: Transfer,
  treeSelect: TreeSelect,
  verificationCode: VerificationCode,
};

export function resolveJsonFormComponents<TExternal extends JsonFormExternalComponentMap>(
  customComponents?: JsonFormComponentRegistry<TExternal>,
) {
  return {
    ...jsonFormBuiltInComponents,
    ...customComponents,
  } as Record<string, Component>;
}

export function shouldStretchJsonFormControl(type?: string) {
  return type ? STRETCH_COMPONENT_TYPES.has(type) : true;
}

export function parseJsonFormPath(
  path: string,
  adapter: 'default' | typeof A2UI_0_9_1 = 'default',
) {
  if (!path) {
    return [] as string[];
  }

  if (adapter === A2UI_0_9_1) {
    return path
      .split('/')
      .slice(1)
      .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'));
  }

  return path.split('.').filter(Boolean);
}

export function getJsonFormValue(
  model: JsonFormModel | undefined,
  path: string,
  adapter: 'default' | typeof A2UI_0_9_1 = 'default',
) {
  const segments = parseJsonFormPath(path, adapter);
  let current: unknown = model;

  for (const segment of segments) {
    if (!isPlainObject(current) && !Array.isArray(current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

export function setJsonFormValue(
  model: JsonFormModel | undefined,
  path: string,
  value: unknown,
  adapter: 'default' | typeof A2UI_0_9_1 = 'default',
) {
  if (!model) {
    return;
  }

  const segments = parseJsonFormPath(path, adapter);

  if (segments.length === 0) {
    return;
  }

  let current: Record<string, unknown> = model;

  for (const segment of segments.slice(0, -1)) {
    const nextValue = current[segment];

    if (!isPlainObject(nextValue) && !Array.isArray(nextValue)) {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  current[segments.at(-1)!] = value;
}

function resolveA2UI_0_9_1Path(value: unknown) {
  if (
    value &&
    typeof value === 'object' &&
    'path' in value &&
    typeof (value as JsonFormA2UI_0_9_1DataBinding).path === 'string'
  ) {
    return (value as JsonFormA2UI_0_9_1DataBinding).path;
  }

  return undefined;
}

function resolveA2UI_0_9_1Text(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function translateA2UI_0_9_1Field(node: JsonFormA2UI_0_9_1ComponentNode): JsonFormSchema<string>[] {
  const field = resolveA2UI_0_9_1Path((node as { value?: unknown }).value);

  if (!field) {
    return [];
  }

  switch (node.component) {
    case 'TextField': {
      const textField = node as JsonFormA2UI_0_9_1TextFieldComponent;
      const variant = textField.variant;
      const type =
        variant === 'longText'
          ? JSON_FORM_COMPONENT_TYPES.textarea
          : variant === 'number'
            ? JSON_FORM_COMPONENT_TYPES.inputNumber
            : variant === 'obscured'
              ? JSON_FORM_COMPONENT_TYPES.inputPassword
              : JSON_FORM_COMPONENT_TYPES.input;

      return [
        {
          field,
          label: resolveA2UI_0_9_1Text(textField.label),
          type,
          componentProps: textField.validationRegexp
            ? { inputAttrs: { pattern: textField.validationRegexp } }
            : undefined,
        },
      ];
    }

    case 'CheckBox':
      return [
        {
          field,
          label: resolveA2UI_0_9_1Text(node.label),
          type: JSON_FORM_COMPONENT_TYPES.checkbox,
        },
      ];

    case 'ChoicePicker': {
      const choicePicker = node as JsonFormA2UI_0_9_1ChoicePickerComponent;
      return [
        {
          field,
          label: resolveA2UI_0_9_1Text(choicePicker.label),
          type: JSON_FORM_COMPONENT_TYPES.checkboxGroup,
          componentProps: {
            options: choicePicker.options.map((option) => ({
              label: resolveA2UI_0_9_1Text(option.label) ?? option.value,
              value: option.value,
            })),
            max: choicePicker.variant === 'multipleSelection' ? undefined : 1,
          },
        },
      ];
    }

    case 'Slider': {
      const slider = node as JsonFormA2UI_0_9_1SliderComponent;
      return [
        {
          field,
          label: resolveA2UI_0_9_1Text(slider.label),
          type: JSON_FORM_COMPONENT_TYPES.slider,
          componentProps: {
            min: slider.min ?? 0,
            max: slider.max,
          },
        },
      ];
    }

    case 'DateTimeInput': {
      const dateTimeInput = node as JsonFormA2UI_0_9_1DateTimeInputComponent;
      const enableDate = dateTimeInput.enableDate ?? false;
      const enableTime = dateTimeInput.enableTime ?? false;

      return [
        {
          field,
          label: resolveA2UI_0_9_1Text(dateTimeInput.label),
          type: enableDate
            ? JSON_FORM_COMPONENT_TYPES.datePicker
            : JSON_FORM_COMPONENT_TYPES.timePicker,
          componentProps: enableDate && enableTime ? { showTime: true } : undefined,
        },
      ];
    }

    default:
      return [];
  }
}

export function translateA2UI_0_9_1ToJsonFormSchemas(nodes: JsonFormA2UI_0_9_1ComponentNode[]) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const visitedIds = new Set<string>();

  const expandNode = (node: JsonFormA2UI_0_9_1ComponentNode): JsonFormSchema<string>[] => {
    if (visitedIds.has(node.id)) {
      return [];
    }

    visitedIds.add(node.id);

    if (node.component === 'Card') {
      const child = nodeMap.get((node as JsonFormA2UI_0_9_1CardComponent).child);
      return child ? expandNode(child) : [];
    }

    if (node.component === 'Column' || node.component === 'List' || node.component === 'Row') {
      const container = node as JsonFormA2UI_0_9_1ContainerComponent;

      if (!Array.isArray(container.children)) {
        return [];
      }

      const children = container.children.flatMap((childId) => {
        const child = nodeMap.get(childId);
        return child ? expandNode(child) : [];
      });

      if (node.component !== 'Row') {
        return children;
      }

      return [
        {
          field: node.id,
          type: JSON_FORM_COMPONENT_TYPES.row,
          children,
        },
      ];
    }

    return translateA2UI_0_9_1Field(node);
  };

  const root = nodeMap.get('root');
  return root ? expandNode(root) : [];
}

export function mergeJsonFormClassName(...classNames: unknown[]) {
  return classNames.filter(Boolean);
}
