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
export type JsonFormModel = Record<string, unknown>;

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

export interface TranslatedJsonFormSchema {
  field: string;
  label?: string;
  type?: string;
  componentProps?: Record<string, unknown>;
  children?: TranslatedJsonFormSchema[];
}
