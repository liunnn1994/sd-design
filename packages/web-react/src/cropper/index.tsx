import type {
  CropperProps as CoreCropperProps,
  CropperSelectionChangeDetail,
  CropperImageTransformDetail,
} from '@sdata/web-core/cropper/types';
import type { ComponentPropsWithoutRef, CSSProperties, Ref } from 'react';

import { createCropper, getCropperRootStyle } from '@sdata/web-core/cropper/foundation';
import { useImperativeHandle, useLayoutEffect, useRef } from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { usePrefix } from '../config-provider/index.js';

export type {
  CropperCanvasProps,
  CropperImageProps,
  CropperSelectionProps,
  CropperSelectionChangeDetail,
  CropperImageTransformDetail,
} from '@sdata/web-core/cropper/types';
export type CropperExpose = Pick<
  ReturnType<typeof createCropper>,
  | 'getInstance'
  | 'getCropperCanvas'
  | 'getCropperImage'
  | 'getCropperSelection'
  | 'getCropperSelections'
  | 'destroy'
>;
export type CropperInstance = CropperExpose;
export interface CropperProps
  extends CoreCropperProps, Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  ref?: Ref<CropperExpose>;
  onSelectionChange?(detail: CropperSelectionChangeDetail): void;
  onSelectionXChange?(value: number): void;
  onSelectionYChange?(value: number): void;
  onSelectionWidthChange?(value: number): void;
  onSelectionHeightChange?(value: number): void;
  onImageTransform?(detail: CropperImageTransformDetail): void;
  onCanvasAction?(detail: unknown): void;
  onCanvasActionStart?(detail: unknown): void;
  onCanvasActionMove?(detail: unknown): void;
  onCanvasActionEnd?(detail: unknown): void;
}
const emptyProps = {};

export function Cropper(props: CropperProps) {
  const {
    ref,
    src = '',
    width = '100%',
    height = '100%',
    fitSelectionToImage = true,
    canvasProps = emptyProps,
    imageProps = emptyProps,
    selectionProps = emptyProps,
    template: _template,
    selectionX,
    selectionY,
    selectionWidth,
    selectionHeight,
    onSelectionChange: _onSelectionChange,
    onSelectionXChange: _onSelectionXChange,
    onSelectionYChange: _onSelectionYChange,
    onSelectionWidthChange: _onSelectionWidthChange,
    onSelectionHeightChange: _onSelectionHeightChange,
    onImageTransform: _onImageTransform,
    onCanvasAction: _onCanvasAction,
    onCanvasActionStart: _onCanvasActionStart,
    onCanvasActionMove: _onCanvasActionMove,
    onCanvasActionEnd: _onCanvasActionEnd,
    className,
    style,
    ...attrs
  } = props;
  const latest = useRef(props);
  latest.current = {
    ...props,
    src,
    width,
    height,
    fitSelectionToImage,
    canvasProps,
    imageProps,
    selectionProps,
  };
  const image = useRef<HTMLImageElement>(null);
  const foundation = useRef<ReturnType<typeof createCropper> | null>(null);
  const afterRender = useAfterRender();
  const prefix = usePrefix('cropper');
  useImperativeHandle(
    ref,
    () => ({
      getInstance: () => foundation.current?.getInstance() ?? null,
      getCropperCanvas: () => foundation.current?.getCropperCanvas() ?? null,
      getCropperImage: () => foundation.current?.getCropperImage() ?? null,
      getCropperSelection: () => foundation.current?.getCropperSelection() ?? null,
      getCropperSelections: () => foundation.current?.getCropperSelections() ?? null,
      destroy: () => foundation.current?.destroy(),
    }),
    [],
  );
  useLayoutEffect(() => {
    let active = true;
    // A destroyed Foundation cannot remount; StrictMode needs a fresh instance per effect.
    const instance = createCropper({
      get props() {
        return {
          ...latest.current,
          canvasProps: latest.current.canvasProps ?? emptyProps,
          imageProps: latest.current.imageProps ?? emptyProps,
          selectionProps: latest.current.selectionProps ?? emptyProps,
        };
      },
      get imageElement() {
        return image.current ?? undefined;
      },
      afterRender: async (callback) => {
        await afterRender();
        if (active) callback();
      },
      selectionChange: (detail) => latest.current.onSelectionChange?.(detail),
      updateSelectionX: (value) => latest.current.onSelectionXChange?.(value),
      updateSelectionY: (value) => latest.current.onSelectionYChange?.(value),
      updateSelectionWidth: (value) => latest.current.onSelectionWidthChange?.(value),
      updateSelectionHeight: (value) => latest.current.onSelectionHeightChange?.(value),
      imageTransform: (detail) => latest.current.onImageTransform?.(detail),
      canvasEvents: {
        action: (detail) => latest.current.onCanvasAction?.(detail),
        actionstart: (detail) => latest.current.onCanvasActionStart?.(detail),
        actionmove: (detail) => latest.current.onCanvasActionMove?.(detail),
        actionend: (detail) => latest.current.onCanvasActionEnd?.(detail),
      },
    });
    foundation.current = instance;
    void instance.mount();
    return () => {
      active = false;
      instance.destroy();
      foundation.current = null;
    };
  }, [afterRender]);
  useLayoutEffect(() => {
    foundation.current?.syncSource(src);
  }, [src]);
  useLayoutEffect(() => {
    foundation.current?.syncCanvasProps();
  }, [canvasProps]);
  useLayoutEffect(() => {
    foundation.current?.syncImageProps();
  }, [imageProps]);
  useLayoutEffect(() => {
    foundation.current?.syncSelectionProps();
  }, [selectionProps]);
  useLayoutEffect(() => {
    foundation.current?.syncSelectionGeometry();
  }, [selectionX, selectionY, selectionWidth, selectionHeight]);
  useLayoutEffect(() => {
    foundation.current?.scheduleAlignOnLoad();
  }, [fitSelectionToImage]);
  return (
    <div
      {...attrs}
      className={[prefix, className].filter(Boolean).join(' ')}
      style={{ ...(getCropperRootStyle(width, height) as CSSProperties), ...style }}
    >
      <img ref={image} src={src} alt="" className={`${prefix}-source-image`} />
    </div>
  );
}
export default Cropper;
