import type { Component, HTMLAttributes, VNodeChild } from 'vue';

import type { AutoCompleteInstance } from '../auto-complete';
import type { CascaderInstance } from '../cascader';
import type { CheckboxGroupInstance, CheckboxInstance } from '../checkbox';
import type { DatePickerInstance, RangePickerInstance } from '../date-picker';
import type { FieldRule, FormItemInstance } from '../form';
import type { GridColInstance, GridRowInstance } from '../grid';
import type { InputInstance, InputPasswordInstance, InputSearchInstance } from '../input';
import type { InputMaskInstance } from '../input-mask';
import type { InputNumberInstance } from '../input-number';
import type { InputTagInstance } from '../input-tag';
import type { MentionInstance } from '../mention';
import type { RadioGroupInstance, RadioInstance } from '../radio';
import type { RateInstance } from '../rate';
import type { SelectInstance } from '../select';
import type { SliderInstance } from '../slider';
import type { SwitchInstance } from '../switch';
import type { TextareaInstance } from '../textarea';
import type { TimePickerInstance } from '../time-picker';
import type { TransferInstance } from '../transfer';
import type { TreeSelectInstance } from '../tree-select';
import type { VerificationCodeInstance } from '../verification-code';

export const A2UI_0_9_1 = 'a2ui-0.9.1' as const;

export const JSON_FORM_ADAPTERS = {
  default: 'default',
  a2ui_0_9_1: A2UI_0_9_1,
} as const;

export const JSON_FORM_COMPONENT_TYPES = {
  autoComplete: 'autoComplete',
  cascader: 'cascader',
  checkbox: 'checkbox',
  checkboxGroup: 'checkboxGroup',
  datePicker: 'datePicker',
  input: 'input',
  inputMask: 'inputMask',
  inputNumber: 'inputNumber',
  inputPassword: 'inputPassword',
  inputSearch: 'inputSearch',
  inputTag: 'inputTag',
  mention: 'mention',
  radio: 'radio',
  radioGroup: 'radioGroup',
  rangePicker: 'rangePicker',
  rate: 'rate',
  row: 'row',
  select: 'select',
  slider: 'slider',
  switch: 'switch',
  textarea: 'textarea',
  timePicker: 'timePicker',
  transfer: 'transfer',
  treeSelect: 'treeSelect',
  verificationCode: 'verificationCode',
  noFormItem: 'noFormItem',
} as const;

export type JsonFormAdapter = (typeof JSON_FORM_ADAPTERS)[keyof typeof JSON_FORM_ADAPTERS];
export type JsonFormBuiltinComponentType =
  (typeof JSON_FORM_COMPONENT_TYPES)[keyof typeof JSON_FORM_COMPONENT_TYPES];
export type JsonFormExternalComponentMap = Record<string, Component>;

type ComponentPropsOf<T> = T extends new (...args: never[]) => { $props: infer P } ? P : never;
type ComponentEmitOf<T> = T extends new (...args: never[]) => { $emit: infer E } ? E : never;

type JsonFormBuiltInComponentPropsMap = {
  autoComplete: AutoCompleteInstance['$props'];
  cascader: CascaderInstance['$props'];
  checkbox: CheckboxInstance['$props'];
  checkboxGroup: CheckboxGroupInstance['$props'];
  datePicker: DatePickerInstance['$props'];
  input: InputInstance['$props'];
  inputMask: InputMaskInstance['$props'];
  inputNumber: InputNumberInstance['$props'];
  inputPassword: InputPasswordInstance['$props'];
  inputSearch: InputSearchInstance['$props'];
  inputTag: InputTagInstance['$props'];
  mention: MentionInstance['$props'];
  radio: RadioInstance['$props'];
  radioGroup: RadioGroupInstance['$props'];
  rangePicker: RangePickerInstance['$props'];
  rate: RateInstance['$props'];
  row: GridRowInstance['$props'];
  select: SelectInstance['$props'];
  slider: SliderInstance['$props'];
  switch: SwitchInstance['$props'];
  textarea: TextareaInstance['$props'];
  timePicker: TimePickerInstance['$props'];
  transfer: TransferInstance['$props'];
  treeSelect: TreeSelectInstance['$props'];
  verificationCode: VerificationCodeInstance['$props'];
  noFormItem: Record<string, unknown>;
};

