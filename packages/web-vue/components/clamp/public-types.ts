// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
// Keep the package entry as an explicit barrel so the public surface stays auditable.
// Internal helpers are intentionally not re-exported from here.

export type { ClampBoundary, ClampLength, LineClampLocation } from './types';

export type {
  InlineClampParts,
  InlineClampProps,
  InlineClampSplit,
} from '@sdata/web-core/clamp/inline/types';

export type {
  LineClampExposed,
  LineClampProps,
  LineClampSlotProps,
  LineClampSlots,
} from './line/types';

export type {
  RichLineClampExposed,
  RichLineClampProps,
  RichLineClampSlotProps,
  RichLineClampSlots,
} from './rich-line/types';

export type {
  WrapClampExposed,
  WrapClampItemKey,
  WrapClampItemSlotProps,
  WrapClampProps,
  WrapClampSlotProps,
  WrapClampSlots,
} from './wrap/types';
