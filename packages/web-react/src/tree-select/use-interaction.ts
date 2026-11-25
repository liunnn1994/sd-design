import { createTreeSelectInteraction } from '@sdata/web-core/tree-select/interaction';
import { useReducer, useRef, useState } from 'react';

export interface TreeSelectInteractionProps {
  inputValue?: string | undefined;
  defaultInputValue?: string | undefined;
  popupVisible?: boolean | undefined;
  defaultPopupVisible?: boolean | undefined;
  show?: boolean | undefined;
  defaultShow?: boolean | undefined;
  readonly?: boolean | string | undefined;
  disabled?: boolean;
  allowSearch?: boolean | { retainInputValue?: boolean } | undefined;
  onInputValueChange?: ((value: string) => void) | undefined;
  onSearch?: ((value: string) => void) | undefined;
  onPopupVisibleChange?: ((value: boolean) => void) | undefined;
  onShowChange?: ((value: boolean) => void) | undefined;
}
export function useTreeSelectInteraction(
  props: TreeSelectInteractionProps,
  view: { showReadonlyTip(): void; blur(): void },
) {
  const current = useRef({ props, view });
  current.current = { props, view };
  const local = useRef({
    input: props.defaultInputValue ?? '',
    visible: props.defaultPopupVisible ?? props.defaultShow ?? false,
  });
  const previousInput = useRef(props.inputValue);
  if (previousInput.current !== props.inputValue) {
    if (props.inputValue === undefined) local.current.input = '';
    previousInput.current = props.inputValue;
  }
  const [, render] = useReducer((value: number) => value + 1, 0);
  const getInput = () => current.current.props.inputValue ?? local.current.input;
  const getVisible = () =>
    current.current.props.popupVisible ?? current.current.props.show ?? local.current.visible;
  const [foundation] = useState(() =>
    createTreeSelectInteraction(
      {
        get inputValue() {
          return getInput();
        },
        get panelVisible() {
          return getVisible();
        },
        get readonly() {
          return current.current.props.readonly;
        },
        get disabled() {
          return !!current.current.props.disabled;
        },
        get allowSearch() {
          return current.current.props.allowSearch;
        },
      },
      {
        setInputValue: (value) => {
          local.current.input = value;
          render();
        },
        setPanelVisible: (value) => {
          local.current.visible = value;
          render();
        },
        showReadonlyTip: () => current.current.view.showReadonlyTip(),
        blur: () => current.current.view.blur(),
        events: {
          updateInputValue() {},
          inputValueChange: (value) => current.current.props.onInputValueChange?.(value),
          search: (value) => current.current.props.onSearch?.(value),
          popupVisibleChange: (value) => current.current.props.onPopupVisibleChange?.(value),
          updatePopupVisible() {},
          showChange: (value) => current.current.props.onShowChange?.(value),
          updateShow() {},
        },
      },
    ),
  );
  return { inputValue: getInput(), visible: getVisible(), foundation };
}