type JsonFormBuiltInComponentEventsMap = {
  autoComplete: AutoCompleteInstance['$emit'];
  cascader: CascaderInstance['$emit'];
  checkbox: CheckboxInstance['$emit'];
  checkboxGroup: CheckboxGroupInstance['$emit'];
  datePicker: DatePickerInstance['$emit'];
  input: InputInstance['$emit'];
  inputMask: InputMaskInstance['$emit'];
  inputNumber: InputNumberInstance['$emit'];
  inputPassword: InputPasswordInstance['$emit'];
  inputSearch: InputSearchInstance['$emit'];
  inputTag: InputTagInstance['$emit'];
  mention: MentionInstance['$emit'];
  radio: RadioInstance['$emit'];
  radioGroup: RadioGroupInstance['$emit'];
  rangePicker: RangePickerInstance['$emit'];
  rate: RateInstance['$emit'];
  row: GridRowInstance['$emit'];
  select: SelectInstance['$emit'];
  slider: SliderInstance['$emit'];
  switch: SwitchInstance['$emit'];
  textarea: TextareaInstance['$emit'];
  timePicker: TimePickerInstance['$emit'];
  transfer: TransferInstance['$emit'];
  treeSelect: TreeSelectInstance['$emit'];
  verificationCode: VerificationCodeInstance['$emit'];
  noFormItem: Record<string, (...args: unknown[]) => unknown>;
};

type JsonFormBuiltInComponentMap = {
  [K in JsonFormBuiltinComponentType]: K extends keyof JsonFormBuiltInComponentPropsMap
    ? Component
    : never;
};

type JsonFormKnownComponentMap<TExternal extends JsonFormExternalComponentMap> =
  JsonFormBuiltInComponentMap & TExternal;

type JsonFormKnownComponentType<TExternal extends JsonFormExternalComponentMap> = Extract<
  keyof JsonFormKnownComponentMap<TExternal>,
  string
>;

type JsonFormResolvedComponentProps<
  TType extends string,
  TExternal extends JsonFormExternalComponentMap,
> = TType extends keyof JsonFormBuiltInComponentPropsMap
  ? JsonFormBuiltInComponentPropsMap[TType]
  : TType extends keyof TExternal
    ? ComponentPropsOf<TExternal[TType]>
    : Record<string, unknown>;

type JsonFormResolvedComponentEvents<
  TType extends string,
  TExternal extends JsonFormExternalComponentMap,
> = TType extends keyof JsonFormBuiltInComponentEventsMap
  ? JsonFormBuiltInComponentEventsMap[TType]
  : TType extends keyof TExternal
    ? ComponentEmitOf<TExternal[TType]>
    : Record<string, (...args: unknown[]) => unknown>;

export type JsonFormComponentType<TExternal extends JsonFormExternalComponentMap = {}> =
  | JsonFormKnownComponentType<TExternal>
  | (string & {});

export type JsonFormComponentProps<
  TType extends string,
  TExternal extends JsonFormExternalComponentMap = {},
> = string extends TType
  ? Record<string, unknown> & HTMLAttributes
  : JsonFormResolvedComponentProps<TType, TExternal> & HTMLAttributes;

export type JsonFormComponentEvents<
  TType extends string,
  TExternal extends JsonFormExternalComponentMap = {},
> = JsonFormResolvedComponentEvents<TType, TExternal>;

export type JsonFormComponentSlotRenderer = Component | ((...args: never[]) => VNodeChild);

