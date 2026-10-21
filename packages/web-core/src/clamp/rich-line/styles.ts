// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampStyle as CSSProperties } from '../style-types.js';

// Rich candidates are measured in an off-screen connected tree. Connected
// measurement preserves browser inline layout while keeping candidate churn out
// of the visible DOM.
export const richProbeStyle: CSSProperties = {
  display: 'block',
  left: '-99999px',
  pointerEvents: 'none',
  position: 'absolute',
  top: '0',
  visibility: 'hidden',
};
