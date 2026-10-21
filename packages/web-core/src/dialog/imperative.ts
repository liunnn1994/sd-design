import { isFunction } from '../_utils/is.js';

export function createModalInstance(adapter: {
  readonly callbacks: {
    onClose?: () => void;
    onOk?: (event?: Event) => void;
    onCancel?: (event?: Event) => void;
  };
  setVisible(value: boolean): void;
  destroy(): void;
  remove(): void;
  afterRender(): Promise<unknown>;
}) {
  let destroyed = false;
  let notifiedClose = false;
  function notifyClose() {
    if (!notifiedClose) {
      notifiedClose = true;
      if (isFunction(adapter.callbacks.onClose)) adapter.callbacks.onClose();
    }
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    adapter.destroy();
    adapter.remove();
  }
  function close() {
    if (destroyed) return;
    adapter.setVisible(false);
    notifyClose();
  }
  function ok() {
    close();
    if (isFunction(adapter.callbacks.onOk)) adapter.callbacks.onOk();
  }
  function cancel() {
    close();
    if (isFunction(adapter.callbacks.onCancel)) adapter.callbacks.onCancel();
  }
  async function afterClose() {
    await adapter.afterRender();
    destroy();
    notifyClose();
  }
  return { destroy, close, ok, cancel, afterClose };
}

export function createDrawerInstance(adapter: {
  readonly callbacks: {
    onClose?: () => void;
    onOk?: (event?: Event) => void;
    onCancel?: (event?: Event) => void;
  };
  setVisible(value: boolean): void;
  destroy(): void;
  afterRender(): Promise<unknown>;
}) {
  function close() {
    adapter.setVisible(false);
  }
  function ok() {
    close();
    if (isFunction(adapter.callbacks.onOk)) adapter.callbacks.onOk();
  }
  function cancel() {
    close();
    if (isFunction(adapter.callbacks.onCancel)) adapter.callbacks.onCancel();
  }
  async function afterClose() {
    await adapter.afterRender();
    adapter.destroy();
    if (isFunction(adapter.callbacks.onClose)) adapter.callbacks.onClose();
  }
  return { close, ok, cancel, afterClose };
}

export function createModalRegistry() {
  const destroyers: (() => void)[] = [];
  let config: { simple?: boolean } = { simple: true };
  return {
    get config() {
      return config;
    },
    configure(value: { simple?: boolean }) {
      config = { ...config, ...value };
    },
    add(destroy: () => void) {
      destroyers.push(destroy);
    },
    remove(destroy: () => void) {
      const index = destroyers.findIndex((item) => item === destroy);
      if (index > -1) destroyers.splice(index, 1);
    },
    destroyAll() {
      while (destroyers.length) destroyers.pop()?.();
    },
  };
}
