import type { ImageNodeProps } from 'markstream-react';

import { createMarkdownImageFoundation } from '@sdata/web-core/markdown/image';
import { useContext, useLayoutEffect, useReducer, useRef, useState, type ReactNode } from 'react';

import { usePrefix } from '../../config-provider/index.js';
import { Image } from '../../image/index.js';
import { getMarkdownNodeEvents, type MarkdownNodeEvents } from './events.js';
import { MarkdownNodeLifecycleContext } from './lifecycle.js';

export interface MarkdownImageSlotState {
  node: ImageNodeProps['node'];
  displaySrc: string;
  imageLoaded: boolean;
  hasError: boolean;
  fallbackSrc: string;
  lazy: boolean;
}
export interface MarkdownImageNodeProps
  extends ImageNodeProps, Omit<MarkdownNodeEvents, 'onClick'> {
  indexKey?: string | number;
  onClick?(payload: [MouseEvent, string]): void;
  onLoad?(src: string): void;
  onError?(src: string): void;
  renderPlaceholder?(state: MarkdownImageSlotState): ReactNode;
  renderError?(state: MarkdownImageSlotState): ReactNode;
}
export function MarkdownImageNode(props: MarkdownImageNodeProps) {
  const { node, indexKey = '', fallbackSrc = '', lazy = false, usePlaceholder = true } = props;
  const prefix = usePrefix('markdown-render-image');
  const lifecycle = useContext(MarkdownNodeLifecycleContext);
  const root = useRef<HTMLSpanElement>(null);
  const [, render] = useReducer((value: number) => value + 1, 0);
  const live = useRef({ props, lifecycle });
  live.current = { props, lifecycle };
  const commits = useRef<Array<() => void>>([]);
  const [state] = useState(() => ({ fallback: false, loaded: false, failed: false }));
  const [foundation] = useState(() =>
    createMarkdownImageFoundation(
      {
        get fallback() {
          return state.fallback;
        },
        set fallback(value) {
          state.fallback = value;
          render();
        },
        get loaded() {
          return state.loaded;
        },
        set loaded(value) {
          state.loaded = value;
          render();
        },
        get failed() {
          return state.failed;
        },
        set failed(value) {
          state.failed = value;
          render();
        },
        get nodeSrc() {
          return live.current.props.node.src;
        },
        get fallbackSrc() {
          return live.current.props.fallbackSrc ?? '';
        },
        get indexKey() {
          return live.current.props.indexKey ?? '';
        },
        get src(): string {
          return foundation.getSrc();
        },
        get root() {
          return root.current;
        },
      },
      {
        markPending: (key) => live.current.lifecycle?.markPending(key),
        markSettled: (key) => live.current.lifecycle?.markSettled(key),
        reportHeight: (key, height) => live.current.lifecycle?.reportHeight(key, height),
      },
      () =>
        new Promise<void>((resolve) => {
          commits.current.push(resolve);
          render();
        }),
      (src) => live.current.props.onLoad?.(src),
      (src) => live.current.props.onError?.(src),
      (payload) => live.current.props.onClick?.(payload),
    ),
  );
  useLayoutEffect(() => {
    for (const resolve of commits.current.splice(0)) resolve();
  });
  useLayoutEffect(() => {
    let cleanup: (() => void) | undefined;
    foundation.reset((value) => {
      cleanup = value;
    });
    return () => {
      cleanup?.();
      for (const resolve of commits.current.splice(0)) resolve();
    };
  }, [node.src, node.loading, fallbackSrc, indexKey, foundation]);
  const src = foundation.getSrc();
  const hasError = state.failed || !src;
  const slotState = {
    node,
    displaySrc: src,
    imageLoaded: state.loaded,
    hasError,
    fallbackSrc,
    lazy,
  };
  return (
    <span
      ref={root}
      {...getMarkdownNodeEvents({ onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut })}
      className={prefix}
    >
      {src && !node.loading && (
        <Image
          key={src}
          src={src}
          alt={node.alt}
          title={node.title ?? undefined}
          loading={lazy ? 'lazy' : 'eager'}
          showLoader={usePlaceholder}
          hideFooter
          onLoad={foundation.handleLoad}
          onError={foundation.handleError}
          onClick={(event) => foundation.handleClick(event.nativeEvent)}
        />
      )}
      {node.title && <span className={`${prefix}-caption`}>{node.title}</span>}
      {usePlaceholder && !state.loaded && !hasError && props.renderPlaceholder?.(slotState)}
      {hasError && props.renderError?.(slotState)}
    </span>
  );
}
