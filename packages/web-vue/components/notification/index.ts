import type { App, AppContext } from 'vue';
import { createVNode, render, reactive, ref } from 'vue';

import { createNoticeQueue } from '@sdata/web-core/notice/queue';
import { createNoticeService, resolveNoticeConfig } from '@sdata/web-core/notice/service';

import { MESSAGE_TYPES, MessageType } from '../_utils/constant';
import { getOverlay } from '../_utils/dom';
import { configProviderInjectionKey, type ConfigProvider } from '../config-provider/context';
import {
  NotificationConfig,
  NotificationItem,
  NotificationMethod,
  NotificationPosition,
} from './interface';
import NotificationList from './notification-list.vue';

type _NotificationConfig = NotificationConfig & {
  type: MessageType;
};

const createManager = (config: _NotificationConfig, appContext?: AppContext) => {
  const { position = 'topRight' } = config;
  let container: HTMLElement | null = getOverlay('notification');
  const notifications = ref<NotificationItem[]>([]);
  const queue = createNoticeQueue<_NotificationConfig, NotificationItem>('notification', {
    get items() {
      return notifications.value;
    },
    get alive() {
      return Boolean(container);
    },
    get connected() {
      return Boolean(container?.isConnected);
    },
    create(item) {
      return reactive(item);
    },
    destroy() {
      if (container) {
        render(null, container);
        if (container.parentNode) container.parentNode.removeChild(container);
      }
      container = null;
    },
    onDestroy() {
      service.release(position);
    },
  });
  const vm = createVNode(NotificationList, {
    notifications: notifications.value,
    position,
    onClose: queue.remove,
    onAfterClose: queue.destroy,
  });
  if (appContext ?? Notification._context) vm.appContext = appContext ?? Notification._context;
  render(vm, container);
  document.body.appendChild(container);
  return queue;
};

const service = createNoticeService<
  NotificationPosition,
  _NotificationConfig,
  AppContext | undefined
>({
  defaultPosition: 'topRight',
  create: createManager,
});

const notification = MESSAGE_TYPES.reduce((pre, value) => {
  pre[value] = (config, appContext?: AppContext) => {
    const context = appContext ?? Notification._context;
    const provider = context?.provides[configProviderInjectionKey as symbol] as
      | ConfigProvider
      | undefined;
    const resolved: _NotificationConfig = resolveNoticeConfig(
      value,
      config,
      provider?.notification,
    );
    return service.open(resolved, appContext);
  };
  return pre;
}, {} as NotificationMethod);

notification.remove = service.remove;

notification.clear = service.clear;

const Notification = {
  ...notification,
  install: (app: App) => {
    const _notification = {
      clear: notification.clear,
      remove: notification.remove,
    } as NotificationMethod;

    for (const key of MESSAGE_TYPES) {
      _notification[key] = (config, appContext = app._context) =>
        notification[key](config, appContext);
    }

    app.config.globalProperties.$notification = _notification;
  },
  _context: null as AppContext | null,
};

export type { NotificationMethod, NotificationConfig, NotificationReturn } from './interface';

export default Notification;
