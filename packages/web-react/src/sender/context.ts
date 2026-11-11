import { createContext } from 'react';

import type { SenderProps } from './types.js';
export const SenderContext = createContext<
  | { prefix: string; classNames: SenderProps['classNames']; styles: SenderProps['styles'] }
  | undefined
>(undefined);
