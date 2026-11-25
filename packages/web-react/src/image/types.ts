import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';

export interface ImageInstance {
  readonly imageRef: HTMLImageElement | null;
  onImgLoaded(): void;
  onImgLoadError(): void;
  onImgClick(): void;
  onPreviewClose(): void;
}
export interface ImagePreviewInstance {
  readonly element: HTMLDivElement | null;
  onImgLoad(): void;
  onImgError(): void;
}
export type ImagePreviewGroupInstance = ImagePreviewInstance;
export type ImagePreviewActionInstance = HTMLDivElement;

export interface ImagePreviewArrowProps {
  onPrev?: (() => void) | undefined;
  onNext?: (() => void) | undefined;
}
export interface ImagePreviewProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onClose' | 'ref' | 'children'
> {
  ref?: Ref<ImagePreviewInstance>;
  src?: string | undefined;
  visible?: boolean;
  defaultVisible?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  actionsLayout?: string[];
  popupContainer?: string | HTMLElement | undefined;
  renderToBody?: boolean;
  escToClose?: boolean;
  keyboard?: boolean;
  wheelZoom?: boolean;
  defaultScale?: number;
  zoomRate?: number;
  inGroup?: boolean;
  groupArrowProps?: ImagePreviewArrowProps;
  actions?: ReactNode;
  onClose?(): void;
  onVisibleChange?(visible: boolean): void;
}
export interface ImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children' | 'ref'> {
  ref?: Ref<ImageInstance> | undefined;
  description?: string;
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  hideFooter?: boolean | 'never';
  footerPosition?: 'inner' | 'outer';
  footerClass?: string;
  showLoader?: boolean;
  preview?: boolean;
  previewVisible?: boolean;
  defaultPreviewVisible?: boolean;
  previewProps?: ImagePreviewProps;
  renderToBody?: boolean;
  extra?: ReactNode;
  error?: ReactNode;
  errorIcon?: ReactNode;
  loader?: ReactNode;
  previewActions?: ReactNode;
  onPreviewVisibleChange?(visible: boolean): void;
}
export interface ImagePreviewGroupProps extends Omit<
  ImagePreviewProps,
  'src' | 'onClose' | 'onChange' | 'actions'
> {
  children?: ReactNode;
  srcList?: string[];
  current?: number;
  defaultCurrent?: number;
  infinite?: boolean;
  actions?: ReactNode | ((state: { url: string | undefined }) => ReactNode);
  onChange?(index: number): void;
  onCurrentChange?(index: number): void;
}
export interface ImagePreviewActionProps extends ComponentPropsWithRef<'div'> {
  name?: string;
  disabled?: boolean;
}
