import type { App, AppContext } from 'vue';
import { createVNode, render, ref, reactive } from 'vue';

import { createNoticeQueue } from '@sdata/web-core/notice/queue';
import { createNoticeService, resolveNoticeConfig } from '@sdata/web-core/notice/service';

import { MESSAGE_TYPES, MessageType } from '../_utils/constant';
import { getOverlay } from '../_utils/dom';
import { configProviderInjectionKey, type ConfigProvider } from '../config-provider/context';
import { MessageConfig, MessageItem, MessageMethod, MessagePosition } from './interface';
import MessageList from './message-list.vue';

type _MessageConfig = MessageConfig & {
  type: MessageType | 'loading' | 'normal';
};

const createManager = (config: _MessageConfig, appContext?: AppContext) => {
  const { position = 'top' } = config;
  let container: HTMLElement | null = getOverlay('message');
  const messages = ref<MessageItem[]>([]);
  const queue = createNoticeQueue<_MessageConfig, MessageItem>('message', {
    get items() {
      return messages.value;
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
  const vm = createVNode(MessageList, {
    messages: messages.value,
    position,
    onClose: queue.remove,
    onAfterClose: queue.destroy,
  });
  if (appContext ?? Message._context) vm.appContext = appContext ?? Message._context;
  render(vm, container);
  document.body.appendChild(container);
  return queue;
};

const service = createNoticeService<MessagePosition, _MessageConfig, AppContext | undefined>({
  defaultPosition: 'top',
  create: createManager,
});

const types = [...MESSAGE_TYPES, 'loading', 'normal'] as const;

const message = types.reduce((pre, value) => {
  pre[value] = (config, appContext?: AppContext) => {
    const context = appContext ?? Message._context;
    const provider = context?.provides[configProviderInjectionKey as symbol] as
      | ConfigProvider
      | undefined;
    const resolved: _MessageConfig = resolveNoticeConfig(value, config, provider?.message);
    return service.open(resolved, appContext);
  };
  return pre;
}, {} as MessageMethod);

message.clear = service.clear;

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
