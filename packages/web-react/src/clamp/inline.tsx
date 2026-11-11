import type { InlineClampProps as CoreInlineClampProps } from '@sdata/web-core/clamp/inline/types';
import type { HTMLAttributes, ReactElement, Ref } from 'react';

import { createInlineClampFoundation } from '@sdata/web-core/clamp/inline/foundation';
import { inlineClampRootStyle } from '@sdata/web-core/clamp/inline/styles';
import { createLayoutMeasurer } from '@sdata/web-core/clamp/measure';
import { nativeTextStyle, resolveNativeMode } from '@sdata/web-core/clamp/native';
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

import { useAfterRender } from '../_shared/use-after-render.js';
import { useCellFactory } from './adapter.js';

export interface InlineClampProps
  extends CoreInlineClampProps, Omit<HTMLAttributes<HTMLElement>, 'children'> {
  ref?: Ref<HTMLElement>;
}

export function InlineClamp({
  as = 'span',
  text,
  ellipsis = '…',
  location = 'end',
  boundary = 'grapheme',
  split,
  ref,
  style,
  ...attrs
}: InlineClampProps): ReactElement {
  const cell = useCellFactory();
  const afterRender = useAfterRender();
  const parts = useMemo(() => split?.(text) ?? { body: text }, [split, text]);
  const preparedBody = useMemo(
    () => prepareSharedText(parts.body, boundary),
    [parts.body, boundary],
  );
  const usesNativeClamp =
    split === undefined &&
    resolveNativeMode({
      boundary,
      ellipsis,
      expanded: false,
      hasAfterSlot: false,
      lineLimit: 1,
      locationRatio: normalizeLocationRatio(location),
      maxHeight: undefined,
    }) === 'single-line';
  const live = useRef({ split, location, ellipsis, parts, preparedBody, usesNativeClamp });
  live.current = { split, location, ellipsis, parts, preparedBody, usesNativeClamp };
  const [state] = useState(() => ({
    rootRef: cell<HTMLElement | null>(null),
    bodyRef: cell<HTMLElement | null>(null),
    visibleBody: cell({ text: parts.body }),
    parts: {
      get value() {
        return live.current.parts;
      },
    },
    preparedBody: {
      get value() {
        return live.current.preparedBody;
      },
    },
    usesNativeClamp: {
      get value() {
        return live.current.usesNativeClamp;
      },
    },
    hasActiveClamp: {
      get value() {
        return !live.current.usesNativeClamp && live.current.parts.body.length > 0;
      },
    },
  }));
  const foundation = useRef<ReturnType<typeof createInlineClampFoundation> | null>(null);
  useLayoutEffect(() => {
    const controller = createInlineClampFoundation({
      get split() {
        return live.current.split;
      },
      get location() {
        return live.current.location;
      },
      get ellipsis() {
        return live.current.ellipsis;
      },
      state,
      measureLayout: createLayoutMeasurer((task) => {
        void afterRender().then(task);
      }),
    });
    foundation.current = controller;
    controller.mount();
    return () => {
      controller.dispose();
      foundation.current = null;
    };
  }, [afterRender, state]);
  useLayoutEffect(() => {
    foundation.current?.semanticChanged();
  }, [parts, ellipsis, location, boundary]);
  useLayoutEffect(
    () => foundation.current?.observe(),
    [usesNativeClamp, state.hasActiveClamp.value, state.rootRef.value],
  );
  useLayoutEffect(() => {
    foundation.current?.updated();
  });
  useImperativeHandle(ref, () => state.rootRef.value!, [state.rootRef.value]);
  const [refs] = useState(() => ({
    root: (node: HTMLElement | null) => {
      state.rootRef.value = node;
    },
    body: (node: HTMLElement | null) => {
      state.bodyRef.value = node;
    },
  }));
  const rewritten = !usesNativeClamp && state.visibleBody.value.text !== parts.body;
  return createElement(
    as,
    {
      ...attrs,
      'ref': refs.root,
      'data-part': 'root',
      'style': { ...style, ...inlineClampRootStyle },
    },
    rewritten && (
      <span key="source" style={visuallyHiddenTextStyle}>
        {text}
      </span>
    ),
    parts.start && (
      <span key="start" data-part="start" aria-hidden={rewritten || undefined}>
        {parts.start}
      </span>
    ),
    <span
      key="body"
      data-part="body"
      ref={refs.body}
      aria-hidden={rewritten || undefined}
      style={usesNativeClamp ? nativeTextStyle : undefined}
    >
      {usesNativeClamp ? parts.body : state.visibleBody.value.text}
    </span>,
    parts.end && (
      <span key="end" data-part="end" aria-hidden={rewritten || undefined}>
        {parts.end}
      </span>
    ),
  );
}
