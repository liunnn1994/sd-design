// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampStyle as CSSProperties } from './style-types.js';

// Keep source text available to assistive technology without letting it change
// the measured inline layout used for clamp decisions.
export const visuallyHiddenTextStyle: CSSProperties = {
  clipPath: 'inset(50%)',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};
