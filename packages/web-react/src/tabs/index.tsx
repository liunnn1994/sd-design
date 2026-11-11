import type { Direction, Size } from '@sdata/web-core/_utils/constant';
import type {
  ScrollPosition,
  TabKey,
  TabsPosition,
  TabsType,
  TabTriggerEvent,
} from '@sdata/web-core/tabs/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { createTabsFoundation, syncTabPane } from '@sdata/web-core/tabs/foundation';
import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useItemIndex } from '../_shared/use-item-index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Scrollbar, type ScrollbarProps } from '../scrollbar/index.js';
import { TabsNav, type ReactTab } from './nav.js';

export type {
  ScrollPosition,
  TabKey,
  TabsPosition,
  TabsType,
  TabTriggerEvent,
} from '@sdata/web-core/tabs/types';
export type TabsInstance = HTMLDivElement;
export type TabPaneInstance = HTMLDivElement;
export interface TabsProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange'> {
  activeKey?: TabKey;
  defaultActiveKey?: TabKey;
  position?: TabsPosition;
  size?: Size;
  type?: TabsType;
  direction?: Direction;
  editable?: boolean;
  showAddButton?: boolean;
  destroyOnHide?: boolean;
  lazyLoad?: boolean;
  justify?: boolean;
  animation?: boolean;
  headerPadding?: boolean;
  autoSwitch?: boolean;
  hideContent?: boolean;
  trigger?: TabTriggerEvent;
  scrollPosition?: ScrollPosition;
  fullHeight?: boolean;
  scrollbar?: boolean | ScrollbarProps;
  extra?: ReactNode;
  onActiveKeyChange?: (key: TabKey) => void;
  onChange?: (key: TabKey) => void;
  onTabClick?: (key: TabKey, event: Event) => void;
  onAdd?: (event: Event) => void;
  onDelete?: (key: TabKey, event: Event) => void;
}
export interface TabPaneProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  paneKey?: TabKey;
  title?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  destroyOnHide?: boolean;
}
const TabsContext = createContext<
  | {
      prefix: string;
      tabsId: string;
      active?: TabKey;
      lazyLoad: boolean;
      destroyOnHide: boolean;
      scrollbar: false | ScrollbarProps;
    }
  | undefined
>(undefined);
const RegistryContext = createContext<
  | {
      collect(id: string, data: ReactTab): void;
      remove(id: string): void;
    }
  | undefined
>(undefined);

