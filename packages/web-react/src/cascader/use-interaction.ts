import type { CascaderInteractionAdapter } from '@sdata/web-core/cascader/interaction';

import { createCascaderInteraction } from '@sdata/web-core/cascader/interaction';
import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';

export interface CascaderInteractionProps {
  inputValue?: string | undefined;
  defaultInputValue?: string;
  popupVisible: boolean;
  allowSearch?: boolean;
  searchDelay?: number;
  onInputValueChange?: ((value: string) => void) | undefined;
  onSearch?: ((value: string) => void) | undefined;
  onClear?: (() => void) | undefined;
}
export function useCascaderInteraction<P>(
  props: CascaderInteractionProps,
  view: Pick<
    CascaderInteractionAdapter<P>,
    | 'getValues'
    | 'getLeafOptions'
    | 'getActiveKey'
    | 'setPopupVisible'
    | 'setSelectedPath'
    | 'setActiveKey'
    | 'clearSelection'
  >,
) {
  const current = useRef({ props, view });
  current.current = { props, view };
  const input = useRef(props.defaultInputValue ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [interaction] = useState(() =>
    createCascaderInteraction<P>({
      getInputValue: () => current.current.props.inputValue ?? input.current,
      getPopupVisible: () => current.current.props.popupVisible,
      getAllowSearch: () => !!current.current.props.allowSearch,
      getValues: () => current.current.view.getValues(),
      getLeafOptions: () => current.current.view.getLeafOptions(),
      getActiveKey: () => current.current.view.getActiveKey(),
      setInputValue: (value) => {
        input.current = value;
        render();
      },
      setPopupVisible: (value) => current.current.view.setPopupVisible(value),
      setSelectedPath: (key) => current.current.view.setSelectedPath(key),
      setActiveKey: (key) => current.current.view.setActiveKey(key),
      clearSelection: () => current.current.view.clearSelection(),
      inputChange: (value) => current.current.props.onInputValueChange?.(value),
      search: (value) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          timer.current = undefined;
          current.current.props.onSearch?.(value);
        }, current.current.props.searchDelay);
      },
      clear: () => current.current.props.onClear?.(),
    }),
  );
  const previousVisible = useRef(props.popupVisible);
  useLayoutEffect(() => {
    if (previousVisible.current !== props.popupVisible) {
      previousVisible.current = props.popupVisible;
      interaction.popupChanged(props.popupVisible);
    }
  }, [interaction, props.popupVisible]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return {
    inputValue: props.inputValue ?? input.current,
    showSearchPanel: !!props.allowSearch && (props.inputValue ?? input.current).length > 0,
    inputChange: interaction.inputChange,
    clear: interaction.clear,
  };
}
