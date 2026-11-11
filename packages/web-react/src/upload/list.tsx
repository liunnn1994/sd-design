import type { FileItem, ListType } from '@sdata/web-core/upload/types';
import type { ReactNode } from 'react';

import { onActivate } from '@sdata/web-core/_utils/keyboard';
import { getUploadFileKind } from '@sdata/web-core/upload/files';
import { getProgressStatus } from '@sdata/web-core/upload/utils';

import { usePrefix } from '../config-provider/index.js';
import IconCheck from '../icon/icon-check.js';
import IconDelete from '../icon/icon-delete.js';
import IconError from '../icon/icon-exclamation-circle-fill.js';
import IconEye from '../icon/icon-eye.js';
import IconAudio from '../icon/icon-file-audio.js';
import IconImage from '../icon/icon-file-image.js';
import IconPdf from '../icon/icon-file-pdf.js';
import IconVideo from '../icon/icon-file-video.js';
import IconFile from '../icon/icon-file.js';
import IconImageClose from '../icon/icon-image-close.js';
import IconPause from '../icon/icon-pause.js';
import IconPlay from '../icon/icon-play-arrow-fill.js';
import IconUpload from '../icon/icon-upload.js';
import { useI18n } from '../locale/index.js';
import { Progress } from '../progress/index.js';
import { Tooltip } from '../tooltip/index.js';

