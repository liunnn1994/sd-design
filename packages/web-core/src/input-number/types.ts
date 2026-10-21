export type InputNumberValue = string | number | null | undefined;
export type InputNumberValueMode = 'string' | 'number';
export type InputNumberStep = 'minus' | 'plus';
export type InputNumberFormatter = (value: InputNumberValue) => string;
export type InputNumberParser = (value: string) => string | number;
export type InputNumberPropFormatter = {
  bivarianceHack(value: InputNumberValue): string | undefined;
}['bivarianceHack'];
export type InputNumberChangeHandler = (value: InputNumberValue, event: Event) => void;
export type InputNumberInputHandler = (
  value: InputNumberValue,
  inputValue: string,
  event: Event,
) => void;
export interface InputNumberOptions {
  modelValue?: InputNumberValue;
  defaultValue?: InputNumberValue;
  stringMode: boolean;
  step: number;
  min: number;
  max: number;
  precision?: number;
  formatter?: InputNumberPropFormatter;
  parser?: InputNumberParser;
  readonly: boolean | string;
  modelEvent: 'change' | 'input';
}
