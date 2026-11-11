import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import type { DialogOptions } from '../_shared/use-dialog.js';
import type { ButtonProps } from '../button/index.js';
import type { ConfigProviderProps } from '../config-provider/index.js';
import type { EllipsisProps } from '../ellipsis/index.js';
export interface ModalProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onCancel' | 'onClose' | 'draggable'>,
    Omit<
      DialogOptions,
      | 'transitionKey'
      | 'animationName'
      | 'maskAnimationName'
      | 'closeSelector'
      | 'beforeOpening'
      | 'beforeClosed'
    > {
  title?: ReactNode;
  titleEllipsisTooltip?: EllipsisProps['tooltip'];
  titleAlign?: 'start' | 'center';
  width?: number | string;
  top?: number | string;
  mask?: boolean;
  maskClosable?: boolean;
  maskStyle?: CSSProperties;
  alignCenter?: boolean;
  unmountOnClose?: boolean;
  hideCancel?: boolean;
  simple?: boolean;
  closable?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okLoading?: boolean;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  footer?: ReactNode;
  renderToBody?: boolean;
  modalClass?: string | string[];
  modalStyle?: CSSProperties;
  draggable?: boolean;
  fullscreen?: boolean;
  maskAnimationName?: string;
  modalAnimationName?: string;
  bodyClass?: string | string[];
  bodyStyle?: CSSProperties;
  messageType?: 'info' | 'success' | 'warning' | 'error';
  hideTitle?: boolean;
}
export type ModalProviderConfig = Pick<
  ModalProps,
  | 'mask'
  | 'maskClosable'
  | 'maskStyle'
  | 'alignCenter'
  | 'escToClose'
  | 'draggable'
  | 'closable'
  | 'titleAlign'
  | 'top'
  | 'footer'
  | 'hideCancel'
  | 'okText'
  | 'cancelText'
  | 'okButtonProps'
  | 'cancelButtonProps'
  | 'titleEllipsisTooltip'
  | 'width'
>;
export type ModalContent = ReactNode | (() => ReactNode);
export interface ModalConfig extends Omit<
  ModalProps,
  | 'content'
  | 'children'
  | 'title'
  | 'footer'
  | 'visible'
  | 'defaultVisible'
  | 'unmountOnClose'
  | 'onOk'
  | 'onCancel'
> {
  content: ModalContent;
  title?: ModalContent;
  footer?: ModalContent;
  onOk?: (event?: Event) => void;
  onCancel?: (event?: Event) => void;
}
export type ModalUpdateConfig = Omit<
  ModalConfig,
  | 'title'
  | 'content'
  | 'footer'
  | 'onOk'
  | 'onCancel'
  | 'onBeforeOk'
  | 'onBeforeCancel'
  | 'onOpen'
  | 'onClose'
  | 'onBeforeOpen'
  | 'onBeforeClose'
>;
export interface ModalReturn {
  close(): void;
  update(config: ModalUpdateConfig): void;
}
export interface ModalGlobalConfig {
  simple?: boolean;
}
export type ModalContext = Omit<ConfigProviderProps, 'children'>;
export interface ModalMethod {
  open(config: ModalConfig, context?: ModalContext): ModalReturn;
  confirm(config: ModalConfig, context?: ModalContext): ModalReturn;
  info(config: ModalConfig, context?: ModalContext): ModalReturn;
  success(config: ModalConfig, context?: ModalContext): ModalReturn;
  warning(config: ModalConfig, context?: ModalContext): ModalReturn;
  error(config: ModalConfig, context?: ModalContext): ModalReturn;
  config(config: ModalGlobalConfig): void;
  destroyAll(): void;
}
