import type { TimeInputValue, TimeStateValue } from '@sdata/web-core/time-picker/foundation';
import type { RefObject } from 'react';

import { getDayjsValue } from '@sdata/web-core/_utils/date';
import { createTimePickerFoundation } from '@sdata/web-core/time-picker/foundation';
import {
  getInitialTimeValue,
  getEmptyTimeValue,
  normalizeTimeValue,
} from '@sdata/web-core/time-picker/state';
import { isDisabledTimeValue } from '@sdata/web-core/time-picker/values';
import { useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { PickerInputInstance } from '../_shared/picker-input.js';
import type { TimePickerProps } from './types.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useFormItem } from '../form/context.js';

export function useTimePicker(
  props: TimePickerProps,
  format: string,
  input: RefObject<PickerInputInstance | null>,
) {
  const range = props.type === 'time-range';
  const form = useFormItem(props);
  const afterRender = useAfterRender();
  const [, render] = useReducer((n: number) => n + 1, 0);
  const model = useMemo(
    () => getDayjsValue(normalizeTimeValue(props.value, range), format),
    [props.value, range, format],
  );
  const [local] = useState(() => {
    const initial = getInitialTimeValue(
      model,
      () => getDayjsValue(normalizeTimeValue(props.defaultValue, range), format),
      range,
    );
    return {
      value: initial,
      panel: initial,
      draft: undefined as TimeInputValue,
      visible: props.defaultPopupVisible ?? false,
      index: 0,
    };
  });
  const value = model ?? local.value;
  const visible = props.popupVisible ?? local.visible;
  const current = useRef({ props, form, range, format, value, visible });
  current.current = { props, form, range, format, value, visible };
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const setPanel = (next: TimeStateValue) => {
    local.panel = next;
    local.draft = undefined;
    render();
  };
  const [foundation] = useState(() =>
    createTimePickerFoundation({
      getValue: () => current.current.value,
      getPanelValue: () => local.panel,
      getInputValue: () => local.draft,
      getFormat: () => current.current.format,
      getVisible: () => current.current.visible,
      getDisabled: () => current.current.form.mergedDisabled,
      getReadonly: () => !!current.current.props.readonly,
      getDisableConfirm: () => !!current.current.props.disableConfirm,
      getRange: () => current.current.range,
      getFocusedIndex: () => local.index,
      setValue: (next) => {
        local.value = next;
        render();
      },
      setPanelValue: setPanel,
      setInputValue: (next) => {
        local.draft = next;
        render();
      },
      setVisible: (next) => {
        local.visible = next;
        render();
      },
      setFocusedInputIndex: (next) => {
        local.index = next;
        render();
      },
      isDisabledTime: (next) =>
        isDisabledTimeValue(next, {
          disabledHours: current.current.props.disabledHours,
          disabledMinutes: current.current.props.disabledMinutes,
          disabledSeconds: current.current.props.disabledSeconds,
        }),
      onUpdateValue: (next) => current.current.props.onValueChange?.(next),
      onChange: (next, date) => current.current.props.onChange?.(next, date),
      onSelect: (next, date) => current.current.props.onSelect?.(next, date),
      onFormChange: () => current.current.form.eventHandlers?.onChange?.(),
      onClear: () => current.current.props.onClear?.(),
      onPopupChange: (next) => current.current.props.onPopupVisibleChange?.(next),
      onUpdatePopup: (next) => current.current.props.onUpdatePopupVisible?.(next),
      focusInput: (index) => input.current?.focus(index),
      afterRender: (task) => {
        void afterRender().then(() => {
          if (mounted.current) task();
        });
      },
    }),
  );
  const previous = useRef({ model, value, visible });
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { model, value, visible };
    if (model !== before.model && model === undefined) {
      local.value = getEmptyTimeValue(range);
      setPanel(local.value);
    } else if (value !== before.value || visible !== before.visible) {
      setPanel(value);
    }
    if (!visible && visible !== before.visible) {
      local.draft = undefined;
      render();
    }
  }, [model, value, visible, range]);
  return {
    foundation,
    form,
    value,
    visible,
    local,
    setFocusedIndex: (index: number) => {
      local.index = index;
      render();
    },
  };
}
