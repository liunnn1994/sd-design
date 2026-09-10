import type { App, AppContext, Ref } from 'vue';
import { createVNode, render, reactive, ref } from 'vue';

import { MESSAGE_TYPES, MessageType } from '../_utils/constant';
import { getOverlay } from '../_utils/dom';
import { isFunction, isString, isUndefined } from '../_utils/is';
import {
  NotificationConfig,
  NotificationItem,
  NotificationMethod,
  NotificationPosition,
} from './interface';
import NotificationList from './notification-list.vue';

type _NotificationConfig = NotificationConfig & {
  type: MessageType;
  /** resetOnUpdate 可由调用方显式传入以保留计时器重启意图（同 NotificationItem） */
  resetOnUpdate?: boolean;
};

class NotificationManger {
  private readonly notificationIds: Set<number | string>;

  private readonly notifications: Ref<NotificationItem[]>;

  private readonly position: NotificationPosition;

  private container: HTMLElement | null;

  private notificationCount = 0;

  constructor(config: _NotificationConfig, appContext?: AppContext) {
    const { position = 'topRight' } = config;
    this.container = getOverlay('notification');
    this.notificationIds = new Set();
    this.notifications = ref([]);
    this.position = position;

    const vm = createVNode(NotificationList, {
      notifications: this.notifications.value,
      position,
      onClose: this.remove,
      onAfterClose: this.destroy,
    });

    if (appContext ?? Notification._context) {
      vm.appContext = appContext ?? Notification._context;
    }
    render(vm, this.container);
    document.body.appendChild(this.container);
  }

  add = (config: _NotificationConfig) => {
    this.notificationCount++;
    const id = config.id ?? `__arco_notification_${this.notificationCount}`;
    if (this.notificationIds.has(id)) {
      return this.update(id, config);
    }
    const notification: NotificationItem = reactive({ id, ...config });
    this.notifications.value.push(notification);
    this.notificationIds.add(id);

    return {
      close: () => this.remove(id),
    };
  };

  update = (id: number | string, config: _NotificationConfig) => {
    for (let i = 0; i < this.notifications.value.length; i++) {
      if (this.notifications.value[i].id === id) {
        const item = this.notifications.value[i];
        // 仅在本次更新配置与既有项都未显式设置 resetOnUpdate 时，才按 duration 推导默认值，
        // 避免无 duration 的更新把用户显式设置的 resetOnUpdate 覆盖回 false
        const resetOnUpdate =
          config.resetOnUpdate ?? item.resetOnUpdate ?? !isUndefined(config.duration);
        Object.assign(item, {
          ...config,
          id,
          resetOnUpdate,
        });
        break;
      }
    }
    return {
      close: () => this.remove(id),
    };
  };

  remove = (id: number | string) => {
    for (let i = 0; i < this.notifications.value.length; i++) {
      const item = this.notifications.value[i];

      if (item.id === id) {
        if (isFunction(item.onClose)) {
          item.onClose(id);
        }

        this.notifications.value.splice(i, 1);
        this.notificationIds.delete(id);
        break;
      }
    }
  };

  clear = () => {
    this.notifications.value.splice(0);
    this.notificationIds.clear();
  };

  destroy = () => {
    if (this.notifications.value.length === 0 && this.container) {
      render(null, this.container);
      document.body.removeChild(this.container);
      this.container = null;
      notificationInstance[this.position] = undefined;
    }
  };

  isDisconnected = () => {
    return !this.container || !this.container.isConnected;
  };
}

const notificationInstance: {
  topLeft?: NotificationManger;
  topRight?: NotificationManger;
  bottomLeft?: NotificationManger;
  bottomRight?: NotificationManger;
} = {};

const notification = MESSAGE_TYPES.reduce((pre, value) => {
  pre[value] = (config, appContext?: AppContext) => {
    if (isString(config)) {
      config = { content: config };
    }

    const _config: _NotificationConfig = { type: value, ...config };
    const { position = 'topRight' } = _config;
    if (notificationInstance[position]?.isDisconnected()) {
      notificationInstance[position] = undefined;
    }
    if (!notificationInstance[position]) {
      notificationInstance[position] = new NotificationManger(_config, appContext);
    }
    return notificationInstance[position]!.add(_config);
  };
  return pre;
}, {} as NotificationMethod);

notification.remove = (id: string) => {
  if (id) {
    Object.values(notificationInstance).forEach((item) => item?.remove(id));
  }
};

notification.clear = (position?: NotificationPosition) => {
  if (position) {
    notificationInstance[position]?.clear();
  } else {
    Object.values(notificationInstance).forEach((item) => item?.clear());
  }
};

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
