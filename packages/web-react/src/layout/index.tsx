import type { SiderBreakpoint } from '@sdata/web-core/_utils/responsive-observe';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import { createLayoutRegistry, resolveHasSider } from '@sdata/web-core/layout/layout';
import {
  createSiderFoundation,
  toSiderWidth,
  getSiderStyle,
  getSiderOverlayStyle,
  type CollapseType,
  type SiderState,
} from '@sdata/web-core/layout/sider';
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useThemeMode } from '../_shared/use-theme-mode.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Drawer, type DrawerProps } from '../drawer/index.js';
import { useI18n } from '../locale/index.js';
import { Scrollbar, type ScrollbarProps } from '../scrollbar/index.js';

export type { CollapseType, SiderBreakpoint };
export type SiderTemporaryDrawerProps = Omit<
  DrawerProps,
  | 'visible'
  | 'defaultVisible'
  | 'onVisibleChange'
  | 'children'
  | 'width'
  | 'footer'
  | 'okText'
  | 'cancelText'
  | 'okLoading'
  | 'okButtonProps'
  | 'cancelButtonProps'
  | 'hideCancel'
  | 'onBeforeOk'
  | 'onBeforeCancel'
>;
export type SiderProps = LayoutSiderProps;
export type SiderTheme = NonNullable<LayoutSiderProps['theme']>;
export interface LayoutProps extends ComponentPropsWithRef<'div'> {
  hasSider?: boolean;
}
export interface LayoutSiderProps extends ComponentPropsWithRef<'aside'> {
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  reverseArrow?: boolean;
  zeroWidthTriggerStyle?: CSSProperties;
  hideTrigger?: boolean;
  width?: number | string;
  collapsedWidth?: number | string;
  breakpoint?: SiderBreakpoint;
  theme?: 'light' | 'dark';
  scrollbar?: boolean | ScrollbarProps;
  temporary?: boolean;
  rail?: boolean;
  railWidth?: number | string;
  expandOnHover?: boolean;
  drawerProps?: SiderTemporaryDrawerProps;
  header?: ReactNode;
  trigger?: ReactNode;
  onCollapse?: (collapsed: boolean, type: CollapseType) => void;
  onBreakpoint?: (broken: boolean) => void;
  onRailChange?: (rail: boolean) => void;
}
const LayoutContext = createContext<ReturnType<typeof createLayoutRegistry> | null>(null);
export const SiderContext = createContext<{
  siderCollapsed: boolean;
  siderRail: boolean;
  siderRailWidth?: number;
  theme: 'light' | 'dark';
} | null>(null);

