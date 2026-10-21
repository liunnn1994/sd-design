import type { FileItem, RequestOption, UploadRequest } from './types.js';

import { isBoolean, isFunction, isObject } from '../_utils/is.js';
import { isImage, uploadRequest } from './utils.js';

export interface UploadOptions {
  limit: number;
  autoUpload: boolean;
  action?: string;
  name?: RequestOption['name'];
  data?: RequestOption['data'];
  headers?: RequestOption['headers'];
  withCredentials?: boolean;
  customRequest?: (option: RequestOption) => UploadRequest;
  lockKey?: string | ((fileItem: FileItem) => string | undefined);
  responseUrlKey?: string | ((fileItem: FileItem) => string);
  onBeforeUpload?: (file: File) => boolean | File | Promise<boolean | File>;
  onBeforeRemove?: (file: FileItem) => Promise<boolean>;
}
export interface UploadAdapter {
  readonly options: UploadOptions;
  getFileList(): FileItem[];
  setFileList(files: FileItem[]): void;
  createFileItem(file: FileItem): FileItem;
  getDisabled(): boolean;
  onUpdateList(files: FileItem[]): void;
  onChange(files: FileItem[], file: FileItem): void;
  onExceed(files: FileItem[], selected: File[]): void;
  onProgress(file: FileItem, event?: ProgressEvent): void;
  onSuccess(file: FileItem): void;
  onError(file: FileItem): void;
  onFormChange(): void;
}

