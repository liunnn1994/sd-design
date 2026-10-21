import { isBoolean, isFunction, isPromise } from '../_utils/is.js';

export type BeforeOk = (
  done: (closed: boolean) => void,
) => void | boolean | Promise<void | boolean>;

export function createConfirmationFoundation<Args extends unknown[]>(adapter: {
  readonly callbacks: { onBeforeOk?: BeforeOk; onBeforeCancel?: () => boolean };
  readonly loading: boolean;
  setLoading(value: boolean): void;
  setVisible(value: boolean): void;
  onVisibleChange(value: boolean): void;
  onOk(...args: Args): void;
  onCancel(...args: Args): void;
}) {
  let version = 0;
  function invalidate() {
    version++;
    if (adapter.loading) adapter.setLoading(false);
  }
  function close() {
    invalidate();
    adapter.setVisible(false);
    adapter.onVisibleChange(false);
  }
  function changeVisible(visible: boolean) {
    if (!visible) close();
    else {
      adapter.setVisible(visible);
      adapter.onVisibleChange(visible);
    }
  }
  async function ok(...args: Args) {
    const current = version;
    const closed = await new Promise<boolean>((resolve) => {
      try {
        if (isFunction(adapter.callbacks.onBeforeOk)) {
          const result = adapter.callbacks.onBeforeOk((closed = true) => resolve(closed));
          if (isPromise(result) || !isBoolean(result)) adapter.setLoading(true);
          if (isPromise(result)) {
            result.then(
              (value) => resolve(value ?? true),
              () => resolve(false),
            );
          } else if (isBoolean(result)) resolve(result);
        } else resolve(true);
      } catch {
        resolve(false);
      }
    });
    if (current === version) {
      if (closed) {
        adapter.onOk(...args);
        close();
      } else if (adapter.loading) adapter.setLoading(false);
    }
  }
  function cancel(...args: Args) {
    if (
      isFunction(adapter.callbacks.onBeforeCancel) &&
      adapter.callbacks.onBeforeCancel() === false
    )
      return;
    adapter.onCancel(...args);
    close();
  }
  return { invalidate, close, changeVisible, ok, cancel };
}
