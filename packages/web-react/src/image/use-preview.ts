import type { ImageLoadStatus } from '@sdata/web-core/image/types';

import { getScrollBarWidth } from '@sdata/web-core/_utils/dom';
import { throttleByRaf } from '@sdata/web-core/_utils/throttle-by-raf';
import { createImageDrag } from '@sdata/web-core/image/drag';
import { createImagePreview } from '@sdata/web-core/image/preview';
import { createPopupEntry } from '@sdata/web-core/popup/manager';
import { createPopupOverflowHidden } from '@sdata/web-core/popup/overflow';
import { resolvePopupContainer } from '@sdata/web-core/trigger/popup-container';
import { useLayoutEffect, useRef, useState } from 'react';

import type { ImagePreviewProps } from './types.js';

import { useAfterRender } from '../_shared/use-after-render.js';

export const defaultActions = [
  'fullScreen',
  'rotateRight',
  'rotateLeft',
  'zoomIn',
  'zoomOut',
  'originalSize',
];

export function useImagePreview(props: ImagePreviewProps) {
  const [innerVisible, setInnerVisible] = useState(props.defaultVisible ?? false);
  const visible = props.visible ?? innerVisible;
  const [scale, setScale] = useState(props.defaultScale ?? 1);
  const [rotate, setRotate] = useState(0);
  const [translate, setTranslate] = useState([0, 0]);
  const [moving, setMoving] = useState(false);
  const [scaleValueVisible, setScaleValueVisible] = useState(false);
  const [status, setStatus] = useState<ImageLoadStatus>('beforeLoad');
  const [zIndex, setZIndex] = useState(0);
  const [container, setContainer] = useState<HTMLElement>();
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const afterRender = useAfterRender();
  const live = useRef({
    props,
    visible,
    scale,
    rotate,
    translate,
    scaleValueVisible,
    zIndex,
    container,
    wrapper,
    image,
  });
  live.current = {
    props,
    visible,
    scale,
    rotate,
    translate,
    scaleValueVisible,
    zIndex,
    container,
    wrapper,
    image,
  };
  const [controller] = useState(() => {
    const entry = createPopupEntry('dialog', {
      get zIndex() {
        return live.current.zIndex;
      },
      setZIndex(value) {
        live.current.zIndex = value;
        setZIndex(value);
      },
    });
    const overflow = createPopupOverflowHidden({
      get element() {
        return live.current.container;
      },
      getScrollBarWidth,
    });
    const drag = createImageDrag({
      get wrapper() {
        return live.current.wrapper ?? undefined;
      },
      get image() {
        return live.current.image ?? undefined;
      },
      get scale() {
        return live.current.scale;
      },
      get translate() {
        return live.current.translate;
      },
      setTranslate(value) {
        live.current.translate = value;
        setTranslate(value);
      },
      setMoving,
    });
    const foundation = createImagePreview({
      get visible() {
        return live.current.visible;
      },
      get scale() {
        return live.current.scale;
      },
      get rotate() {
        return live.current.rotate;
      },
      get defaultScale() {
        return live.current.props.defaultScale ?? 1;
      },
      get zoomRate() {
        return live.current.props.zoomRate ?? 1.1;
      },
      get escToClose() {
        return live.current.props.escToClose ?? true;
      },
      get wheelZoom() {
        return live.current.props.wheelZoom ?? true;
      },
      get maskClosable() {
        return live.current.props.maskClosable ?? true;
      },
      get actions() {
        return live.current.props.actionsLayout ?? defaultActions;
      },
      get scaleValueVisible() {
        return live.current.scaleValueVisible;
      },
      get arrows() {
        return live.current.props.groupArrowProps ?? {};
      },
      isLastDialog: entry.isLastDialog,
      isEditableTarget(event) {
        const target = event.target;
        return (
          target instanceof HTMLElement &&
          Boolean(target.isContentEditable || target.closest('input, textarea, select'))
        );
      },
      setScale(value) {
        live.current.scale = value;
        setScale(value);
      },
      setRotate(value) {
        live.current.rotate = value;
        setRotate(value);
      },
      setVisible(value) {
        if (live.current.props.visible === undefined) live.current.visible = value;
        setInnerVisible(value);
      },
      setScaleValueVisible(value) {
        live.current.scaleValueVisible = value;
        setScaleValueVisible(value);
      },
      setLoadStatus: setStatus,
      onClose() {
        live.current.props.onClose?.();
      },
      onVisibleChange(value) {
        live.current.props.onVisibleChange?.(value);
      },
      resetTranslate: drag.resetTranslate,
      focusAfterRender() {
        void afterRender().then(() => {
          if (live.current.visible) live.current.wrapper?.focus();
        });
      },
      focusOnMaskClick() {
        if (!live.current.wrapper?.contains(document.activeElement)) live.current.wrapper?.focus();
      },
      measure() {
        return {
          wrapper: live.current.wrapper!.getBoundingClientRect(),
          image: live.current.image!.getBoundingClientRect(),
        };
      },
      schedule: (callback, delay) => setTimeout(callback, delay),
      cancel: (handle) => clearTimeout(handle),
      releasePopup: entry.close,
    });
    return { foundation, drag, entry, overflow, wheel: throttleByRaf(foundation.wheel) };
  });
  useLayoutEffect(() => {
    setContainer(
      resolvePopupContainer({
        popupContainer: props.popupContainer,
        defaultContainer: document.body,
      }),
    );
  }, [props.popupContainer, visible]);
  useLayoutEffect(() => {
    if (visible) controller.entry.open();
    else controller.entry.close();
    return controller.entry.close;
  }, [visible, controller]);
  useLayoutEffect(() => {
    if (visible && container) controller.overflow.lock();
    return controller.overflow.reset;
  }, [visible, container, controller]);
  useLayoutEffect(() => {
    if (!visible || props.keyboard === false || !container) return;
    container.addEventListener('keydown', controller.foundation.keydown);
    return () => container.removeEventListener('keydown', controller.foundation.keydown);
  }, [visible, props.keyboard, container, controller]);
  useLayoutEffect(() => controller.foundation.syncSource(), [props.src, visible, controller]);
  useLayoutEffect(() => controller.drag.connect(image ?? undefined), [image, controller]);
  useLayoutEffect(() => {
    controller.drag.fix();
  }, [scale, controller]);
  useLayoutEffect(() => {
    if (!wrapper) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      controller.wheel(event);
    };
    wrapper.addEventListener('wheel', wheel, { passive: false });
    return () => {
      wrapper.removeEventListener('wheel', wheel);
      controller.wheel.cancel();
    };
  }, [wrapper, controller]);
  useLayoutEffect(
    () => () => {
      controller.wheel.cancel();
      controller.foundation.dispose();
    },
    [controller],
  );
  return {
    visible,
    scale,
    rotate,
    translate,
    moving,
    scaleValueVisible,
    status,
    zIndex,
    container,
    setWrapper,
    setImage,
    foundation: controller.foundation,
  };
}
