import type {
  MutableCell,
  MultilineState,
  createMultilineClamp,
} from '@sdata/web-core/clamp/multiline';
import type { NativeClampMode } from '@sdata/web-core/clamp/native';
import type { ClampSlotProps } from '@sdata/web-core/clamp/types';
import type { ReactNode } from 'react';

import {
  multilineNativeSlotStyle,
  multilineSlotStyle,
} from '@sdata/web-core/clamp/multiline-styles';
import { useLayoutEffect, useState } from 'react';

export type ClampAffix = ReactNode | ((state: ClampSlotProps) => ReactNode);
type MultilineController = ReturnType<typeof createMultilineClamp>;

export function useCellFactory() {
  const [, rerender] = useState(0);
  return useState(() => <T,>(initial: T): MutableCell<T> => {
    let current = initial;
    return {
      get value() {
        return current;
      },
      set value(next) {
        if (!Object.is(next, current)) {
          current = next;
          rerender((version) => version + 1);
        }
      },
    };
  })[0];
}

export function useMultilineLifecycle(
  controller: MultilineController,
  state: MultilineState,
  active: boolean,
  nativeMode: NativeClampMode | null,
) {
  useLayoutEffect(() => {
    controller.mount();
    return controller.dispose;
  }, [controller]);
  useLayoutEffect(
    () => controller.observe(),
    [
      controller,
      active,
      nativeMode,
      state.rootRef.value,
      state.contentRef.value,
      state.beforeRef.value,
      state.afterRef.value,
    ],
  );
  useLayoutEffect(() => controller.listenFonts(), [controller, active]);
  useLayoutEffect(() => controller.updated());
}

export function renderClampAffix(
  part: 'before' | 'after',
  content: ClampAffix,
  controller: MultilineController,
  nativeMode: NativeClampMode | null,
) {
  const node = typeof content === 'function' ? content(controller.affixSlotProps()) : content;
  if (node == null || typeof node === 'boolean') return null;
  return (
    <span
      data-part={part}
      ref={part === 'before' ? controller.setBeforeElement : controller.setAfterElement}
      style={nativeMode === 'single-line' ? multilineNativeSlotStyle : multilineSlotStyle}
    >
      {node}
    </span>
  );
}
