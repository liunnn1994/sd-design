import { getScrollBarWidth } from '@sdata/web-core/_utils/dom';
import { createMediaLoader, isVideoJsMediaSkin } from '@sdata/web-core/file-previewer/media';
import { createPopupEntry } from '@sdata/web-core/popup/manager';
import { createPopupOverflowHidden } from '@sdata/web-core/popup/overflow';
import { resolvePopupContainer } from '@sdata/web-core/trigger/popup-container';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ImageProps } from '../image/types.js';
import type { FilePreviewerProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import IconClose from '../icon/icon-close.js';
import IconLoading from '../icon/icon-loading.js';
import { Image } from '../image/index.js';
import { useI18n } from '../locale/index.js';
import { FileMediaView } from './media-view.js';
import { FilePdfView } from './pdf-view.js';
import { useFilePreview } from './use-preview.js';

const ensureMedia = createMediaLoader();
const noPdf = async () => {};

export function FilePreviewer({
  src = '',
  type = 'image',
  visible,
  defaultVisible = false,
  fullscreen = true,
  title,
  maskClosable = true,
  closable = true,
  escToClose = true,
  popupContainer,
  renderToBody = true,
  imageProps,
  mediaProps,
  pdfProps,
  onClose,
  onVisibleChange,
  renderTitle,
  renderContent,
  renderImage,
  renderVideo,
  renderAudio,
  renderPdf,
  ref,
  className,
  style,
  onKeyDown,
  ...attrs
}: FilePreviewerProps) {
  const prefix = usePrefix('file-previewer');
  const { t } = useI18n();
  const wrapper = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement>();
  const [zIndex, setZIndex] = useState(0);
  const live = useRef({ container, zIndex });
  live.current = { container, zIndex };
  const [popup] = useState(() => ({
    entry: createPopupEntry('dialog', {
      get zIndex() {
        return live.current.zIndex;
      },
      setZIndex(value) {
        live.current.zIndex = value;
        setZIndex(value);
      },
    }),
    overflow: createPopupOverflowHidden({
      get element() {
        return live.current.container;
      },
      getScrollBarWidth,
    }),
  }));
  const slots = [
    renderContent && 'content',
    renderImage && 'image',
    renderVideo && 'video',
    renderAudio && 'audio',
    renderPdf && 'pdf',
  ].filter((name): name is string => !!name);
  const state = useFilePreview(
    {
      src,
      type,
      visible,
      defaultVisible,
      fullscreen,
      escToClose,
      maskClosable,
      slots,
      withMediaSkin:
        (type === 'video' || type === 'audio') && isVideoJsMediaSkin(mediaProps?.skin ?? 'default'),
      onClose,
      onVisibleChange,
    },
    {
      // PDF resources belong to the mounted PDF view and are released with that view.
      destroyPdf: noPdf,
      loadPdf: noPdf,
      ensureMedia: () => ensureMedia(type),
      focusAfterRender: () => wrapper.current?.focus(),
    },
  );
  const { foundation } = state;
  useImperativeHandle(
    ref,
    () => ({ close: foundation.close, onLoad: foundation.loaded, onError: foundation.error }),
    [foundation],
  );
  useLayoutEffect(() => {
    setContainer(resolvePopupContainer({ popupContainer, defaultContainer: document.body }));
  }, [popupContainer, state.visible]);
  useLayoutEffect(() => {
    if (fullscreen && state.visible && !state.useImagePreview) popup.entry.open();
    return popup.entry.close;
  }, [fullscreen, state.visible, state.useImagePreview, popup]);
  useLayoutEffect(() => {
    if (fullscreen && state.visible && !state.useImagePreview) popup.overflow.lock();
    return popup.overflow.reset;
  }, [fullscreen, state.visible, state.useImagePreview, container, popup]);
  useLayoutEffect(() => {
    if (fullscreen && state.shouldRender) wrapper.current?.focus();
  }, [container, fullscreen, state.shouldRender]);
  const mergedImage: ImageProps = {
    alt: title || '',
    ...imageProps,
    src,
    renderToBody,
    previewProps: {
      maskClosable,
      closable,
      popupContainer,
      escToClose,
      ...imageProps?.previewProps,
    },
    onLoad: (event) => {
      imageProps?.onLoad?.(event);
      foundation.loaded();
    },
    onError: (event) => {
      imageProps?.onError?.(event);
      foundation.error();
    },
  };
  if (state.useImagePreview)
    return (
      <Image
        {...mergedImage}
        key={`${src}:image`}
        previewVisible={state.visible}
        onPreviewVisibleChange={foundation.imageVisibleChange}
        className={[`${prefix}-image`, className].filter(Boolean).join(' ')}
        style={style}
      />
    );
  if (!state.shouldRender) return null;
  const slotState = {
    src,
    type,
    title,
    visible: state.shouldRender,
    fullscreen,
    status: state.status,
    loading: state.status === 'loading',
    loaded: state.status === 'loaded',
    error: state.status === 'error',
    close: foundation.close,
    onLoad: foundation.loaded,
    onError: foundation.error,
  };
  const content = (
    <div
      {...attrs}
      ref={wrapper}
      tabIndex={fullscreen ? -1 : undefined}
      className={[
        prefix,
        `${prefix}-${type}`,
        `${prefix}-${fullscreen ? 'fullscreen' : 'inline'}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...(fullscreen
          ? ({
              zIndex:
                typeof document !== 'undefined' && container === document.body ? zIndex : 'inherit',
              position:
                typeof document !== 'undefined' && container === document.body
                  ? 'fixed'
                  : 'absolute',
            } as const)
          : undefined),
        ...style,
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        foundation.keydown(event.nativeEvent);
        if (event.nativeEvent.cancelBubble) event.stopPropagation();
      }}
    >
      {fullscreen && <div className={`${prefix}-mask`} onClick={foundation.maskClick} />}
      <section
        className={`${prefix}-content ${prefix}-content-${type} ${prefix}-content-${fullscreen ? 'fullscreen' : 'inline'}`}
        role={fullscreen ? 'dialog' : 'region'}
        aria-modal={fullscreen || undefined}
        aria-label={title || t('a11y.filePreview')}
      >
        {(title || renderTitle) && (
          <header className={`${prefix}-header`}>
            {renderTitle ? renderTitle() : <span className={`${prefix}-title`}>{title}</span>}
          </header>
        )}
        <div className={`${prefix}-body`}>
          {renderContent ? (
            renderContent(slotState)
          ) : type === 'image' ? (
            renderImage ? (
              renderImage({ ...slotState, imageProps: mergedImage })
            ) : (
              <Image {...mergedImage} key={`${src}:image`} className={`${prefix}-image`} />
            )
          ) : type === 'pdf' ? (
            <FilePdfView
              src={src}
              pdfProps={pdfProps}
              close={foundation.close}
              onStatus={state.setStatus}
              status={state.status}
              renderPdf={renderPdf}
            />
          ) : (
            <FileMediaView
              {...slotState}
              type={type}
              mediaProps={mediaProps}
              renderMedia={type === 'audio' ? renderAudio : renderVideo}
            />
          )}
        </div>
        {fullscreen && closable && (
          <button
            type="button"
            className={`${prefix}-close-btn`}
            aria-label={t('a11y.close')}
            onClick={foundation.close}
          >
            <IconClose />
          </button>
        )}
      </section>
      {!(type === 'pdf' && !renderContent) && slotState.loading && (
        <div className={`${prefix}-loading`} role="status" aria-label={t('a11y.loading')}>
          <IconLoading />
        </div>
      )}
      {!(type === 'pdf' && !renderContent) && slotState.error && (
        <div className={`${prefix}-error`} role="alert">
          {t('filePreview.loadFailed')}
        </div>
      )}
    </div>
  );
  return fullscreen && renderToBody && container ? createPortal(content, container) : content;
}
