import type { ImageLoadStatus, PreviewGroupContext } from '@sdata/web-core/image/types';

import { createImageFoundation, getImageFooterVisibility } from '@sdata/web-core/image/foundation';
import { normalizeImageSizeProp } from '@sdata/web-core/image/utils/index';
import { useContext, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { ImageProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import { IconImageClose } from '../icon/icon-image-close.js';
import { IconLoading } from '../icon/icon-loading.js';
import { useI18n } from '../locale/index.js';
import { ImageGroupContext } from './context.js';
import { ImageFooter } from './footer.js';
import { ImagePreview } from './preview.js';

let nextImageId = 0;

export function ImageView({
  src,
  width,
  height,
  title,
  description,
  fit,
  alt,
  hideFooter = false,
  footerPosition = 'inner',
  footerClass,
  showLoader = false,
  preview = true,
  previewVisible,
  defaultPreviewVisible = false,
  previewProps,
  renderToBody = true,
  extra,
  error,
  errorIcon,
  loader,
  previewActions,
  onPreviewVisibleChange,
  onLoad,
  onError,
  onClick,
  className,
  style,
  ref,
  ...attrs
}: ImageProps) {
  const prefix = usePrefix('image');
  const { t } = useI18n();
  const group = useContext(ImageGroupContext);
  const [id] = useState(() => nextImageId++);
  const image = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<ImageLoadStatus>('beforeLoad');
  const [innerVisible, setInnerVisible] = useState(defaultPreviewVisible);
  const visible = previewVisible ?? innerVisible;
  const live = useRef({ src, preview, group, onPreviewVisibleChange });
  live.current = { src, preview, group, onPreviewVisibleChange };
  const [foundation] = useState(() =>
    createImageFoundation({
      get src() {
        return live.current.src;
      },
      get preview() {
        return live.current.preview;
      },
      get groupPreview() {
        return !!live.current.group;
      },
      id,
      setLoadStatus: setStatus,
      previewGroup(value) {
        live.current.group?.preview(value);
      },
      onPreviewVisibleChange(value) {
        live.current.onPreviewVisibleChange?.(value);
      },
      setPreviewVisible: setInnerVisible,
    }),
  );
  useLayoutEffect(() => foundation.syncSource(image.current ?? undefined), [src, foundation]);
  useImperativeHandle(
    ref,
    () => ({
      get imageRef() {
        return image.current;
      },
      onImgLoaded: foundation.loaded,
      onImgLoadError: foundation.error,
      onImgClick: foundation.click,
      onPreviewClose: foundation.close,
    }),
    [foundation],
  );
  const registration = useRef<{ group: PreviewGroupContext; remove(): void } | undefined>(
    undefined,
  );
  const previewSrc = previewProps?.src ?? src ?? '';
  useLayoutEffect(() => {
    if (registration.current?.group !== group) {
      registration.current?.remove();
      registration.current = undefined;
    }
    if (group)
      registration.current = { group, remove: group.registerImageUrl(id, previewSrc, preview) };
  }, [group, id, previewSrc, preview]);
  useLayoutEffect(
    () => () => {
      registration.current?.remove();
      registration.current = undefined;
    },
    [],
  );
  const loaded = status === 'loaded';
  const size = { width: normalizeImageSizeProp(width), height: normalizeImageSizeProp(height) };
  const showFooter = getImageFooterVisibility(
    title,
    description,
    extra != null,
    hideFooter,
    loaded,
  );
  return (
    <div
      className={[
        prefix,
        status === 'loading' && `${prefix}-loading`,
        status === 'error' && `${prefix}-loading-error`,
        loaded && showFooter && `${prefix}-with-footer-${footerPosition}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...size, ...style }}
    >
      <img
        {...attrs}
        ref={image}
        className={`${prefix}-img`}
        src={src || undefined}
        style={{ ...size, objectFit: fit }}
        title={title}
        alt={alt ?? description}
        onLoad={(event) => {
          foundation.loaded();
          onLoad?.(event);
        }}
        onError={(event) => {
          foundation.error();
          onError?.(event);
        }}
        onClick={(event) => {
          foundation.click();
          onClick?.(event);
        }}
      />
      {!loaded && (
        <div className={`${prefix}-overlay`}>
          {status === 'error' &&
            (error ?? (
              <div className={`${prefix}-error`}>
                <div className={`${prefix}-error-icon`}>{errorIcon ?? <IconImageClose />}</div>
                {(alt || description) && (
                  <div className={`${prefix}-error-alt`}>{alt || description}</div>
                )}
              </div>
            ))}
          {status === 'loading' &&
            (showLoader || loader != null) &&
            (loader ?? (
              <div className={`${prefix}-loader`}>
                <div className={`${prefix}-loader-spin`}>
                  <IconLoading />
                  <div className={`${prefix}-loader-spin-text`}>{t('image.loading')}</div>
                </div>
              </div>
            ))}
        </div>
      )}
      {showFooter && (
        <ImageFooter
          className={footerClass}
          title={title}
          description={description}
          extra={extra}
        />
      )}
      {loaded && preview && !group && (
        <ImagePreview
          src={src}
          {...previewProps}
          visible={visible}
          renderToBody={renderToBody}
          onClose={() => {
            previewProps?.onClose?.();
            foundation.close();
          }}
          actions={previewActions ?? previewProps?.actions}
        />
      )}
    </div>
  );
}
