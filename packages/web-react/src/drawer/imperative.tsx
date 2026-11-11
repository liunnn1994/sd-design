import type { ReactNode } from 'react';

import { getOverlay } from '@sdata/web-core/_utils/dom';
import { createDrawerInstance } from '@sdata/web-core/dialog/imperative';
import { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';

import type { ConfigProviderProps } from '../config-provider/index.js';
import type { DrawerProps } from './index.js';

import { ConfigProvider } from '../config-provider/index.js';
import { DrawerView } from './index.js';

type DrawerContent = ReactNode | (() => ReactNode);
export interface DrawerConfig extends Omit<
  DrawerProps,
  | 'children'
  | 'content'
  | 'title'
  | 'header'
  | 'footer'
  | 'visible'
  | 'defaultVisible'
  | 'unmountOnClose'
  | 'onOk'
  | 'onCancel'
  | 'ref'
> {
  content?: DrawerContent;
  title?: DrawerContent;
  header?: DrawerContent;
  footer?: DrawerContent;
  onOk?: (event?: Event) => void;
  onCancel?: (event?: Event) => void;
}
export type DrawerUpdateConfig = Omit<
  DrawerConfig,
  | 'title'
  | 'content'
  | 'header'
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
export interface DrawerReturn {
  close(): void;
  update(config: DrawerUpdateConfig): void;
}
export interface DrawerMethod {
  open(config: DrawerConfig, context?: Omit<ConfigProviderProps, 'children'>): DrawerReturn;
}
const content = (value: DrawerContent) => (typeof value === 'function' ? value() : value);

export const openDrawer: DrawerMethod['open'] = (initial, context) => {
  const container = getOverlay('drawer');
  document.body.appendChild(container);
  const root = createRoot(container);
  let config = initial;
  let visible = true;
  let committed = false;
  let destroyed = false;
  const instance = createDrawerInstance({
    callbacks: initial,
    setVisible(value) {
      if (destroyed) return;
      visible = value;
      render();
      if (!value && !committed) void instance.afterClose();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.unmount();
      container.remove();
    },
    afterRender: () => Promise.resolve(),
  });
  function View() {
    useLayoutEffect(() => {
      committed = true;
    }, []);
    const {
      content: body,
      title,
      header = true,
      footer = true,
      onOk: _onOk,
      onCancel: _onCancel,
      onClose: _onClose,
      ...props
    } = config;
    return (
      <DrawerView
        {...props}
        renderToBody={false}
        visible={visible}
        unmountOnClose
        title={content(title)}
        header={content(header)}
        footer={content(footer)}
        onOk={instance.ok}
        onCancel={instance.cancel}
        onClose={() => {
          void instance.afterClose();
        }}
      >
        {content(body)}
      </DrawerView>
    );
  }
  function render() {
    const node = <View />;
    root.render(context ? <ConfigProvider {...context}>{node}</ConfigProvider> : node);
  }
  render();
  return {
    close: instance.close,
    update(patch) {
      if (destroyed) return;
      config = { ...config, ...patch };
      render();
    },
  };
};
