import type { ReactNode } from 'react';

import { maxScale, minScale } from '@sdata/web-core/image/utils/get-scale';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ImagePreviewProps } from './types.js';

import { useTransitionPresence } from '../_shared/use-transition-presence.js';
import { usePrefix } from '../config-provider/index.js';
import { IconClose } from '../icon/icon-close.js';
import { IconFullscreen } from '../icon/icon-fullscreen.js';
import { IconLoading } from '../icon/icon-loading.js';
import { IconOriginalSize } from '../icon/icon-original-size.js';
import { IconRotateLeft } from '../icon/icon-rotate-left.js';
import { IconRotateRight } from '../icon/icon-rotate-right.js';
import { IconZoomIn } from '../icon/icon-zoom-in.js';
import { IconZoomOut } from '../icon/icon-zoom-out.js';
import { useI18n } from '../locale/index.js';
import { ImagePreviewArrow } from './preview-arrow.js';
import { ImagePreviewToolbar } from './preview-toolbar.js';
import { defaultActions, useImagePreview } from './use-preview.js';

function ScaleValue({
  visible,
  children,
  className,
}: {
  visible: boolean;
  children: ReactNode;
  className: string;
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const { present } = useTransitionPresence(
    visible,
    element,
    'image-fade',
    undefined,
    () => {},
    () => {},
  );
  return present ? (
    <div ref={setElement} className={className}>
      {children}
    </div>
  ) : null;
}

export function ImagePreview(props: ImagePreviewProps) {
  const {
    src,
    visible: _visible,
    defaultVisible: _defaultVisible,
    maskClosable: _maskClosable,
    closable = true,
    actionsLayout = defaultActions,
    popupContainer: _popupContainer,
    renderToBody = true,
    escToClose: _escToClose,
    keyboard: _keyboard,
    wheelZoom: _wheelZoom,
    defaultScale: _defaultScale,
    zoomRate: _zoomRate,
    inGroup = false,
    groupArrowProps,
    actions: customActions,
    onClose: _onClose,
    onVisibleChange: _onVisibleChange,
    className,
    style,
    ref,
    ...attrs
  } = props;
  const prefix = usePrefix('image-preview');
  const { t } = useI18n();
  const preview = useImagePreview(props);
  const { foundation, visible, scale, rotate, translate, moving, status } = preview;
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      get element() {
        return root.current;
      },
      onImgLoad: foundation.loaded,
      onImgError: foundation.error,
    }),
    [foundation],
  );
  const [mask, setMask] = useState<HTMLDivElement | null>(null);
  const { present } = useTransitionPresence(
    visible,
    mask,
    'image-fade',
    undefined,
    () => {},
    () => {},
  );
  const [host, setHost] = useState<HTMLElement>();
  const [inline, setInline] = useState<HTMLSpanElement | null>(null);
  useLayoutEffect(() => {
    const element = document.createElement('div');
    element.style.display = 'contents';
    setHost(element);
    return () => element.remove();
  }, []);
  useLayoutEffect(() => {
    const target = renderToBody ? preview.container : inline;
    if (!target || !host) return;
    const focused = document.activeElement;
    const restoreFocus = focused instanceof HTMLElement && host.contains(focused);
    target.appendChild(host);
    if (restoreFocus) focused.focus({ preventScroll: true });
    return () => host.remove();
  }, [renderToBody, preview.container, inline, host]);
  const actions = [
    {
      key: 'fullScreen',
      name: t('imagePreview.fullScreen'),
      children: <IconFullscreen />,
      onClick: foundation.fullScreen,
    },
    {
      key: 'rotateRight',
      name: t('imagePreview.rotateRight'),
      children: <IconRotateRight />,
      onClick: () => foundation.rotate('clockwise'),
    },
    {
      key: 'rotateLeft',
      name: t('imagePreview.rotateLeft'),
      children: <IconRotateLeft />,
      onClick: () => foundation.rotate('counterclockwise'),
    },
    {
      key: 'zoomIn',
      name: t('imagePreview.zoomIn'),
      children: <IconZoomIn />,
      onClick: () => foundation.scale('zoomIn'),
      disabled: scale === maxScale,
    },
    {
      key: 'zoomOut',
      name: t('imagePreview.zoomOut'),
      children: <IconZoomOut />,
      onClick: () => foundation.scale('zoomOut'),
      disabled: scale === minScale,
    },
    {
      key: 'originalSize',
      name: t('imagePreview.originalSize'),
      children: <IconOriginalSize />,
      onClick: () => foundation.changeScale(1),
    },
  ];
  const fixed = typeof document !== 'undefined' && preview.container === document.body;
  const content = (
    <div
      {...attrs}
      ref={root}
      className={[prefix, !visible && `${prefix}-hide`, className].filter(Boolean).join(' ')}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        zIndex: fixed ? preview.zIndex : 'inherit',
        ...style,
        ...(present && !visible ? { display: 'block' } : {}),
      }}
    >
      <div
        ref={setMask}
        className={`${prefix}-mask`}
        style={{ display: present ? undefined : 'none' }}
      />
      {visible && (
        <div
          ref={preview.setWrapper}
          tabIndex={0}
          className={`${prefix}-wrapper`}
          onClick={foundation.maskClick}
        >
          <div
            className={`${prefix}-img-container`}
            style={{ transform: `scale(${scale}, ${scale})` }}
            onClick={foundation.maskClick}
          >
            <img
              key={src}
              ref={preview.setImage}
              src={src || undefined}
              className={[`${prefix}-img`, moving && `${prefix}-img-moving`]
                .filter(Boolean)
                .join(' ')}
              style={{
                transform: `translate(${translate[0]}px, ${translate[1]}px) rotate(${rotate}deg)`,
              }}
              onLoad={foundation.loaded}
              onError={foundation.error}
            />
          </div>
          {status === 'loading' && (
            <div className={`${prefix}-loading`}>
              <IconLoading />
            </div>
          )}
          <ScaleValue visible={preview.scaleValueVisible} className={`${prefix}-scale-value`}>
            {(scale * 100).toFixed(0)}%
          </ScaleValue>
          {status === 'loaded' && actionsLayout.length > 0 && (
            <ImagePreviewToolbar actions={actions} actionsLayout={actionsLayout}>
              {customActions}
            </ImagePreviewToolbar>
          )}
          {closable && (
            <div className={`${prefix}-close-btn`} onClick={foundation.close}>
              <IconClose />
            </div>
          )}
          {inGroup && <ImagePreviewArrow {...groupArrowProps} />}
        </div>
      )}
    </div>
  );
  return (
    <>
      {!renderToBody && <span ref={setInline} style={{ display: 'contents' }} />}
      {host ? createPortal(content, host) : null}
    </>
  );
}
