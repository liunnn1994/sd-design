import type { PDFDocumentProxy } from 'pdfjs-dist';
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
export type FilePreviewerPdfRotation = 0 | 90 | 180 | 270;
export type FilePreviewerPdfProps = Simplify<
  UnknownRecord & {
    /**
     * @zh 是否使用 Worker 渲染，默认 `true`。设为 `false` 时退回主线程渲染（大文件可能阻塞 UI；该切换为全局一次性，启用后本页所有后续 PDF 都在主线程渲染）
     * @en Whether to render with a Worker, defaults to `true`. Set to `false` to fall back to main-thread rendering (may block UI on large files; this is a one-way global switch — once enabled, all subsequent PDFs on the page render on the main thread)
     */
    worker?: boolean;
    /**
     * @zh pdf.js worker 资源地址，优先级低于 `workerPort`。未提供时使用打包进本库的 worker（离线可用）；如需 CDN 可在此指定
     * @en pdf.js worker source url, lower priority than `workerPort`. When not provided, the worker bundled into this library is used (offline-capable); set this to use a CDN
     */
    workerSrc?: string;
    /**
     * @zh 已构造的 pdf.js Worker 实例，优先级高于 `workerSrc`
     * @en A constructed pdf.js Worker instance, takes precedence over `workerSrc`
     */
    workerPort?: Worker;
    /**
     * @zh 渲染缩放比例，默认 `1`
     * @en Render scale, defaults to `1`
     */
    scale?: number;
    /**
     * @zh 页面旋转角度
     * @en Page rotation in degrees
     */
    rotation?: FilePreviewerPdfRotation;
    /**
     * @zh 初始页码，从 `1` 开始
     * @en Initial page number, 1-based
     */
    page?: number;
    /**
     * @zh 透传给 pdf.js `getDocument` 的参数（`url` 由 `src` 自动注入）
     * @en Parameters passed to pdf.js `getDocument` (`url` is injected from `src`)
     */
    documentParams?: UnknownRecord;
    /**
     * @zh 透传给 pdf.js `page.render` 的参数，会与 `canvasContext` / `viewport` 合并
     * @en Parameters passed to pdf.js `page.render`, merged with `canvasContext` / `viewport`
     */
    renderParams?: UnknownRecord;
    /**
     * @zh PDF 文档加载完成回调，参数为 pdf.js 文档代理
     * @en Fired when the PDF document is loaded, receives the pdf.js document proxy
     */
    onDocumentLoad?: (doc: PDFDocumentProxy) => void;
  }
>;

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

export interface FilePreviewerPdfSlotProps {
  src: string;
  status: FilePreviewerStatus;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  /**
   * @zh pdf.js 文档代理，加载完成后可用
   * @en pdf.js document proxy, available after loaded
   */
  doc: PDFDocumentProxy | null;
  /**
   * @zh 当前页码，从 `1` 开始
   * @en Current page number, 1-based
   */
  page: number;
  /**
   * @zh 总页数
   * @en Total page count
   */
  numPages: number;
  /**
   * @zh 跳转到指定页
   * @en Go to a specific page
   */
  goto: (page: number) => void;
  /**
   * @zh 上一页
   * @en Go to previous page
   */
  prev: () => void;
  /**
   * @zh 下一页
   * @en Go to next page
   */
  next: () => void;
  /**
   * @zh 将指定页渲染到传入的 canvas 上
   * @en Render a specific page onto the given canvas
   */
  render: (canvas: HTMLCanvasElement, page?: number) => Promise<void>;
  close: () => void;
  onLoad: () => void;
  onError: (error?: unknown) => void;
}

export interface FilePreviewerMediaSlotProps {
  src: string;
  status: FilePreviewerStatus;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  /**
   * @zh 当前媒体皮肤配置
   * @en Current media skin config
   */
  skin: FilePreviewerMediaSkin;
  /**
   * @zh 是否启用了 Video.js Web Components
   * @en Whether Video.js Web Components are enabled
   */
  useVideoJs: boolean;
  /**
   * @zh 透传给 `video-player` / `audio-player` 的属性
   * @en Props passed to `video-player` / `audio-player`
   */
  playerProps: UnknownRecord;
  /**
   * @zh 透传给当前 skin Web Component 的属性
   * @en Props passed to the selected skin Web Component
   */
  skinProps: UnknownRecord;
  close: () => void;
  onLoad: () => void;
  onError: (error?: unknown) => void;
}

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
