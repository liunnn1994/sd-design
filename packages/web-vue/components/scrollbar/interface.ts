import type { ScrollbarProps as CoreScrollbarProps } from '@sdata/web-core/scrollbar/types';

import type { StyleValue } from 'vue';
export type {
  ScrollbarType,
  ScrollbarClickScrollBehaviorOptions,
  ScrollbarClickScrollBehavior,
  ScrollbarUpdateDebounceValue,
  ScrollbarUpdateOptions,
  ScrollbarOverflowOptions,
  ScrollbarScrollbarsOptions,
  ScrollbarOptions,
  ScrollbarOptionsResolved,
  ScrollbarReadonlyOptions,
  ScrollbarEventListeners,
  ScrollbarEventListenerArgs,
  ScrollbarEventListener,
  ScrollbarUpdatedEvent,
  ScrollbarElements,
  ScrollbarState,
  ScrollbarPlugin,
  ScrollbarExpose,
} from '@sdata/web-core/scrollbar/types';
export interface ScrollbarProps extends CoreScrollbarProps<StyleValue> {}