export interface UploadCustomIcon {
  startIcon?(): ReactNode;
  cancelIcon?(): ReactNode;
  retryIcon?(): ReactNode;
  successIcon?(): ReactNode;
  errorIcon?(): ReactNode;
  removeIcon?(): ReactNode;
  previewIcon?(): ReactNode;
  fileIcon?(file: FileItem): ReactNode;
  fileName?(file: FileItem): ReactNode;
}
export interface UploadListProps {
  fileList: FileItem[];
  listType: ListType;
  disabled?: boolean;
  showRemoveButton?: boolean;
  showPreviewButton?: boolean;
  showStartButton?: boolean;
  showRetryButton?: boolean;
  showCancelButton?: boolean;
  showLink?: boolean;
  download?: boolean;
  imageLoading?: 'eager' | 'lazy';
  customIcon?: UploadCustomIcon;
  renderItem?(file: FileItem, index: number): ReactNode;
  renderFileName?(file: FileItem): ReactNode;
  renderImage?(file: FileItem): ReactNode;
  renderExtraButton?(file: FileItem): ReactNode;
  uploadButton?: ReactNode;
  onUpload?(file: FileItem): void;
  onAbort?(file: FileItem): void;
  onRemove?(file: FileItem): void;
  onPreview?(file: FileItem): void;
}
export function UploadList(props: UploadListProps) {
  const prefix = usePrefix('upload');
  const list = `${prefix}-list`;
  const { t } = useI18n();
  const icons = props.customIcon;
  const action = (
    file: FileItem,
    kind: string,
    label: string,
    callback: UploadListProps['onRemove'],
    icon: ReactNode,
  ) => (
    <span
      className={`${prefix}-icon ${prefix}-icon-${kind}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => callback?.(file)}
      onKeyDown={(event) => onActivate(() => callback?.(file))(event.nativeEvent)}
    >
      {icon}
    </span>
  );
  const progress = (file: FileItem) => (
    <span className={`${prefix}-progress`}>
      {(file.status === 'init' || file.status === 'uploading') && (
        <Progress
          type="circle"
          size="mini"
          showText={false}
          status={getProgressStatus(file.status)}
          percent={file.percent}
        />
      )}
      {file.status === 'error' && props.showRetryButton ? (
        action(
          file,
          'upload',
          t('a11y.retryUpload'),
          props.onUpload,
          icons?.retryIcon?.() ?? t('upload.retry'),
        )
      ) : file.status === 'done' ? (
        <span className={`${prefix}-icon ${prefix}-icon-success`}>
          {icons?.successIcon?.() ?? <IconCheck />}
        </span>
      ) : file.status === 'init' && props.showStartButton ? (
        action(
          file,
          'start',
          t('upload.start'),
          props.onUpload,
          icons?.startIcon?.() ?? <IconPlay />,
        )
      ) : file.status === 'uploading' && props.showCancelButton ? (
        action(
          file,
          'cancel',
          t('upload.cancel'),
          props.onAbort,
          icons?.cancelIcon?.() ?? <IconPause />,
        )
      ) : null}
    </span>
  );
  return (
    <div className={`${list} ${list}-type-${props.listType}`}>
      {props.fileList.map((file, index) => {
        if (props.renderItem) return <span key={file.uid}>{props.renderItem(file, index)}</span>;
        const image = props.renderImage ? (
          props.renderImage(file)
        ) : (
          <img src={file.url} alt={file.name} loading={props.imageLoading} />
        );
        if (props.listType === 'picture-card')
          return (
            <span
              key={file.uid}
              className={[
                `${list}-picture`,
                file.status === 'error' && `${list}-picture-status-error`,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {file.status === 'uploading' ? (
                progress(file)
              ) : (
                <>
                  {image}
                  <div className={`${list}-picture-mask`}>
                    {file.status === 'error' && (
                      <div className={`${list}-picture-error-tip`}>
                        <span className={`${prefix}-icon ${prefix}-icon-error`}>
                          {icons?.errorIcon?.() ?? <IconImageClose />}
                        </span>
                      </div>
                    )}
                    <div className={`${list}-picture-operation`}>
                      {file.status !== 'error' &&
                        props.showPreviewButton &&
                        action(
                          file,
                          'preview',
                          t('a11y.preview'),
                          props.onPreview,
                          icons?.previewIcon?.() ?? <IconEye />,
                        )}
                      {file.status === 'init' &&
                        props.showStartButton &&
                        action(
                          file,
                          'start',
                          t('upload.start'),
                          props.onUpload,
                          icons?.startIcon?.() ?? <IconPlay />,
                        )}
                      {file.status === 'error' &&
                        props.showRetryButton &&
                        action(
                          file,
                          'upload',
                          t('a11y.retryUpload'),
                          props.onUpload,
                          icons?.retryIcon?.() ?? <IconUpload />,
                        )}
                      {!props.disabled &&
                        props.showRemoveButton &&
                        action(
                          file,
                          'remove',
                          t('a11y.remove'),
                          props.onRemove,
                          icons?.removeIcon?.() ?? <IconDelete />,
                        )}
                      {props.renderExtraButton?.(file)}
                    </div>
                  </div>
                </>
              )}
            </span>
          );
        const FileIcon = {
          image: IconImage,
          pdf: IconPdf,
          audio: IconAudio,
          video: IconVideo,
          file: IconFile,
        }[getUploadFileKind(file)];
        const name = props.renderFileName
          ? props.renderFileName(file)
          : (icons?.fileName?.(file) ?? file.name);
        return (
          <div key={file.uid} className={`${list}-item ${list}-item-${file.status}`}>
            <div className={`${list}-item-content`}>
              {props.listType === 'picture' && (
                <span className={`${list}-item-thumbnail`}>{image}</span>
              )}
              <div className={`${list}-item-name`}>
                {props.listType === 'text' && (
                  <span className={`${list}-item-file-icon`}>
                    {icons?.fileIcon?.(file) ?? <FileIcon />}
                  </span>
                )}
                {props.showLink && file.url ? (
                  <a
                    className={`${list}-item-name-link`}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    download={props.download ? file.name : undefined}
                  >
                    {name}
                  </a>
                ) : (
                  <span
                    className={`${list}-item-name-text`}
                    onClick={() => props.onPreview?.(file)}
                  >
                    {name}
                  </span>
                )}
                {file.status === 'error' && (
                  <Tooltip content={t('upload.error')}>
                    <span className={`${prefix}-icon ${prefix}-icon-error`}>
                      {icons?.errorIcon?.() ?? <IconError />}
                    </span>
                  </Tooltip>
                )}
              </div>
              {progress(file)}
            </div>
            {props.showRemoveButton && (
              <span className={`${list}-item-operation`}>
                {action(
                  file,
                  'remove',
                  t('a11y.remove'),
                  props.onRemove,
                  icons?.removeIcon?.() ?? <IconDelete />,
                )}
              </span>
            )}
            {props.renderExtraButton?.(file)}
          </div>
        );
      })}
      {props.listType === 'picture-card' && props.uploadButton}
    </div>
  );
}