export type JsonFormItemSlotProps<TExternal extends JsonFormExternalComponentMap = {}> = {
  record?: JsonFormSchema<JsonFormComponentType<TExternal>, TExternal>;
  value?: unknown;
} & Record<string, unknown>;

type JsonFormBaseSchema<TType extends string, TExternal extends JsonFormExternalComponentMap> = {
  field: string;
  label?: string;
  type?: TType;
  required?: boolean;
  hidden?: boolean;
  slotName?: string;
  render?: () => VNodeChild;
  span?: number;
  colProps?: GridColInstance['$props'];
  formItemProps?: Omit<FormItemInstance['$props'], 'field' | 'label' | 'rules'>;
  formItemRules?: FieldRule | FieldRule[];
  formItemEvents?: ComponentEmitOf<FormItemInstance>;
  componentProps?: JsonFormComponentProps<TType, TExternal>;
  componentEvents?: JsonFormComponentEvents<TType, TExternal>;
  componentSlots?: Record<string, JsonFormComponentSlotRenderer>;
  children?: JsonFormSchema<JsonFormComponentType<TExternal>, TExternal>[];
};

export type JsonFormSchema<
  TType extends string = JsonFormBuiltinComponentType,
  TExternal extends JsonFormExternalComponentMap = {},
> = JsonFormBaseSchema<TType, TExternal>;

export type JsonFormComponentRegistry<TExternal extends JsonFormExternalComponentMap = {}> =
  Partial<Record<JsonFormComponentType<TExternal>, Component>>;

export type JsonFormProviderConfig<TExternal extends JsonFormExternalComponentMap = {}> = {
  adapter?: JsonFormAdapter;
  components?: JsonFormComponentRegistry<TExternal>;
};

export type JsonFormModel = Record<string, unknown>;

export type JsonFormProps<TExternal extends JsonFormExternalComponentMap = {}> = {
  schemas:
    | JsonFormSchema<JsonFormComponentType<TExternal>, TExternal>[]
    | JsonFormA2UI_0_9_1ComponentNode[];
  adapter?: JsonFormAdapter;
  model?: JsonFormModel;
  hideLabel?: boolean;
  hideAsterisk?: boolean;
  showColon?: boolean;
  component?: string | Component;
};

export type JsonFormA2UI_0_9_1DataBinding = {
  path: string;
};

export type JsonFormA2UI_0_9_1FunctionCall = {
  call: string;
  args?: Record<string, unknown>;
  returnType?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' | 'void';
};

export type JsonFormA2UI_0_9_1DynamicString =
  | string
  | JsonFormA2UI_0_9_1DataBinding
  | (JsonFormA2UI_0_9_1FunctionCall & { returnType: 'string' });
export type JsonFormA2UI_0_9_1DynamicNumber =
  | number
  | JsonFormA2UI_0_9_1DataBinding
  | (JsonFormA2UI_0_9_1FunctionCall & { returnType: 'number' });
export type JsonFormA2UI_0_9_1DynamicBoolean =
  | boolean
  | JsonFormA2UI_0_9_1DataBinding
  | (JsonFormA2UI_0_9_1FunctionCall & { returnType: 'boolean' });
export type JsonFormA2UI_0_9_1DynamicStringList =
  | string[]
  | JsonFormA2UI_0_9_1DataBinding
  | (JsonFormA2UI_0_9_1FunctionCall & { returnType: 'array' });

export type JsonFormA2UI_0_9_1CheckRule = {
  condition: JsonFormA2UI_0_9_1DynamicBoolean;
  message: string;
};

export type JsonFormA2UI_0_9_1ChoiceOption = {
  label: JsonFormA2UI_0_9_1DynamicString;
  value: string;
};

export type JsonFormA2UI_0_9_1Children =
  | string[]
  | {
      componentId: string;
      path: string;
    };

type JsonFormA2UI_0_9_1SharedNode = {
  id: string;
  component: string;
  accessibility?: {
    label?: JsonFormA2UI_0_9_1DynamicString;
    description?: JsonFormA2UI_0_9_1DynamicString;
  };
  weight?: number;
  checks?: JsonFormA2UI_0_9_1CheckRule[];
};

