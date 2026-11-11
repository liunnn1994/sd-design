import { activatePreviewArrow } from '@sdata/web-core/image/foundation';

import type { ImagePreviewArrowProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import { IconLeft } from '../icon/icon-left.js';
import { IconRight } from '../icon/icon-right.js';

export function ImagePreviewArrow({ onPrev, onNext }: ImagePreviewArrowProps) {
  const prefix = usePrefix('image-preview-arrow');
  return (
    <div className={prefix}>
      <div
        className={[`${prefix}-left`, !onPrev && `${prefix}-disabled`].filter(Boolean).join(' ')}
        onClick={(event) => activatePreviewArrow(event, onPrev)}
      >
        <IconLeft />
      </div>
      <div
        className={[`${prefix}-right`, !onNext && `${prefix}-disabled`].filter(Boolean).join(' ')}
        onClick={(event) => activatePreviewArrow(event, onNext)}
      >
        <IconRight />
      </div>
    </div>
  );
}
