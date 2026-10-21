// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampStyle as CSSProperties } from '../style-types.js';

// WrapClamp treats each rendered item and slot as an atomic inline-flex box. It
// never clips through an item because callers own item rendering semantics.
export const itemStyle: CSSProperties = {
  display: 'inline-flex',
  maxWidth: '100%',
  verticalAlign: 'baseline',
  whiteSpace: 'nowrap',
};

export const hiddenItemStyle: CSSProperties = {
  ...itemStyle,
  display: 'none',
};

export const contentStyle: CSSProperties = {
  display: 'inline-flex',
  flexWrap: 'wrap',
  maxWidth: '100%',
  width: '100%',
};
