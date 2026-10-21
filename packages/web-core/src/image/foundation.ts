import type { ImageLoadStatus } from './types.js';

import { isBoolean } from '../_utils/is.js';

export function getImageLoadFlags(status: ImageLoadStatus) {
  return {
    isBeforeLoad: status === 'beforeLoad',
    isLoading: status === 'loading',
    isError: status === 'error',
    isLoaded: status === 'loaded',
  };
}
export function getImageFooterVisibility(
  title: string | undefined,
  description: string | undefined,
  extra: boolean,
  hide: boolean | 'never',
  loaded: boolean,
) {
  if (!(title || description || extra)) return false;
  if (isBoolean(hide)) return !hide && loaded;
  return hide === 'never';
}
export function createImageFoundation(adapter: {
  readonly src: string | undefined;
  readonly preview: boolean;
  readonly groupPreview: boolean;
  readonly id: number;
  setLoadStatus(value: ImageLoadStatus): void;
  previewGroup(id: number): void;
  onPreviewVisibleChange(value: boolean): void;
  setPreviewVisible(value: boolean): void;
}) {
  function setVisible(value: boolean) {
    adapter.onPreviewVisibleChange(value);
    adapter.setPreviewVisible(value);
  }
  return {
    syncSource() {
      adapter.setLoadStatus(adapter.src ? 'loading' : 'beforeLoad');
    },
    loaded() {
      if (adapter.src) adapter.setLoadStatus('loaded');
    },
    error() {
      if (adapter.src) adapter.setLoadStatus('error');
    },
    click() {
      if (!adapter.preview) return;
      if (adapter.groupPreview) adapter.previewGroup(adapter.id);
      else setVisible(true);
    },
    close() {
      setVisible(false);
    },
  };
}
export function getPreviewActions<Action extends { key: string }>(
  actions: Action[],
  layout: string[],
) {
  const included = new Set(layout);
  return actions
    .filter((item) => included.has(item.key))
    .sort((pre, cur) => (layout.indexOf(pre.key) > layout.indexOf(cur.key) ? 1 : -1));
}
export function activatePreviewAction(
  disabled: boolean,
  event: MouseEvent,
  notify: (event: MouseEvent) => void,
) {
  if (!disabled) notify(event);
}
export function activatePreviewArrow(event: MouseEvent, callback: (() => void) | undefined) {
  event.preventDefault();
  if (callback) callback();
}
