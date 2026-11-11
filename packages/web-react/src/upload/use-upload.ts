import type { UploadAdapter, UploadOptions } from '@sdata/web-core/upload/foundation';
import type { FileItem } from '@sdata/web-core/upload/types';

import { createUploadFoundation, normalizeUploadFile } from '@sdata/web-core/upload/foundation';
import { useLayoutEffect, useReducer, useRef } from 'react';

export interface UploadStateProps extends Partial<UploadOptions> {
  fileList?: FileItem[];
  defaultFileList?: FileItem[];
  disabled?: boolean;
  onFileListChange?: UploadAdapter['onUpdateList'];
  onChange?: UploadAdapter['onChange'];
  onExceedLimit?: UploadAdapter['onExceed'];
  onProgress?: UploadAdapter['onProgress'];
  onSuccess?: UploadAdapter['onSuccess'];
  onError?: UploadAdapter['onError'];
}
export function useUpload(props: UploadStateProps, onFormChange?: () => void) {
  const current = useRef({ props, onFormChange });
  current.current = { props, onFormChange };
  const files = useRef<FileItem[]>(
    (props.fileList ?? props.defaultFileList ?? []).map(normalizeUploadFile),
  );
  const foundation = useRef<ReturnType<typeof createUploadFoundation> | null>(null);
  const [, render] = useReducer((value: number) => value + 1, 0);
  useLayoutEffect(() => {
    const instance = createUploadFoundation({
      get options() {
        return {
          ...current.current.props,
          limit: current.current.props.limit ?? 0,
          autoUpload: current.current.props.autoUpload ?? true,
        };
      },
      getFileList: () => files.current,
      setFileList: (list) => {
        files.current = list;
        render();
      },
      createFileItem: (file) => file,
      getDisabled: () => !!current.current.props.disabled,
      onUpdateList: (list) => {
        render();
        current.current.props.onFileListChange?.(list);
      },
      onChange: (...args) => current.current.props.onChange?.(...args),
      onExceed: (...args) => current.current.props.onExceedLimit?.(...args),
      onProgress: (...args) => {
        render();
        current.current.props.onProgress?.(...args);
      },
      onSuccess: (file) => {
        render();
        current.current.props.onSuccess?.(file);
      },
      onError: (file) => {
        render();
        current.current.props.onError?.(file);
      },
      onFormChange: () => current.current.onFormChange?.(),
    });
    foundation.current = instance;
    instance.checkFileList(current.current.props.fileList ?? current.current.props.defaultFileList);
    return () => {
      instance.dispose();
      foundation.current = null;
    };
  }, []);
  const previousList = useRef<FileItem[] | undefined>(undefined);
  const previousItems = useRef<FileItem[]>([]);
  useLayoutEffect(() => {
    const list = props.fileList;
    if (!list) {
      previousList.current = undefined;
      previousItems.current = [];
      return;
    }
    const changed =
      previousList.current !== list ||
      list.length !== previousItems.current.length ||
      list.some((file, index) => {
        const old = previousItems.current[index];
        return (
          !old ||
          Object.keys(file).length !== Object.keys(old).length ||
          (Object.keys(file) as (keyof FileItem)[]).some((key) => !Object.is(file[key], old[key]))
        );
      });
    if (changed) {
      previousList.current = list;
      previousItems.current = list.map((file) => ({ ...file }));
      foundation.current?.checkFileList(list);
    }
  });
  useLayoutEffect(() =>
    foundation.current?.releasePreviewUrls(new Set(files.current.map((file) => file.url))),
  );
  return {
    files: files.current,
    uploadFiles: (list: File[]) => foundation.current?.uploadFiles(list),
    submit: (file?: FileItem) => foundation.current?.submit(file),
    abort: (file: FileItem) => foundation.current?.abort(file),
    remove: (file: FileItem) => foundation.current?.handleRemove(file),
    updateFile: (uid: string, file: File) => foundation.current?.updateFile(uid, file),
  };
}
