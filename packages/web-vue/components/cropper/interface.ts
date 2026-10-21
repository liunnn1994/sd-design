import type Cropper from 'cropperjs';
import type { CropperCanvas, CropperImage, CropperSelection } from 'cropperjs';

export type {
  CropperCanvasProps,
  CropperImageProps,
  CropperSelectionProps,
  CropperSelectionChangeDetail,
  CropperImageTransformDetail,
  CropperProps,
} from '@sdata/web-core/cropper/types';

export interface CropperExpose {
  getInstance(): Cropper | null;
  getCropperCanvas(): CropperCanvas | null;
  getCropperImage(): CropperImage | null;
  getCropperSelection(): CropperSelection | null;
  getCropperSelections(): ReturnType<Cropper['getCropperSelections']> | null;
  destroy(): void;
}
