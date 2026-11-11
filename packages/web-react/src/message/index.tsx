import type { MessagePosition, NoticeReturn } from '@sdata/web-core/notice/types';
import type { ReactNode } from 'react';

import { useMemo } from 'react';

import type { NoticeContext, NoticeController, ReactNoticeConfig } from '../_shared/notice.js';

import { createNoticeController, useNoticeController } from '../_shared/notice.js';

export type { MessagePosition } from '@sdata/web-core/notice/types';
export { MESSAGE_POSITION } from '@sdata/web-core/notice/types';
export type { NoticeContent, NoticeContext } from '../_shared/notice.js';
export interface MessageConfig extends Omit<
  ReactNoticeConfig,
  | 'position'
  | 'title'
  | 'footer'
  | 'closeIcon'
  | 'closeIconElement'
  | 'className'
  | 'style'
  | 'resetOnUpdate'
> {
  position?: MessagePosition;
}
export type MessageReturn = NoticeReturn;
type MessageOpen = (config: string | MessageConfig, context?: NoticeContext) => MessageReturn;
export interface MessageMethod {
  info: MessageOpen;
  success: MessageOpen;
  warning: MessageOpen;
  error: MessageOpen;
  loading: MessageOpen;
  normal: MessageOpen;
  clear(position?: MessagePosition): void;
}
function methods(controller: NoticeController): MessageMethod {
  return {
    info: (config, context) => controller.open('info', config, context),
    success: (config, context) => controller.open('success', config, context),
    warning: (config, context) => controller.open('warning', config, context),
    error: (config, context) => controller.open('error', config, context),
    loading: (config, context) => controller.open('loading', config, context),
    normal: (config, context) => controller.open('normal', config, context),
    clear: controller.clear,
  };
}
export const Message = methods(createNoticeController('message'));
export function useMessage(): readonly [MessageMethod, ReactNode] {
  const [controller, holder] = useNoticeController('message');
  return [useMemo(() => methods(controller), [controller]), holder];
}
export default Message;
