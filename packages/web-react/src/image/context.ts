import type { PreviewGroupContext } from '@sdata/web-core/image/types';

import { createContext } from 'react';

export const ImageGroupContext = createContext<PreviewGroupContext | undefined>(undefined);
