import type { CascaderOptionContext } from '@sdata/web-core/cascader/option';
import type { CascaderOptionInfo } from '@sdata/web-core/cascader/types';
import type { ReactNode } from 'react';

import { createContext } from 'react';

import type { TagProps } from '../tag/index.js';

export interface CascaderContextValue extends Partial<CascaderOptionContext<TagProps>> {
  ellipsis?: boolean | 'performant-ellipsis';
  renderOption?: ((option: CascaderOptionInfo<TagProps>) => ReactNode) | undefined;
}
export const CascaderContext = createContext<CascaderContextValue>({});
