// 面板控制器。移植自 vendor/motion-panels 的 core/panel.ts：
// 动画通过内部 MotionValue 引擎驱动，时长单位毫秒。
import { clamp } from 'es-toolkit';

import type { PanelSize, PanelTransition } from '../types';
import type { Side } from './axes';
import type { EngineGroup } from './group';

import { FILL_ATTRIBUTE, hasFillAfter, isRtl, isSeparator, lockBody } from './dom';
import { MotionValue } from './motion';
import { timing } from './transition';
import { emitter } from './utils';

const KEY_STEP = 10;
const KEY_STEP_FAST = 50;

export interface PanelOptions {
  collapsed?: boolean;
  defaultSize?: PanelSize;
  maxSize?: PanelSize;
  minSize?: PanelSize;
  onCollapsedChange?: (collapsed: boolean) => void;
  onSizeChange?: (size: PanelSize) => void;
  size: PanelSize;
  transition?: PanelTransition;
}

export interface PanelState {
  bare: boolean;
  dragging: boolean;
  end: boolean | undefined;
  folding: boolean;
}

export interface PanelKeyEvent {
  key: string;
  preventDefault: () => void;
  shiftKey: boolean;
}

export interface PanelDrag {
  cancel: () => void;
  end: () => void;
  move: (offset: { x: number; y: number }) => void;
  start: (cursor?: string) => void;
}

export interface PanelController {
  attach: (element: HTMLElement) => () => void;
  bounds: () => { max: number; min: number };
  destroy: () => void;
  drag: PanelDrag;
  motion: {
    content: MotionValue;
    size: MotionValue;
  };
  options: PanelOptions;
  reset: () => void;
  resizeByKey: (event: PanelKeyEvent) => void;
  state: PanelState;
  subscribe: (listener: () => void) => () => void;
  sync: (options: PanelOptions, mounting?: boolean) => void;
  target: number;
}

const DEV = import.meta.env.DEV;

const toPixels = (value: PanelSize, extent: number) =>
  typeof value === 'string' ? (Number(value.slice(0, -1)) / 100) * extent : value;

const warnPlacement = (element: HTMLElement, side: Side) => {
  if (!DEV) {
    return;
  }
  const siblings = [...(element.parentElement?.children ?? [])];
  const fill = siblings.findIndex((node) => node.hasAttribute(FILL_ATTRIBUTE));
  if (fill === -1) {
    // oxlint-disable-next-line no-console -- dev-only 用户提示
    console.warn(
      'PanelGroup: 组内需要一个未设置 size 的填充面板（fill panel），否则有尺寸的面板无法判断伸缩方向。',
    );
    return;
  }
  const half = side === 'start' ? siblings.slice(0, fill) : siblings.slice(fill + 1);
  const sized = half.filter((node) => !isSeparator(node));
  if (sized.length > 1) {
    // oxlint-disable-next-line no-console -- dev-only 用户提示
    console.warn(
      `PanelGroup: 填充面板的 "${side}" 侧有 ${sized.length} 个有尺寸的面板。每组每侧最多一个有尺寸面板——请使用嵌套的 Group。`,
    );
  }
};

