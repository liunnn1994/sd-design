import type { NotificationPosition, NoticeId, NoticeReturn } from '@sdata/web-core/notice/types';
import type { ReactNode } from 'react';

import { useMemo } from 'react';

import type { NoticeContext, NoticeController, ReactNoticeConfig } from '../_shared/notice.js';

import { createNoticeController, useNoticeController } from '../_shared/notice.js';

export type { NotificationPosition } from '@sdata/web-core/notice/types';
export { NOTIFICATION_POSITION } from '@sdata/web-core/notice/types';
export type { NoticeContent, NoticeContext } from '../_shared/notice.js';
export interface NotificationConfig extends Omit<ReactNoticeConfig, 'position' | 'resetOnHover'> {
  position?: NotificationPosition;
}
export type NotificationReturn = NoticeReturn;
type NotificationOpen = (
  config: string | NotificationConfig,
  context?: NoticeContext,
) => NotificationReturn;
export interface NotificationMethod {
  info: NotificationOpen;
  success: NotificationOpen;
  warning: NotificationOpen;
  error: NotificationOpen;
  remove(id: NoticeId): void;
  clear(position?: NotificationPosition): void;
}
function methods(controller: NoticeController): NotificationMethod {
  return {
    info: (config, context) => controller.open('info', config, context),
    success: (config, context) => controller.open('success', config, context),
    warning: (config, context) => controller.open('warning', config, context),
    error: (config, context) => controller.open('error', config, context),
    remove: controller.remove,
    clear: controller.clear,
  };
}
export const Notification = methods(createNoticeController('notification'));
export function useNotification(): readonly [NotificationMethod, ReactNode] {
  const [controller, holder] = useNoticeController('notification');
  return [useMemo(() => methods(controller), [controller]), holder];
}
export default Notification;
