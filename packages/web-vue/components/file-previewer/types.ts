import type { Except, Simplify, UnknownRecord } from 'type-fest';

import type { ImageProps } from '../image/interface';

export type FilePreviewerType = 'image' | 'video' | 'audio' | 'pdf';
export type FilePreviewerStatus = 'beforeLoad' | 'loading' | 'loaded' | 'error';
type FilePreviewerImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
export type FilePreviewerImageProps = Simplify<
  Except<Partial<ImageProps>, 'fit'> & { fit?: FilePreviewerImageFit } & UnknownRecord
>;
export type FilePreviewerMediaSkin = 'default' | 'minimal' | 'native' | false | (string & {});
export type FilePreviewerMediaProps = Simplify<
  UnknownRecord & {
    /**
     * @zh 媒体预览皮肤。设置为 `native` 或 `false` 时不渲染 Video.js Web Components
     * @en Media preview skin. Set to `native` or `false` to avoid rendering Video.js Web Components
     */
    skin?: FilePreviewerMediaSkin;
    /**
     * @zh 透传给 `video-player` 的属性
     * @en Props passed to `video-player`
     */
    playerProps?: UnknownRecord;
    /**
     * @zh 透传给当前 skin Web Component 的属性
     * @en Props passed to the selected skin Web Component
     */
    skinProps?: UnknownRecord;
  }
>;
export type FilePreviewerPdfProps = UnknownRecord;

export interface FilePreviewerContentSlotProps {
  src: string;
  type: FilePreviewerType;
  title?: string;
  visible: boolean;
  fullscreen: boolean;
  status: FilePreviewerStatus;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  close: () => void;
  onLoad: () => void;
  onError: () => void;
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