function containsSider(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return false;
    if (child.type === LayoutSider) return true;
    if (child.type === Layout) return false;
    return containsSider(child.props.children);
  });
}
function LayoutRoot({ hasSider, children, className, ...attrs }: LayoutProps) {
  const prefix = usePrefix('layout');
  const { rtl } = useConfig();
  const [siders, setSiders] = useState<string[]>([]);
  const list = useRef(siders);
  list.current = siders;
  const [registry] = useState(() =>
    createLayoutRegistry({
      get siders() {
        return list.current;
      },
      set siders(value) {
        list.current = value;
        setSiders(value);
      },
    }),
  );
  const has = resolveHasSider(
    hasSider,
    () => siders.length,
    () => containsSider(children),
  );
  return (
    <LayoutContext.Provider value={registry}>
      <div
        {...attrs}
        className={[prefix, has && `${prefix}-has-sider`, rtl && `${prefix}-rtl`, className]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </LayoutContext.Provider>
  );
}
export function LayoutHeader({ className, ...props }: ComponentPropsWithRef<'header'>) {
  return (
    <header
      {...props}
      className={[usePrefix('layout-header'), className].filter(Boolean).join(' ')}
    />
  );
}
export function LayoutContent({ className, ...props }: ComponentPropsWithRef<'main'>) {
  return (
    <main
      {...props}
      className={[usePrefix('layout-content'), className].filter(Boolean).join(' ')}
    />
  );
}
export function LayoutFooter({ className, ...props }: ComponentPropsWithRef<'footer'>) {
  return (
    <footer
      {...props}
      className={[usePrefix('layout-footer'), className].filter(Boolean).join(' ')}
    />
  );
}
export function LayoutSider({
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  reverseArrow = false,
  zeroWidthTriggerStyle,
  hideTrigger = false,
  width = 200,
  collapsedWidth = 48,
  breakpoint,
  theme,
  scrollbar,
  temporary = false,
  rail = false,
  railWidth = 72,
  expandOnHover = false,
  drawerProps,
  header,
  trigger,
  onCollapse,
  onBreakpoint,
  onRailChange,
  className,
  style,
  children,
  ref,
  onMouseEnter,
  onMouseLeave,
  ...attrs
}: LayoutSiderProps) {
  const prefix = usePrefix('layout-sider');
  const { rtl = false } = useConfig();
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  const registry = useContext(LayoutContext);
  const id = useId();
  const [, render] = useState(0);
  const props = {
    collapsible,
    collapsed,
    defaultCollapsed,
    hideTrigger,
    width,
    collapsedWidth,
    breakpoint,
    temporary,
    rail,
    railWidth,
    expandOnHover,
  };
  const live = useRef({ props, onCollapse, onBreakpoint, onRailChange });
  live.current = { props, onCollapse, onBreakpoint, onRailChange };
  const [runtime] = useState(() => {
    const data = { collapsed: collapsed ?? defaultCollapsed, below: false, hovering: false };
    const state: SiderState = {
      get props() {
        return live.current.props;
      },
      get controlled() {
        return foundation.controlled;
      },
      get mergedCollapsed() {
        return foundation.mergedCollapsed;
      },
      get railHoverEnabled() {
        return foundation.railHoverEnabled;
      },
      get railExpanded() {
        return foundation.railExpanded;
      },
      get hasZeroWidth() {
        return foundation.hasZeroWidth;
      },
      get collapsed() {
        return data.collapsed;
      },
      set collapsed(value) {
        if (data.collapsed !== value) {
          data.collapsed = value;
          render((n) => n + 1);
        }
      },
      get below() {
        return data.below;
      },
      set below(value) {
        if (data.below !== value) {
          data.below = value;
          render((n) => n + 1);
        }
      },
      get hovering() {
        return data.hovering;
      },
      set hovering(value) {
        if (data.hovering !== value) {
          data.hovering = value;
          render((n) => n + 1);
        }
      },
    };
    const foundation = createSiderFoundation(state, {
      collapse: (value, type) => live.current.onCollapse?.(value, type),
      breakpoint: (value) => live.current.onBreakpoint?.(value),
      rail: (value) => live.current.onRailChange?.(value),
    });
    return { state, foundation };
  });
  const { state, foundation } = runtime;
  const detectedTheme = useThemeMode(root);
  useLayoutEffect(() => {
    registry?.addSider(id);
    return () => registry?.removeSider(id);
  }, [registry, id]);
  useLayoutEffect(() => foundation.setupResponsive(), [foundation, breakpoint]);
  useLayoutEffect(() => foundation.syncCollapsed(collapsed), [foundation, collapsed]);
  useLayoutEffect(
    () => foundation.syncRailHover(rail && expandOnHover),
    [foundation, rail, expandOnHover],
  );
  const mergedTheme = theme ?? detectedTheme;
  const siderWidth = toSiderWidth(foundation.rawWidth);
  const reserved = rail ? toSiderWidth(railWidth) : siderWidth;
  const classes = [
    prefix,
    `${prefix}-${mergedTheme}`,
    foundation.mergedCollapsed && `${prefix}-collapsed`,
    collapsible && !hideTrigger && !foundation.hasZeroWidth && `${prefix}-has-trigger`,
    state.below && `${prefix}-below`,
    Number.parseFloat(siderWidth) === 0 && `${prefix}-zero-width`,
    temporary && `${prefix}-temporary`,
    rail && `${prefix}-rail`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {header != null && <div className={`${prefix}-header`}>{header}</div>}
      {scrollbar === false ? (
        <div className={`${prefix}-children ${prefix}-children-scroll`}>{children}</div>
      ) : (
        <Scrollbar
          outerClass={`${prefix}-children`}
          type="embed"
          {...(typeof scrollbar === 'object' ? scrollbar : {})}
        >
          {children}
        </Scrollbar>
      )}
    </>
  );
  const menu = temporary || foundation.hasZeroWidth;
  const reverse = rtl === !reverseArrow;
  const right = foundation.mergedCollapsed ? !reverse : reverse;
  const triggerContent = trigger ?? (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      width="1em"
      height="1em"
      aria-hidden="true"
    >
      <path
        d={menu ? 'M8 12h32M8 24h32M8 36h32' : right ? 'm18 10 14 14-14 14' : 'm30 10-14 14 14 14'}
      />
    </svg>
  );
  const triggerElement = foundation.renderTrigger && (
    <span
      role="button"
      tabIndex={0}
      aria-expanded={!foundation.mergedCollapsed}
      aria-label={t('a11y.toggleSidebar')}
      className={
        temporary
          ? `${prefix}-temporary-trigger`
          : foundation.hasZeroWidth
            ? `${prefix}-zero-width-trigger ${prefix}-zero-width-trigger-${reverseArrow ? 'right' : 'left'}`
            : `${prefix}-trigger`
      }
      style={
        temporary
          ? undefined
          : foundation.hasZeroWidth
            ? zeroWidthTriggerStyle
            : { width: siderWidth }
      }
      onClick={foundation.toggle}
      onKeyDown={(event) => foundation.handleTriggerKeydown(event.nativeEvent)}
    >
      {triggerContent}
    </span>
  );
  return (
    <SiderContext.Provider
      value={{
        siderCollapsed: foundation.mergedCollapsed,
        siderRail: foundation.siderRail,
        siderRailWidth: foundation.siderRailWidth,
        theme: mergedTheme,
      }}
    >
      <aside
        {...attrs}
        ref={root}
        className={classes}
        style={{ ...getSiderStyle(temporary, rail, siderWidth, reserved), ...style }}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          foundation.onMouseEnter();
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          foundation.onMouseLeave();
        }}
      >
        {temporary ? (
          <>
            <Drawer
              placement="left"
              width={siderWidth}
              header={false}
              footer={false}
              {...drawerProps}
              visible={!foundation.mergedCollapsed}
              onVisibleChange={foundation.onDrawerVisibleChange}
            >
              {content}
            </Drawer>
            {triggerElement}
          </>
        ) : rail ? (
          <div
            className={[
              `${prefix}-rail-overlay`,
              foundation.railExpanded && `${prefix}-rail-expand`,
            ]
              .filter(Boolean)
              .join(' ')}
            style={getSiderOverlayStyle(foundation.railExpanded, siderWidth, reserved)}
          >
            {content}
          </div>
        ) : (
          <>
            {content}
            {triggerElement}
          </>
        )}
      </aside>
    </SiderContext.Provider>
  );
}
export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Content: LayoutContent,
  Footer: LayoutFooter,
  Sider: LayoutSider,
});
export default Layout;

export type LayoutContentInstance = ReactComponentRef<typeof LayoutContent>;
export type LayoutFooterInstance = ReactComponentRef<typeof LayoutFooter>;
export type LayoutHeaderInstance = ReactComponentRef<typeof LayoutHeader>;
export type LayoutInstance = ReactComponentRef<typeof Layout>;
export type LayoutSiderInstance = ReactComponentRef<typeof LayoutSider>;