export const createPanel = (group: EngineGroup, initial: PanelOptions): PanelController => {
  const { axes, fill, panels } = group;
  const { emit: notify, subscribe, clear } = emitter();

  let element: HTMLElement | null = null;
  let options: PanelOptions = initial;

  const extent = () => element?.parentElement?.[axes.client] ?? 0;
  const measure = () => {
    const pixels = toPixels(options.size, extent());
    return typeof options.size === 'string' ? Math.round(pixels) : pixels;
  };
  const report = (value: number): PanelSize => {
    if (typeof options.size !== 'string') {
      return value;
    }
    const total = extent();
    // 保留两位小数，与 vendor 一致
    return `${total > 0 ? Math.round((value / total) * 10_000) / 100 : 0}%`;
  };

  const size = new MotionValue(initial.collapsed ? 0 : measure());
  const content = new MotionValue(measure());

  let target = size.get();
  let state: PanelState = {
    bare: false,
    dragging: false,
    end: undefined,
    folding: false,
  };
  let unlock: (() => void) | undefined;

  const session = {
    collapsed: false,
    max: 0,
    min: 0,
    sign: 1,
    start: 0,
    wasCollapsed: false,
  };

  const patch = (next: Partial<PanelState>) => {
    const changes = Object.entries(next) as [keyof PanelState, unknown][];
    if (changes.some(([key, value]) => state[key] !== value)) {
      state = { ...state, ...next };
      notify();
    }
  };

  const available = () => {
    const filler = [...(element?.parentElement?.children ?? [])].find((node) =>
      node.hasAttribute(FILL_ATTRIBUTE),
    ) as HTMLElement | undefined;
    let room = filler ? Number.parseFloat(getComputedStyle(filler)[axes.extent]) : 0;
    for (const panel of panels.values()) {
      room += panel.motion.size.get() - (panel === controller ? 0 : panel.target);
    }

    return Math.max(0, room);
  };

  const bounds = () => {
    const room = available();
    const total = extent();
    const min = Math.min(
      options.minSize === undefined ? 0 : toPixels(options.minSize, total),
      room,
    );
    const max = options.maxSize === undefined ? room : toPixels(options.maxSize, total);

    return { max: Math.max(min, Math.min(max, room)), min };
  };

  const growSign = () => (state.end ? 1 : -1) * (axes.point === 'x' && isRtl(element) ? -1 : 1);

  const setFolding = (folding: boolean) => {
    if (folding === state.folding) {
      return;
    }
    patch({ folding });
    if (folding) {
      fill.anchor = state.end ? 'flex-end' : 'flex-start';
      fill.size = available() - target;
    } else if (![...panels.values()].some((panel) => panel.state.folding)) {
      fill.size = '100%';
    }
  };

  const fold = (to: number, from: number, mounting?: boolean) => {
    setFolding(true);
    const closed = size.get() === 0;
    if (closed) {
      content.jump(to);
    }
    const start = () => {
      // 内容宽度跟随目标宽度展开；收起时内容宽度不动，靠裁剪隐藏
      if (!closed && to > 0) {
        content.animate(to, timing());
      }
      const transition = from === 0 || to === 0 ? timing(options.transition) : timing();
      size.animate(to, transition);
    };
    if (closed && mounting) {
      queueMicrotask(start);
    } else {
      start();
    }
  };

  const stopSettle = size.on('animationComplete', () => {
    if (size.get() === target) {
      setFolding(false);
    }
  });

  const release = () => {
    unlock?.();
    unlock = undefined;
  };

  const stopDragging = () => {
    release();
    patch({ dragging: false });
  };

  const drag = {
    start: (cursor: string = axes.cursor) => {
      const collapsed = !!options.collapsed;
      Object.assign(session, {
        ...bounds(),
        collapsed,
        sign: growSign(),
        start: size.get(),
        wasCollapsed: collapsed,
      });
      release();
      unlock = lockBody(cursor, drag.cancel);
      setFolding(false);
      patch({ dragging: true });
    },
    move: (offset: { x: number; y: number }) => {
      if (!state.dragging) return;
      const pixels = session.start + offset[axes.point] * session.sign;
      const collapsed = !!options.onCollapsedChange && pixels < session.min / 2;
      const next = collapsed ? 0 : Math.round(clamp(pixels, session.min, session.max));
      if (collapsed !== session.collapsed) {
        options.onCollapsedChange?.(collapsed);
      }
      size.jump(next);
      if (!collapsed) {
        content.jump(next);
      }
      session.collapsed = collapsed;
    },
    end: () => {
      if (!state.dragging) {
        return;
      }
      stopDragging();
      if (!session.collapsed) {
        options.onSizeChange?.(report(size.get()));
      }
      if (size.get() !== target) {
        fold(target, size.get());
      }
    },
    cancel: () => {
      if (!state.dragging) {
        return;
      }
      size.jump(session.start);
      content.jump(session.start);
      if (session.collapsed !== session.wasCollapsed) {
        options.onCollapsedChange?.(session.wasCollapsed);
      }
      stopDragging();
    },
  };

  const resizeByKey = (event: PanelKeyEvent) => {
    if (event.key === 'Enter') {
      if (options.onCollapsedChange) {
        event.preventDefault();
        options.onCollapsedChange(!options.collapsed);
      }

      return;
    }
    const { max, min } = bounds();
    const fast = event.shiftKey || event.key === 'PageUp' || event.key === 'PageDown';
    const step = (fast ? KEY_STEP_FAST : KEY_STEP) * growSign();
    const moves: Record<string, number> = {
      End: max,
      Home: min,
      PageDown: target + step,
      PageUp: target - step,
      [axes.grow]: target + step,
      [axes.shrink]: target - step,
    };
    const next = moves[event.key];
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    const value = clamp(next, min, max);
    if (options.collapsed && value > 0) {
      options.onCollapsedChange?.(false);
    }
    options.onSizeChange?.(report(value));
  };

  const unplace = () => {
    for (const [side, panel] of panels) {
      if (panel === controller) {
        panels.delete(side);
      }
    }
  };

  const place = () => {
    if (!element) {
      return;
    }
    const end = hasFillAfter(element);
    const side: Side = end ? 'start' : 'end';
    if (panels.get(side) !== controller) {
      warnPlacement(element, side);
      unplace();
      panels.set(side, controller);
      group.notify();
    }
    const neighbour = end ? element.nextElementSibling : element.previousElementSibling;
    patch({ bare: !isSeparator(neighbour), end });
  };

  const refit = () => {
    if (typeof options.size !== 'string' || state.dragging || state.folding) {
      return;
    }
    const value = options.collapsed ? 0 : measure();
    content.jump(measure());
    if (value === target) {
      return;
    }
    target = value;
    size.jump(target);
    notify();
    group.notify();
  };

  const sync = (next: PanelOptions, mounting?: boolean) => {
    options = next;
    place();
    const measured = measure();
    if (size.get() === 0 && !state.dragging) {
      content.jump(measured);
    }
    const value = next.collapsed ? 0 : measured;
    if (value === target) {
      return;
    }
    const from = target;
    target = value;
    notify();
    group.notify();
    if (state.dragging) {
      return;
    }
    if (size.get() === target) {
      setFolding(false);
      size.jump(target);
      content.jump(target);
    } else {
      fold(target, from, mounting);
    }
  };

  const controller: PanelController = {
    attach: (node) => {
      element = node;
      place();
      refit();
      const parent = node.parentElement;
      const watch = parent ? new ResizeObserver(refit) : undefined;
      if (parent) {
        watch?.observe(parent);
      }

      return () => {
        watch?.disconnect();
        release();
        unplace();
        element = null;
        group.notify();
      };
    },
    bounds,
    destroy: () => {
      release();
      size.stop();
      content.stop();
      setFolding(false);
      stopSettle();
      clear();
    },
    drag,
    motion: { content, size },
    get options() {
      return options;
    },
    reset: () => {
      if (options.collapsed) {
        options.onCollapsedChange?.(false);
      }
      options.onSizeChange?.(options.defaultSize ?? initial.size);
    },
    resizeByKey,
    get state() {
      return state;
    },
    subscribe,
    sync,
    get target() {
      return target;
    },
  };

  return controller;
};
