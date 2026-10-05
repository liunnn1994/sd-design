import type { RowProps } from '../interface';

// Both directions accept a fixed gap or responsive breakpoint values.
const gutters = [
  16,
  { xs: 8, md: 16 },
  [16, 24],
  [16, { xs: 8, md: 24 }],
  [{ xs: 8, md: 16 }, 24],
  [{ xs: 8 }, { md: 24 }],
] satisfies RowProps['gutter'][];

void gutters;
