import type { MarkdownImageLifecycle } from '@sdata/web-core/markdown/image';

import { createContext } from 'react';

export const MarkdownNodeLifecycleContext = createContext<MarkdownImageLifecycle | undefined>(
  undefined,
);
