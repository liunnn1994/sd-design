import type { FileItem, ListType } from '@sdata/web-core/upload/types';
import type { CSSProperties, Ref, HTMLAttributes } from 'react';

import {
  getUploadAccept,
  isUploadLimitReached,
  isUploadButtonHidden,
  getUploadPreviewUrls,
  previewUploadFile,
} from '@sdata/web-core/upload/files';
import { useImperativeHandle, useState } from 'react';

import type { UploadButtonProps } from './button.js';
import type { UploadListProps } from './list.js';
import type { UploadStateProps } from './use-upload.js';

import { usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { ImagePreviewGroup } from '../image/preview-group.js';
import { UploadButton } from './button.js';
import { UploadList } from './list.js';
import { useUpload } from './use-upload.js';

export interface UploadInstance {
  upload(files: File[]): void;
  submit(file?: FileItem): void;
  abort(file: FileItem): void;
  updateFile(uid: string, file: File): void;
}
export interface UploadProps
  extends
    UploadStateProps,
    Omit<
      HTMLAttributes<HTMLElement>,
      keyof UploadStateProps | keyof UploadListProps | keyof UploadButtonProps
    >,
    Omit<UploadListProps, 'fileList' | 'listType' | 'onUpload' | 'onAbort' | 'onRemove'>,
    Omit<UploadButtonProps, 'uploadFiles' | 'listType' | 'disabled' | 'rootAttrs'> {
  'ref'?: Ref<UploadInstance>;
  'listType'?: ListType;
  'showFileList'?: boolean;
  'showUploadButton'?: boolean | { showOnExceedLimit: boolean };
  'imagePreview'?: boolean;
  'id'?: string;
  'className'?: string;
  'style'?: CSSProperties;
  'aria-label'?: string;
}
export function Upload(props: UploadProps) {
  const prefix = usePrefix('upload');
  const {
    ref,
    listType = 'text',
    showFileList = true,
    showUploadButton = true,
    imagePreview = false,
  } = props;
  const {
    ref: _ref,
    listType: _listType,
    showFileList: _showFileList,
    showUploadButton: _showUploadButton,
    imagePreview: _imagePreview,
    fileList: _fileList,
    defaultFileList: _defaultFileList,
    disabled: _disabled,
    accept: _accept,
    directory: _directory,
    multiple: _multiple,
    draggable: _draggable,
    tip: _tip,
    hide: _hide,
    children: _children,
    onButtonClick: _onButtonClick,
    action: _action,
    name: _name,
    data: _data,
    headers: _headers,
    withCredentials: _withCredentials,
    customRequest: _customRequest,
    lockKey: _lockKey,
    responseUrlKey: _responseUrlKey,
    limit: _limit,
    autoUpload: _autoUpload,
    onBeforeUpload: _onBeforeUpload,
    onBeforeRemove: _onBeforeRemove,
    onFileListChange: _onFileListChange,
    onChange: _onChange,
    onExceedLimit: _onExceedLimit,
    onProgress: _onProgress,
    onSuccess: _onSuccess,
    onError: _onError,
    showRemoveButton: _showRemoveButton,
    showPreviewButton: _showPreviewButton,
    showStartButton: _showStartButton,
    showRetryButton: _showRetryButton,
    showCancelButton: _showCancelButton,
    showLink: _showLink,
    download: _download,
    imageLoading: _imageLoading,
    customIcon: _customIcon,
    renderItem: _renderItem,
    renderFileName: _renderFileName,
    renderImage: _renderImage,
    renderExtraButton: _renderExtraButton,
    uploadButton: _uploadButton,
    onPreview: _onPreview,
    ...rootAttrs
  } = props;
  const form = useFormItem(props);
  const upload = useUpload({ ...props, disabled: form.mergedDisabled }, () =>
    form.eventHandlers?.onChange?.(),
  );
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewCurrent, setPreviewCurrent] = useState(0);
  const urls = getUploadPreviewUrls(upload.files);
  const preview = (file: FileItem) =>
    previewUploadFile(file, {
      enabled: imagePreview,
      urls,
      setCurrent: setPreviewCurrent,
      setVisible: setPreviewVisible,
      onPreview: (item) => props.onPreview?.(item),
    });
  useImperativeHandle(ref, () => ({
    upload: upload.uploadFiles,
    submit: upload.submit,
    abort: upload.abort,
    updateFile: upload.updateFile,
  }));
  const button = showUploadButton && (
    <UploadButton
      disabled={form.mergedDisabled}
      accept={getUploadAccept(props.accept, listType)}
      directory={props.directory}
      multiple={props.multiple}
      draggable={props.draggable}
      listType={listType}
      tip={props.tip}
      hide={isUploadButtonHidden(
        showUploadButton,
        isUploadLimitReached(props.limit ?? 0, upload.files.length),
      )}
      onButtonClick={props.onButtonClick}
      uploadFiles={upload.uploadFiles}
      rootAttrs={
        !showFileList && !(props.tip && listType !== 'picture-card' && !props.draggable)
          ? rootAttrs
          : undefined
      }
    >
      {props.children}
    </UploadButton>
  );
  const renderedButton =
    props.tip && listType !== 'picture-card' && !props.draggable ? (
      <span {...(!showFileList ? rootAttrs : {})}>
        {button}
        <div className={`${prefix}-tip`}>{props.tip}</div>
      </span>
    ) : (
      button
    );
  if (!showFileList) return showUploadButton ? renderedButton : null;
  return (
    <div
      {...rootAttrs}
      id={props.id}
      className={[
        showFileList && `${prefix}-wrapper`,
        showFileList && `${prefix}-wrapper-type-${listType}`,
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={props.style}
      aria-label={props['aria-label']}
    >
      {imagePreview && urls.length > 0 && (
        <ImagePreviewGroup
          srcList={urls}
          visible={previewVisible}
          current={previewCurrent}
          onVisibleChange={setPreviewVisible}
          onChange={setPreviewCurrent}
        />
      )}
      <>
        {listType !== 'picture-card' && renderedButton}
        <UploadList
          {...props}
          fileList={upload.files}
          listType={listType}
          disabled={form.mergedDisabled}
          showLink={props.showLink ?? true}
          showRemoveButton={props.showRemoveButton ?? true}
          showStartButton={props.showStartButton ?? true}
          showRetryButton={props.showRetryButton ?? true}
          showCancelButton={props.showCancelButton ?? true}
          showPreviewButton={props.showPreviewButton ?? true}
          uploadButton={renderedButton}
          onPreview={preview}
          onRemove={upload.remove}
          onUpload={(file) => {
            if (!form.mergedDisabled) upload.submit(file);
          }}
          onAbort={(file) => {
            if (!form.mergedDisabled) upload.abort(file);
          }}
        />
      </>
    </div>
  );
}
