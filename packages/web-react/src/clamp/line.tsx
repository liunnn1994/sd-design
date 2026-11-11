import type { LineClampLocation } from '@sdata/web-core/clamp/types';
import type { ReactElement } from 'react';

import {
  cssLength,
  normalizeLineLimit,
  observeBorderBoxSizes,
  observeMeasuredBorderBoxSizes,
} from '@sdata/web-core/clamp/layout';
import { createLineClampFoundation } from '@sdata/web-core/clamp/line/foundation';
import { createLayoutMeasurer } from '@sdata/web-core/clamp/measure';
import { createMultilineClamp } from '@sdata/web-core/clamp/multiline';
import {
  getNativeContentStyle,
  nativeBodyStyle,
  nativeTextStyle,
} from '@sdata/web-core/clamp/native';
import { visuallyHiddenTextStyle } from '@sdata/web-core/clamp/styles';
import { normalizeLocationRatio, prepareSharedText } from '@sdata/web-core/clamp/text';
// Derived from vue-clamp v1.7.2. MIT; see @sdata/web-core/THIRD_PARTY_NOTICES.md.
import {
  createElement,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { RichLineClampProps } from './rich-line.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { renderClampAffix, useCellFactory, useMultilineLifecycle } from './adapter.js';

export interface LineClampProps extends Omit<RichLineClampProps, 'html'> {
  text?: string;
  location?: LineClampLocation;
}

export function LineClamp({
  as = 'div',
  text = '',
  maxLines,
  maxHeight,
  ellipsis = '…',
  location = 'end',
  boundary = 'grapheme',
  expanded,
  before,
  after,
  onExpandedChange,
  onClampChange,
  ref,
  style,
  ...attrs
}: LineClampProps): ReactElement {
  const afterRender = useAfterRender();
  const cell = useCellFactory();
  const live = useRef({
    text,
    maxLines,
    maxHeight,
    ellipsis,
    location,
    boundary,
    expanded,
    onExpandedChange,
    onClampChange,
  });
  live.current = {
    text,
    maxLines,
    maxHeight,
    ellipsis,
    location,
    boundary,
    expanded,
    onExpandedChange,
    onClampChange,
  };
  const prepared = useMemo(() => prepareSharedText(text, boundary), [text, boundary]);
  const preparedRef = useRef(prepared);
  preparedRef.current = prepared;
  const lastClamped = useRef<boolean | undefined>(undefined);
  const [state] = useState(() => {
    const localExpanded = cell(false);
    return {
      rootRef: cell<HTMLElement | null>(null),
      contentRef: cell<HTMLElement | null>(null),
      beforeRef: cell<HTMLElement | null>(null),
      bodyRef: cell<HTMLElement | null>(null),
      afterRef: cell<HTMLElement | null>(null),
      textRef: cell<HTMLElement | null>(null),
      isClamped: cell(false),
      visibleText: cell({ text }),
      expanded: {
        get value() {
          return live.current.expanded ?? localExpanded.value;
        },
        set value(next: boolean) {
          localExpanded.value = next;
          live.current.onExpandedChange?.(next);
        },
      },
      lineLimit: {
        get value() {
          return normalizeLineLimit(live.current.maxLines);
        },
      },
      preparedText: {
        get value() {
          return preparedRef.current;
        },
      },
      hasActiveClamp: {
        get value(): boolean {
          return (
            !state.expanded.value &&
            live.current.text.length > 0 &&
            (state.lineLimit.value !== undefined || live.current.maxHeight !== undefined)
          );
        },
      },
    };
  });
  const [{ multiline, foundation }] = useState(() => {
    const multiline = createMultilineClamp({
      state,
      active: state.hasActiveClamp,
      expanded: state.expanded,
      afterRender: (task) => {
        void afterRender().then(task);
      },
      onFontLoad: () => foundation.onFontLoad(),
      observeSizes: (elements, listener) =>
        (foundation.getNativeMode(
          state.afterRef.value !== null,
          state.lineLimit.value,
          normalizeLocationRatio(live.current.location),
        ) !== null
          ? observeBorderBoxSizes
          : observeMeasuredBorderBoxSizes)(elements, listener),
      recompute: async (value, width) => {
        await foundation.recompute(value, width);
        if (lastClamped.current !== state.isClamped.value) {
          lastClamped.current = state.isClamped.value;
          live.current.onClampChange?.(state.isClamped.value);
        }
      },
    });
    const foundation = createLineClampFoundation({
      get text() {
        return live.current.text;
      },
      get location() {
        return live.current.location;
      },
      get maxHeight() {
        return live.current.maxHeight;
      },
      get boundary() {
        return live.current.boundary;
      },
      get ellipsis() {
        return live.current.ellipsis;
      },
      state,
      afterRender,
      observedSizeSnapshot: multiline.observedSizeSnapshot,
      measureLayout: createLayoutMeasurer((task) => {
        void afterRender().then(task);
      }),
    });
    return { multiline, foundation };
  });
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
    text: (node: HTMLElement | null) => {
      state.textRef.value = node;
    },
  }));
  const nativeMode = foundation.getNativeMode(
    state.afterRef.value !== null,
    state.lineLimit.value,
    normalizeLocationRatio(location),
  );
  useMultilineLifecycle(multiline, state, state.hasActiveClamp.value, nativeMode);
  useLayoutEffect(() => {
    foundation.resetTextClampHint();
    multiline.requestRecompute();
  }, [
    foundation,
    multiline,
    text,
    maxLines,
    maxHeight,
    ellipsis,
    location,
    boundary,
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
  const currentText = state.visibleText.value.text;
  const hasLimit = foundation.hasClampLimit(state.lineLimit.value);
  const sourceIsHidden = !nativeMode && hasLimit && !state.expanded.value && currentText !== text;
  const renderedText =
    nativeMode || state.expanded.value || !currentText.length || !hasLimit ? text : currentText;
  return createElement(
    as,
    {
      ...attrs,
      'ref': refs.root,
      'data-part': 'root',
      'style': {
        ...style,
        overflow: 'hidden',
        maxHeight: !state.expanded.value ? cssLength(maxHeight) : undefined,
      },
    },
    <span
      data-part="content"
      ref={refs.content}
      style={getNativeContentStyle(nativeMode, state.lineLimit.value)}
    >
      {renderClampAffix('before', before, multiline, nativeMode)}
      <span
        data-part="body"
        ref={refs.body}
        style={nativeMode === 'single-line' ? nativeBodyStyle : { position: 'relative' }}
      >
        {sourceIsHidden && <span style={visuallyHiddenTextStyle}>{text}</span>}
        <span
          key="text"
          ref={refs.text}
          aria-hidden={sourceIsHidden || undefined}
          style={nativeMode === 'single-line' ? nativeTextStyle : undefined}
        >
          {renderedText}
        </span>
      </span>
      {renderClampAffix('after', after, multiline, nativeMode)}
    </span>,
  );
}
