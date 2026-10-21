import type {
  FilePreviewerType,
  FilePreviewerStatus,
  FilePreviewerMediaProps,
  FilePreviewerPdfProps,
} from '@sdata/web-core/file-previewer/types';
export type {
  FilePreviewerType,
  FilePreviewerStatus,
  FilePreviewerMediaSkin,
  FilePreviewerMediaProps,
  FilePreviewerPdfRotation,
  FilePreviewerPdfProps,
  FilePreviewerContentSlotProps,
  FilePreviewerPdfSlotProps,
  FilePreviewerMediaSlotProps,
} from '@sdata/web-core/file-previewer/types';

import type { Except, Simplify, UnknownRecord } from 'type-fest';

import type { ImageProps } from '../image/interface';

type FilePreviewerImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
export type FilePreviewerImageProps = Simplify<
  Except<Partial<ImageProps>, 'fit'> & { fit?: FilePreviewerImageFit } & UnknownRecord
>;
export interface FilePreviewerImageSlotProps {
  src: string;
  status: FilePreviewerStatus;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  /**
   * @zh 合并后的 Image 组件属性
   * @en Merged Image component props
   */
  imageProps: FilePreviewerImageProps;
  close: () => void;
  onLoad: () => void;
  onError: (error?: unknown) => void;
}

export interface FilePreviewerProps {
  /**
   * @zh 文件地址
   * @en File source url
   */
  src?: string;
  /**
   * @zh 预览类型，由参数决定使用哪个预览器
   * @en Preview type, decides which previewer to use
   */
  type?: FilePreviewerType;
  /**
   * @zh 是否可见
   * @en Whether the previewer is visible
   */
  visible?: boolean;
  /**
   * @zh 默认是否可见，非受控
   * @en Default visibility
   */
  defaultVisible?: boolean;
  /**
   * @zh 是否使用全屏弹层展示
   * @en Whether to show the previewer in fullscreen overlay
   */
  fullscreen?: boolean;
  /**
   * @zh 标题
   * @en Title
   */
  title?: string;
  /**
   * @zh 点击遮罩是否关闭
   * @en Whether to close when mask is clicked
   */
  maskClosable?: boolean;
  /**
   * @zh 是否显示关闭按钮
   * @en Whether to show close button
   */
  closable?: boolean;
  /**
   * @zh 是否支持 ESC 键关闭
   * @en Whether to support closing with ESC
   */
  escToClose?: boolean;
  /**
   * @zh 设置弹出框挂载点，同 `teleport` 的 `to`
   * @en Set the mount point, same as `teleport` `to`
   */
  popupContainer?: HTMLElement | string;
  /**
   * @zh 是否渲染到 body
   * @en Whether to render to body
   */
  renderToBody?: boolean;
  /**
   * @zh 图片预览器参数
   * @en Image previewer props
   */
  imageProps?: FilePreviewerImageProps;
  /**
   * @zh 视频和音频预览器参数
   * @en Video and audio previewer props
   */
  mediaProps?: FilePreviewerMediaProps;
  /**
   * @zh PDF 预览器参数
   * @en PDF previewer props
   */
  pdfProps?: FilePreviewerPdfProps;
}
