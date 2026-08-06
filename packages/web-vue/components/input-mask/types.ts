export type InputMaskSize = 'mini' | 'small' | 'medium' | 'large';

export type InputMaskToken = string | RegExp;

export type InputMaskPattern = string | readonly InputMaskToken[];

export interface InputMaskSelection {
  start: number;
  end: number;
}

export interface InputMaskState {
  value: string;
  selection: InputMaskSelection | null;
}

/**
 * @zh 写入前调整掩码值与选区。
 *
 * 与 react-input-mask 不同：本组件采用「整体重排」引擎，不追踪每次输入的
 * 插入字符串，因此回调签名为 `(nextState, previousState)`，不提供
 * `enteredString` 与 `config`。如需按「新输入字符」做判断，请自行在回调中
 * 比较 `previousState.value` 与 `nextState.value`。
 * @en Adjust the masked value and selection before committing.
 *
 * Unlike react-input-mask, this component reformats the whole value on each
 * input and does not track the inserted string, so the callback receives only
 * `(nextState, previousState)` - no `enteredString` or `config`. To react to
 * what was just typed, compare `previousState.value` with `nextState.value`
 * inside the callback.
 */
export type InputMaskBeforeChange = (
  nextState: InputMaskState,
  previousState: InputMaskState,
) => InputMaskState;

export interface InputMaskPresetDefinition {
  /** @zh 输入提示 @en Input hint */
  placeholder: string;
  /** @zh 原生输入模式 @en Native input mode */
  inputMode?: 'decimal' | 'email' | 'numeric' | 'search' | 'tel' | 'text' | 'url';
  /** @zh 固定位置掩码 @en Fixed-position mask */
  mask?: InputMaskPattern;
  /** @zh 模板专用格式字符 @en Preset-specific format characters */
  formatChars?: Readonly<Record<string, RegExp>>;
  /** @zh 过滤或规范化输入 @en Filter or normalize input */
  normalize?: (value: string) => string;
  /** @zh 判断当前值能否继续输入，不代表最终校验 @en Whether input can continue; not final validation */
  accepts?: (value: string) => boolean;
}

export interface InputMaskProps {
  /** @zh 绑定值 @en Value */
  modelValue?: string;
  /** @zh 默认值 @en Default value */
  defaultValue?: string;
  /** @zh 自定义固定位置掩码 @en Custom fixed-position mask */
  mask?: InputMaskPattern;
  /** @zh 内置格式模板 @en Built-in format preset */
  preset?: InputMaskPresetName;
  /** @zh 未填写位置的占位字符；null 表示不显示 @en Placeholder for unfilled positions; null hides it */
  maskChar?: string | null;
  /** @zh 自定义格式字符 @en Custom format characters */
  formatChars?: Readonly<Record<string, RegExp>>;
  /** @zh 未聚焦且为空时是否仍显示固定掩码 @en Whether to show a fixed mask while empty and blurred */
  alwaysShowMask?: boolean;
  /** @zh 写入前调整掩码值与选区 @en Adjust masked value and selection before committing */
  beforeMaskedValueChange?: InputMaskBeforeChange;
  /** @zh 输入框大小 @en Input size */
  size?: InputMaskSize;
  /** @zh 是否允许清空 @en Whether clearing is allowed */
  allowClear?: boolean;
  /** @zh 是否禁用 @en Whether disabled */
  disabled?: boolean;
  /** @zh 是否只读；字符串会作为只读提示 @en Whether readonly; a string is used as the readonly tip */
  readonly?: boolean | string;
  /** @zh 是否显示错误状态 @en Whether to show the error state */
  error?: boolean;
  /** @zh 输入提示 @en Input placeholder */
  placeholder?: string;
  /** @zh 宽度是否适应内容 @en Whether width adapts to content */
  fitWidth?: boolean;
  /** @zh 最大宽度是否限制为父容器宽度 @en Whether maximum width is limited to the parent */
  maxWFull?: boolean;
  /** @zh 是否显示字数统计 @en Whether to show word count */
  showWordLimit?: boolean;
  /** @zh 输入值的最大长度 @en Maximum input length */
  maxLength?: number | { length: number; errorOnly?: boolean };
  /** @zh 字符长度计算方法 @en Word length calculator */
  wordLength?: (value: string) => number;
  /** @zh 字符截取方法 @en Word slicing function */
  wordSlice?: (value: string, maxLength: number) => string;
  /** @zh 内部 input 元素属性 @en Attributes for the inner input */
  inputAttrs?: Record<string, unknown>;
  /** @zh 前置标签 @en Prepend label */
  prepend?: string;
  /** @zh 后置标签 @en Append label */
  append?: string;
}

export type InputMaskPresetName =
  | 'data-uri'
  | 'date'
  | 'datetime'
  | 'email'
  | 'fqdn'
  | 'hex-color'
  | 'hsl'
  | 'iban'
  | 'imei'
  | 'ip'
  | 'ip-range'
  | 'ipv4'
  | 'ipv6'
  | 'isrc'
  | 'iso6346'
  | 'issn'
  | 'jwt'
  | 'lat-long'
  | 'mac-address'
  | 'magnet-uri'
  | 'mailto-uri'
  | 'mime-type'
  | 'rgb-color'
  | 'rfc3339'
  | 'semver'
  | 'time'
  | 'url'
  | 'uuid';
