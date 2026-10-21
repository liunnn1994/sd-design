import type { TagProps as CoreTagProps } from '@sdata/web-core/tag/types';

import type { EllipsisTooltipProps } from '../ellipsis';
export { TAG_COLORS } from '@sdata/web-core/tag/types';
export type { TagColor } from '@sdata/web-core/tag/types';
export interface TagProps extends CoreTagProps<EllipsisTooltipProps> {}
