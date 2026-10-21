import { KEYBOARD_KEY } from '../_utils/keyboard.js';

export function createDialogFoundation(adapter: {
  readonly visible: boolean;
  readonly inner: boolean;
  readonly escToClose: boolean | undefined;
  setInner(value: boolean): void;
  setMounted(value: boolean): void;
  isLastDialog(): boolean;
  cancel(event: Event): void;
  invalidate(): void;
  onBeforeOpen(): void;
  onBeforeClose(): void;
  onOpen(): void;
  onClose(): void;
  beforeOpening(): void;
  beforeClosed(): void;
  lockOverflow(): void;
  resetOverflow(): void;
  addKeyListener(): void;
  removeKeyListener(): void;
  activateFocus(): void;
  deactivateFocus(): void;
  releasePopup(): void;
}) {
  function escape(event: KeyboardEvent) {
    if (adapter.escToClose && event.key === KEYBOARD_KEY.ESC && adapter.isLastDialog())
      adapter.cancel(event);
  }
  function mount() {
    if (adapter.visible) {
      adapter.setMounted(true);
      adapter.lockOverflow();
      if (adapter.escToClose) adapter.addKeyListener();
      adapter.activateFocus();
    }
  }
  function syncVisible(visible: boolean) {
    if (adapter.inner !== visible) adapter.setInner(visible);
    if (visible) {
      adapter.onBeforeOpen();
      adapter.setMounted(true);
      adapter.beforeOpening();
      adapter.lockOverflow();
      adapter.addKeyListener();
      adapter.activateFocus();
    } else {
      adapter.invalidate();
      adapter.onBeforeClose();
      adapter.removeKeyListener();
      adapter.deactivateFocus();
    }
  }
  function syncEsc(enabled: boolean | undefined) {
    if (enabled && adapter.visible) adapter.addKeyListener();
    else adapter.removeKeyListener();
  }
  function opened() {
    if (adapter.visible) adapter.onOpen();
  }
  function closed() {
    if (!adapter.visible) {
      adapter.beforeClosed();
      adapter.setMounted(false);
      adapter.resetOverflow();
      adapter.onClose();
    }
  }
  function dispose() {
    adapter.invalidate();
    adapter.releasePopup();
    adapter.resetOverflow();
    adapter.removeKeyListener();
  }
  return { escape, mount, syncVisible, syncEsc, opened, closed, dispose };
}

export function createDialogMask(adapter: {
  readonly mask: boolean | undefined;
  readonly closable: boolean | undefined;
  isMaskTarget(event: Event): boolean;
  isWrapperTarget(event: Event): boolean;
  cancel(event: Event): void;
}) {
  let startedOnMask = false;
  return {
    reset() {
      startedOnMask = false;
    },
    down(event: Event) {
      if (adapter.isMaskTarget(event) || adapter.isWrapperTarget(event)) startedOnMask = true;
    },
    click(event: Event) {
      if (!adapter.isMaskTarget(event) && !startedOnMask) return;
      if (adapter.mask && adapter.closable) adapter.cancel(event);
      startedOnMask = false;
    },
  };
}

export function clickDrawerMask(
  closable: boolean | undefined,
  event: Event,
  cancel: (event: Event) => void,
) {
  if (closable) cancel(event);
}
