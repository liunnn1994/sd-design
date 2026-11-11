import type { ComponentRef as ReactComponentRef } from 'react';

import type { InlineClamp } from './inline.js';
import type { LineClamp } from './line.js';
import type { LineClampProps } from './line.js';
import type { RichLineClamp } from './rich-line.js';
import type { RichLineClampProps } from './rich-line.js';
import type { WrapClamp } from './wrap.js';
import type { WrapClampProps } from './wrap.js';

export type LineClampSlots = Pick<LineClampProps, 'before' | 'after'>;
export type RichLineClampSlots = Pick<RichLineClampProps, 'before' | 'after'>;
export type WrapClampSlots<T = unknown> = Pick<
  WrapClampProps<T>,
  'before' | 'after' | 'renderItem'
>;

export { RichLineClamp } from './rich-line.js';
export type { RichLineClampProps } from './rich-line.js';
export type {
  ClampExposed,
  ClampSlotProps,
  ClampBoundary,
  ClampLength,
  LineClampLocation,
  ClampExposed as LineClampExposed,
  ClampExposed as RichLineClampExposed,
  ClampSlotProps as LineClampSlotProps,
  ClampSlotProps as RichLineClampSlotProps,
} from '@sdata/web-core/clamp/types';
export { LineClamp, LineClamp as default } from './line.js';
export type { LineClampProps } from './line.js';
export { InlineClamp } from './inline.js';
export type { InlineClampProps } from './inline.js';
export type { InlineClampParts, InlineClampSplit } from '@sdata/web-core/clamp/inline/types';
export { WrapClamp } from './wrap.js';
export type { WrapClampProps } from './wrap.js';
export type {
  WrapClampExposed,
  WrapClampItemKey,
  WrapClampItemSlotProps,
  WrapClampSlotProps,
} from '@sdata/web-core/clamp/wrap/types';

export type InlineClampInstance = ReactComponentRef<typeof InlineClamp>;
export type LineClampInstance = ReactComponentRef<typeof LineClamp>;
export type RichLineClampInstance = ReactComponentRef<typeof RichLineClamp>;
export type WrapClampInstance = ReactComponentRef<typeof WrapClamp>;
