import type { NoticeId, NoticeReturn } from '@sdata/web-core/notice/types';
import type { CSSProperties, ReactNode, RefObject } from 'react';

import { getOverlay } from '@sdata/web-core/_utils/dom';
import { createNoticeQueue } from '@sdata/web-core/notice/queue';
import { createNoticeService, resolveNoticeConfig } from '@sdata/web-core/notice/service';
import { createNoticeTimer } from '@sdata/web-core/notice/timer';
import { createPopupEntry } from '@sdata/web-core/popup/manager';
import { memo, useContext, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';

import type { ConfigProviderProps } from '../config-provider/index.js';

import { ConfigProvider, useConfig, usePrefix } from '../config-provider/index.js';
import { ThemeContext } from '../config-provider/theme-provider.js';
import { useI18n } from '../locale/index.js';
import { LoadingIcon } from './loading-icon.js';
import { StatusIcon } from './status-icon.js';
import { useTransitionPresence } from './use-transition-presence.js';

export type NoticeContent = ReactNode | (() => ReactNode);
export type NoticeContext = Omit<ConfigProviderProps, 'children'>;
export type NoticeType = 'info' | 'success' | 'warning' | 'error' | 'loading' | 'normal';
export interface ReactNoticeConfig {
  content: NoticeContent;
  title?: NoticeContent;
  id?: string;
  position?: string;
  icon?: NoticeContent;
  showIcon?: boolean;
  closable?: boolean;
  duration?: number;
  deduplicate?: boolean;
  deduplicateByType?: boolean;
  resetOnHover?: boolean;
  resetOnUpdate?: boolean;
  footer?: NoticeContent;
  closeIcon?: NoticeContent;
  closeIconElement?: NoticeContent;
  className?: string;
  style?: CSSProperties;
  onClose?: (id: NoticeId) => void;
}
type Kind = 'message' | 'notification';
interface Item extends Omit<ReactNoticeConfig, 'id'> {
  id: NoticeId;
  key: number;
  type: NoticeType;
  timerVersion?: number;
}
interface Manager {
  key: number;
  container: HTMLElement;
  context?: NoticeContext | undefined;
  position: string;
  subscribe(callback: () => void): () => void;
  snapshot(): Item[];
  remove(id: NoticeId): void;
  destroy(): void;
  dispose(): void;
}
const renderContent = (content: NoticeContent) =>
  typeof content === 'function' ? content() : content;

const NoticeView = memo(
  function NoticeView({
    item,
    kind,
    visible,
    remove,
    afterLeave,
  }: {
    item: Item;
    kind: Kind;
    visible: boolean;
    remove(id: NoticeId): void;
    afterLeave(key: number): void;
  }) {
    const prefix = usePrefix(kind);
    const iconPrefix = usePrefix('icon');
    const { t } = useI18n();
    const [element, setElement] = useState<HTMLLIElement | null>(null);
    const current = useRef({ item, remove });
    current.current = { item, remove };
    const [timer] = useState(() =>
      createNoticeTimer({
        get duration() {
          return current.current.item.duration ?? 3000;
        },
        get resetOnUpdate() {
          return current.current.item.resetOnUpdate ?? false;
        },
        get resetOnHover() {
          return kind === 'message' && (current.current.item.resetOnHover ?? true);
        },
        schedule: (callback, duration) => window.setTimeout(callback, duration),
        cancel: (handle) => window.clearTimeout(handle),
        onClose: () => current.current.remove(current.current.item.id),
      }),
    );
    useLayoutEffect(() => {
      if (visible) timer.start();
      return timer.clear;
    }, [timer, visible]);
    const previous = useRef(item);
    useLayoutEffect(() => {
      if (previous.current !== item && visible) {
        if (previous.current.timerVersion !== item.timerVersion) timer.restart();
        else timer.updated();
      }
      previous.current = item;
    }, [item, visible, timer]);
    const name =
      kind === 'message'
        ? 'fade-message'
        : `slide-${item.position?.includes('Right') ? 'right' : 'left'}-notification`;
    const presence = useTransitionPresence(
      visible,
      element,
      name,
      undefined,
      () => {},
      () => afterLeave(item.key),
    );
    if (!presence.present) return null;
    const icon =
      item.icon !== undefined ? (
        renderContent(item.icon)
      ) : item.type === 'loading' ? (
        <LoadingIcon />
      ) : item.type !== 'normal' ? (
        <StatusIcon type={item.type} />
      ) : null;
    const closeIcon = (
      <span className={`${iconPrefix}-hover ${prefix}-icon-hover`}>
        {item.closeIcon !== undefined ? (
          renderContent(item.closeIcon)
        ) : (
          <svg
            className={`${iconPrefix} ${iconPrefix}-close`}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            aria-hidden="true"
          >
            <path d="m12 12 24 24M12 36l24-24" />
          </svg>
        )}
      </span>
    );
    return (
      <li
        ref={setElement}
        role="alert"
        style={item.style}
        className={[
          prefix,
          `${prefix}-${item.type}`,
          item.closable && `${prefix}-closable`,
          item.className,
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseEnter={kind === 'message' ? timer.enter : undefined}
        onMouseLeave={kind === 'message' ? timer.leave : undefined}
      >
        {kind === 'message' ? (
          <>
            {item.showIcon !== false && icon !== null && (
              <span className={`${prefix}-icon`}>{icon}</span>
            )}
            <span className={`${prefix}-content`}>{renderContent(item.content)}</span>
          </>
        ) : (
          <>
            {item.showIcon !== false && (
              <div className={`${prefix}-left`}>
                <div className={`${prefix}-icon`}>{icon}</div>
              </div>
            )}
            <div className={`${prefix}-right`}>
              <div className={`${prefix}-title`}>{renderContent(item.title)}</div>
              <div className={`${prefix}-content`}>{renderContent(item.content)}</div>
              {item.footer !== undefined && (
                <div className={`${prefix}-footer`}>{renderContent(item.footer)}</div>
              )}
            </div>
          </>
        )}
        {item.closable && (
          <span
            className={`${prefix}-close-btn`}
            role="button"
            tabIndex={0}
            aria-label={t('a11y.close')}
            onClick={timer.close}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                timer.close();
              }
            }}
          >
            {item.closeIconElement !== undefined ? renderContent(item.closeIconElement) : closeIcon}
          </span>
        )}
      </li>
    );
  },
  (before, after) =>
    before.visible === after.visible &&
    before.kind === after.kind &&
    Object.keys({ ...before.item, ...after.item }).every(
      (key) => before.item[key as keyof Item] === after.item[key as keyof Item],
    ),
);

