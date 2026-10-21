export const defaultWindow = typeof window !== 'undefined' ? window : undefined;

export interface MutationObserverOptions extends MutationObserverInit {
  window?: Window;
}

export function createWatermarkObserver(
  callback: MutationCallback,
  options: MutationObserverOptions = {},
) {
  const { window = defaultWindow, ...mutationOptions } = options;
  const isSupported = window && 'MutationObserver' in window;
  let observer: MutationObserver | undefined;
  const stop = () => {
    if (observer) {
      observer.disconnect();
      observer = undefined;
    }
  };
  return {
    isSupported,
    stop,
    observe(element: Node | undefined | null) {
      stop();
      if (isSupported && window && element) {
        observer = new (
          window as Window & Pick<typeof globalThis, 'MutationObserver'>
        ).MutationObserver(callback);
        observer.observe(element, mutationOptions);
      }
    },
  };
}
