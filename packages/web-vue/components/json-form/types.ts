import type {
  JsonFormAdapter,
  JsonFormBuiltinComponentType,
  JsonFormModel,
  JsonFormA2UI_0_9_1ComponentNode,
} from '@sdata/web-core/json-form/types';
export {
  A2UI_0_9_1,
  JSON_FORM_ADAPTERS,
  JSON_FORM_COMPONENT_TYPES,
} from '@sdata/web-core/json-form/types';
export type * from '@sdata/web-core/json-form/types';
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

export type JsonFormExternalComponentMap = Record<string, Component>;

type ComponentPropsOf<T> = T extends new (...args: never[]) => { $props: infer P } ? P : never;
type ComponentEventsOf<TProps> = {
  [K in keyof TProps as K extends `on${infer Event}` ? Uncapitalize<Event> : never]: TProps[K];
};

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
  autoComplete: ComponentEventsOf<AutoCompleteInstance['$props']>;
  cascader: ComponentEventsOf<CascaderInstance['$props']>;
  checkbox: ComponentEventsOf<CheckboxInstance['$props']>;
  checkboxGroup: ComponentEventsOf<CheckboxGroupInstance['$props']>;
  datePicker: ComponentEventsOf<DatePickerInstance['$props']>;
  input: ComponentEventsOf<InputInstance['$props']>;
  inputMask: ComponentEventsOf<InputMaskInstance['$props']>;
  inputNumber: ComponentEventsOf<InputNumberInstance['$props']>;
  inputPassword: ComponentEventsOf<InputPasswordInstance['$props']>;
  inputSearch: ComponentEventsOf<InputSearchInstance['$props']>;
  inputTag: ComponentEventsOf<InputTagInstance['$props']>;
  mention: ComponentEventsOf<MentionInstance['$props']>;
  radio: ComponentEventsOf<RadioInstance['$props']>;
  radioGroup: ComponentEventsOf<RadioGroupInstance['$props']>;
  rangePicker: ComponentEventsOf<RangePickerInstance['$props']>;
  rate: ComponentEventsOf<RateInstance['$props']>;
  row: ComponentEventsOf<GridRowInstance['$props']>;
  select: ComponentEventsOf<SelectInstance['$props']>;
  slider: ComponentEventsOf<SliderInstance['$props']>;
  switch: ComponentEventsOf<SwitchInstance['$props']>;
  textarea: ComponentEventsOf<TextareaInstance['$props']>;
  timePicker: ComponentEventsOf<TimePickerInstance['$props']>;
  transfer: ComponentEventsOf<TransferInstance['$props']>;
  treeSelect: ComponentEventsOf<TreeSelectInstance['$props']>;
  verificationCode: ComponentEventsOf<VerificationCodeInstance['$props']>;
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
    ? ComponentEventsOf<ComponentPropsOf<TExternal[TType]>>
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
  formItemEvents?: ComponentEventsOf<FormItemInstance['$props'] & HTMLAttributes>;
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

export type JsonFormProps<TExternal extends JsonFormExternalComponentMap = {}> = {
  /**
   * @zh 表单结构描述，声明每个字段及其组件
   * @en Form schema describing each field and its component
   */
  schemas:
    | JsonFormSchema<JsonFormComponentType<TExternal>, TExternal>[]
    | JsonFormA2UI_0_9_1ComponentNode[];
  /**
   * @zh 表单数据对象（v-model）
   * @en Form data object (v-model)
   */
  modelValue?: JsonFormModel;
  /**
   * @zh 结构描述的适配器，用于兼容 A2UI 等外部格式
   * @en Adapter of the schema format, for A2UI and other external formats
   */
  adapter?: JsonFormAdapter;
  /**
   * @zh 表单数据对象（非受控状态），字段就地变更
   * @en Form data object (uncontrolled state), mutated in place
   */
  model?: JsonFormModel;
  /**
   * @zh 是否隐藏字段标签
   * @en Whether to hide field labels
   */
  hideLabel?: boolean;
  /**
   * @zh 是否隐藏必填标记
   * @en Whether to hide the required marker
   */
  hideAsterisk?: boolean;
  /**
   * @zh 是否在标签后显示冒号
   * @en Whether to show a colon after the label
   */
  showColon?: boolean;
  /**
   * @zh 默认的表单容器组件
   * @en Default form container component
   */
  component?: string | Component;
};

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
