import type {
  ColorFormat,
  ColorModes,
  ColorObject,
  ColorPickerChangeTrigger,
  ColorValueState,
  RecentColorsValue,
} from './types.js';

import { formatColorState, getColorBackground, getColorObject, parseColorState } from './utils.js';

export function getColorPreviewStyle(state: ColorValueState): Record<string, string> {
  return {
    [state.mode === 'linear-gradient' ? 'backgroundImage' : 'backgroundColor']:
      getColorBackground(state),
  };
}
export function createColorPicker(adapter: {
  readonly props: {
    modelValue?: string;
    recentColors?: RecentColorsValue;
    disabled: boolean;
    readonly: boolean | string;
    colorModes: ColorModes;
    enableAlpha: boolean;
  };
  readonly value: string;
  readonly format: ColorFormat;
  readonly state: ColorValueState;
  draft: string | null;
  setInner(value: string): void;
  setRecent(value: string[]): void;
  setPopup(value: boolean): void;
  onUpdate(value: string): void;
  onChange(value: string, context: { color: ColorObject; trigger: ColorPickerChangeTrigger }): void;
  onClear(context: { e: MouseEvent }): void;
  onRecentChange(value: string[]): void;
  onPopupChange(value: boolean, displayValue: string): void;
}) {
  function display() {
    if (adapter.draft !== null) return adapter.draft;
    if (!adapter.value) return '';
    return formatColorState(adapter.state, adapter.format, adapter.props.enableAlpha);
  }
  function sync(value: string) {
    if (adapter.props.modelValue === undefined) adapter.setInner(value);
    adapter.onUpdate(value);
  }
  function change(value: string, trigger: ColorPickerChangeTrigger) {
    if (!adapter.props.disabled && !adapter.props.readonly) {
      sync(value);
      adapter.onChange(value, {
        color: getColorObject(parseColorState(value, adapter.props.colorModes)),
        trigger,
      });
    }
  }
  return {
    display,
    sync,
    change,
    recent(value: string[]) {
      if (adapter.props.recentColors === undefined) adapter.setRecent(value);
      adapter.onRecentChange(value);
    },
    clear(event: MouseEvent) {
      adapter.draft = null;
      sync('');
      adapter.onClear({ e: event });
      adapter.onChange('', {
        color: getColorObject(parseColorState('', adapter.props.colorModes)),
        trigger: 'clear',
      });
    },
    commit(value: string) {
      adapter.draft = null;
      if (!value) return;
      change(
        formatColorState(
          parseColorState(value, adapter.props.colorModes),
          adapter.format,
          adapter.props.enableAlpha,
        ),
        'input',
      );
    },
    input(value: string) {
      adapter.draft = value;
    },
    syncValue() {
      adapter.draft = null;
    },
    popup(value: boolean) {
      adapter.setPopup(value);
      adapter.onPopupChange(value, display());
    },
  };
}
