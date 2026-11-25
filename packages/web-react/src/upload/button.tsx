import type { UploadInputOptions } from '@sdata/web-core/upload/input';
import type { ListType } from '@sdata/web-core/upload/types';
import type { ReactNode, HTMLAttributes } from 'react';
import type { UndefinedOnPartial } from 'type-fest';

import { createUploadInput } from '@sdata/web-core/upload/input';
import { useReducer, useRef, useState } from 'react';

import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import IconPlus from '../icon/icon-plus.js';
import IconUpload from '../icon/icon-upload.js';
import { useI18n } from '../locale/index.js';

export interface UploadButtonProps extends UndefinedOnPartial<
  Partial<Omit<UploadInputOptions, 'uploadFiles'>>
> {
  uploadFiles(files: File[]): void;
  listType?: ListType;
  tip?: ReactNode;
  draggable?: boolean | undefined;
  hide?: boolean;
  children?: ReactNode;
  rootAttrs?: HTMLAttributes<HTMLElement> | undefined;
}
export function UploadButton(props: UploadButtonProps) {
  const {
    disabled = false,
    directory = false,
    accept,
    multiple = false,
    listType,
    tip,
    draggable,
    hide,
    children,
  } = props;
  const prefix = usePrefix('upload');
  const { t } = useI18n();
  const current = useRef(props);
  current.current = props;
  const input = useRef<HTMLInputElement>(null);
  const state = useRef({ dragging: false, enters: 0 });
  const [, render] = useReducer((value: number) => value + 1, 0);
  const [foundation] = useState(() =>
    createUploadInput({
      get options() {
        return {
          ...current.current,
          disabled: !!current.current.disabled,
          directory: !!current.current.directory,
          multiple: !!current.current.multiple,
        };
      },
      getDragging: () => state.current.dragging,
      setDragging: (value) => {
        state.current.dragging = value;
        render();
      },
      getDragEnterCount: () => state.current.enters,
      setDragEnterCount: (value) => {
        state.current.enters = value;
      },
      clickInput: () => input.current?.click(),
    }),
  );
  return (
    <span
      {...props.rootAttrs}
      className={[
        prefix,
        listType === 'picture-card' && `${prefix}-type-picture-card`,
        draggable && `${prefix}-draggable`,
        disabled && `${prefix}-disabled`,
        hide && `${prefix}-hide`,
        props.rootAttrs?.className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) => {
        props.rootAttrs?.onClick?.(event);
        foundation.handleClick(event.nativeEvent);
      }}
      onDragEnter={() => foundation.setDragEnterCount('add')}
      onDrop={(event) => foundation.handleDrop(event.nativeEvent)}
      onDragOver={(event) => foundation.handleDragOver(event.nativeEvent)}
      onDragLeave={(event) => foundation.handleDragLeave(event.nativeEvent)}
    >
      <input
        ref={input}
        type="file"
        style={{ display: 'none' }}
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        {...(directory ? { webkitdirectory: 'webkitdirectory' } : {})}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => foundation.handleInputChange(event.nativeEvent)}
      />
      {children != null ? (
        <span>{children}</span>
      ) : listType === 'picture-card' ? (
        <div className={`${prefix}-picture-card`}>
          <div className={`${prefix}-picture-card-text`}>
            <IconPlus />
          </div>
          {tip != null && <div className={`${prefix}-tip`}>{tip}</div>}
        </div>
      ) : draggable ? (
        <div
          className={[`${prefix}-drag`, state.current.dragging && `${prefix}-drag-active`]
            .filter(Boolean)
            .join(' ')}
        >
          <div>
            <IconPlus />
          </div>
          <div className={`${prefix}-drag-text`}>
            {t(state.current.dragging ? 'upload.dragHover' : 'upload.drag')}
          </div>
          {tip != null && <div className={`${prefix}-tip`}>{tip}</div>}
        </div>
      ) : (
        <Button type="primary" disabled={disabled} icon={<IconUpload />}>
          {t('upload.buttonText')}
        </Button>
      )}
    </span>
  );
}
