import type {
  FilePreviewerMediaProps,
  FilePreviewerMediaSkin,
  FilePreviewerType,
} from './types.js';

export function createMediaLoader() {
  let videoPromise: Promise<unknown> | undefined;
  let audioPromise: Promise<unknown> | undefined;
  return async (type: FilePreviewerType) => {
    if (typeof Element === 'undefined' && typeof window !== 'undefined' && window.Element) {
      Object.defineProperty(globalThis, 'Element', { configurable: true, value: window.Element });
    }
    if (type === 'audio') {
      if (!audioPromise)
        audioPromise = import('@videojs/html/audio/player').then(() =>
          Promise.all([
            import('@videojs/html/audio/skin'),
            import('@videojs/html/audio/neutral-skin'),
          ]),
        );
      await audioPromise;
      return;
    }
    if (!videoPromise)
      videoPromise = import('@videojs/html/video/player').then(() =>
        Promise.all([
          import('@videojs/html/video/skin'),
          import('@videojs/html/video/neutral-skin'),
        ]),
      );
    await videoPromise;
  };
}

export function isVideoJsMediaSkin(skin: FilePreviewerMediaSkin) {
  return skin !== false && skin !== 'native';
}
export function getMediaSkinTag(type: FilePreviewerType, skin: FilePreviewerMediaSkin) {
  if (skin === 'minimal') return type === 'audio' ? 'audio-neutral-skin' : 'video-neutral-skin';
  if (skin && skin !== 'default') return String(skin);
  return type === 'audio' ? 'audio-skin' : 'video-skin';
}
export function callFileEventHandler(handler: unknown, event: Event) {
  if (Array.isArray(handler)) {
    handler.forEach((item) => callFileEventHandler(item, event));
    return;
  }
  if (typeof handler === 'function') handler(event);
}

export function mergeFileMediaProps(
  props: FilePreviewerMediaProps | undefined,
  src: string,
  type: FilePreviewerType,
  withSkin: boolean,
  request: number,
  adapter: {
    readonly requestId: number;
    onLoad(): void;
    onError(): void;
  },
) {
  const user = { ...props };
  const { onLoadedData, onError } = user;
  delete user.skin;
  delete user.playerProps;
  delete user.skinProps;
  delete user.onLoadedData;
  delete user.onError;
  return {
    ...(withSkin ? undefined : { controls: true }),
    ...(type === 'video' ? { playsinline: true } : undefined),
    ...user,
    src,
    onLoadeddata: (event: Event) => {
      if (request !== adapter.requestId) return;
      callFileEventHandler(onLoadedData, event);
      adapter.onLoad();
    },
    onError: (event: Event) => {
      if (request !== adapter.requestId) return;
      callFileEventHandler(onError, event);
      adapter.onError();
    },
  };
}

export function mergeFileImageProps<
  Props extends Record<string, unknown> & { previewProps?: object },
>(
  props: Props,
  options: {
    title: string | undefined;
    src: string;
    renderToBody: boolean;
    maskClosable: boolean;
    closable: boolean;
    popupContainer: string | HTMLElement | undefined;
    escToClose: boolean;
    onLoad(): void;
    onError(): void;
  },
) {
  return {
    alt: options.title || '',
    ...props,
    src: options.src,
    renderToBody: options.renderToBody,
    previewProps: {
      maskClosable: options.maskClosable,
      closable: options.closable,
      popupContainer: options.popupContainer,
      escToClose: options.escToClose,
      ...props.previewProps,
    },
    onLoad: (event: Event) => {
      callFileEventHandler(props.onLoad, event);
      options.onLoad();
    },
    onError: (event: Event) => {
      callFileEventHandler(props.onError, event);
      options.onError();
    },
  };
}
