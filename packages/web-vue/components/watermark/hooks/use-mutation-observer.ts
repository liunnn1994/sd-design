import type { MutationObserverOptions } from '@sdata/web-core/watermark/observer';

import { unref, watch, getCurrentScope, onScopeDispose, Ref, ComponentPublicInstance } from 'vue';

import { createWatermarkObserver } from '@sdata/web-core/watermark/observer';
export { defaultWindow } from '@sdata/web-core/watermark/observer';
export type { MutationObserverOptions } from '@sdata/web-core/watermark/observer';

export type MaybeRef<T> = T | Ref<T>;
export type MaybeElement = HTMLElement | SVGElement | ComponentPublicInstance | undefined | null;
export type UnRefElementReturn<T extends MaybeElement = MaybeElement> =
  T extends ComponentPublicInstance
    ? Exclude<MaybeElement, ComponentPublicInstance>
    : T | undefined;

export type Fn = () => void;

export function unrefElement<T extends MaybeElement>(elRef: MaybeRef<T>): UnRefElementReturn<T> {
  const plain = unref(elRef);
  return (plain as ComponentPublicInstance)?.$el ?? plain;
}

export function tryOnScopeDispose(fn: Fn): boolean {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}

export function useMutationObserver(
  target: MaybeRef<MaybeElement>,
  callback: MutationCallback,
  options: MutationObserverOptions = {},
) {
  const observer = createWatermarkObserver(callback, options);
  const stopWatch = watch(
    () => unrefElement(target),
    (el) => observer.observe(el),
    { immediate: true },
  );

  const stop = () => {
    observer.stop();
    stopWatch();
  };

  tryOnScopeDispose(stop);

  return {
    isSupported: observer.isSupported,
    stop,
  };
}

export type UseMutationObserverReturn = ReturnType<typeof useMutationObserver>;
