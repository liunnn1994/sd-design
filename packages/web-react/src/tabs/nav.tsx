import type { Direction, Size } from '@sdata/web-core/_utils/constant';
import type {
  ScrollPosition,
  TabItem,
  TabKey,
  TabsPosition,
  TabsType,
  TabTriggerEvent,
} from '@sdata/web-core/tabs/types';
import type { CSSProperties, ReactNode } from 'react';

import { createResizeObserverController } from '@sdata/web-core/resize-observer/browser';
import {
  activateTab,
  activateTabKey,
  getTabNavigationTarget,
} from '@sdata/web-core/tabs/foundation';
import {
  createTabsNavigation,
  getTabMarginSide,
  getTabTargetOffset,
  getTabsInkStyle,
} from '@sdata/web-core/tabs/navigation';
import { updateScrollOffset } from '@sdata/web-core/tabs/utils';
import { useLayoutEffect, useRef, useState } from 'react';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';

export interface ReactTab extends TabItem {
  label?: ReactNode;
  index: number;
}
interface Props {
  tabs: ReactTab[];
  tabsId: string;
  active?: TabKey;
  direction: Direction;
  position: TabsPosition;
  size: Size;
  type: TabsType;
  editable: boolean;
  showAddButton: boolean;
  animation: boolean;
  headerPadding: boolean;
  scrollPosition: ScrollPosition;
  trigger: TabTriggerEvent;
  extra?: ReactNode;
  onClick(key: TabKey, event: Event): void;
  onAdd(event: Event): void;
  onDelete(key: TabKey, event: Event): void;
}
function TabIcon({ name }: { name: 'plus' | 'close' | 'left' | 'right' | 'up' | 'down' }) {
  const prefix = usePrefix('icon');
  const paths = {
    plus: 'M5 24h38M24 5v38',
    close: 'M9.857 9.858 24 24m0 0 14.142 14.142M24 24 38.142 9.858M24 24 9.857 38.142',
    left: 'M32 8.4 16.444 23.956 32 39.513',
    right: 'm16 39.513 15.556-15.557L16 8.4',
    up: 'M39.6 30.557 24.043 15 8.487 30.557',
    down: 'M39.6 17.443 24.043 33 8.487 17.443',
  };
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      viewBox="0 0 48 48"
      className={`${prefix} ${prefix}-${name}`}
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function TabsNav(props: Props) {
  const prefix = usePrefix('tabs-nav');
  const tabPrefix = usePrefix('tabs-tab');
  const hoverPrefix = usePrefix('icon-hover');
  const config = useConfig();
  const { t } = useI18n();
  const rtl = !!config.rtl && props.direction === 'horizontal';
  const live = useRef({ ...props, rtl });
  live.current = { ...props, rtl };
  const wrapper = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const tabs = useRef(new Map<TabKey, HTMLDivElement>());
  const state = useRef({ offset: 0, max: 0, scrolling: false, wrapperLength: 0 });
  const [view, setView] = useState(state.current);
  const [ink, setInk] = useState({ position: 0, size: 0 });
  const [navigation] = useState(() => {
    const length = (element: HTMLElement | null) =>
      (live.current.direction === 'vertical' ? element?.offsetHeight : element?.offsetWidth) ?? 0;
    function update<K extends keyof typeof state.current>(
      key: K,
      value: (typeof state.current)[K],
    ) {
      if (state.current[key] === value) return;
      state.current = { ...state.current, [key]: value };
      setView(state.current);
    }
    return createTabsNavigation({
      get offset() {
        return state.current.offset;
      },
      get max() {
        return state.current.max;
      },
      get scrolling() {
        return state.current.scrolling;
      },
      get wrapperLength() {
        return state.current.wrapperLength;
      },
      get rtl() {
        return live.current.rtl;
      },
      hasElements: () => !!wrapper.current && !!list.current,
      measureOverflow: () => length(list.current) > length(wrapper.current),
      measureWrapper: () => length(wrapper.current),
      measureMax: () => length(list.current) - length(wrapper.current),
      setOffset: (value) => update('offset', value),
      setMax: (value) => update('max', value),
      setScrolling: (value) => update('scrolling', value),
      setWrapperLength: (value) => update('wrapperLength', value),
    });
  });
  const [measureInk] = useState(() => () => {
    const key = live.current.active;
    const element = key === undefined ? undefined : tabs.current.get(key);
    if (!element) return;
    const vertical = live.current.direction === 'vertical';
    const position = vertical ? element.offsetTop : element.offsetLeft;
    const size = vertical ? element.offsetHeight : element.offsetWidth;
    setInk((old) => (old.position === position && old.size === size ? old : { position, size }));
  });
  const [alignActive] = useState(() => () => {
    const p = live.current;
    const element = p.active === undefined ? undefined : tabs.current.get(p.active);
    if (!element || !wrapper.current || !state.current.scrolling) return;
    updateScrollOffset(wrapper.current, p.direction);
    const horizontal = p.direction === 'horizontal';
    const size = horizontal ? element.offsetWidth : element.offsetHeight;
    const wrapperSize = horizontal ? wrapper.current.offsetWidth : wrapper.current.offsetHeight;
    const position = p.rtl
      ? (list.current?.offsetWidth ?? 0) - element.offsetLeft - size
      : horizontal
        ? element.offsetLeft
        : element.offsetTop;
    const margin =
      parseFloat(
        getComputedStyle(element)[getTabMarginSide(horizontal, p.rtl, p.scrollPosition)],
      ) || 0;
    navigation.setOffset(
      getTabTargetOffset(
        p.scrollPosition,
        state.current.offset,
        position,
        size,
        wrapperSize,
        margin,
      ),
    );
  });
  useLayoutEffect(() => {
    const observers = [wrapper.current, list.current].map((element) => {
      const observer = createResizeObserverController(() => {
        navigation.measure();
        measureInk();
      });
      observer.observe(element ?? undefined);
      return observer;
    });
    const element = wrapper.current;
    element?.addEventListener('wheel', navigation.wheel, { passive: false });
    return () => {
      observers.forEach((observer) => observer.disconnect());
      element?.removeEventListener('wheel', navigation.wheel);
    };
  }, [navigation, measureInk]);
  useLayoutEffect(() => {
    navigation.measure();
    measureInk();
    alignActive();
  }, [
    navigation,
    measureInk,
    alignActive,
    props.tabs,
    props.active,
    props.direction,
    props.type,
    props.size,
    props.headerPadding,
    props.scrollPosition,
    rtl,
    view.scrolling,
  ]);
  const addButton =
    props.editable &&
    props.showAddButton &&
    ['line', 'card', 'card-gutter'].includes(props.type) ? (
      <button
        type="button"
        className={`${prefix}-add-btn`}
        aria-label={t('a11y.addTab')}
        onClick={(event) => props.onAdd(event.nativeEvent)}
      >
        <span className={hoverPrefix}>
          <TabIcon name="plus" />
        </span>
      </button>
    ) : null;
  const navButton = (type: 'previous' | 'next', disabled: boolean) => {
    const side =
      props.direction === 'vertical'
        ? type === 'next'
          ? 'down'
          : 'up'
        : type === 'next'
          ? 'right'
          : 'left';
    return (
      <button
        type="button"
        disabled={disabled}
        className={[
          `${prefix}-button`,
          `${prefix}-button-${side}`,
          disabled && `${prefix}-button-disabled`,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={t(type === 'next' ? 'a11y.nextTabs' : 'a11y.prevTabs')}
        onClick={() => navigation.button(type)}
      >
        <span
          className={[hoverPrefix, disabled && `${hoverPrefix}-disabled`].filter(Boolean).join(' ')}
        >
          <TabIcon name={side} />
        </span>
      </button>
    );
  };
  const listStyle: CSSProperties = {
    transform:
      props.direction === 'vertical'
        ? `translateY(${-view.offset}px)`
        : `translateX(${rtl ? view.offset : -view.offset}px)`,
  };
  return (
    <div
      className={[
        prefix,
        `${prefix}-${props.direction}`,
        `${prefix}-${props.position}`,
        `${prefix}-size-${props.size}`,
        `${prefix}-type-${props.type}`,
      ].join(' ')}
    >
      {view.scrolling && navButton(rtl ? 'next' : 'previous', view.offset <= 0)}
      <div
        ref={wrapper}
        className={[`${prefix}-tab`, view.scrolling && `${prefix}-tab-scroll`]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          ref={list}
          role="tablist"
          aria-orientation={props.direction}
          className={[
            `${prefix}-tab-list`,
            !props.headerPadding &&
              ['line', 'text'].includes(props.type) &&
              props.direction === 'horizontal' &&
              `${prefix}-tab-list-no-padding`,
          ]
            .filter(Boolean)
            .join(' ')}
          style={listStyle}
          onKeyDown={(event) => {
            const target = getTabNavigationTarget(
              props.tabs,
              props.active,
              props.direction,
              rtl,
              event.key,
            );
            if (!target) return;
            event.preventDefault();
            tabs.current.get(target.key)?.focus();
            props.onClick(target.key, event.nativeEvent);
          }}
        >
          {props.tabs.map((tab) => {
            const active = tab.key === props.active;
            const base = `${props.tabsId}-${typeof tab.key}-${tab.key}`;
            const activate = (event: Event) => activateTab(tab, event, props.onClick);
            return (
              <div
                key={`${typeof tab.key}:${tab.key}`}
                ref={(element) => {
                  if (element) tabs.current.set(tab.key, element);
                  else tabs.current.delete(tab.key);
                }}
                id={`${base}-tab`}
                role="tab"
                tabIndex={active && !tab.disabled ? 0 : -1}
                aria-selected={active}
                aria-disabled={tab.disabled || undefined}
                aria-controls={`${base}-panel`}
                className={[
                  tabPrefix,
                  active && `${tabPrefix}-active`,
                  props.editable && tab.closable && `${tabPrefix}-closable`,
                  tab.disabled && `${tabPrefix}-disabled`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={
                  props.trigger === 'click' ? (event) => activate(event.nativeEvent) : undefined
                }
                onMouseOver={
                  props.trigger === 'hover' ? (event) => activate(event.nativeEvent) : undefined
                }
                onKeyDown={(event) => activateTabKey(event.nativeEvent, activate)}
              >
                <span className={`${tabPrefix}-title`}>{tab.label ?? tab.title}</span>
                {props.editable && tab.closable && (
                  <button
                    type="button"
                    className={`${tabPrefix}-close-btn`}
                    aria-label={t('a11y.closeTab')}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      activateTab(tab, event.nativeEvent, props.onDelete);
                    }}
                  >
                    <span className={hoverPrefix}>
                      <TabIcon name="close" />
                    </span>
                  </button>
                )}
              </div>
            );
          })}
          {['line', 'capsule'].includes(props.type) &&
            props.active !== undefined &&
            tabs.current.has(props.active) && (
              <div
                className={[
                  `${prefix}-ink`,
                  props.animation && `${prefix}-ink-animation`,
                  props.type === 'capsule' && `${prefix}-ink-capsule`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={getTabsInkStyle(
                  props.type === 'capsule',
                  props.direction,
                  ink.position,
                  ink.size,
                )}
              />
            )}
        </div>
        {!view.scrolling && addButton}
      </div>
      {view.scrolling && navButton(rtl ? 'previous' : 'next', view.offset >= view.max)}
      <div className={`${prefix}-extra`}>
        {view.scrolling && addButton}
        {props.extra}
      </div>
    </div>
  );
}
