export const MESSAGE_POSITION = ['top', 'bottom'] as const;
export type MessagePosition = (typeof MESSAGE_POSITION)[number];
export const NOTIFICATION_POSITION = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
export type NotificationPosition = (typeof NOTIFICATION_POSITION)[number];
export type NoticeId = number | string;
export interface NoticeReturn {
  close(): void;
}
export interface NoticeConfig {
  content: unknown;
  title?: unknown;
  type?: string;
  id?: NoticeId;
  duration?: number;
  deduplicate?: boolean;
  deduplicateByType?: boolean;
  resetOnUpdate?: boolean;
}
export interface NoticeItem<Content = unknown> {
  id: NoticeId;
  content: Content;
  title?: unknown;
  type?: string;
  duration?: number;
  timerVersion?: number;
  resetOnUpdate?: boolean;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: (id: NoticeId) => void;
}
