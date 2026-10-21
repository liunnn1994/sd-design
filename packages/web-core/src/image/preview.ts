import type { ImageLoadStatus } from './types.js';

import { KEYBOARD_KEY } from '../_utils/keyboard.js';
import getScale, { getScaleByRate } from './utils/get-scale.js';

export function createImagePreview<Handle>(adapter: {
  readonly visible: boolean;
  readonly scale: number;
  readonly rotate: number;
  readonly defaultScale: number;
  readonly zoomRate: number;
  readonly escToClose: boolean;
  readonly wheelZoom: boolean;
  readonly maskClosable: boolean;
  readonly actions: string[];
  readonly scaleValueVisible: boolean;
  readonly arrows: { onPrev?: () => void; onNext?: () => void };
  isLastDialog(): boolean;
  isEditableTarget(event: KeyboardEvent): boolean;
  setScale(value: number): void;
  setRotate(value: number): void;
  setVisible(value: boolean): void;
  setScaleValueVisible(value: boolean): void;
  setLoadStatus(value: ImageLoadStatus): void;
  onClose(): void;
  onVisibleChange(value: boolean): void;
  resetTranslate(): void;
  focusAfterRender(): void;
  focusOnMaskClick(): void;
  measure(): {
    wrapper: Pick<DOMRect, 'width' | 'height'>;
    image: Pick<DOMRect, 'width' | 'height'>;
  };
  schedule(callback: () => void, delay: number): Handle;
  cancel(handle: Handle): void;
  releasePopup(): void;
}) {
  let hideTimer: Handle | null = null;
  function showScaleValue() {
    if (!adapter.scaleValueVisible) adapter.setScaleValueVisible(true);
    if (hideTimer) adapter.cancel(hideTimer);
    hideTimer = adapter.schedule(() => adapter.setScaleValueVisible(false), 1000);
  }
  function changeScale(value: number) {
    if (adapter.scale !== value) {
      adapter.setScale(value);
      showScaleValue();
    }
  }
  function close() {
    if (adapter.visible) {
      adapter.onClose();
      adapter.onVisibleChange(false);
      adapter.setVisible(false);
    }
  }
  function reset() {
    adapter.setRotate(0);
    adapter.setScale(adapter.defaultScale);
    adapter.resetTranslate();
  }
  function scale(action: 'zoomIn' | 'zoomOut') {
    changeScale(getScale(adapter.scale, action));
  }
  function keydown(event: KeyboardEvent) {
    if (!adapter.isLastDialog()) return;
    if (event.key !== KEYBOARD_KEY.ESC && adapter.isEditableTarget(event)) return;
    switch (event.key) {
      case KEYBOARD_KEY.ESC:
        if (adapter.escToClose) close();
        break;
      case KEYBOARD_KEY.ARROW_LEFT:
        if (adapter.arrows.onPrev) adapter.arrows.onPrev();
        break;
      case KEYBOARD_KEY.ARROW_RIGHT:
        if (adapter.arrows.onNext) adapter.arrows.onNext();
        break;
      case KEYBOARD_KEY.ARROW_UP:
        if (adapter.actions.includes('zoomIn')) scale('zoomIn');
        break;
      case KEYBOARD_KEY.ARROW_DOWN:
        if (adapter.actions.includes('zoomOut')) scale('zoomOut');
        break;
      case KEYBOARD_KEY.SPACE:
        if (adapter.actions.includes('originalSize')) changeScale(1);
        break;
      default:
        return;
    }
    event.stopPropagation();
    event.preventDefault();
  }
  return {
    changeScale,
    close,
    reset,
    scale,
    keydown,
    syncSource() {
      if (adapter.visible) {
        reset();
        adapter.setLoadStatus('loading');
        adapter.focusAfterRender();
      }
    },
    maskClick(event: MouseEvent) {
      adapter.focusOnMaskClick();
      if (adapter.maskClosable && event.target === event.currentTarget) close();
    },
    wheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();
      if (!adapter.wheelZoom) return;
      const delta = event.deltaY || event.deltaX;
      changeScale(
        getScaleByRate(adapter.scale, adapter.zoomRate, delta > 0 ? 'zoomOut' : 'zoomIn'),
      );
    },
    fullScreen() {
      const { wrapper, image } = adapter.measure();
      changeScale(
        Math.max(
          wrapper.height / (image.height / adapter.scale),
          wrapper.width / (image.width / adapter.scale),
        ),
      );
    },
    rotate(direction: 'clockwise' | 'counterclockwise') {
      adapter.setRotate(
        direction === 'clockwise'
          ? (adapter.rotate + 90) % 360
          : adapter.rotate === 0
            ? 270
            : adapter.rotate - 90,
      );
    },
    loaded() {
      adapter.setLoadStatus('loaded');
    },
    error() {
      adapter.setLoadStatus('error');
    },
    dispose() {
      if (hideTimer) {
        adapter.cancel(hideTimer);
        hideTimer = null;
      }
      adapter.releasePopup();
    },
  };
}
