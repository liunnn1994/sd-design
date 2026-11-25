import type { FilePreviewerType, FilePreviewerStatus } from '@sdata/web-core/file-previewer/types';

import {
  createFilePreviewer,
  shouldRenderFile,
  shouldUseImagePreview,
} from '@sdata/web-core/file-previewer/foundation';
import { useLayoutEffect, useRef, useState } from 'react';

export interface FilePreviewStateProps {
  src?: string;
  type?: FilePreviewerType;
  visible?: boolean | undefined;
  defaultVisible?: boolean;
  fullscreen?: boolean;
  escToClose?: boolean;
  maskClosable?: boolean;
  slots?: string[];
  withMediaSkin?: boolean;
  onClose?: (() => void) | undefined;
  onVisibleChange?: ((visible: boolean) => void) | undefined;
}
export function useFilePreview(
  props: FilePreviewStateProps,
  view: {
    destroyPdf(): Promise<void>;
    loadPdf(): Promise<void>;
    ensureMedia(): Promise<unknown>;
    focusAfterRender(): void;
  },
) {
  const [localVisible, setVisible] = useState(props.defaultVisible ?? false);
  const [status, setStatus] = useState<FilePreviewerStatus>('beforeLoad');
  const visible = props.visible ?? localVisible;
  const fullscreen = props.fullscreen ?? true;
  const type = props.type ?? 'image';
  const shouldRender = shouldRenderFile(fullscreen, visible);
  const request = useRef(0);
  const current = useRef({ props, view, visible, fullscreen, type, shouldRender });
  current.current = { props, view, visible, fullscreen, type, shouldRender };
  const [foundation] = useState(() =>
    createFilePreviewer({
      get visible() {
        return current.current.visible;
      },
      get fullscreen() {
        return current.current.fullscreen;
      },
      get escToClose() {
        return current.current.props.escToClose ?? true;
      },
      get maskClosable() {
        return current.current.props.maskClosable ?? true;
      },
      get type() {
        return current.current.type;
      },
      get shouldRender() {
        return current.current.shouldRender;
      },
      get slots() {
        return current.current.props.slots ?? [];
      },
      get withMediaSkin() {
        return !!current.current.props.withMediaSkin;
      },
      get requestId() {
        return request.current;
      },
      isServer: typeof window === 'undefined',
      setRequestId: (value) => {
        request.current = value;
      },
      setVisible,
      setStatus,
      onClose: () => current.current.props.onClose?.(),
      onVisibleChange: (value) => current.current.props.onVisibleChange?.(value),
      destroyPdf: () => current.current.view.destroyPdf(),
      loadPdf: () => current.current.view.loadPdf(),
      ensureMedia: () => current.current.view.ensureMedia(),
      focusAfterRender: () => current.current.view.focusAfterRender(),
    }),
  );
  const slots = (props.slots ?? []).join('|');
  useLayoutEffect(() => {
    foundation.syncPreview();
    return () => {
      request.current += 1;
    };
  }, [foundation, props.src, type, shouldRender, slots, props.withMediaSkin]);
  useLayoutEffect(
    () => () => {
      request.current += 1;
      void current.current.view.destroyPdf();
    },
    [],
  );
  return {
    visible,
    status,
    setStatus,
    shouldRender,
    useImagePreview: shouldUseImagePreview(type, fullscreen, props.slots ?? []),
    foundation,
  };
}
