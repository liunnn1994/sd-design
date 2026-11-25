import type { ClampProps, ClampSlotProps, ClampExposed } from '@sdata/web-core/clamp/types';
import type { HTMLAttributes, ReactNode, ReactElement, Ref } from 'react';

import {
  cssLength,
  normalizeLineLimit,
  observeBorderBoxSizes,
  observeMeasuredBorderBoxSizes,
} from '@sdata/web-core/clamp/layout';
import { createLayoutMeasurer } from '@sdata/web-core/clamp/measure';
import { createMultilineClamp } from '@sdata/web-core/clamp/multiline';
import {
  getNativeContentStyle,
  nativeBodyStyle,
  nativeTextStyle,
} from '@sdata/web-core/clamp/native';
import { createRichLineClampFoundation } from '@sdata/web-core/clamp/rich-line/foundation';
import { prepareSharedRich } from '@sdata/web-core/clamp/rich-line/preparation';
import { richProbeStyle } from '@sdata/web-core/clamp/rich-line/styles';
// Derived from vue-clamp v1.7.2. MIT; see @sdata/web-core/THIRD_PARTY_NOTICES.md.
import {
  createElement,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { renderClampAffix, useCellFactory, useMultilineLifecycle } from './adapter.js';

export interface RichLineClampProps
  extends Omit<ClampProps, 'location'>, Omit<HTMLAttributes<HTMLElement>, 'children'> {
  html: string;
  before?: ReactNode | ((state: ClampSlotProps) => ReactNode);
  after?: ReactNode | ((state: ClampSlotProps) => ReactNode);
  onExpandedChange?: (expanded: boolean) => void;
  onClampChange?: (clamped: boolean) => void;
  ref?: Ref<ClampExposed>;
  rootRef?: Ref<HTMLElement> | undefined;
}

export function RichLineClamp({
  as = 'div',
  html,
  maxLines,
  maxHeight,
  ellipsis = '…',
  boundary = 'grapheme',
  expanded,
  before,
  after,
  onExpandedChange,
  onClampChange,
  ref,
  rootRef,
  style,
  ...attrs
}: RichLineClampProps): ReactElement {
  const afterRender = useAfterRender();
  const onClampChangeRef = useRef(onClampChange);
  onClampChangeRef.current = onClampChange;
  const lastClamped = useRef<boolean | undefined>(undefined);
  const cell = useCellFactory();
  const live = useRef({
    html,
    maxLines,
    maxHeight,
    ellipsis,
    boundary,
    expanded,
    onExpandedChange,
  });
  live.current = { html, maxLines, maxHeight, ellipsis, boundary, expanded, onExpandedChange };
  const prepared = useMemo(() => prepareSharedRich(html, boundary), [html, boundary]);
  const preparedRef = useRef(prepared);
  preparedRef.current = prepared;
  const [state] = useState(() => {
    const localExpanded = cell(false);
    return {
      expanded: {
        get value() {
          return live.current.expanded ?? localExpanded.value;
        },
        set value(next: boolean) {
          localExpanded.value = next;
          live.current.onExpandedChange?.(next);
        },
      },
      rootRef: cell<HTMLElement | null>(null),
      contentRef: cell<HTMLElement | null>(null),
      bodyRef: cell<HTMLElement | null>(null),
      beforeRef: cell<HTMLElement | null>(null),
      afterRef: cell<HTMLElement | null>(null),
      probeRef: cell<HTMLElement | null>(null),
      isClamped: cell(false),
      isFallback: cell(false),
      hasActiveClamp: {
        get value(): boolean {
          return (
            !state.expanded.value &&
            live.current.html.length > 0 &&
            (normalizeLineLimit(live.current.maxLines) !== undefined ||
              live.current.maxHeight !== undefined)
          );
        },
      },
      preparedHtml: {
        get value() {
          return preparedRef.current;
        },
      },
    };
  });
  const [runtime] = useState(() => {
    const measureLayout = createLayoutMeasurer((task) => {
      void afterRender().then(task);
    });
    const multiline = createMultilineClamp({
      state,
      active: state.hasActiveClamp,
      expanded: state.expanded,
      afterRender: (task) => {
        void afterRender().then(task);
      },
      observeSizes(elements, listener) {
        return foundation.getNativeMode(normalizeLineLimit(live.current.maxLines)) !== null
          ? observeBorderBoxSizes(elements, listener)
          : observeMeasuredBorderBoxSizes(elements, listener, live.current.ellipsis.length > 0);
      },
      syncAffixSignaturesOnRootChange: true,
      recompute: async (value, width) => {
        const result = await foundation.recompute(value, width);
        if (lastClamped.current !== state.isClamped.value) {
          lastClamped.current = state.isClamped.value;
          onClampChangeRef.current?.(state.isClamped.value);
        }
        return result;
      },
    });
    const foundation = createRichLineClampFoundation({
      get html() {
        return live.current.html;
      },
      get maxLines() {
        return live.current.maxLines;
      },
      get maxHeight() {
        return live.current.maxHeight;
      },
      get ellipsis() {
        return live.current.ellipsis;
      },
      get boundary() {
        return live.current.boundary;
      },
      state,
      measureLayout,
      afterRender,
      observedSizeSnapshot: multiline.observedSizeSnapshot,
    });
    return { multiline, foundation };
  });
  const { multiline, foundation } = runtime;
  const [refs] = useState(() => ({
    root: (node: HTMLElement | null) => {
      state.rootRef.value = node;
    },
    content: (node: HTMLElement | null) => {
      state.contentRef.value = node;
    },
    body: (node: HTMLElement | null) => {
      state.bodyRef.value = node;
    },
    probe: (node: HTMLElement | null) => {
      state.probeRef.value = node;
    },
  }));
  const active = state.hasActiveClamp.value;
  const nativeMode = foundation.getNativeMode(normalizeLineLimit(maxLines));
  useMultilineLifecycle(multiline, state, active, nativeMode);
  const previousHtml = useRef(html);
  useLayoutEffect(() => {
    foundation.resetSource(previousHtml.current !== html);
    previousHtml.current = html;
    multiline.requestRecompute();
  }, [
    foundation,
    multiline,
    html,
    maxLines,
    maxHeight,
    ellipsis,
    boundary,
    expanded,
    state.expanded.value,
  ]);
  useImperativeHandle(
    ref,
    () => ({
      expand: multiline.expand,
      collapse: multiline.collapse,
      toggle: multiline.toggle,
      get clamped() {
        return state.isClamped.value;
      },
      get expanded() {
        return state.expanded.value;
      },
    }),
    [multiline, state],
  );
  useImperativeHandle(rootRef, () => state.rootRef.value!, [as, state]);
  const collapsedMaxHeight =
    !state.expanded.value && !state.isFallback.value ? cssLength(maxHeight) : undefined;
  return createElement(
    as,
    {
      ...attrs,
      'ref': refs.root,
      'data-part': 'root',
      'style': {
        ...style,
        ...(collapsedMaxHeight === undefined
          ? {}
          : { maxHeight: collapsedMaxHeight, overflow: 'hidden' }),
      },
    },
    <span
      data-part="content"
      ref={refs.content}
      style={getNativeContentStyle(nativeMode, normalizeLineLimit(maxLines))}
    >
      {renderClampAffix('before', before, multiline, nativeMode)}
      <span
        data-part="body"
        ref={refs.body}
        style={
          nativeMode === 'single-line' ? { ...nativeBodyStyle, ...nativeTextStyle } : undefined
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {renderClampAffix('after', after, multiline, nativeMode)}
    </span>,
    !nativeMode && <span aria-hidden="true" inert ref={refs.probe} style={richProbeStyle} />,
  );
}
