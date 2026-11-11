import type {
  FilePreviewerContentSlotProps,
  FilePreviewerMediaProps,
  FilePreviewerMediaSlotProps,
  FilePreviewerPdfProps,
  FilePreviewerPdfSlotProps,
  FilePreviewerStatus,
  FilePreviewerType,
} from '@sdata/web-core/file-previewer/types';
import type { HTMLAttributes, ReactNode, Ref } from 'react';

import type { ImageProps } from '../image/types.js';

export type * from '@sdata/web-core/file-previewer/types';
export type FilePreviewerImageProps = Partial<ImageProps>;
export interface FilePreviewerImageSlotProps {
  src: string;
  status: FilePreviewerStatus;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  imageProps: FilePreviewerImageProps;
  close(): void;
  onLoad(): void;
  onError(error?: unknown): void;
}
export interface FilePreviewerInstance {
  close(): void;
  onLoad(): void;
  onError(): void;
}
export interface FilePreviewerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'children'
> {
  ref?: Ref<FilePreviewerInstance>;
  src?: string;
  type?: FilePreviewerType;
  visible?: boolean;
  defaultVisible?: boolean;
  fullscreen?: boolean;
  title?: string;
  maskClosable?: boolean;
  closable?: boolean;
  escToClose?: boolean;
  popupContainer?: HTMLElement | string;
  renderToBody?: boolean;
  imageProps?: FilePreviewerImageProps;
  mediaProps?: FilePreviewerMediaProps;
  pdfProps?: FilePreviewerPdfProps;
  onClose?(): void;
  onVisibleChange?(visible: boolean): void;
  renderTitle?(): ReactNode;
  renderContent?(state: FilePreviewerContentSlotProps): ReactNode;
  renderImage?(state: FilePreviewerImageSlotProps): ReactNode;
  renderVideo?(state: FilePreviewerMediaSlotProps): ReactNode;
  renderAudio?(state: FilePreviewerMediaSlotProps): ReactNode;
  renderPdf?(state: FilePreviewerPdfSlotProps): ReactNode;
}