export function createUploadFoundation(adapter: UploadAdapter) {
  let uidCounter = 0;
  const fileMap = new Map<string, FileItem>();
  const previewUrls = new Set<string>();
  const releasePreviewUrls = (retainedUrls: Set<string | undefined>) => {
    for (const url of previewUrls) {
      if (!retainedUrls.has(url)) {
        URL.revokeObjectURL(url);
        previewUrls.delete(url);
      }
    }
  };
  interface UploadTask {
    request?: UploadRequest;
    cancelled: boolean;
    releaseLock?: () => void;
  }
  const requestMap = new Map<string, UploadTask>();
  let disposed = false;
  let pendingFiles = 0;
  const cancelRequest = (uid: string) => {
    const task = requestMap.get(uid);
    if (!task) return;
    // 先使回调失效，abort 也可能同步触发自定义请求的回调。
    requestMap.delete(uid);
    task.cancelled = true;
    try {
      task.request?.abort?.();
    } catch (error) {
      // oxlint-disable-next-line no-console
      console.error(error);
    } finally {
      task.releaseLock?.();
    }
  };
  const checkFileList = (fileList?: FileItem[]) => {
    fileMap.clear();
    const nextFileList = fileList?.map((data, index) => {
      const status = data.status ?? 'done';
      const fileItem = adapter.createFileItem({
        ...data,
        uid: data.uid ?? `${Date.now()}${index}`,
        status,
        percent: data.percent ?? (['error', 'init'].includes(status) ? 0 : 1),
      });
      fileMap.set(fileItem.uid, fileItem);
      return fileItem;
    });
    adapter.setFileList(nextFileList ?? []);
    for (const uid of requestMap.keys()) {
      if (!fileMap.has(uid)) cancelRequest(uid);
    }
  };
  const updateFileList = (file: FileItem) => {
    adapter.onUpdateList(adapter.getFileList());
    adapter.onChange(adapter.getFileList(), file);
    adapter.onFormChange();
  };
  const updateFile = (id: string, file: File) => {
    for (const item of adapter.getFileList()) {
      if (item.uid === id) {
        item.file = file;
        updateFileList(item);
        break;
      }
    }
  };
  const uploadFile = (fileItem: FileItem) => {
    if (disposed || !fileMap.has(fileItem.uid) || requestMap.has(fileItem.uid)) return;
    const task: UploadTask = { cancelled: false };
    requestMap.set(fileItem.uid, task);
    const isCurrent = () => !disposed && requestMap.get(fileItem.uid) === task;
    const handleProgress = (percent: number, event?: ProgressEvent) => {
      if (!isCurrent()) return;
      const file = fileMap.get(fileItem.uid);
      if (!file) return;
      file.status = 'uploading';
      file.percent = percent;
      adapter.onProgress(file, event);
      updateFileList(file);
    };
    const handleSuccess = (response: unknown) => {
      if (!isCurrent()) return;
      const file = fileMap.get(fileItem.uid);
      if (!file) return;
      file.status = 'done';
      file.percent = 1;
      file.response = response;
      try {
        if (adapter.options.responseUrlKey) {
          if (isFunction(adapter.options.responseUrlKey)) {
            const url = adapter.options.responseUrlKey(file);
            if (!isCurrent()) return;
            file.url = url;
          } else if (isObject(response) && response[adapter.options.responseUrlKey]) {
            file.url = String(response[adapter.options.responseUrlKey]);
          }
        }
      } catch (error) {
        handleError(error);
        return;
      }
      requestMap.delete(file.uid);
      task.releaseLock?.();
      adapter.onSuccess(file);
      updateFileList(file);
    };
    const handleError = (response: unknown) => {
      if (!isCurrent()) return;
      const file = fileMap.get(fileItem.uid);
      if (!file) return;
      file.status = 'error';
      file.percent = 0;
      file.response = response;
      requestMap.delete(file.uid);
      task.releaseLock?.();
      adapter.onError(file);
      updateFileList(file);
    };
    const option: RequestOption = {
      fileItem,
      action: adapter.options.action,
      name: adapter.options.name,
      data: adapter.options.data,
      headers: adapter.options.headers,
      withCredentials: adapter.options.withCredentials,
      onProgress: handleProgress,
      onSuccess: handleSuccess,
      onError: handleError,
    };
    fileItem.status = 'uploading';
    fileItem.percent = 0;
    const startRequest = () => {
      if (!isCurrent()) return;
      try {
        task.request = isFunction(adapter.options.customRequest)
          ? adapter.options.customRequest(option)
          : uploadRequest(option);
        if (task.cancelled) task.request.abort?.();
        if (isCurrent()) updateFileList(fileItem);
      } catch (error) {
        handleError(error);
      }
    };
    try {
      // 在本次上传开始时确定 key，后续 prop 变化不影响已持有的锁。
      const key = isFunction(adapter.options.lockKey)
        ? adapter.options.lockKey(fileItem)
        : adapter.options.lockKey;
      if (key === undefined) {
        startRequest();
        return;
      }
      if (!globalThis.navigator?.locks) {
        handleError({ code: 'UPLOAD_LOCK_UNSUPPORTED', message: 'Web Locks API is unavailable' });
        return;
      }
      void navigator.locks
        .request(`sd-upload:${key}`, { ifAvailable: true }, (lock) => {
          if (!isCurrent()) return;
          if (!lock) {
            handleError({
              code: 'UPLOAD_LOCK_BUSY',
              message: 'An upload with this lock key is already running',
            });
            return;
          }
          // 回调返回的 Promise 必须等到上传结束，否则浏览器会提前释放锁。
          return new Promise<void>((resolve) => {
            task.releaseLock = resolve;
            startRequest();
          });
        })
        .catch(handleError);
      updateFileList(fileItem);
    } catch (error) {
      handleError(error);
    }
  };
  const abort = (fileItem: FileItem) => {
    const request = requestMap.get(fileItem.uid);
    if (!request) return;
    cancelRequest(fileItem.uid);
    const file = fileMap.get(fileItem.uid);
    if (file) {
      file.status = 'error';
      file.percent = 0;
      // 取消上传视为错误结束，发出 error 事件让消费方感知取消
      adapter.onError(file);
      updateFileList(file);
    }
  };
  const submit = (fileItem?: FileItem) => {
    if (fileItem) {
      const file = fileMap.get(fileItem.uid);
      if (file) uploadFile(file);
      return;
    }
    for (const item of adapter.getFileList()) {
      if (item.status === 'init') uploadFile(item);
    }
  };
  const initUpload = (file: File) => {
    if (disposed) return;
    if (adapter.options.limit > 0 && adapter.getFileList().length >= adapter.options.limit) {
      adapter.onExceed(adapter.getFileList(), [file]);
      return;
    }
    let uid: string;
    do {
      uid = `${Date.now()}-${uidCounter++}`;
    } while (fileMap.has(uid));
    const url = isImage(file) ? URL.createObjectURL(file) : undefined;
    if (url) previewUrls.add(url);
    const fileItem: FileItem = adapter.createFileItem({
      uid,
      file,
      url,
      name: file.name,
      status: 'init',
      percent: 0,
    });
    fileMap.set(uid, fileItem);
    adapter.setFileList([...adapter.getFileList(), fileItem]);
    updateFileList(fileItem);
    if (adapter.options.autoUpload) uploadFile(fileItem);
  };
  const uploadFiles = (files: File[]) => {
    if (disposed) return;
    if (
      adapter.options.limit > 0 &&
      adapter.getFileList().length + pendingFiles + files.length > adapter.options.limit
    ) {
      adapter.onExceed(adapter.getFileList(), files);
      return;
    }
    // 整批预占名额，异步校验和同步事件重入都不能突破 limit。
    pendingFiles += files.length;
    files.forEach(async (file) => {
      let result: boolean | File = true;
      try {
        if (isFunction(adapter.options.onBeforeUpload))
          result = await adapter.options.onBeforeUpload(file);
      } catch (error) {
        result = false;
        // oxlint-disable-next-line no-console
        console.error(error);
      } finally {
        pendingFiles -= 1;
      }
      if (result) initUpload(isBoolean(result) ? file : result);
    });
  };
  const removeFile = (fileItem: FileItem) => {
    if (disposed || !fileMap.has(fileItem.uid)) return;
    fileMap.delete(fileItem.uid);
    cancelRequest(fileItem.uid);
    adapter.setFileList(adapter.getFileList().filter((item) => item.uid !== fileItem.uid));
    updateFileList(fileItem);
  };
  const handleRemove = (fileItem: FileItem) => {
    if (adapter.getDisabled()) return;
    if (isFunction(adapter.options.onBeforeRemove)) {
      Promise.resolve(adapter.options.onBeforeRemove(fileItem))
        .then((result) => {
          if (result) removeFile(fileItem);
        })
        .catch((error) => {
          // oxlint-disable-next-line no-console
          console.error(error);
        });
    } else {
      removeFile(fileItem);
    }
  };

  function dispose() {
    disposed = true;
    releasePreviewUrls(new Set());
    for (const uid of requestMap.keys()) cancelRequest(uid);
  }
  return {
    checkFileList,
    releasePreviewUrls,
    dispose,
    uploadFile,
    abort,
    submit,
    updateFile,
    uploadFiles,
    handleRemove,
  };
}
