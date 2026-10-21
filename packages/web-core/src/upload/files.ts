import type { FileItem, ListType } from './types.js';

import { isObject } from '../_utils/is.js';

export function getUploadFileKind(file: FileItem) {
  let type = '';
  if (file.file?.type) {
    type = file.file.type;
  } else {
    const extension = file.name?.split('.').pop() ?? '';
    if (['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp'].includes(extension)) {
      type = 'image';
    } else if (['mp4', 'm2v', 'mkv', 'm4v', 'mov'].includes(extension)) {
      type = 'video';
    } else if (['mp3', 'wav', 'wmv', 'm4a', 'acc', 'flac'].includes(extension)) {
      type = 'audio';
    }
  }

  if (type.includes('image')) return 'image';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('audio')) return 'audio';
  if (type.includes('video')) return 'video';
  return 'file';
}
export function getUploadAccept(accept: string | undefined, listType: ListType) {
  if (accept) return accept;
  return listType === 'picture' || listType === 'picture-card' ? 'image/*' : undefined;
}
export function isUploadLimitReached(limit: number, count: number) {
  return limit > 0 && count >= limit;
}
export function isUploadButtonHidden(show: boolean | { showOnExceedLimit: boolean }, max: boolean) {
  return !show || (max && !(isObject(show) && show.showOnExceedLimit));
}

export function getUploadPreviewUrls(files: readonly FileItem[]): string[] {
  return files.filter((item) => Boolean(item.url)).map((item) => item.url as string);
}

export function previewUploadFile(
  file: FileItem,
  adapter: {
    readonly enabled: boolean;
    readonly urls: readonly string[];
    setCurrent: (current: number) => void;
    setVisible: (visible: boolean) => void;
    onPreview: (file: FileItem) => void;
  },
) {
  if (adapter.enabled && file.url) {
    const current = adapter.urls.indexOf(file.url);
    if (current > -1) {
      adapter.setCurrent(current);
      adapter.setVisible(true);
    }
  }
  adapter.onPreview(file);
}
