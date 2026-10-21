import { MESSAGE_STACK_BASE_Z_INDEX, POPUP_STACK_BASE_Z_INDEX, Z_INDEX_STEP } from './z-index.js';

export type PopupType = 'popup' | 'dialog' | 'message';

export class PopupManager {
  private popupStack = {
    popup: new Set<number>(),
    dialog: new Set<number>(),
    message: new Set<number>(),
  };

  private getNextZIndex = (type: PopupType) => {
    const popupZIndex = Array.from(this.popupStack.popup).pop() || POPUP_STACK_BASE_Z_INDEX;
    const current =
      type === 'message' ? Math.max(popupZIndex, MESSAGE_STACK_BASE_Z_INDEX) : popupZIndex;
    return current + Z_INDEX_STEP;
  };

  public add = (type: PopupType) => {
    const zIndex = this.getNextZIndex(type);
    this.popupStack[type].add(zIndex);
    if (type !== 'popup') {
      this.popupStack.popup.add(zIndex);
    }
    return zIndex;
  };

  public delete = (zIndex: number, type: PopupType) => {
    this.popupStack[type].delete(zIndex);
    if (type !== 'popup') {
      this.popupStack.popup.delete(zIndex);
    }
  };

  public isLastDialog = (zIndex: number) => {
    if (this.popupStack.dialog.size > 1) {
      return zIndex === Array.from(this.popupStack.dialog).pop();
    }
    return true;
  };
}

export const popupManager = new PopupManager();

export function createPopupEntry(
  type: PopupType,
  adapter: {
    readonly zIndex: number;
    setZIndex(value: number): void;
  },
  manager = popupManager,
) {
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    adapter.setZIndex(manager.add(type));
  };
  const close = () => {
    if (!opened) return;
    opened = false;
    manager.delete(adapter.zIndex, type);
  };
  const isLastDialog = () => type === 'dialog' && manager.isLastDialog(adapter.zIndex);
  return { open, close, isLastDialog };
}
