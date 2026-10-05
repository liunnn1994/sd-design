import { Slot } from 'vue';

export interface ImageProps {
  src?: string;
  width?: string | number;
  height?: string | number;
  title?: string;
  description?: string;
  fit?: '' | 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  alt?: string;
  hideFooter: boolean | 'never';
  footerPosition: 'inner' | 'outer';
  showLoader: boolean;
  preview: boolean;
  previewVisible?: boolean;
  defaultPreviewVisible: boolean;
  previewProps?: Partial<ImagePreviewProps>;
  /**
   * @zh 图片下方的附加内容插槽
   * @en Slot for extra content below the image
   */
  extra?: Slot;
  /**
   * @zh 加载失败时的内容插槽
   * @en Slot rendered when the image fails to load
   */
  error?: Slot;
  /**
   * @zh 加载中的内容插槽
   * @en Slot rendered while the image is loading
   */
  loader?: Slot;
  /**
   * @zh 预览浮层显示状态变化时触发
   * @en Triggered when the preview visibility changes
   */
  onPreviewVisibleChange?: (visible: boolean) => void;
}

export interface ImagePreviewProps {
  src?: string;
  visible?: boolean;
  defaultVisible?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  actionsLayout?: string[];
  popupContainer?: HTMLElement | string;
  /**
   * @zh 按 Esc 是否关闭预览
   * @en Whether pressing Escape closes the preview
   */
  escToClose?: boolean;
  /**
   * @zh 是否支持键盘操作
   * @en Whether keyboard interaction is supported
   */
  keyboard?: boolean;
  /**
   * @zh 是否支持滚轮缩放
   * @en Whether the wheel zooms the image
   */
  wheelZoom?: boolean;
  /**
   * @zh 默认缩放比例
   * @en Default zoom scale
   */
  defaultScale?: number;
  /**
   * @zh 每次缩放的倍率
   * @en Zoom factor applied per step
   */
  zoomRate?: number;
  /**
   * @zh 图片组左右箭头的组件属性
   * @en Props forwarded to the group prev/next arrows
   */
  groupArrowProps?: Record<string, unknown>;
  /**
   * @zh 关闭预览时触发
   * @en Triggered when the preview closes
   */
  onClose?: () => void;
}

export interface ImagePreviewGroupProps extends Omit<ImagePreviewProps, 'src' | 'onClose'> {
  srcList?: string[];
  current?: number;
  defaultCurrent: number;
  infinite: boolean;
  onChange?: (index: number, preIndex: number) => void;
  onPreviewVisibleChange?: (visible: boolean) => void;
}
