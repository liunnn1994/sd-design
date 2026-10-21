// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampStyle as CSSProperties } from './style-types.js';

// Slot wrappers are inline-flex so before/after controls participate in the same
// line box as text while staying atomic during measurement.
export const multilineSlotStyle: CSSProperties = {
  display: 'inline-flex',
  flexWrap: 'nowrap',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  verticalAlign: 'baseline',
};

export const multilineNativeSlotStyle: CSSProperties = {
  ...multilineSlotStyle,
  flex: 'none',
};
