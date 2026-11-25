import type { Breakpoint } from '@sdata/web-core/_utils/responsive-observe';
import type { MenuMode, MenuTheme, MenuData } from '@sdata/web-core/menu/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode, Ref, MouseEvent as ReactMouseEvent } from 'react';

import { createResponsiveSubscription } from '@sdata/web-core/_utils/responsive';
import { getMenuKeys } from '@sdata/web-core/menu/collector';
import {
  createMenuFoundation,
  getMenuFocusTarget,
  getMenuFocusItems,
  activateMenuItem,
  activateMenuItemKey,
  isMenuPopup,
  hasMenuSelectedDescendant,
  activatePopupMenu,
  selectPopupMenuItem,
  getMenuPopupMaxHeight,
} from '@sdata/web-core/menu/foundation';
import { createMenuOpenFoundation } from '@sdata/web-core/menu/open';
import {
  getMenuOverflowIndex,
  roundMenuWidth,
  parseMenuMargin,
  type MenuOverflowItem,
} from '@sdata/web-core/menu/overflow';
import { scrollMenuItemIntoView } from '@sdata/web-core/menu/scroll';
import { createResizeObserverController } from '@sdata/web-core/resize-observer/browser';
import { runCssTransition } from '@sdata/web-core/transition/css';
import {
  onBeforeEnter,
  onEnter,
  onAfterEnter,
  onBeforeLeave,
  onLeave,
  onAfterLeave,
} from '@sdata/web-core/transition/expand';
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

import { usePrefix } from '../config-provider/index.js';
import { Ellipsis, type EllipsisProps } from '../ellipsis/index.js';
import { SiderContext } from '../layout/index.js';
import { Tooltip, type TooltipProps } from '../tooltip/index.js';
import { Trigger, type TriggerProps, type FloatingOptions } from '../trigger/index.js';
import { MenuCollectorContext, useMenuCollector } from './use-menu-collector.js';

export type { MenuMode, MenuTheme, MenuData, Breakpoint };
export type {
  MenuDataItem,
  PopupMenuMaxHeightType,
  SubMenuChildDataType,
  MenuCollapseTrigger,
  MenuCollapseHandler,
  MenuItemClickHandler,
  MenuSubMenuClickHandler,
  MenuOpenKeys,
  MenuSelectedKeys,
} from '@sdata/web-core/menu/types';
export type MenuEllipsisProps = Pick<EllipsisProps, 'lineClamp' | 'expandTrigger' | 'tooltip'>;
export interface MenuProps extends ComponentPropsWithRef<'div'> {
  theme?: MenuTheme;
  mode?: MenuMode;
  levelIndent?: number | undefined;
  autoOpen?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  collapsedWidth?: number | undefined;
  accordion?: boolean;
  autoScrollIntoView?: boolean;
  showCollapseButton?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  scrollConfig?: Record<string, unknown> | undefined;
  triggerProps?: Partial<TriggerProps> | undefined;
  floatingOptions?: FloatingOptions | undefined;
  tooltipProps?: Partial<TooltipProps> | undefined;
  ellipsis?: boolean | undefined;
  ellipsisProps?: MenuEllipsisProps | undefined;
  autoOpenSelected?: boolean;
  breakpoint?: Breakpoint;
  popupMaxHeight?: boolean | number;
  collapseIcon?: ReactNode | ((collapsed: boolean) => ReactNode);
  expandIconDown?: ReactNode;
  expandIconRight?: ReactNode;
  onCollapsedChange?: (collapsed: boolean) => void;
  onCollapse?: (collapsed: boolean, reason: 'clickTrigger' | 'responsive') => void;
  onSelectedKeysChange?: (keys: string[]) => void;
  onOpenKeysChange?: (keys: string[]) => void;
  onMenuItemClick?: (key: string) => void;
  onSubMenuClick?: (key: string, keys: string[]) => void;
}
export interface MenuItemProps extends Omit<ComponentPropsWithRef<'div'>, 'ref'> {
  ref?: Ref<MenuItemInstance> | Ref<HTMLDivElement>;
  itemKey?: string;
  disabled?: boolean;
  icon?: ReactNode;
}
export interface SubMenuProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'ref'> {
  ref?: Ref<MenuSubMenuInstance> | Ref<HTMLDivElement>;
  itemKey?: string;
  title?: ReactNode;
  icon?: ReactNode;
  selectable?: boolean;
  popup?: boolean | ((level: number) => boolean);
  popupMaxHeight?: boolean | number;
  expandIconDown?: ReactNode;
  expandIconRight?: ReactNode;
}
export interface MenuItemGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title?: ReactNode;
}
export interface MenuContextValue extends Pick<
  MenuProps,
  | 'levelIndent'
  | 'autoScrollIntoView'
  | 'scrollConfig'
  | 'triggerProps'
  | 'floatingOptions'
  | 'tooltipProps'
  | 'ellipsis'
  | 'ellipsisProps'
  | 'expandIconDown'
  | 'expandIconRight'
  | 'popupMaxHeight'