function prepare(children: ReactNode, result: ReactNode[] = []): ReactNode[] {
  Children.forEach(children, (child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment)
      prepare(child.props.children, result);
    else if (isValidElement<TabPaneProps>(child) && child.type === TabPane)
      result.push(
        cloneElement(child, {
          key: child.key ?? `${typeof child.props.paneKey}:${child.props.paneKey ?? result.length}`,
          paneKey: child.props.paneKey ?? child.key ?? result.length,
        }),
      );
    else result.push(child);
  });
  return result;
}
function TabsRoot({
  activeKey,
  defaultActiveKey,
  position = 'top',
  size,
  type = 'line',
  direction = 'horizontal',
  editable = false,
  showAddButton = false,
  destroyOnHide = false,
  lazyLoad = false,
  justify = false,
  animation = false,
  headerPadding = true,
  autoSwitch = false,
  hideContent = false,
  trigger = 'click',
  scrollPosition = 'auto',
  fullHeight = false,
  scrollbar = true,
  extra,
  onActiveKeyChange,
  onChange,
  onTabClick,
  onAdd,
  onDelete,
  children,
  className,
  ...attrs
}: TabsProps) {
  const prefix = usePrefix('tabs');
  const tabsId = `${prefix}-${useId()}`;
  const config = useConfig();
  const mergedPosition = direction === 'vertical' ? 'left' : position;
  const mergedDirection =
    mergedPosition === 'left' || mergedPosition === 'right' ? 'vertical' : 'horizontal';
  const [inner, setInner] = useState(defaultActiveKey);
  const [, render] = useState(0);
  const registry = useRef(new Map<string, ReactTab>());
  const content = prepare(children);
  const initial = content.flatMap((child, index): ReactTab[] =>
    isValidElement<TabPaneProps>(child) && child.type === TabPane
      ? [
          {
            key: child.props.paneKey ?? index,
            title: typeof child.props.title === 'string' ? child.props.title : undefined,
            label: child.props.title,
            disabled: child.props.disabled,
            closable: child.props.closable ?? true,
            index,
          },
        ]
      : [],
  );
  const live = useRef({
    activeKey,
    inner,
    autoSwitch,
    initial,
    onActiveKeyChange,
    onChange,
    onTabClick,
    onAdd,
    onDelete,
  });
  live.current = {
    activeKey,
    inner,
    autoSwitch,
    initial,
    onActiveKeyChange,
    onChange,
    onTabClick,
    onAdd,
    onDelete,
  };
  const afterRender = useAfterRender();
  const [foundation] = useState((): ReturnType<typeof createTabsFoundation<ReactTab, string>> =>
    createTabsFoundation<ReactTab, string>({
      registry: registry.current,
      get order() {
        return [...registry.current].sort((a, b) => a[1].index - b[1].index).map(([id]) => id);
      },
      get keys(): TabKey[] {
        const tabs = foundation.getSorted();
        return (tabs.length ? tabs : live.current.initial).map((tab) => tab.key);
      },
      get value() {
        return live.current.activeKey;
      },
      get inner() {
        return live.current.inner;
      },
      get active(): TabKey | undefined {
        return foundation.getActive();
      },
      get autoSwitch() {
        return live.current.autoSwitch;
      },
      setInner(key) {
        live.current.inner = key;
        setInner(key);
      },
      onChange(key) {
        live.current.onActiveKeyChange?.(key);
        live.current.onChange?.(key);
      },
      onClick(key, event) {
        live.current.onTabClick?.(key, event);
      },
      onAdd(event) {
        live.current.onAdd?.(event);
      },
      onDelete(key, event) {
        live.current.onDelete?.(key, event);
      },
      defer(callback) {
        // Wait for pane registration and DOM order to commit before selecting the new last tab.
        void afterRender().then(afterRender).then(callback);
      },
    }),
  );
  const [collector] = useState(() => ({
    collect(id: string, data: ReactTab) {
      const old = registry.current.get(id);
      if (
        old &&
        old.key === data.key &&
        old.label === data.label &&
        old.disabled === data.disabled &&
        old.closable === data.closable &&
        old.index === data.index
      )
        return;
      foundation.register(id, data);
      render((value) => value + 1);
    },
    remove(id: string) {
      if (registry.current.has(id)) {
        foundation.unregister(id);
        render((value) => value + 1);
      }
    },
  }));
  const registered = foundation.getSorted();
  const tabs = registered.length ? registered : initial;
  const active = foundation.getActive();
  const context = {
    prefix,
    tabsId,
    active,
    lazyLoad,
    destroyOnHide,
    scrollbar:
      fullHeight && scrollbar !== false
        ? { type: 'embed' as const, ...(typeof scrollbar === 'object' ? scrollbar : {}) }
        : (false as const),
  };
  const panels = (
    <div
      className={[`${prefix}-content`, hideContent && `${prefix}-content-hide`]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[`${prefix}-content-list`, animation && `${prefix}-content-animation`]
          .filter(Boolean)
          .join(' ')}
        style={{
          transform: `translateX(${config.rtl ? '' : '-'}${foundation.getActiveIndex() * 100}%)`,
        }}
      >
        {content}
      </div>
    </div>
  );
  return (
    <TabsContext.Provider value={context}>
      <RegistryContext.Provider value={collector}>
        <div
          {...attrs}
          className={[
            prefix,
            `${prefix}-${mergedDirection}`,
            `${prefix}-${mergedPosition}`,
            `${prefix}-type-${type}`,
            `${prefix}-size-${size ?? config.size ?? 'medium'}`,
            justify && `${prefix}-justify`,
            fullHeight && `${prefix}-full-height`,
            config.rtl && `${prefix}-rtl`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {mergedPosition === 'bottom' && panels}
          <TabsNav
            tabs={tabs}
            tabsId={tabsId}
            active={active}
            direction={mergedDirection}
            position={mergedPosition}
            size={size ?? config.size ?? 'medium'}
            type={type}
            editable={editable}
            showAddButton={showAddButton}
            animation={animation}
            headerPadding={headerPadding}
            scrollPosition={scrollPosition}
            trigger={trigger}
            extra={extra}
            onClick={foundation.click}
            onAdd={foundation.add}
            onDelete={foundation.remove}
          />
          {mergedPosition !== 'bottom' && panels}
        </div>
      </RegistryContext.Provider>
    </TabsContext.Provider>
  );
}

function PaneContent({ active, children }: { active: boolean; children?: ReactNode }) {
  const cache = useRef(children);
  if (active) cache.current = children;
  return <>{cache.current}</>;
}

export function TabPane({
  paneKey,
  title,
  disabled = false,
  closable = true,
  destroyOnHide = false,
  children,
  className,
  ref,
  ...attrs
}: TabPaneProps) {
  const fallbackId = useId();
  const key = paneKey ?? fallbackId;
  const prefix = usePrefix('tabs');
  const context = useContext(TabsContext);
  const collector = useContext(RegistryContext);
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  const index = useItemIndex(root, `.${prefix}-content-item`, context?.prefix);
  const active = key === context?.active;
  const [mounted, setMounted] = useState(context?.lazyLoad ? active : true);
  const previousActive = useRef(active);
  useLayoutEffect(() => {
    if (previousActive.current !== active) {
      previousActive.current = active;
      syncTabPane(active, destroyOnHide || context?.destroyOnHide, mounted, setMounted);
    }
  }, [active, destroyOnHide, context?.destroyOnHide, mounted]);
  useLayoutEffect(() => {
    collector?.collect(fallbackId, {
      key,
      title: typeof title === 'string' ? title : undefined,
      label: title,
      disabled,
      closable,
      index,
    });
  }, [collector, fallbackId, key, title, disabled, closable, index]);
  useLayoutEffect(() => () => collector?.remove(fallbackId), [collector, fallbackId]);
  const baseId = `${context?.tabsId ?? ''}-${typeof key}-${key}`;
  const pane = <PaneContent active={active}>{children}</PaneContent>;
  return (
    <div
      {...attrs}
      ref={root}
      id={`${baseId}-panel`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab`}
      aria-hidden={active ? undefined : true}
      tabIndex={active ? 0 : undefined}
      inert={active ? undefined : true}
      className={[`${prefix}-content-item`, active && `${prefix}-content-item-active`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {mounted && (
        <div
          className={[`${prefix}-pane`, context?.scrollbar && `${prefix}-pane-scroll`]
            .filter(Boolean)
            .join(' ')}
        >
          {context?.scrollbar ? (
            <Scrollbar {...context.scrollbar} outerClass={`${prefix}-pane-scrollbar`}>
              {pane}
            </Scrollbar>
          ) : (
            pane
          )}
        </div>
      )}
    </div>
  );
}
export const Tabs = Object.assign(TabsRoot, { TabPane });
export default Tabs;