function NoticeList({ manager, kind }: { manager: Manager; kind: Kind }) {
  const items = useSyncExternalStore(manager.subscribe, manager.snapshot, manager.snapshot);
  const [previous, setPrevious] = useState(items);
  const [rendered, setRendered] = useState(items);
  if (previous !== items) {
    setPrevious(items);
    setRendered([
      ...rendered.map((item) => items.find((next) => next.key === item.key) ?? item),
      ...items.filter((item) => !rendered.some((previousItem) => previousItem.key === item.key)),
    ]);
  }
  const prefix = usePrefix(`${kind}-list`);
  const theme = useContext(ThemeContext);
  const [zIndex, setZIndex] = useState(0);
  const [popup] = useState(() => {
    let value = 0;
    return createPopupEntry('message', {
      get zIndex() {
        return value;
      },
      setZIndex(next) {
        value = next;
        setZIndex(next);
      },
    });
  });
  useLayoutEffect(() => {
    popup.open();
    return popup.close;
  }, [popup]);
  useLayoutEffect(() => {
    if (!rendered.length && !items.length) manager.destroy();
  }, [rendered.length, items.length, manager]);
  const position = manager.position.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
  return (
    <ul
      className={`${prefix} ${prefix}-${position}`}
      style={{ ...theme.variables, zIndex }}
      sd-theme={theme.mode}
    >
      {rendered.map((item) => (
        <NoticeView
          key={item.key}
          item={item}
          kind={kind}
          visible={items.some((next) => next.key === item.key)}
          remove={manager.remove}
          afterLeave={(key) =>
            setRendered((current) => current.filter((entry) => entry.key !== key))
          }
        />
      ))}
    </ul>
  );
}

