export const SIZES = ['default', 'small'] as const;
export type SizeType = (typeof SIZES)[number];
