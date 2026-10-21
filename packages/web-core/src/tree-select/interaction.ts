export interface TreeSelectInteractionState {
  readonly inputValue: string;
  readonly panelVisible: boolean;
  readonly readonly: boolean | string | undefined;
  readonly disabled: boolean;
  readonly allowSearch: boolean | { retainInputValue?: boolean } | undefined;
}
export interface TreeSelectInteractionAdapter {
  setInputValue: (value: string) => void;
  setPanelVisible: (visible: boolean) => void;
  showReadonlyTip: () => void;
  blur: () => void;
  events: {
    updateInputValue: (value: string) => void;
    inputValueChange: (value: string) => void;
    search: (value: string) => void;
    popupVisibleChange: (visible: boolean) => void;
    updatePopupVisible: (visible: boolean) => void;
    showChange: (visible: boolean) => void;
    updateShow: (visible: boolean) => void;
  };
}

export function createTreeSelectInteraction(
  state: TreeSelectInteractionState,
  adapter: TreeSelectInteractionAdapter,
) {
  function updateInputValue(value: string) {
    adapter.setInputValue(value);
    adapter.events.updateInputValue(value);
    adapter.events.inputValueChange(value);
  }
  function setPanelVisible(visible: boolean) {
    if (visible && state.readonly && !state.disabled) {
      adapter.showReadonlyTip();
      return;
    }
    if (visible !== state.panelVisible) {
      adapter.setPanelVisible(visible);
      adapter.events.popupVisibleChange(visible);
      adapter.events.updatePopupVisible(visible);
      adapter.events.showChange(visible);
      adapter.events.updateShow(visible);
    }
    if (!visible) adapter.blur();
  }
  function handleInputValueChange(value: string) {
    if (value !== state.inputValue) {
      setPanelVisible(true);
      updateInputValue(value);
      if (state.allowSearch) adapter.events.search(value);
    }
  }
  return { updateInputValue, setPanelVisible, handleInputValueChange };
}
