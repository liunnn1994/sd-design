import type { App, AppContext, Ref } from 'vue';
import { createVNode, render, ref, reactive } from 'vue';

import { MESSAGE_TYPES, MessageType } from '../_utils/constant';
import { getOverlay } from '../_utils/dom';
import { isFunction, isString, isUndefined } from '../_utils/is';
import { configProviderInjectionKey, type ConfigProvider } from '../config-provider/context';
import { MessageConfig, MessageItem, MessageMethod, MessagePosition } from './interface';
import MessageList from './message-list.vue';

type _MessageConfig = MessageConfig & {
  type: MessageType | 'loading' | 'normal';
};

class MessageManger {
  private readonly pool = new Set<MessageItem>();

  private readonly messageIds: Set<number | string>;

  private readonly messages: Ref<MessageItem[]>;

  private readonly position: MessagePosition;

  private container: HTMLElement | null;

  private messageCount = 0;

  constructor(config: _MessageConfig, appContext?: AppContext) {
    const { position = 'top' } = config;
    this.container = getOverlay('message');
    this.messageIds = new Set();
    this.messages = ref([]);
    this.position = position;

    const vm = createVNode(MessageList, {
      messages: this.messages.value,
      position,
      onClose: this.remove,
      onAfterClose: this.destroy,
    });

    if (appContext ?? Message._context) {
      vm.appContext = appContext ?? Message._context;
    }
    render(vm, this.container);
    document.body.appendChild(this.container);
  }

  add = (config: _MessageConfig) => {
    this.messageCount++;
    let id = config.id ?? `__sd_message_${this.messageCount}`;
    if (isUndefined(config.id)) {
      while (this.messageIds.has(id)) {
        id = `__sd_message_${++this.messageCount}`;
      }
    }
    if (this.messageIds.has(id)) {
      return this.update(id, config);
    }
    const message: MessageItem = reactive({ ...config, id });
    this.messages.value.push(message);
    if (config.deduplicate) {
      this.pool.add(message);
    }
    this.messageIds.add(id);
    return {
      close: () => this.remove(id),
    };
  };

  reuse = (config: _MessageConfig) => {
    for (const item of this.pool) {
      if (
        (!config.deduplicateByType || item.type === config.type) &&
        item.content === config.content
      ) {
        if (!isUndefined(config.duration)) {
          item.duration = config.duration;
        }
        item.timerVersion = (item.timerVersion ?? 0) + 1;
        return { close: () => this.remove(item.id) };
      }
    }
  };

  update = (id: number | string, config: _MessageConfig) => {
    for (let i = 0; i < this.messages.value.length; i++) {
      if (this.messages.value[i].id === id) {
        const resetOnUpdate = !isUndefined(config.duration);
        Object.assign(this.messages.value[i], { ...config, id, resetOnUpdate });
        const updated = this.messages.value[i];
        if (config.deduplicate) {
          this.pool.add(updated);
        } else {
          this.pool.delete(updated);
        }
        break;
      }
    }
    return {
      close: () => this.remove(id),
    };
  };

  remove = (id: number | string) => {
    for (let i = 0; i < this.messages.value.length; i++) {
      const item = this.messages.value[i];
      if (item.id === id) {
        this.messages.value.splice(i, 1);
        this.messageIds.delete(id);
        this.pool.delete(item);
        if (isFunction(item.onClose)) {
          item.onClose(id);
        }
        break;
      }
    }
  };

  clear = () => {
    this.messages.value.splice(0);
    this.messageIds.clear();
    this.pool.clear();
  };

  destroy = () => {
    if (this.messages.value.length === 0 && this.container) {
      render(null, this.container);
      if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.container = null;
      messageInstance[this.position] = undefined;
    }
  };

  isDisconnected = () => {
    return !this.container || !this.container.isConnected;
  };
}

const messageInstance: {
  top?: MessageManger;
  bottom?: MessageManger;
} = {};

const types = [...MESSAGE_TYPES, 'loading', 'normal'] as const;

const message = types.reduce((pre, value) => {
  pre[value] = (config, appContext?: AppContext) => {
    if (isString(config)) {
      config = { content: config };
    }
    const context = appContext ?? Message._context;
    const provider = context?.provides[configProviderInjectionKey as symbol] as
      | ConfigProvider
      | undefined;
    const _config: _MessageConfig = {
      type: value,
      ...config,
      deduplicate: config.deduplicate ?? provider?.message?.deduplicate ?? false,
      deduplicateByType: config.deduplicateByType ?? provider?.message?.deduplicateByType ?? true,
    };
    const { position = 'top' } = _config;
    for (const instance of Object.values(messageInstance)) {
      if (instance?.isDisconnected()) {
        instance.clear();
        instance.destroy();
      }
    }
    if (_config.deduplicate && isUndefined(_config.id)) {
      for (const instance of Object.values(messageInstance)) {
        const reused = instance?.reuse(_config);
        if (reused) {
          return reused;
        }
      }
    }
    if (!messageInstance[position]) {
      messageInstance[position] = new MessageManger(_config, appContext);
    }
    return messageInstance[position]!.add(_config);
  };
  return pre;
}, {} as MessageMethod);

message.clear = (position?: MessagePosition) => {
  if (position) {
    messageInstance[position]?.clear();
  } else {
    Object.values(messageInstance).forEach((item) => item?.clear());
  }
};

const Message = {
  ...message,
  install: (app: App): void => {
    const _message = {
      clear: message.clear,
    } as MessageMethod;

    for (const key of types) {
      _message[key] = (config, appContext = app._context) => message[key](config, appContext);
    }

    app.config.globalProperties.$message = _message;
  },
  _context: null as AppContext | null,
};

export type { MessageMethod, MessageConfig, MessageReturn } from './interface';

export default Message;
