import type { App, AppContext } from 'vue';
import { createVNode, nextTick, render } from 'vue';

import { createDrawerInstance } from '@sdata/web-core/dialog/imperative';

import type { DrawerConfig, DrawerMethod, DrawerUpdateConfig } from './interface';

import { getOverlay } from '../_utils/dom';
import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import { omit } from '../_utils/omit';
import { SDOptions } from '../_utils/types';
import { getSlotFunction } from '../_utils/vue-utils';
import _Drawer from './drawer.vue';

const open = (config: DrawerConfig, appContext?: AppContext) => {
  let container: HTMLElement | null = getOverlay('drawer');

  const instance = createDrawerInstance({
    callbacks: config,
    setVisible(value) {
      if (vm.component) vm.component.props.visible = value;
    },
    destroy() {
      if (container) {
        render(null, container);
        document.body.removeChild(container);
      }
      container = null;
    },
    afterRender: () => nextTick(),
  });

  const handleUpdateConfig = (config: DrawerUpdateConfig) => {
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
    _Drawer,
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
      ] as (keyof DrawerConfig)[]),
      header: typeof config.header === 'boolean' ? config.header : undefined,
      footer: typeof config.footer === 'boolean' ? config.footer : undefined,
    } as Record<string, unknown>,
    {
      default: getSlotFunction(config.content),
      header: typeof config.header !== 'boolean' ? getSlotFunction(config.header) : undefined,
      title: getSlotFunction(config.title),
      footer: typeof config.footer !== 'boolean' ? getSlotFunction(config.footer) : undefined,
    },
  );

  if (appContext ?? Drawer._context) {
    vm.appContext = appContext ?? Drawer._context;
  }

  render(vm, container);
  document.body.appendChild(container);

  return {
    close: instance.close,
    update: handleUpdateConfig,
  };
};

const Drawer = Object.assign(_Drawer, {
  open,
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Drawer.name, _Drawer);

    const drawerWithContext: DrawerMethod = {
      open: (config, appContext = app._context) => open(config, appContext),
    };

    app.config.globalProperties.$drawer = drawerWithContext;
  },
  _context: null as AppContext | null,
});

export type { DrawerMethod, DrawerConfig, DrawerReturn } from './interface';

export type DrawerInstance = InstanceType<typeof _Drawer>;
// Runtime props of the Drawer component, derived from the SFC so the prop
// list stays in sync without a hand-maintained interface.
export type DrawerProps = InstanceType<typeof _Drawer>['$props'];

export default Drawer;
