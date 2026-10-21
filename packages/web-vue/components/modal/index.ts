import type { App, AppContext } from 'vue';
import { createVNode, nextTick, render } from 'vue';

import { createModalInstance, createModalRegistry } from '@sdata/web-core/dialog/imperative';

import type { SDOptions } from '../_utils/types';
import type { ModalConfig, ModalGlobalConfig, ModalMethod, ModalUpdateConfig } from './interface';

import { MESSAGE_TYPES } from '../_utils/constant';
import { getOverlay } from '../_utils/dom';
import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import { omit } from '../_utils/omit';
import { getSlotFunction } from '../_utils/vue-utils';
import _Modal from './modal.vue';

type ModalOpenMethod = Pick<
  ModalMethod,
  'open' | 'confirm' | 'info' | 'success' | 'warning' | 'error'
>;

const registry = createModalRegistry();

const open = (config: ModalConfig, appContext?: AppContext) => {
  let container: HTMLElement | null = getOverlay('modal');
  const instance = createModalInstance({
    callbacks: config,
    setVisible(value) {
      if (vm.component) vm.component.props.visible = value;
    },
    destroy() {
      if (container) {
        render(null, container);
        if (container.parentNode) container.parentNode.removeChild(container);
      }
      container = null;
    },
    remove() {
      registry.remove(instance.destroy);
    },
    afterRender: () => nextTick(),
  });

  const handleUpdateConfig = (config: ModalUpdateConfig) => {
    if (vm.component) {
      Object.entries(config).forEach(([key, value]) => {
        vm.component!.props[key] = value;
      });
    }
  };

  const defaultConfig = {
    visible: true,
    renderToBody: false,
    unmountOnClose: true,
    onOk: instance.ok,
    onCancel: instance.cancel,
    onClose: instance.afterClose,
  };

  const vm = createVNode(
    _Modal,
    {
      ...defaultConfig,
      ...omit(config, [
        'content',
        'title',
        'footer',
        'visible',
        'unmountOnClose',
        'onOk',
        'onCancel',
        'onClose',
      ] as (keyof ModalConfig)[]),
      footer: typeof config.footer === 'boolean' ? config.footer : undefined,
    } as Record<string, unknown>,
    {
      default: getSlotFunction(config.content),
      title: getSlotFunction(config.title),
      footer: typeof config.footer !== 'boolean' ? getSlotFunction(config.footer) : undefined,
    },
  );

  if (appContext ?? Modal._context) {
    vm.appContext = appContext ?? Modal._context;
  }

  render(vm, container);
  document.body.appendChild(container);
  registry.add(instance.destroy);

  return {
    close: instance.close,
    update: handleUpdateConfig,
  };
};

const modal: ModalOpenMethod = {
  open,
  confirm: (config: ModalConfig, appContext?: AppContext) => {
    const { simple } = registry.config;
    const _config = { simple, messageType: 'warning', ...config };

    return open(_config, appContext);
  },
  ...MESSAGE_TYPES.reduce(
    (pre, value) => {
      pre[value] = (config: ModalConfig, appContext?: AppContext) => {
        const { simple } = registry.config;
        const _config = {
          simple,
          hideCancel: true,
          messageType: value,
          ...config,
        };
        return open(_config, appContext);
      };
      return pre;
    },
    {} as Pick<ModalMethod, 'info' | 'success' | 'warning' | 'error'>,
  ),
};

const config = (config: ModalGlobalConfig) => {
  registry.configure(config);
};

const destroyAll = registry.destroyAll;

const Modal = Object.assign(_Modal, {
  ...modal,
  config,
  destroyAll,
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Modal.name, _Modal);

    const modalWithContext = {} as ModalMethod;

    for (const key of Object.keys(modal) as (keyof ModalOpenMethod)[]) {
      modalWithContext[key] = (config, appContext = app._context) => modal[key](config, appContext);
    }
    modalWithContext.config = config;
    modalWithContext.destroyAll = destroyAll;

    app.config.globalProperties.$modal = modalWithContext;
  },
  _context: null as AppContext | null,
});

export type { ModalMethod, ModalConfig, ModalGlobalConfig, ModalReturn } from './interface';

export default Modal;
