import type Cropper from 'cropperjs';
import type { CropperCanvas, CropperImage, CropperSelection } from 'cropperjs';
import type { UnknownRecord } from 'type-fest';

import { isNumber, isString } from 'es-toolkit';

import type {
  CropperProps,
  CropperCanvasProps,
  CropperImageProps,
  CropperSelectionProps,
  CropperSelectionChangeDetail,
  CropperImageTransformDetail,
} from './types.js';

import { loadCropper } from './engine.js';

type CropperEventListener = (event: Event) => void;
type TrackedHandler = { el: Element; event: string; fn: CropperEventListener };

export function resolveCropperSize(value: unknown) {
  if (isNumber(value)) return `${value}px`;
  if (isString(value)) return value;
  return '100%';
}
export function getCropperRootStyle(width: unknown, height: unknown) {
  return {
    '--sd-cropper-width': resolveCropperSize(width),
    '--sd-cropper-height': resolveCropperSize(height),
  };
}
export function createCropper(adapter: {
  readonly props: CropperProps & {
    canvasProps: CropperCanvasProps;
    imageProps: CropperImageProps;
    selectionProps: CropperSelectionProps;
  };
  readonly imageElement: HTMLImageElement | undefined;
  afterRender(callback: () => void): Promise<void>;
  loadConstructor?(): Promise<typeof import('cropperjs').default>;
  selectionChange(detail: CropperSelectionChangeDetail): void;
  updateSelectionX(value: number): void;
  updateSelectionY(value: number): void;
  updateSelectionWidth(value: number): void;
  updateSelectionHeight(value: number): void;
  imageTransform(detail: CropperImageTransformDetail): void;
  canvasEvents: Record<
    'action' | 'actionstart' | 'actionmove' | 'actionend',
    (detail: unknown) => void
  >;
}) {
  const trackedHandlers: TrackedHandler[] = [];
  let cropperInstance: Cropper | null = null;
  let destroyed = false;
  let selectionInitialized = true;
  let fittedImageElement: HTMLImageElement | null = null;
  let cropperConstructorPromise: Promise<typeof import('cropperjs').default> | null = null;
  function loadCropperConstructor() {
    if (!cropperConstructorPromise)
      cropperConstructorPromise = adapter.loadConstructor?.() ?? loadCropper();
    return cropperConstructorPromise;
  }
  function addTrackedListener(el: Element, event: string, fn: CropperEventListener) {
    el.addEventListener(event, fn);
    trackedHandlers.push({ el, event, fn });
  }

  function removeTrackedListener(el: Element, event: string, fn: CropperEventListener) {
    const index = trackedHandlers.findIndex(
      (handler) => handler.el === el && handler.event === event && handler.fn === fn,
    );
    if (index === -1) {
      return;
    }
    trackedHandlers.splice(index, 1);
    el.removeEventListener(event, fn);
  }

  function toKebabCase(key: string) {
    return key.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  const originalAttributes = new WeakMap<Element, Map<string, string | null>>();

  function syncPropsToElement(el: Element | null | undefined, propsObject: UnknownRecord) {
    if (!el) {
      return;
    }

    let originals = originalAttributes.get(el);
    if (!originals) {
      originals = new Map();
      originalAttributes.set(el, originals);
    }
    for (const [key, original] of originals) {
      if (Object.hasOwn(propsObject, key)) continue;
      const attrName = toKebabCase(key);
      if (original === null) el.removeAttribute(attrName);
      else el.setAttribute(attrName, original);
      originals.delete(key);
    }

    for (const [key, value] of Object.entries(propsObject)) {
      const attrName = toKebabCase(key);
      if (!originals.has(key)) originals.set(key, el.getAttribute(attrName));

      if (value === undefined || value === null || value === false) {
        el.removeAttribute(attrName);
        continue;
      }

      if (value === true) {
        el.setAttribute(attrName, '');
        continue;
      }

      el.setAttribute(attrName, String(value));
    }
  }

  function getCropperCanvas() {
    return cropperInstance?.getCropperCanvas() ?? null;
  }

  function getCropperImage() {
    return cropperInstance?.getCropperImage() ?? null;
  }

  function getCropperSelection() {
    return cropperInstance?.getCropperSelection() ?? null;
  }

  function getCropperSelections() {
    return cropperInstance?.getCropperSelections() ?? null;
  }

  function alignSelectionToImage() {
    if (!adapter.props.fitSelectionToImage) return;
    const image = getCropperImage();
    const selection = getCropperSelection();
    const imageElement = adapter.imageElement;

    if (!image || !selection || !imageElement) {
      return;
    }

    const naturalWidth = imageElement.naturalWidth;
    const naturalHeight = imageElement.naturalHeight;

    if (!naturalWidth || !naturalHeight) {
      return;
    }

    const matrix = image.$getTransform();
    const scaleX = matrix[0] ?? 0;
    const scaleY = matrix[3] ?? 0;

    if (!scaleX || !scaleY) {
      return;
    }

    const renderedWidth = (image.clientWidth || naturalWidth) * scaleX;
    const renderedHeight = (image.clientHeight || naturalHeight) * scaleY;

    selection.$change(
      adapter.props.selectionX ?? 1,
      adapter.props.selectionY ?? 1,
      adapter.props.selectionWidth ?? renderedWidth - 2,
      adapter.props.selectionHeight ?? renderedHeight - 2,
    );
  }

  function bindCanvasEvents(canvas: CropperCanvas) {
    const canvasEventNames = ['action', 'actionstart', 'actionmove', 'actionend'] as const;

    for (const eventName of canvasEventNames) {
      addTrackedListener(canvas, eventName, (event) => {
        const detail = (event as CustomEvent).detail;

        if (eventName === 'action') {
          adapter.canvasEvents.action(detail);
        }
        if (eventName === 'actionstart') {
          adapter.canvasEvents.actionstart(detail);
        }
        if (eventName === 'actionmove') {
          adapter.canvasEvents.actionmove(detail);
        }
        if (eventName === 'actionend') {
          adapter.canvasEvents.actionend(detail);
        }
      });
    }
  }

  function bindSelectionEvents(selection: CropperSelection) {
    addTrackedListener(selection, 'change', (event) => {
      // 异步默认居中不能通过 v-model 覆盖父组件提供的初始几何值。
      if (
        !selectionInitialized &&
        (adapter.props.selectionX !== undefined ||
          adapter.props.selectionY !== undefined ||
          adapter.props.selectionWidth !== undefined ||
          adapter.props.selectionHeight !== undefined)
      ) {
        return;
      }
      const detail = (event as CustomEvent<CropperSelectionChangeDetail>).detail;

      adapter.selectionChange(detail);
      adapter.updateSelectionX(detail.x);
      adapter.updateSelectionY(detail.y);
      adapter.updateSelectionWidth(detail.width);
      adapter.updateSelectionHeight(detail.height);
    });
  }

  function bindImageEvents(image: CropperImage) {
    addTrackedListener(image, 'transform', (event) => {
      adapter.imageTransform(
        (event as CustomEvent).detail as { matrix: number[]; oldMatrix: number[] },
      );
    });

    if (!adapter.props.fitSelectionToImage) {
      return;
    }

    scheduleAlignOnLoad();
  }

  // fitSelectionToImage：等待原始 img 加载完成后重新对齐选区。
  // 监听走 addTrackedListener，destroy() 会统一移除；触发一次后自移除，避免重复堆积。
  function scheduleAlignOnLoad() {
    if (destroyed || !adapter.props.fitSelectionToImage) {
      return;
    }

    const imageElement = adapter.imageElement;
    if (!imageElement) {
      return;
    }

    const align = () => {
      const image = getCropperImage();
      if (!image) return;
      image.$ready().then(
        (loadedImage) => {
          if (destroyed) return;
          if (loadedImage && fittedImageElement !== loadedImage) {
            fittedImageElement = loadedImage;
            // 已解码的图片可能先完成 $ready，随后 load 才更新 Cropper 的尺寸和变换。
            addTrackedListener(loadedImage, 'load', () => {
              adapter.afterRender(() => alignSelectionToImage());
            });
          }
          adapter.afterRender(() => alignSelectionToImage());
        },
        () => undefined,
      );
    };

    if (imageElement.complete && imageElement.naturalWidth > 0) {
      align();
      return;
    }

    const onLoad: CropperEventListener = () => {
      removeTrackedListener(imageElement, 'load', onLoad);
      align();
    };

    addTrackedListener(imageElement, 'load', onLoad);
  }

  function syncChildProps() {
    syncPropsToElement(
      getCropperCanvas(),
      adapter.props.canvasProps as CropperCanvasProps as UnknownRecord,
    );
    syncPropsToElement(
      getCropperImage(),
      adapter.props.imageProps as CropperImageProps as UnknownRecord,
    );
    syncPropsToElement(
      getCropperSelection(),
      adapter.props.selectionProps as CropperSelectionProps as UnknownRecord,
    );
  }

  function syncSelectionGeometry() {
    const {
      selectionX: x,
      selectionY: y,
      selectionWidth: width,
      selectionHeight: height,
    } = adapter.props;

    if (x === undefined && y === undefined && width === undefined && height === undefined) {
      return;
    }

    const selection = getCropperSelection();
    if (!selection) {
      return;
    }

    const nextX = x ?? selection.x;
    const nextY = y ?? selection.y;
    const nextWidth = width ?? selection.width;
    const nextHeight = height ?? selection.height;

    if (typeof selection.$change !== 'function') {
      selection.x = nextX;
      selection.y = nextY;
      selection.width = nextWidth;
      selection.height = nextHeight;
      if (typeof selection.$render === 'function') {
        selection.$render();
      }
      return;
    }

    selection.$change(nextX, nextY, nextWidth, nextHeight);
  }

  function destroy() {
    destroyed = true;
    for (const { el, event, fn } of trackedHandlers) {
      el.removeEventListener(event, fn);
    }

    trackedHandlers.length = 0;
    cropperInstance?.destroy();
    cropperInstance = null;
  }

  async function mount() {
    if (!adapter.imageElement) {
      return;
    }

    const CropperConstructor = await loadCropperConstructor();
    const imageElement = adapter.imageElement;
    if (destroyed || !imageElement) {
      return;
    }

    const options: ConstructorParameters<typeof CropperConstructor>[1] = {};
    if (adapter.props.template !== undefined) {
      options.template = adapter.props.template;
    }

    cropperInstance = new CropperConstructor(imageElement, options);

    adapter.afterRender(() => {
      syncChildProps();

      const canvas = getCropperCanvas();
      if (canvas) {
        bindCanvasEvents(canvas);
      }

      const image = getCropperImage();
      selectionInitialized = !image;
      const selection = getCropperSelection();
      if (selection) {
        syncSelectionGeometry();
        bindSelectionEvents(selection);
      }

      if (image) {
        bindImageEvents(image);
        // Cropper 2.3 在图片就绪后异步初始化选区，再同步受控位置。
        image
          .$ready()
          .catch(() => undefined)
          .then(() =>
            adapter.afterRender(() => {
              if (destroyed) return;
              selectionInitialized = true;
              syncSelectionGeometry();
            }),
          );
      }
    });
  }

  function syncSource(value: string | undefined) {
    const cropperImage = getCropperImage();
    if (cropperImage) (cropperImage as unknown as HTMLImageElement).src = value ?? '';
    else if (adapter.imageElement) adapter.imageElement.src = value ?? '';
    adapter.afterRender(() => scheduleAlignOnLoad());
  }
  return {
    mount,
    getInstance: () => cropperInstance,
    getCropperCanvas,
    getCropperImage,
    getCropperSelection,
    getCropperSelections,
    destroy,
    scheduleAlignOnLoad,
    syncSource,
    syncSelectionGeometry,
    syncCanvasProps: () =>
      syncPropsToElement(getCropperCanvas(), adapter.props.canvasProps as UnknownRecord),
    syncImageProps: () =>
      syncPropsToElement(getCropperImage(), adapter.props.imageProps as UnknownRecord),
    syncSelectionProps: () =>
      syncPropsToElement(getCropperSelection(), adapter.props.selectionProps as UnknownRecord),
  };
}
