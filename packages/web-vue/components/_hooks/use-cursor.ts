import type { CursorSelection } from '@sdata/web-core/text-input/cursor';

import { ref, Ref } from 'vue';

import { createCursorFoundation } from '@sdata/web-core/text-input/cursor';

// Refer to Element Plus
export function useCursor(input: Ref<HTMLInputElement | undefined>): [() => void, () => void] {
  const selectionRef = ref<CursorSelection>();
  const { recordCursor, setCursor } = createCursorFoundation({
    get input() {
      return input.value;
    },
    get selection() {
      return selectionRef.value;
    },
    set selection(value) {
      selectionRef.value = value;
    },
  });
  return [recordCursor, setCursor];
}
