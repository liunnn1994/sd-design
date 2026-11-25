import type {
  FilePreviewerMediaProps,
  FilePreviewerMediaSlotProps,
  FilePreviewerStatus,
} from '@sdata/web-core/file-previewer/types';
import type { ReactNode } from 'react';

import {
  getMediaSkinTag,
  isVideoJsMediaSkin,
  mergeFileMediaProps,
} from '@sdata/web-core/file-previewer/media';
import { createElement, useRef } from 'react';

import { usePrefix } from '../config-provider/index.js';

export interface FileMediaViewProps {
  src: string;
  type: 'audio' | 'video';
  status: FilePreviewerStatus;
  mediaProps?: FilePreviewerMediaProps | undefined;
  close(): void;
  onLoad(): void;
  onError(): void;
  renderMedia?: ((state: FilePreviewerMediaSlotProps) => ReactNode) | undefined;
}

export function FileMediaView({
  src,
  type,
  status,
  mediaProps,
  close,
  onLoad,
  onError,
  renderMedia,
}: FileMediaViewProps) {
  const prefix = usePrefix('file-previewer');
  const current = useRef({ src, type, request: 0 });
  if (current.current.src !== src || current.current.type !== type) {
    current.current = { src, type, request: current.current.request + 1 };
  }
  const skin = mediaProps?.skin ?? 'default';
  const useVideoJs = isVideoJsMediaSkin(skin);
  const playerProps = mediaProps?.playerProps ?? {};
  const skinProps = mediaProps?.skinProps ?? {};
  const { onLoadeddata, playsinline, ...props } = mergeFileMediaProps(
    mediaProps,
    src,
    type,
    useVideoJs,
    current.current.request,
    {
      get requestId() {
        return current.current.request;
      },
      onLoad,
      onError,
    },
  );
  const media = createElement(type, {
    ...props,
    key: `${src}:${type}`,
    playsInline: playsinline,
    onLoadedData: onLoadeddata,
    className: `${prefix}-${type}`,
  });
  const content = renderMedia
    ? renderMedia({
        src,
        status,
        loading: status === 'beforeLoad' || status === 'loading',
        loaded: status === 'loaded',
        error: status === 'error',
        skin,
        useVideoJs,
        playerProps,
        skinProps,
        close,
        onLoad,
        onError,
      })
    : useVideoJs
      ? createElement(
          `${type}-player`,
          { ...playerProps, className: `${prefix}-${type}-player` },
          createElement(
            getMediaSkinTag(type, skin),
            { ...skinProps, className: `${prefix}-media-skin ${prefix}-media-skin-${type}` },
            media,
          ),
        )
      : media;
  return type === 'audio' ? <div className={`${prefix}-audio-panel`}>{content}</div> : content;
}
