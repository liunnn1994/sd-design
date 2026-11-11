import type { ReactNode } from 'react';

export const hasContent = (value: ReactNode) =>
  value !== undefined && value !== null && value !== false && value !== '';
