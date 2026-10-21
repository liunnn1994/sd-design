import type { SiderBreakpoint } from '../_utils/responsive-observe.js';

import { isActivationKey } from '../_utils/keyboard.js';

/** Trigger type of collapsing. */
export type CollapseType = 'clickTrigger' | 'responsive' | 'mask';

const dimensionMaxMap: Record<string, string> = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px',
  xxxl: '1839.98px',
};

const isNumeric = (val: unknown): boolean =>
  !Number.isNaN(Number.parseFloat(val as string)) && Number.isFinite(Number(val));

export const toSiderWidth = (val: number | string): string =>
  isNumeric(val) ? `${val}px` : String(val);

export interface SiderState {
  readonly props: {
    collapsed?: boolean | undefined;
    defaultCollapsed: boolean;
    breakpoint?: SiderBreakpoint | undefined;
    rail: boolean;
    expandOnHover: boolean;
    width: number | string;
    collapsedWidth: number | string;
    railWidth: number | string;
    temporary: boolean;
    hideTrigger: boolean;
    collapsible: boolean;
  };
  readonly controlled: boolean;
  readonly mergedCollapsed: boolean;
  readonly railHoverEnabled: boolean;
  readonly railExpanded: boolean;
  readonly hasZeroWidth: boolean;
  collapsed: boolean;
  below: boolean;
  hovering: boolean;
}

export function createSiderFoundation(
  state: SiderState,
  callbacks: {
    collapse(value: boolean, type: CollapseType): void;
    breakpoint(broken: boolean): void;
    rail(rail: boolean): void;
  },
) {
  state.collapsed = state.props.collapsed ?? state.props.defaultCollapsed;
  const setCollapsed = (value: boolean, type: CollapseType) => {
    if (!state.controlled) state.collapsed = value;
    callbacks.collapse(value, type);
  };
  const toggle = () => setCollapsed(!state.mergedCollapsed, 'clickTrigger');
  return {
    get controlled() {
      return state.props.collapsed !== undefined;
    },
    get mergedCollapsed() {
      return state.controlled ? state.props.collapsed! : state.collapsed;
    },
    syncCollapsed(value: boolean | undefined) {
      if (value !== undefined) state.collapsed = value;
    },
    toggle,
    handleTriggerKeydown(event: KeyboardEvent) {
      if (isActivationKey(event)) {
        event.preventDefault();
        toggle();
      }
    },
    setupResponsive() {
      const { breakpoint } = state.props;
      if (typeof window === 'undefined' || !window.matchMedia || !breakpoint) return;
      const max = dimensionMaxMap[breakpoint];
      if (!max) return;
      const mql = window.matchMedia(`screen and (max-width: ${max})`);
      const handler = (m: MediaQueryListEvent | MediaQueryList) => {
        state.below = m.matches;
        callbacks.breakpoint(m.matches);
        if (state.mergedCollapsed !== m.matches) setCollapsed(m.matches, 'responsive');
      };
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
      } else if (typeof mql.addListener === 'function') {
        mql.addListener(handler as (e: MediaQueryListEvent) => void);
      }
      handler(mql);
      return () => {
        state.below = false;
        if (typeof mql.removeEventListener === 'function') {
          mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
        } else if (typeof mql.removeListener === 'function') {
          mql.removeListener(handler as (e: MediaQueryListEvent) => void);
        }
      };
    },
    get railHoverEnabled() {
      return state.props.rail && state.props.expandOnHover;
    },
    get railExpanded() {
      return state.railHoverEnabled && state.hovering;
    },
    onMouseEnter() {
      if (state.railHoverEnabled) {
        state.hovering = true;
        callbacks.rail(false);
      }
    },
    onMouseLeave() {
      if (state.railHoverEnabled) {
        state.hovering = false;
        callbacks.rail(true);
      }
    },
    syncRailHover(enabled: boolean) {
      if (!enabled) state.hovering = false;
    },
    get rawWidth() {
      if (state.props.rail) return state.railExpanded ? state.props.width : state.props.railWidth;
      return state.mergedCollapsed ? state.props.collapsedWidth : state.props.width;
    },
    get hasZeroWidth() {
      return Number.parseFloat(String(state.props.collapsedWidth || 0)) === 0;
    },
    get renderTrigger() {
      if (state.props.temporary) return !state.props.hideTrigger;
      return (
        (state.props.collapsible || (state.below && state.hasZeroWidth)) && !state.props.hideTrigger
      );
    },
    onDrawerVisibleChange(visible: boolean) {
      if (visible !== !state.mergedCollapsed) setCollapsed(!visible, 'mask');
    },
    get siderRail() {
      return !!state.props.rail && !state.railExpanded;
    },
    get siderRailWidth() {
      return state.props.rail && typeof state.props.railWidth === 'number'
        ? state.props.railWidth
        : undefined;
    },
  };
}
