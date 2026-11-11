import { ImageView } from './image.js';
import { ImagePreviewGroup } from './preview-group.js';
import { ImagePreview } from './preview.js';

export const Image = Object.assign(ImageView, {
  Preview: ImagePreview,
  PreviewGroup: ImagePreviewGroup,
});
export { ImagePreview, ImagePreviewGroup };
export { ImagePreviewAction } from './preview-action.js';
export type {
  ImageProps,
  ImagePreviewProps,
  ImagePreviewGroupProps,
  ImagePreviewActionProps,
  ImagePreviewArrowProps,
  ImageInstance,
  ImagePreviewInstance,
  ImagePreviewGroupInstance,
  ImagePreviewActionInstance,
} from './types.js';
