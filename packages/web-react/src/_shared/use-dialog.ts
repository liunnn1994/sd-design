import type { BeforeOk } from '@sdata/web-core/dialog/confirmation';

import { getScrollBarWidth, isScroll } from '@sdata/web-core/_utils/dom';
import { createConfirmationFoundation } from '@sdata/web-core/dialog/confirmation';
import { createDialogFoundation } from '@sdata/web-core/dialog/foundation';
import { createFocusTrap, getFocusableElements } from '@sdata/web-core/popup/focus-trap';
import { createPopupEntry } from '@sdata/web-core/popup/manager';
import { createOverflowController } from '@sdata/web-core/popup/overflow';
import { runCssTransition } from '@sdata/web-core/transition/css';
import { useLayoutEffect, useRef, useState } from 'react';

export interface DialogOptions {
  visible?: boolean;
  defaultVisible?: boolean;
  popupContainer?: string | HTMLElement;
  renderToBody?: boolean;
  escToClose?: boolean;
  animationName: string;
  transitionKey?: string;
  maskAnimationName: string;
  closeSelector: string;
  onBeforeOk?: BeforeOk;
  onBeforeCancel?: () => boolean;
  onVisibleChange?: (visible: boolean) => void;
  onOk?: (event: Event) => void;
  onCancel?: (event: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onBeforeOpen?: () => void;
  onBeforeClose?: () => void;
  beforeOpening?: () => void;
  beforeClosed?: () => void;
}
export function useDialog({
  visible: controlled,
  defaultVisible = false,
  popupContainer = 'body',
  renderToBody = true,
  escToClose = true,
  animationName,
  maskAnimationName,
  transitionKey,
  closeSelector,
  onBeforeOk,
  onBeforeCancel,
  onVisibleChange,
  onOk,
  onCancel,
  onOpen,
  onClose,
  onBeforeOpen,
  onBeforeClose,
  beforeOpening,
  beforeClosed,
}: DialogOptions) {
  const [inner, setInner] = useState(defaultVisible);
  const visible = controlled ?? inner;
  const [mounted, setMounted] = useState(visible);
  const [container, setContainer] = useState<HTMLElement>();
  const [portalContainer, setPortalContainer] = useState<HTMLElement>();
  const [loading, setLoading] = useState(false);
  const [zIndex, setZIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const live = useRef({
    visible,
    inner,
    escToClose,
    container,
    zIndex,
    loading,
    onBeforeOk,
    onBeforeCancel,
    onVisibleChange,
    onOk,
    onCancel,
    onOpen,
    onClose,
    onBeforeOpen,
    onBeforeClose,
    beforeOpening,
    beforeClosed,
  });
  live.current = {
    visible,
    inner,
    escToClose,
    container,
    zIndex,
    loading,
    onBeforeOk,
    onBeforeCancel,
    onVisibleChange,
    onOk,
    onCancel,
    onOpen,
    onClose,
    onBeforeOpen,
    onBeforeClose,
    beforeOpening,
    beforeClosed,
  };
  const [controller] = useState(() => {
    const confirmation = createConfirmationFoundation<[Event]>({
      get callbacks() {
        return live.current;
      },
      get loading() {
        return live.current.loading;
      },
      setLoading(value) {
        live.current.loading = value;
        setLoading(value);
      },
      setVisible: setInner,
      onVisibleChange: (value) => live.current.onVisibleChange?.(value),
      onOk: (event) => live.current.onOk?.(event),
      onCancel: (event) => live.current.onCancel?.(event),
    });
    const entry = createPopupEntry('dialog', {
      get zIndex() {
        return live.current.zIndex;
      },
      setZIndex(value) {
        live.current.zIndex = value;
        setZIndex(value);
      },
    });
    const overflow = createOverflowController({
      get element() {
        return live.current.container;
      },
      getScrollBarWidth,
      isScroll,
    });
    const focus = createFocusTrap(() => dialogRef.current ?? undefined, {
      initialFocus: (element) =>
        getFocusableElements(element).find((node) => !node.closest(closeSelector)),
    });
    const keydown = (event: KeyboardEvent) => dialog.escape(event);
    const dialog = createDialogFoundation({
      get visible() {
        return live.current.visible;
      },
      get inner() {
        return live.current.inner;
      },
      get escToClose() {
        return live.current.escToClose;
      },
      setInner,
      setMounted,
      isLastDialog: entry.isLastDialog,
      cancel: confirmation.cancel,
      invalidate: confirmation.invalidate,
      onBeforeOpen: () => live.current.onBeforeOpen?.(),
      onBeforeClose: () => live.current.onBeforeClose?.(),
      onOpen: () => live.current.onOpen?.(),
      onClose: () => live.current.onClose?.(),
      beforeOpening() {
        entry.open();
        live.current.beforeOpening?.();
      },
      beforeClosed() {
        live.current.beforeClosed?.();
      },
      lockOverflow: overflow.lock,
      resetOverflow: overflow.reset,
      addKeyListener: () => document.documentElement.addEventListener('keydown', keydown),
      removeKeyListener: () => document.documentElement.removeEventListener('keydown', keydown),
      activateFocus: focus.activate,
      deactivateFocus: focus.deactivate,
      releasePopup: entry.close,
    });
    return { confirmation, entry, overflow, focus, dialog };
  });
  useLayoutEffect(() => {
    setPortalContainer((current) => {
      if (current) return current;
      const host = document.createElement('div');
      host.style.display = 'contents';
      return host;
    });
    setContainer(
      (typeof popupContainer === 'string'
        ? document.querySelector<HTMLElement>(popupContainer)
        : popupContainer) ?? document.body,
    );
  }, [popupContainer, visible]);
  useLayoutEffect(() => {
    if (!container || !portalContainer) return;
    if (!renderToBody) {
      portalContainer.remove();
      return;
    }
    // Keep React's portal target stable so moving the popup preserves child state.
    const focused = document.activeElement;
    const restoreFocus = focused instanceof HTMLElement && portalContainer.contains(focused);
    container.appendChild(portalContainer);
    if (restoreFocus) focused.focus({ preventScroll: true });
  }, [container, portalContainer, renderToBody]);
  useLayoutEffect(() => () => portalContainer?.remove(), [portalContainer]);
  useLayoutEffect(() => {
    if (!container) return;
    controller.overflow.syncElement();
  }, [container, controller]);
  const ready = !!container && !!portalContainer;
  const previous = useRef<boolean | undefined>(undefined);
  useLayoutEffect(() => {
    if (!ready) return;
    if (visible) controller.entry.open();
    else controller.entry.close();
    if (previous.current === undefined) controller.dialog.mount();
    else if (previous.current !== visible) controller.dialog.syncVisible(visible);
    previous.current = visible;
    if (!visible && !mounted) return;
    const element = dialogRef.current;
    if (!element) return;
    const cancelMask =
      maskRef.current &&
      runCssTransition(maskRef.current, {
        name: maskAnimationName,
        enter: visible,
        finish() {},
      });
    const cancelDialog = runCssTransition(element, {
      name: animationName,
      enter: visible,
      finish: visible ? controller.dialog.opened : controller.dialog.closed,
    });
    return () => {
      cancelMask?.();
      cancelDialog();
    };
    // Changing animation names (for fullscreen) does not open the dialog again.
  }, [visible, ready, transitionKey, controller]);
  useLayoutEffect(() => {
    controller.dialog.syncEsc(escToClose);
  }, [escToClose, controller]);
  useLayoutEffect(
    () => () => {
      controller.focus.deactivate();
      controller.dialog.dispose();
      previous.current = undefined;
    },
    [controller],
  );
  return {
    visible,
    mounted,
    container,
    portalContainer,
    loading,
    zIndex,
    dialogRef,
    maskRef,
    controller,
  };
}
