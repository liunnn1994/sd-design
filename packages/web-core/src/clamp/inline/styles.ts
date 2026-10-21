// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampStyle as CSSProperties } from '../style-types.js';

// InlineClamp measures a single inline-block because affixes and middle
// truncation cannot be represented by native text-overflow.
export const inlineClampRootStyle: CSSProperties = {
  display: 'inline-block',
  maxWidth: '100%',
  minWidth: '0',
  overflow: 'hidden',
  position: 'relative',
  whiteSpace: 'nowrap',
  verticalAlign: 'baseline',
};
