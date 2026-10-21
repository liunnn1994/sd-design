import type { FilePreviewerType, FilePreviewerStatus } from './types.js';

import { KEYBOARD_KEY } from '../_utils/keyboard.js';

export function shouldRenderFile(fullscreen: boolean, visible: boolean) {
  return !fullscreen || visible;
}
export function shouldUseImagePreview(
  type: FilePreviewerType,
  fullscreen: boolean,
  slots: readonly string[],
) {
  return type === 'image' && fullscreen && !slots.includes('content') && !slots.includes('image');
}
export function createFilePreviewer(adapter: {
  readonly visible: boolean;
  readonly fullscreen: boolean;
  readonly escToClose: boolean;
  readonly maskClosable: boolean;
  readonly type: FilePreviewerType;
  readonly shouldRender: boolean;
  readonly slots: readonly string[];
  readonly withMediaSkin: boolean;
  readonly requestId: number;
  readonly isServer: boolean;
  setRequestId(value: number): void;
  setVisible(value: boolean): void;
  setStatus(value: FilePreviewerStatus): void;
  onClose(): void;
  onVisibleChange(value: boolean): void;
  destroyPdf(): Promise<void>;
  loadPdf(): Promise<void>;
  ensureMedia(): Promise<unknown>;
  focusAfterRender(): void;
}) {
  function setVisible(value: boolean) {
    if (value !== adapter.visible) {
      adapter.onVisibleChange(value);
      adapter.setVisible(value);
    }
  }
  function close() {
    if (!adapter.visible) return;
    adapter.onClose();
    setVisible(false);
  }
  async function prepareMedia(request: number) {
    adapter.setStatus('loading');
    try {
      if (!adapter.isServer) await adapter.ensureMedia();
      if (request !== adapter.requestId) return;
      adapter.setStatus('loaded');
    } catch {
      if (request !== adapter.requestId) return;
      adapter.setStatus('error');
    }
  }
  return {
    close,
    setVisible,
    prepareMedia,
    maskClick() {
      if (adapter.maskClosable) close();
    },
    imageVisibleChange(value: boolean) {
      if (!value && adapter.visible) adapter.onClose();
      setVisible(value);
    },
    keydown(event: KeyboardEvent) {
      if (adapter.fullscreen && adapter.escToClose && event.key === KEYBOARD_KEY.ESC) {
        event.stopPropagation();
        close();
      }
    },
    loaded() {
      adapter.setStatus('loaded');
    },
    error() {
      adapter.setStatus('error');
    },
    syncPreview() {
      adapter.setRequestId(adapter.requestId + 1);
      if (!adapter.shouldRender || adapter.type !== 'pdf' || adapter.slots.includes('content'))
        void adapter.destroyPdf();
      if (!adapter.shouldRender) return;
      adapter.setStatus('beforeLoad');
      if (adapter.fullscreen) adapter.focusAfterRender();
      if (adapter.slots.includes('content')) {
        adapter.setStatus('loaded');
        return;
      }
      const request = adapter.requestId;
      if (adapter.type === 'pdf') {
        void adapter.loadPdf();
        return;
      }
      if (adapter.type === 'video' || adapter.type === 'audio') {
        if (adapter.withMediaSkin) {
          void prepareMedia(request);
          return;
        }
        if (adapter.slots.includes(adapter.type)) {
          adapter.setStatus('loaded');
          return;
        }
        adapter.setStatus('loading');
        return;
      }
      if (adapter.slots.includes(adapter.type)) {
        adapter.setStatus('loaded');
        return;
      }
      adapter.setStatus('loading');
    },
  };
}
