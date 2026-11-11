import type { CascaderLoader } from '@sdata/web-core/cascader/lazy-load';
import type { CascaderOption as CoreOption } from '@sdata/web-core/cascader/types';

import type { TagProps } from '../tag/index.js';
import type { CascaderProps } from './cascader.js';

import { Cascader as CascaderRoot } from './cascader.js';
import { CascaderPanel } from './panel.js';

export const Cascader = Object.assign(CascaderRoot, { CascaderPanel });
export { CascaderPanel };
export type { CascaderProps, CascaderInstance, CascaderTriggerState } from './cascader.js';
export type { CascaderPanelProps } from './panel.js';
export type {
  CascaderFieldNames,
  CascaderModelValue,
  CascaderOptionValue,
  CascaderPathValue,
  CascaderSingleValue,
} from '@sdata/web-core/cascader/types';
export type CascaderOption = CoreOption<TagProps>;
export type CascaderLoadMore = CascaderLoader<TagProps>;
export type CascaderChangeHandler = NonNullable<CascaderProps['onChange']>;
export type CascaderSearchHandler = NonNullable<CascaderProps['onSearch']>;
export type CascaderFormatLabel = NonNullable<CascaderProps['formatLabel']>;
export type CascaderFallback = Exclude<CascaderProps['fallback'], boolean | undefined>;
export default Cascader;
