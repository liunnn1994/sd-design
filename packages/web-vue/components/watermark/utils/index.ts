import type { CSSProperties } from 'vue';

import { styleToString as coreStyleToString } from '@sdata/web-core/watermark/utils';
export { camelToKebab, canvasToGray } from '@sdata/web-core/watermark/utils';
export const styleToString: (style: CSSProperties) => string = coreStyleToString;
