import type { ReactNode } from 'react';

import { getOverlay } from '@sdata/web-core/_utils/dom';
import { createModalInstance, createModalRegistry } from '@sdata/web-core/dialog/imperative';
import { useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

import type { ModalConfig, ModalContent, ModalContext, ModalMethod } from './types.js';

import { ConfigProvider } from '../config-provider/index.js';
import { ModalView } from './modal.js';

type Instance = ReturnType<typeof createModalInstance>;
interface Item {
  id: number;
  config: ModalConfig;
  visible: boolean;
  container: HTMLElement;
  instance: Instance;
  context?: ModalContext | undefined;
  root?: Root | undefined;
  committed?: boolean;
}
const content = (value: ModalContent) => (typeof value === 'function' ? <>{value()}</> : value);
function ModalItem({ item }: { item: Item }) {
  useLayoutEffect(() => {
    item.committed = true;
  }, [item]);
  const {
    content: body,
    title,
    footer = true,
    onOk: _onOk,
    onCancel: _onCancel,
    onClose: _onClose,
    ...props
  } = item.config;
  return (
    <ModalView
      renderToBody={false}
      {...props}
      visible={item.visible}
      unmountOnClose
      title={content(title)}
      footer={content(footer)}
      onOk={item.instance.ok}
      onCancel={item.instance.cancel}
      onClose={() => {
        void item.instance.afterClose();
      }}
    >
      {content(body)}
    </ModalView>
  );
}
function createModalController(portal: boolean) {
  const registry = createModalRegistry();
  const items = new Map<number, Item>();
  const listeners = new Set<() => void>();
  let active = true;
  let sequence = 0;
  let version = 0;
  const notify = () => {
    version++;
    listeners.forEach((listener) => listener());
  };
  const renderItem = (item: Item) => {
    const node = <ModalItem item={item} />;
    return item.context ? <ConfigProvider {...item.context}>{node}</ConfigProvider> : node;
  };
  const refresh = (item: Item) => {
    if (portal) notify();
    else item.root?.render(renderItem(item));
  };
  const open: ModalMethod['open'] = (config, context) => {
    if (!active) return { close() {}, update() {} };
    const container = getOverlay('modal');
    document.body.appendChild(container);
    const id = ++sequence;
    const instance = createModalInstance({
      callbacks: config,
      setVisible(value) {
        const item = items.get(id);
        if (item) {
          item.visible = value;
          refresh(item);
          if (!value && !item.committed) void instance.afterClose();
        }
      },
      destroy() {
        const item = items.get(id);
        if (!item) return;
        items.delete(id);
        item.root?.unmount();
        container.remove();
        notify();
      },
      remove: () => registry.remove(instance.destroy),
      afterRender: () => Promise.resolve(),
    });
    const item: Item = {
      id,
      config,
      visible: true,
      container,
      instance,
      context,
      root: portal ? undefined : createRoot(container),
    };
    items.set(id, item);
    registry.add(instance.destroy);
    refresh(item);
    return {
      close: instance.close,
      update(patch) {
        if (!items.has(id)) return;
        item.config = { ...item.config, ...patch };
        refresh(item);
      },
    };
  };
  const api: ModalMethod = {
    open,
    confirm: (config, context) =>
      open({ simple: registry.config.simple, messageType: 'warning', ...config }, context),
    info: (config, context) =>
      open(
        { simple: registry.config.simple, hideCancel: true, messageType: 'info', ...config },
        context,
      ),
    success: (config, context) =>
      open(
        { simple: registry.config.simple, hideCancel: true, messageType: 'success', ...config },
        context,
      ),
    warning: (config, context) =>
      open(
        { simple: registry.config.simple, hideCancel: true, messageType: 'warning', ...config },
        context,
      ),
    error: (config, context) =>
      open(
        { simple: registry.config.simple, hideCancel: true, messageType: 'error', ...config },
        context,
      ),
    config: registry.configure,
    destroyAll: registry.destroyAll,
  };
  return {
    api,
    mount() {
      active = true;
    },
    dispose() {
      active = false;
      registry.destroyAll();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    snapshot: () => version,
    render: () =>
      [...items.values()].map((item) => createPortal(renderItem(item), item.container, item.id)),
  };
}
const globalController = createModalController(false);
export const modalMethods = globalController.api;
function ModalHolder({ controller }: { controller: ReturnType<typeof createModalController> }) {
  useSyncExternalStore(controller.subscribe, controller.snapshot, controller.snapshot);
  return <>{controller.render()}</>;
}
export function useModal(): readonly [ModalMethod, ReactNode] {
  const [controller] = useState(() => createModalController(true));
  useLayoutEffect(() => {
    controller.mount();
    return () => controller.dispose();
  }, [controller]);
  return [controller.api, <ModalHolder controller={controller} />] as const;
}