export function createNoticeController(
  kind: Kind,
  getConfig: () => NoticeContext = () => ({}),
  changed?: () => void,
) {
  const managers = new Set<Manager>();
  let sequence = 0;
  const service = createNoticeService<
    string,
    ReactNoticeConfig & { type: NoticeType },
    NoticeContext | undefined
  >({
    defaultPosition: kind === 'message' ? 'top' : 'topRight',
    create(config, context) {
      const container = getOverlay(kind);
      document.body.appendChild(container);
      const position = config.position ?? (kind === 'message' ? 'top' : 'topRight');
      const items: Item[] = [];
      let snapshot: Item[] = [];
      const listeners = new Set<() => void>();
      let alive = true;
      let root: ReturnType<typeof createRoot> | undefined;
      const queue = createNoticeQueue<ReactNoticeConfig & { type: NoticeType }, Item>(kind, {
        items,
        get alive() {
          return alive;
        },
        get connected() {
          return container.isConnected;
        },
        create(item) {
          return { ...item, position, key: ++sequence };
        },
        changed() {
          snapshot = items.map((item) => ({ ...item }));
          listeners.forEach((listener) => listener());
        },
        destroy() {
          alive = false;
          managers.delete(manager);
          container.remove();
          if (root) queueMicrotask(() => root?.unmount());
          changed?.();
        },
        onDestroy() {
          service.release(position);
        },
      });
      const manager: Manager = {
        key: ++sequence,
        container,
        position,
        context,
        subscribe(callback) {
          listeners.add(callback);
          return () => {
            listeners.delete(callback);
          };
        },
        snapshot: () => snapshot,
        remove: queue.remove,
        destroy: queue.destroy,
        dispose() {
          queue.clear();
          queue.destroy();
        },
      };
      managers.add(manager);
      if (changed) changed();
      else {
        root = createRoot(container);
        root.render(
          <ConfigProvider {...context}>
            <NoticeList manager={manager} kind={kind} />
          </ConfigProvider>,
        );
      }
      return queue;
    },
  });
  return {
    open(
      type: NoticeType,
      config: string | ReactNoticeConfig,
      context?: NoticeContext,
    ): NoticeReturn {
      if (typeof document === 'undefined') return { close() {} };
      return service.open(
        resolveNoticeConfig(type, config, context?.[kind] ?? getConfig()[kind]),
        context,
      );
    },
    clear: service.clear,
    remove: service.remove,
    dispose() {
      [...managers].forEach((manager) => manager.dispose());
    },
    render() {
      return [...managers].map((manager) =>
        createPortal(
          manager.context ? (
            <ConfigProvider {...manager.context}>
              <NoticeList manager={manager} kind={kind} />
            </ConfigProvider>
          ) : (
            <NoticeList manager={manager} kind={kind} />
          ),
          manager.container,
          String(manager.key),
        ),
      );
    },
  };
}

export type NoticeController = ReturnType<typeof createNoticeController>;
function NoticeHolder({
  controller,
  context,
}: {
  controller: NoticeController;
  context: RefObject<NoticeContext>;
}) {
  context.current = useConfig();
  return controller.render();
}
export function useNoticeController(kind: Kind) {
  const config = useConfig();
  const current = useRef(config);
  current.current = config;
  const mounted = useRef(true);
  const [, render] = useState(0);
  const [controller] = useState(() =>
    createNoticeController(
      kind,
      () => current.current,
      () => {
        if (mounted.current) render((version) => version + 1);
      },
    ),
  );
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.dispose();
    };
  }, [controller]);
  return [controller, <NoticeHolder controller={controller} context={current} />] as const;
}
