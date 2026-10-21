export interface CompatTriggerState {
  readonly defaultPopupVisible: boolean | undefined;
  readonly defaultShow: boolean | undefined;
  readonly popupVisible: boolean | undefined;
  readonly show: boolean | undefined;
  readonly visible: boolean;
  localVisible: boolean;
}
export const getDefaultPopupVisible = (
  state: Pick<CompatTriggerState, 'defaultPopupVisible' | 'defaultShow'>,
) => state.defaultPopupVisible ?? state.defaultShow ?? false;

export function createCompatTriggerFoundation(
  state: CompatTriggerState,
  emit: (
    event: 'update:popupVisible' | 'popupVisibleChange' | 'update:show' | 'showChange',
    visible: boolean,
  ) => void,
) {
  const getVisible = () => state.popupVisible ?? state.show ?? state.localVisible;
  const handlePopupVisibleChange = (visible: boolean) => {
    if (visible !== state.visible) {
      state.localVisible = visible;
      emit('update:popupVisible', visible);
      emit('popupVisibleChange', visible);
      emit('update:show', visible);
      emit('showChange', visible);
    }
  };
  const syncLocal = (visible: boolean) => {
    if (state.localVisible !== visible) {
      state.localVisible = visible;
    }
  };
  return { getVisible, handlePopupVisibleChange, syncLocal };
}

export interface PopupWrapperState {
  readonly popupVisible?: boolean | undefined;
  localVisible: boolean;
}

export function createPopupWrapperFoundation(
  state: PopupWrapperState,
  onUpdate: (visible: boolean) => void,
  onChange: (visible: boolean) => void,
) {
  const getVisible = () => state.popupVisible ?? state.localVisible;
  const handlePopupVisibleChange = (visible: boolean) => {
    state.localVisible = visible;
    onUpdate(visible);
    onChange(visible);
  };
  return { getVisible, handlePopupVisibleChange };
}
