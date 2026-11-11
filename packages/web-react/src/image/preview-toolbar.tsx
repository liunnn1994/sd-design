import type { ReactNode } from 'react';

import { getPreviewActions } from '@sdata/web-core/image/foundation';

import type { ImagePreviewActionProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import { ImagePreviewAction } from './preview-action.js';

export interface PreviewAction extends ImagePreviewActionProps {
  key: string;
}
export function ImagePreviewToolbar({
  actions,
  actionsLayout,
  children,
}: {
  actions: PreviewAction[];
  actionsLayout: string[];
  children?: ReactNode;
}) {
  const prefix = usePrefix('image-preview-toolbar');
  return (
    <div className={prefix}>
      {getPreviewActions(actions, actionsLayout).map(({ key, ...action }) => (
        <ImagePreviewAction key={key} {...action} />
      ))}
      {children}
    </div>
  );
}