> {
  prefix: string;
  mode: MenuMode;
  theme: MenuTheme;
  collapsed: boolean;
  inTrigger: boolean;
  selectedKeys: string[];
  openKeys: string[];
  select(key: string): void;
  open(key: string, level: number): void;
}
export interface MenuItemInstance extends HTMLDivElement {
  readonly menuContext: MenuContextValue;
  readonly level: number;
  readonly isSelected: boolean;
  readonly refItemElement: HTMLDivElement | null;
  onClick(event: ReactMouseEvent<HTMLDivElement>): void;
}
export interface MenuSubMenuInstance extends HTMLDivElement {
  readonly subMenuKeys: string[];
  readonly menuItemKeys: string[];
  readonly isChildrenSelected: boolean;
  readonly props: SubMenuProps;
  readonly attrs: Omit<SubMenuProps, 'ref'>;
  readonly computedKey: string;
  readonly computedPopup: boolean;
  readonly expandIconDown: ReactNode;
  readonly expandIconRight: ReactNode;
}
const MenuContext = createContext<MenuContextValue | undefined>(undefined);
const LevelContext = createContext(1);
const KeyContext = createContext<string | null>(null);
const join = (...values: (string | false | undefined)[]) => values.filter(Boolean).join(' ');
function itemKeys(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return child;
    if (child.type === Fragment) return cloneElement(child, {}, itemKeys(child.props.children));
    return <KeyContext.Provider value={child.key}>{child}</KeyContext.Provider>;
  });
}
function useMenu(): MenuContextValue {
  const context = useContext(MenuContext);
  const prefix = usePrefix('menu');
  return (
    context ??
    ({
      prefix,
      mode: 'vertical',
      theme: 'light',
      collapsed: false,
      inTrigger: false,
      selectedKeys: [],
      openKeys: [],
      select() {},
      open() {},
    } satisfies MenuContextValue)
  );
}
function useKey(itemKey?: string) {
  const key = useContext(KeyContext);
  const id = useId();
  return itemKey ?? key ?? id;
}
function Arrow({ right = false }: { right?: boolean }) {
  return <MenuIcon name={right ? 'right' : 'down'} />;
}
function MenuIcon({ name }: { name: 'right' | 'down' | 'menu-fold' | 'menu-unfold' }) {
  const prefix = usePrefix('icon');
  const paths = {
    'right': 'm16 39.513 15.556-15.557L16 8.4',
    'down': 'M39.6 17.443 24.043 33 8.487 17.443',
    'menu-fold': 'M42 11H6M42 24H22M42 37H6M13.66 26.912l-4.82-3.118 4.82-3.118z',
    'menu-unfold': 'M6 11h36M22 24h20M6 37h36M8 20.882 12.819 24 8 27.118z',
  };
  return (
    <svg
      className={`${prefix} ${prefix}-${name}`}
      width="1em"
      height="1em"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
function Indent({ level }: { level: number }) {
  const menu = useMenu();
  const prefix = usePrefix('menu');
  return level > 1 ? (
    <span className={`${prefix}-indent-list`}>
      {Array.from({ length: level - 1 }, (_, index) => (
        <span key={index} className={`${prefix}-indent`} style={{ width: menu.levelIndent }} />
      ))}
    </span>
  ) : null;
}
function Title({
  children,
  icon,
  indented = false,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  indented?: boolean;
}) {
  const menu = useMenu();
  const cls = join(`${menu.prefix}-item-inner`, !!icon && `${menu.prefix}-title`);
  return (
    <>
      {icon && <span className={`${menu.prefix}-icon`}>{icon}</span>}
      {menu.ellipsis ? (
        <span className={`${cls} ${menu.prefix}-ellipsis-wrapper`}>
          <Ellipsis className={`${menu.prefix}-ellipsis`} {...menu.ellipsisProps}>
            {children}
          </Ellipsis>
        </span>
      ) : icon || indented ? (
        <span className={cls}>{children}</span>
      ) : (
        children
      )}
    </>
  );
}

function MenuRoot(props: MenuProps) {
  const sider = useContext(SiderContext);
  return (
    <BaseMenu
      {...props}
      theme={props.theme ?? sider?.theme ?? 'light'}
      siderCollapsed={!!(sider?.siderCollapsed || sider?.siderRail)}
      collapsedWidth={
        props.collapsedWidth ?? (sider?.siderRail ? (sider.siderRailWidth ?? 72) : undefined)
      }
      className={join(props.className, !!sider?.siderRail && 'sd-menu-in-sider-rail')}
    />
  );
}
function BaseMenu({
  theme = 'light',
  mode = 'vertical',
  levelIndent,
  autoOpen = false,
  collapsed,
  defaultCollapsed = false,
  collapsedWidth,
  accordion = false,
  autoScrollIntoView = false,
  showCollapseButton = false,
  selectedKeys,
  defaultSelectedKeys = [],
  openKeys,
  defaultOpenKeys = [],
  scrollConfig,
  triggerProps,
  floatingOptions,
  tooltipProps,
  ellipsis = false,
  ellipsisProps,
  autoOpenSelected = false,
  breakpoint,
  popupMaxHeight = true,
  collapseIcon,
  expandIconDown,
  expandIconRight,
  onCollapsedChange,
  onCollapse,
  onSelectedKeysChange,
  onOpenKeysChange,
  onMenuItemClick,
  onSubMenuClick,
  children,
  className,
  style,
  inTrigger = false,
  prefixCls,
  siderCollapsed = false,
  ...attrs
}: MenuProps & { inTrigger?: boolean; prefixCls?: string; siderCollapsed?: boolean }) {
  const globalPrefix = usePrefix('menu');
  const prefix = prefixCls ?? globalPrefix;
  const collector = useMenuCollector({ type: inTrigger ? 'popupMenu' : 'menu' });
  const [localSelected, setSelected] = useState(defaultSelectedKeys);
  const [localOpen, setOpen] = useState(defaultOpenKeys);
  const [localCollapsed, setCollapsed] = useState(defaultCollapsed);
  const selected = selectedKeys ?? localSelected;
  const opened = openKeys ?? localOpen;
  const mergedCollapsed = collapsed ?? localCollapsed;
  const isCollapsed = siderCollapsed || mergedCollapsed || mode === 'popButton';
  const live = useRef({
    autoOpen,
    autoOpenSelected,
    accordion,
    selected,
    opened,
    openKeys,
    defaultOpenKeys,
    mergedCollapsed,
    collector,
    onCollapsedChange,
    onCollapse,
    onSelectedKeysChange,
    onOpenKeysChange,
    onMenuItemClick,
    onSubMenuClick,
  });
  live.current = {
    autoOpen,
    autoOpenSelected,
    accordion,
    selected,
    opened,
    openKeys,
    defaultOpenKeys,
    mergedCollapsed,
    collector,
    onCollapsedChange,
    onCollapse,
    onSelectedKeysChange,
    onOpenKeysChange,
    onMenuItemClick,
    onSubMenuClick,
  };
  const [openFoundation] = useState(() =>
    createMenuOpenFoundation({
      get props() {
        const p = live.current;
        return {
          modelValue: p.openKeys,
          defaultValue: p.defaultOpenKeys,
          autoOpen: p.autoOpen,
          autoOpenSelected: p.autoOpenSelected,
          accordion: p.accordion,
          selectedKeys: p.selected,
          subMenuKeys: getMenuKeys(p.collector.data, (item) => !!item.children),
          menuData: p.collector.data,
        };
      },
      get openKeys() {
        return live.current.opened;
      },
      setLocal: setOpen,
    }),
  );
  const [foundation] = useState(() =>
    createMenuFoundation({
      get collapsed() {
        return live.current.mergedCollapsed;
      },
      setCollapsed,
      onCollapsed(value, reason) {
        live.current.onCollapsedChange?.(value);
        live.current.onCollapse?.(value, reason);
      },
      setSelected,
      onSelected(value, key) {
        live.current.onSelectedKeysChange?.(value);
        live.current.onMenuItemClick?.(key);
      },
      open: openFoundation.open,
      setOpen,
      onOpen(value, key) {
        live.current.onOpenKeysChange?.(value);
        live.current.onSubMenuClick?.(key, value);
      },
    }),
  );
  const previousKeys = useRef<string[]>([]);
  useLayoutEffect(() => {
    openFoundation.mount();
    previousKeys.current = getMenuKeys(collector.data, (item) => !!item.children);
  }, [openFoundation, collector]);
  const keySignature = JSON.stringify(getMenuKeys(collector.data, (item) => !!item.children));
  useLayoutEffect(() => {
    const keys = getMenuKeys(collector.data, (item) => !!item.children);
    if (JSON.stringify(keys) === JSON.stringify(previousKeys.current)) return;
    openFoundation.syncKeys(keys, previousKeys.current);
    previousKeys.current = keys;
  }, [keySignature, collector, openFoundation]);
  const previousModel = useRef(openKeys);
  useLayoutEffect(() => {
    if (previousModel.current !== openKeys) openFoundation.syncModel(openKeys);
    previousModel.current = openKeys;
  }, [openKeys, openFoundation]);
  useLayoutEffect(() => {
    const subscription = createResponsiveSubscription({ breakpoint }, (checked) =>
      foundation.collapse(!checked, 'responsive'),
    );
    subscription.mount();
    return subscription.dispose;
  }, [breakpoint, foundation]);
  const context: MenuContextValue = {
    prefix,
    theme,
    mode,
    levelIndent,
    autoScrollIntoView,
    scrollConfig,
    triggerProps,
    floatingOptions,
    tooltipProps,
    ellipsis,
    ellipsisProps,
    expandIconDown,
    expandIconRight,
    popupMaxHeight,
    collapsed: isCollapsed,
    inTrigger,
    selectedKeys: selected,
    openKeys: opened,
    select: foundation.select,
    open: foundation.open,
  };
  return (
    <MenuCollectorContext.Provider value={collector.value}>
      <MenuContext.Provider value={context}>
        <LevelContext.Provider value={1}>
          <div
            {...attrs}
            className={join(
              prefix,
              `${prefix}-${theme}`,
              `${prefix}-${mode === 'horizontal' ? 'horizontal' : 'vertical'}`,
              isCollapsed && `${prefix}-collapsed`,
              (mode === 'pop' || isCollapsed) && `${prefix}-pop`,
              mode === 'popButton' && `${prefix}-pop-button`,
              className,
            )}
            style={{ ...style, width: isCollapsed ? collapsedWidth : style?.width }}
          >
            <div
              className={`${prefix}-inner`}
              role={!inTrigger && mode === 'horizontal' ? 'menubar' : 'menu'}
              onKeyDown={(event) => {
                if (!event.currentTarget.contains(event.target as Node)) return;
                const items = getMenuFocusItems(event.currentTarget);
                const target = getMenuFocusTarget(
                  mode,
                  event.key,
                  items.indexOf(event.target as HTMLElement),
                  items.length,
                );
                if (target !== undefined) {
                  event.preventDefault();
                  items[target]?.focus();
                }
              }}
            >
              {mode === 'horizontal' && !inTrigger ? (
                <MenuOverflow>{children}</MenuOverflow>
              ) : (
                itemKeys(children)
              )}
            </div>
            {showCollapseButton && !inTrigger && mode !== 'horizontal' && mode !== 'popButton' && (
              <div
                className={`${prefix}-collapse-button`}
                role="button"
                tabIndex={0}
                aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
                onClick={foundation.toggleCollapse}
                onKeyDown={(event) =>
                  activateMenuItemKey(event.nativeEvent, foundation.toggleCollapse)
                }
              >
                {typeof collapseIcon === 'function'
                  ? collapseIcon(isCollapsed)
                  : (collapseIcon ?? <MenuIcon name={isCollapsed ? 'menu-unfold' : 'menu-fold'} />)}
              </div>
            )}
          </div>
        </LevelContext.Provider>
      </MenuContext.Provider>
    </MenuCollectorContext.Provider>
  );
}

export function MenuItem({
  itemKey,
  disabled = false,
  icon,
  children,
  className,
  ref,
  onClick,
  onKeyDown,
  ...attrs
}: MenuItemProps) {
  const key = useKey(itemKey);
  const menu = useMenu();
  const level = useContext(LevelContext);
  const collector = useContext(MenuCollectorContext);
  const element = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    ref,
    () =>
      Object.defineProperties(element.current!, {
        menuContext: { configurable: true, get: () => menu },
        level: { configurable: true, get: () => level },
        isSelected: { configurable: true, get: () => selected },
        refItemElement: { configurable: true, get: () => element.current },
        onClick: { configurable: true, value: handleClick },
      }) as MenuItemInstance,
  );
  useLayoutEffect(() => {
    collector?.context.collectMenuItem(key);
    return () => collector?.context.removeMenuItem(key);
  }, [collector, key]);
  const selected = menu.selectedKeys.includes(key);
  const scrollState = useRef({ menu, selected });
  scrollState.current = { menu, selected };
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      const { menu, selected } = scrollState.current;
      if (selected && menu.autoScrollIntoView && element.current)
        scrollMenuItemIntoView(element.current, menu.scrollConfig);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  const previousSelected = useRef(selected);
  useLayoutEffect(() => {
    if (
      selected !== previousSelected.current &&
      selected &&
      menu.autoScrollIntoView &&
      element.current
    )
      scrollMenuItemIntoView(element.current, menu.scrollConfig);
    previousSelected.current = selected;
  }, [selected, menu.autoScrollIntoView, menu.scrollConfig]);
  const indented = menu.mode === 'vertical' && level > 1 && !menu.inTrigger && !menu.collapsed;
  const activate = (event: MouseEvent) =>
    activateMenuItem(
      event,
      disabled,
      () => menu.select(key),
      () => {},
    );
  function handleClick(event: ReactMouseEvent<HTMLDivElement>) {
    activate(event.nativeEvent);
    if (!disabled) onClick?.(event);
  }
  const item = (
    <div
      {...attrs}
      ref={element}
      role="menuitem"
      tabIndex={disabled ? undefined : 0}
      aria-disabled={disabled || undefined}
      aria-current={selected ? 'page' : undefined}
      className={join(
        `${menu.prefix}-item`,
        disabled && `${menu.prefix}-disabled`,
        selected && `${menu.prefix}-selected`,
        !!icon && `${menu.prefix}-has-icon`,
        indented && `${menu.prefix}-item-indented`,
        className,
      )}
      onClick={handleClick}
      onKeyDown={(event) => {
        activateMenuItemKey(event.nativeEvent, (native) => {
          activate(native);
          if (!disabled) onClick?.(event as unknown as ReactMouseEvent<HTMLDivElement>);
        });
        onKeyDown?.(event);
      }}
    >
      {indented && <Indent level={level} />}
      <Title icon={icon} indented={indented}>
        {children}
      </Title>
      {selected && menu.mode === 'horizontal' && (
        <div className={`${menu.prefix}-selected-label`} />
      )}
    </div>
  );
  return menu.collapsed && !menu.inTrigger && level === 1 ? (
    <Tooltip
      position="right"
      {...menu.tooltipProps}
      className={join(`${menu.prefix}-item-tooltip`, menu.tooltipProps?.className)}
      content={children}
    >
      {item}
    </Tooltip>
  ) : (
    item
  );
}
export function MenuItemGroup({ title, children, className, ...attrs }: MenuItemGroupProps) {
  const menu = useMenu();
  const level = useContext(LevelContext);
  return (
    <div {...attrs} className={join(`${menu.prefix}-group`, className)}>
      <div
        className={join(
          `${menu.prefix}-group-title`,
          !!menu.ellipsis && `${menu.prefix}-ellipsis-enabled`,
        )}
      >
        <Indent level={level} />
        <Title>{title}</Title>
      </div>
      <LevelContext.Provider value={level === 1 ? 2 : level}>
        {itemKeys(children)}
      </LevelContext.Provider>
    </div>
  );
}
function ExpandContent({
  open,
  className,
  children,
  id,
}: {
  open: boolean;
  className: string;
  children: ReactNode;
  id: string;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  const previous = useRef(open);
  useLayoutEffect(() => {
    const el = element.current;
    if (!el || open === previous.current) return;
    previous.current = open;
    el.style.display = '';
    setPresent(true);
    (open ? onBeforeEnter : onBeforeLeave)(el);
    el.getBoundingClientRect();
    (open ? onEnter : onLeave)(el);
    const cancel = runCssTransition(el, {
      name: 'v',
      enter: open,
      finish() {
        (open ? onAfterEnter : onAfterLeave)(el);
        setPresent(open);
      },
    });
    return () => {
      cancel();
      el.style.height = '';
    };
  }, [open]);
  return (
    <div
      id={id}
      ref={element}
      className={className}
      style={{ display: open || present ? undefined : 'none' }}
    >
      {children}
    </div>
  );
}
export function SubMenu(props: SubMenuProps) {
  const {
    itemKey,
    title,
    icon,
    selectable = false,
    popup = false,
    popupMaxHeight,
    expandIconDown,
    expandIconRight,
    children,
    className,
    onClick,
    ref,
    ...attrs
  } = props;
  const key = useKey(itemKey);
  const menu = useMenu();
  const level = useContext(LevelContext);
  const collector = useMenuCollector({ key, type: 'subMenu' });
  const triggerPrefix = usePrefix('trigger');
  const popupMode = isMenuPopup(popup, level, menu.collapsed, menu.inTrigger, menu.mode);
  const selectedChild = hasMenuSelectedDescendant(
    menu.selectedKeys,
    getMenuKeys(collector.data, (item) => !!item.children),
    getMenuKeys(collector.data, (item) => !item.children),
  );
  const element = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    ref,
    () =>
      Object.defineProperties(element.current!, {
        subMenuKeys: {
          configurable: true,
          get: () => getMenuKeys(collector.data, (item) => !!item.children),
        },
        menuItemKeys: {
          configurable: true,
          get: () => getMenuKeys(collector.data, (item) => !item.children),
        },
        isChildrenSelected: { configurable: true, get: () => selectedChild },
        props: { configurable: true, get: () => props },
        attrs: { configurable: true, get: () => attrs },
        computedKey: { configurable: true, get: () => key },
        computedPopup: { configurable: true, get: () => popupMode },
        expandIconDown: { configurable: true, get: () => menu.expandIconDown },
        expandIconRight: { configurable: true, get: () => menu.expandIconRight },
      }) as MenuSubMenuInstance,
  );
  const selected = selectedChild || (!!popupMode && selectable && menu.selectedKeys.includes(key));
  const open = menu.openKeys.includes(key);
  const [visible, setVisible] = useState(false);
  useLayoutEffect(() => setVisible(false), [popupMode]);
  const id = useId();
  const bottom = menu.mode === 'horizontal' && !menu.inTrigger;
  const header = (
    <>
      <Indent level={level} />
      <Title icon={icon}>{title}</Title>
      <span className={join(`${menu.prefix}-icon-suffix`, !popupMode && open && 'is-open')}>
        {popupMode && !bottom
          ? (expandIconRight ?? menu.expandIconRight ?? <Arrow right />)
          : (expandIconDown ?? menu.expandIconDown ?? <Arrow />)}
      </span>
      {popupMode && selected && menu.mode === 'horizontal' && (
        <div className={`${menu.prefix}-selected-label`} />
      )}
    </>
  );
  const headerClass = join(
    `${menu.prefix}-${popupMode ? 'pop' : 'inline'}-header`,
    selected && `${menu.prefix}-selected`,
    !!icon && `${menu.prefix}-has-icon`,
    !!menu.ellipsis && `${menu.prefix}-ellipsis-enabled`,
  );
  const activate = () =>
    popupMode
      ? activatePopupMenu({ key, level, selectable, onSubmenu: menu.open, onSelect: menu.select })
      : menu.open(key, level);
  const view = popupMode ? (
    <Trigger
      trigger="hover"
      position={bottom ? 'bl' : 'rt'}
      showArrow
      animationName="fade-in"
      mouseEnterDelay={50}
      mouseLeaveDelay={50}
      popupOffset={4}
      autoFitPopupMinWidth
      duration={100}
      {...menu.triggerProps}
      floatingOptions={menu.floatingOptions ?? menu.triggerProps?.floatingOptions}
      className={join(
        `${menu.prefix}-pop-trigger`,
        menu.theme === 'dark' && `${menu.prefix}-pop-trigger-dark`,
        menu.triggerProps?.className,
      )}
      unmountOnClose={false}
      popupVisible={visible}
      onPopupVisibleChange={(value) => {
        setVisible(value);
        menu.triggerProps?.onPopupVisibleChange?.(value);
      }}
      content={
        <BaseMenu
          inTrigger
          prefixCls={`${triggerPrefix}-menu`}
          selectedKeys={menu.selectedKeys}
          theme={menu.theme}
          triggerProps={menu.triggerProps}
          floatingOptions={menu.floatingOptions}
          ellipsis={menu.ellipsis}
          ellipsisProps={menu.ellipsisProps}
          expandIconDown={menu.expandIconDown}
          expandIconRight={menu.expandIconRight}
          style={getMenuPopupMaxHeight(popupMaxHeight ?? menu.popupMaxHeight)}
          onMenuItemClick={(key) => selectPopupMenuItem(key, menu.select, setVisible)}
        >
          {children}
        </BaseMenu>
      }
    >
      <div
        {...attrs}
        ref={element}
        className={join(`${menu.prefix}-pop`, headerClass, className)}
        role="menuitem"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={visible}
        onClick={(event) => {
          activate();
          onClick?.(event);
        }}
        onKeyDown={(event) => {
          activateMenuItemKey(event.nativeEvent, () => {
            activate();
            setVisible(true);
          });
          attrs.onKeyDown?.(event);
        }}
      >
        {header}
      </div>
    </Trigger>
  ) : (
    <div
      {...attrs}
      ref={element}
      className={join(`${menu.prefix}-inline`, className)}
      onClick={onClick}
    >
      <div
        className={headerClass}
        role="menuitem"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={id}
        onClick={activate}
        onKeyDown={(event) => activateMenuItemKey(event.nativeEvent, activate)}
      >
        {header}
      </div>
      <ExpandContent id={id} open={open} className={`${menu.prefix}-inline-content`}>
        <LevelContext.Provider value={level + 1}>{itemKeys(children)}</LevelContext.Provider>
      </ExpandContent>
    </div>
  );
  return (
    <MenuCollectorContext.Provider value={collector.value}>{view}</MenuCollectorContext.Provider>
  );
}
function flatten(children: ReactNode): ReactNode[] {
  const items: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment)
      items.push(...flatten(child.props.children));
    else if (child !== null && child !== undefined && typeof child !== 'boolean') items.push(child);
  });
  return items;
}
function MenuOverflow({ children }: { children: ReactNode }) {
  const menu = useMenu();
  const prefix = `${menu.prefix}-overflow`;
  const wrapper = useRef<HTMLDivElement>(null);
  const [last, setLast] = useState<number | null>(null);
  const items = flatten(children);
  useLayoutEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const measure = () => {
      const nodes: MenuOverflowItem[] = Array.from(el.children).map((node) => {
        const style = getComputedStyle(node);
        return {
          type: node.classList.contains(`${prefix}-sub-menu`)
            ? 'overflow'
            : node.classList.contains(`${prefix}-sub-menu-mirror`)
              ? 'mirror'
              : 'item',
          width:
            roundMenuWidth(node.getBoundingClientRect().width) +
            parseMenuMargin(style.marginLeft) +
            parseMenuMargin(style.marginRight),
        };
      });
      setLast(getMenuOverflowIndex(roundMenuWidth(el.getBoundingClientRect().width), nodes));
    };
    measure();
    const resize = createResizeObserverController(measure);
    resize.observe(el);
    const mutation = new MutationObserver(measure);
    mutation.observe(el, { childList: true, characterData: true, subtree: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [prefix]);
  return (
    <div ref={wrapper} className={`${prefix}-wrap`}>
      <SubMenu
        itemKey="__sd-menu-overflow-sub-menu-mirror"
        title="..."
        className={`${prefix}-sub-menu-mirror`}
      />
      {itemKeys(
        items.map((child, index) =>
          isValidElement<{ className?: string }>(child)
            ? cloneElement(child, {
                className: join(
                  child.props.className,
                  last !== null && index > last && `${prefix}-hidden-menu-item`,
                ),
              })
            : child,
        ),
      )}
      {last !== null && (
        <SubMenu itemKey="__sd-menu-overflow-sub-menu" title="..." className={`${prefix}-sub-menu`}>
          {items.slice(last + 1)}
        </SubMenu>
      )}
    </div>
  );
}
export const Menu = Object.assign(MenuRoot, { Item: MenuItem, ItemGroup: MenuItemGroup, SubMenu });
export default Menu;

export type MenuInstance = ReactComponentRef<typeof Menu>;
export type MenuItemGroupInstance = ReactComponentRef<typeof MenuItemGroup>;
