import type { AvatarGroupContext as CoreContext } from '@sdata/web-core/avatar/types';

import { createContext } from 'react';

export const AvatarGroupContext = createContext<(CoreContext & { index: number }) | undefined>(
  undefined,
);
