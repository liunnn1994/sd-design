import type { Component } from 'vue';

import { translateA2UI_0_9_1ToJsonFormSchemas as translate } from '@sdata/web-core/json-form/schema';

import type {
  JsonFormA2UI_0_9_1ComponentNode,
  JsonFormComponentRegistry,
  JsonFormExternalComponentMap,
  JsonFormModel,
  JsonFormSchema,
} from './types';

import { getPrefixCls } from '../_utils/global-config';
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
export {
  shouldStretchJsonFormControl,
  parseJsonFormPath,
  getJsonFormValue,
  setJsonFormValue,
  mergeJsonFormClassName,
} from '@sdata/web-core/json-form/schema';

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

export function translateA2UI_0_9_1ToJsonFormSchemas(
  nodes: JsonFormA2UI_0_9_1ComponentNode[],
  model?: JsonFormModel,
): JsonFormSchema<string>[] {
  return translate(nodes, model, () => getPrefixCls('json-form'));
}