export type JsonFormA2UI_0_9_1ContainerComponent = JsonFormA2UI_0_9_1SharedNode & {
  component: 'Row' | 'Column' | 'List';
  children: JsonFormA2UI_0_9_1Children;
  justify?: 'center' | 'end' | 'spaceAround' | 'spaceBetween' | 'spaceEvenly' | 'start' | 'stretch';
  align?: 'start' | 'center' | 'end' | 'stretch';
};

export type JsonFormA2UI_0_9_1CardComponent = JsonFormA2UI_0_9_1SharedNode & {
  component: 'Card';
  child: string;
};

export type JsonFormA2UI_0_9_1TextFieldComponent = JsonFormA2UI_0_9_1SharedNode & {
  component: 'TextField';
  label: JsonFormA2UI_0_9_1DynamicString;
  value?: JsonFormA2UI_0_9_1DynamicString;
  variant?: 'longText' | 'number' | 'shortText' | 'obscured';
  validationRegexp?: string;
};

export type JsonFormA2UI_0_9_1CheckBoxComponent = JsonFormA2UI_0_9_1SharedNode & {
  component: 'CheckBox';
  label: JsonFormA2UI_0_9_1DynamicString;
  value: JsonFormA2UI_0_9_1DynamicBoolean;
};

export type JsonFormA2UI_0_9_1ChoicePickerComponent = JsonFormA2UI_0_9_1SharedNode & {
  component: 'ChoicePicker';
  label?: JsonFormA2UI_0_9_1DynamicString;
  variant?: 'multipleSelection' | 'mutuallyExclusive';
  options: JsonFormA2UI_0_9_1ChoiceOption[];
  value: JsonFormA2UI_0_9_1DynamicStringList;
  displayStyle?: 'checkbox' | 'chips';
  filterable?: boolean;
};

export type JsonFormA2UI_0_9_1SliderComponent = JsonFormA2UI_0_9_1SharedNode & {
  component: 'Slider';
  label?: JsonFormA2UI_0_9_1DynamicString;
  min?: number;
  max: number;
  value: JsonFormA2UI_0_9_1DynamicNumber;
};

export type JsonFormA2UI_0_9_1DateTimeInputComponent = JsonFormA2UI_0_9_1SharedNode & {
  component: 'DateTimeInput';
  value: JsonFormA2UI_0_9_1DynamicString;
  enableDate?: boolean;
  enableTime?: boolean;
  min?: JsonFormA2UI_0_9_1DynamicString;
  max?: JsonFormA2UI_0_9_1DynamicString;
  label?: JsonFormA2UI_0_9_1DynamicString;
};

export type JsonFormA2UI_0_9_1CustomComponentNode = JsonFormA2UI_0_9_1SharedNode & {
  [key: string]: unknown;
};

export type JsonFormA2UI_0_9_1ComponentNode =
  | JsonFormA2UI_0_9_1ContainerComponent
  | JsonFormA2UI_0_9_1CardComponent
  | JsonFormA2UI_0_9_1TextFieldComponent
  | JsonFormA2UI_0_9_1CheckBoxComponent
  | JsonFormA2UI_0_9_1ChoicePickerComponent
  | JsonFormA2UI_0_9_1SliderComponent
  | JsonFormA2UI_0_9_1DateTimeInputComponent
  | JsonFormA2UI_0_9_1CustomComponentNode;

export const defineJsonFormComponents = <const TExternal extends JsonFormExternalComponentMap>(
  components: TExternal,
) => {
  return components;
};

export const defineJsonFormSchemas = <const TExternal extends JsonFormExternalComponentMap>() => {
  return <const TSchemas extends JsonFormSchema<JsonFormComponentType<TExternal>, TExternal>[]>(
    schemas: TSchemas,
  ) => {
    return schemas;
  };
};
