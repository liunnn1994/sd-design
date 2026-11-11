import type { JsonFormBuiltinComponentType } from '@sdata/web-core/json-form/types';
import type { ElementType } from 'react';

import { AutoComplete } from '../auto-complete/index.js';
import { Cascader } from '../cascader/index.js';
import { Checkbox, CheckboxGroup } from '../checkbox/index.js';
import { DatePicker, RangePicker } from '../date-picker/index.js';
import { Row } from '../grid/index.js';
import { InputMask } from '../input-mask/index.js';
import { InputNumber } from '../input-number/index.js';
import { InputTag } from '../input-tag/index.js';
import { Input, InputPassword, InputSearch } from '../input/index.js';
import { Mention } from '../mention/index.js';
import { Radio, RadioGroup } from '../radio/index.js';
import { Rate } from '../rate/index.js';
import { Select } from '../select/index.js';
import { Slider } from '../slider/index.js';
import { Switch } from '../switch/index.js';
import { Textarea } from '../textarea/index.js';
import { TimePicker } from '../time-picker/index.js';
import { Transfer } from '../transfer/index.js';
import { TreeSelect } from '../tree-select/index.js';
import { VerificationCode } from '../verification-code/index.js';

export const jsonFormBuiltInComponents = {
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
} satisfies Record<Exclude<JsonFormBuiltinComponentType, 'noFormItem'>, ElementType>;

export function resolveJsonFormComponents(custom?: Partial<Record<string, ElementType>>) {
  return { ...jsonFormBuiltInComponents, ...custom } as Record<string, ElementType>;
}
