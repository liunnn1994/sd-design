import type { PreviewImage } from './types.js';

import { isArray, isUndefined } from '../_utils/is.js';

export function getPreviewSourceMap(sources: string[] | undefined): Map<number, PreviewImage> {
  return new Map(
    isArray(sources) ? sources.map((url, index) => [index, { url, canPreview: true }]) : [],
  );
}
export function createImagePreviewGroup(adapter: {
  readonly sources: string[] | undefined;
  readonly registered: Map<number, PreviewImage>;
  readonly images: Map<number, PreviewImage>;
  readonly ids: number[];
  readonly index: number;
  readonly visible: boolean;
  readonly infinite: boolean;
  setVisible(value: boolean): void;
  onVisibleChange(value: boolean): void;
  setIndex(value: number): void;
  onIndexChange(value: number): void;
}) {
  function visible(value: boolean) {
    if (value !== adapter.visible) {
      adapter.onVisibleChange(value);
      adapter.setVisible(value);
    }
  }
  function index(value: number) {
    if (value !== adapter.index) {
      adapter.onIndexChange(value);
      adapter.setIndex(value);
    }
  }
  function setId(id: number) {
    const next = adapter.ids.indexOf(id);
    if (next !== adapter.index) index(next);
  }
  function next() {
    const find = (start: number, end: number) => {
      for (let i = start; i <= end; i++)
        if (adapter.images.get(adapter.ids[i])?.canPreview) return i;
      return undefined;
    };
    const found = find(adapter.index + 1, adapter.ids.length - 1);
    return isUndefined(found) && adapter.infinite ? find(0, adapter.index - 1) : found;
  }
  function prev() {
    const find = (start: number, end: number) => {
      for (let i = start; i >= end; i--)
        if (adapter.images.get(adapter.ids[i])?.canPreview) return i;
      return undefined;
    };
    const found = find(adapter.index - 1, 0);
    return isUndefined(found) && adapter.infinite
      ? find(adapter.ids.length - 1, adapter.index + 1)
      : found;
  }
  return {
    visible,
    index,
    setId,
    next,
    prev,
    register(id: number, url: string, canPreview: boolean) {
      adapter.registered.set(id, { url, canPreview });
      return () => {
        adapter.registered.delete(id);
      };
    },
    preview(id: number) {
      visible(true);
      if (!isArray(adapter.sources)) setId(id);
    },
    close() {
      visible(false);
    },
  };
}
