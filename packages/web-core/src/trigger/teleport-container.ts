import { getElement } from '../_utils/dom.js';

export type PopupContainer = string | HTMLElement | null | undefined;
export interface TeleportContainerState {
  readonly popupContainer: PopupContainer;
  teleportContainer: PopupContainer;
  containerElement: HTMLElement | undefined;
}
export function createTeleportContainerFoundation(
  state: TeleportContainerState,
  {
    defaultContainer,
    documentContainer,
  }: { defaultContainer: string; documentContainer: boolean | undefined },
) {
  const getContainer = () => {
    const resolvedPopupContainer = state.popupContainer ?? undefined;
    const element = getElement(resolvedPopupContainer);
    const _teleportContainer = element ? resolvedPopupContainer : defaultContainer;
    const _containerElement =
      element ?? (documentContainer ? document.documentElement : getElement(defaultContainer));
    if (_teleportContainer !== state.teleportContainer) {
      state.teleportContainer = _teleportContainer;
    }
    if (_containerElement !== state.containerElement) {
      state.containerElement = _containerElement;
    }
  };
  const sync = (nextPopupContainer: PopupContainer, nextVisible: boolean) => {
    if (!nextVisible) {
      return;
    }
    if (state.teleportContainer !== nextPopupContainer) {
      getContainer();
    }
  };
  return { getContainer, sync };
}
