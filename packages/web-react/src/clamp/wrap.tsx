import type {
  WrapClampProps as CoreWrapClampProps,
  WrapClampExposed,
  WrapClampSlotProps,
  WrapClampItemSlotProps,
} from '@sdata/web-core/clamp/wrap/types';
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';

import { createClampControls } from '@sdata/web-core/clamp/controls';
import {
  cssLength,
  hasBorderBoxEntrySignatureChange,
  listenForFontLoads,
  normalizeLineLimit,
  observeMeasuredBorderBoxSizes,
} from '@sdata/web-core/clamp/layout';
import { createWrapClampFoundation, resolveItemKey } from '@sdata/web-core/clamp/wrap/foundation';
import { contentStyle, hiddenItemStyle, itemStyle } from '@sdata/web-core/clamp/wrap/styles';
// Derived from vue-clamp v1.7.2. MIT; see @sdata/web-core/THIRD_PARTY_NOTICES.md.
import { createElement, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useCellFactory } from './adapter.js';

export interface WrapClampProps<T = unknown>
  extends CoreWrapClampProps<T>, Omit<HTMLAttributes<HTMLElement>, 'children'> {
  renderItem: (props: WrapClampItemSlotProps<T>) => ReactNode;
  before?: ReactNode | ((props: WrapClampSlotProps<T>) => ReactNode);
  after?: ReactNode | ((props: WrapClampSlotProps<T>) => ReactNode);
  onExpandedChange?: (expanded: boolean) => void;
  onClampChange?: (clamped: boolean) => void;
  ref?: Ref<WrapClampExposed>;
}

const emptyItems: readonly never[] = [];

export function WrapClamp<T>({
  as = 'div',
  items = emptyItems,
  itemKey,
  maxLines,
  maxHeight,
  expanded,
  renderItem,
  before,
  after,
  onExpandedChange,
  onClampChange,
  ref,
  style,
  ...attrs
}: WrapClampProps<T>): ReactElement {
  const cell = useCellFactory();
  const afterRender = useAfterRender();
  const live = useRef({
    items,
    maxLines,
    maxHeight,
    expanded,
    before,
    after,
    onExpandedChange,
    onClampChange,
  });
  live.current = {
    items,
    maxLines,
    maxHeight,
    expanded,
    before,
    after,
    onExpandedChange,
    onClampChange,
  };
  const [state] = useState(() => {
    const localExpanded = cell(false);
    return {
      rootRef: cell<HTMLElement | null>(null),
      contentRef: cell<HTMLElement | null>(null),
      beforeRef: cell<HTMLElement | null>(null),
      afterRef: cell<HTMLElement | null>(null),
      visibleCount: cell(items.length),
      materializedCount: cell(0),
      isClamped: cell(false),
      expanded: {
        get value() {
          return live.current.expanded ?? localExpanded.value;
        },
        set value(next: boolean) {
          localExpanded.value = next;
          live.current.onExpandedChange?.(next);
        },
      },
    };
  });
  const [controls] = useState(() => createClampControls(state.expanded));
  const [foundation] = useState(() =>
    createWrapClampFoundation({
      get items() {
        return live.current.items;
      },
      get maxLines() {
        return live.current.maxLines;
      },
      get maxHeight() {
        return live.current.maxHeight;
      },
      get slots() {
        return { before: live.current.before, after: live.current.after };
      },
      state,
      // Commit measurement candidates before another observer can flush them during delivery.
      afterRender: () =>
        new Promise<void>((resolve) => {
          queueMicrotask(() =>
            flushSync(() => {
              void afterRender().then(resolve);
            }),
          );
        }),
    }),
  );
  const [refs] = useState(() => ({
    root: (node: HTMLElement | null) => {
      state.rootRef.value = node;
    },
    content: (node: HTMLElement | null) => {
      state.contentRef.value = node;
    },
    before: (node: HTMLElement | null) => {
      state.beforeRef.value = node;
    },
    after: (node: HTMLElement | null) => {
      state.afterRef.value = node;
    },
  }));
  const active =
    !state.expanded.value &&
    items.length > 0 &&
    (normalizeLineLimit(maxLines) !== undefined || maxHeight !== undefined);
  useLayoutEffect(() => {
    foundation.requestRecompute();
  }, [foundation, state.expanded.value]);
  useLayoutEffect(() => {
    foundation.resetMeasurements();
    foundation.requestRecompute();
  }, [foundation, maxLines, maxHeight, itemKey, items, items.length]);
  useLayoutEffect(() => {
    live.current.onClampChange?.(state.isClamped.value);
  }, [state.isClamped.value]);
  useLayoutEffect(() => {
    if (!active) return;
    let frame: number | undefined;
    const stop = observeMeasuredBorderBoxSizes(
      [
        state.rootRef.value,
        state.contentRef.value,
        state.beforeRef.value,
        state.afterRef.value,
      ].filter((element): element is HTMLElement => element !== null),
      (entries) => {
        if (hasBorderBoxEntrySignatureChange(entries, foundation.lastObservedSignature)) {
          frame ??= requestAnimationFrame(() => {
            frame = undefined;
            foundation.requestRecompute();
          });
        }
      },
      false,
    );
    return () => {
      stop();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [
    foundation,
    active,
    state.rootRef.value,
    state.contentRef.value,
    state.beforeRef.value,
    state.afterRef.value,
  ]);
  useLayoutEffect(() => {
    if (active)
      return listenForFontLoads(() => {
        foundation.resetMeasurements();
        foundation.requestRecompute();
      });
  }, [foundation, active]);
  useLayoutEffect(() => {
    if (
      !foundation.isRecomputing &&
      active &&
      foundation.layoutSignature(false) === foundation.lastLayoutSignature
    ) {
      foundation.resetMeasurements();
      foundation.requestRecompute();
    }
  });
  useImperativeHandle(
    ref,
    () => ({
      ...controls,
      get clamped() {
        return state.isClamped.value;
      },
      get expanded() {
        return state.expanded.value;
      },
    }),
    [controls, state],
  );
  const visibleCount = Math.min(state.visibleCount.value, items.length);
  const renderedCount = Math.min(
    items.length,
    Math.max(visibleCount, state.materializedCount.value),
  );
  const slotProps: WrapClampSlotProps<T> = {
    ...controls,
    clamped: visibleCount < items.length,
    expanded: state.expanded.value,
    hiddenItems: items.slice(visibleCount),
  };
  const affix = (part: 'before' | 'after', content: WrapClampProps<T>['before']) => {
    const node = typeof content === 'function' ? content(slotProps) : content;
    return node == null || typeof node === 'boolean' ? null : (
      <span data-part={part} ref={refs[part]} style={itemStyle}>
        {node}
      </span>
    );
  };
  return createElement(
    as,
    {
      ...attrs,
      'ref': refs.root,
      'data-part': 'root',
      'style': {
        ...style,
        maxHeight: !state.expanded.value ? cssLength(maxHeight) : undefined,
        overflow: 'hidden',
      },
    },
    <span data-part="content" ref={refs.content} style={contentStyle}>
      {affix('before', before)}
      {items.slice(0, renderedCount).map((item, index) => (
        <span
          key={resolveItemKey(itemKey, item, index)}
          data-part="item"
          aria-hidden={index >= visibleCount || undefined}
          style={index >= visibleCount ? hiddenItemStyle : itemStyle}
        >
          {renderItem({ item, index })}
        </span>
      ))}
      {affix('after', after)}
    </span>,
  );
}
