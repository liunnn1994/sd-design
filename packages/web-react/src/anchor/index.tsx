import type { BoundaryPosition } from '@sdata/web-core/anchor/utils';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import { createAnchor } from '@sdata/web-core/anchor/foundation';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { Affix } from '../affix/index.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';

export type { BoundaryPosition } from '@sdata/web-core/anchor/utils';
export interface AnchorProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'onSelect'> {
  boundary?: BoundaryPosition | number;
  lineLess?: boolean;
  affix?: boolean;
  affixStyle?: CSSProperties;
  offsetTop?: number;
  offsetBottom?: number;
  direction?: 'vertical' | 'horizontal';
  targetOffset?: number;
  scrollContainer?: string | HTMLElement | Window;
  changeHash?: boolean;
  smooth?: boolean;
  onSelect?: (hash: string | undefined, previous: string) => void;
  onChange?: (hash: string) => void;
}
export interface AnchorLinkProps extends Omit<ComponentPropsWithRef<'li'>, 'title'> {
  title?: string;
  href?: string;
  sublist?: ReactNode;
}
type AnchorFoundation = ReturnType<typeof createAnchor>;
const AnchorContext = createContext<{ foundation: AnchorFoundation; current: string } | undefined>(
  undefined,
);

function AnchorRoot({
  boundary = 'start',
  lineLess = false,
  affix = false,
  affixStyle,
  offsetTop = 0,
  offsetBottom,
  direction = 'vertical',
  targetOffset,
  scrollContainer,
  changeHash = true,
  smooth = true,
  onSelect,
  onChange,
  children,
  ref,
  ...attrs
}: AnchorProps) {
  const prefix = usePrefix('anchor');
  const { t } = useI18n();
  const line = useRef<HTMLDivElement>(null);
  const live = useRef({
    boundary,
    lineLess,
    targetOffset,
    scrollContainer,
    changeHash,
    smooth,
    onSelect,
    onChange,
  });
  live.current = {
    boundary,
    lineLess,
    targetOffset,
    scrollContainer,
    changeHash,
    smooth,
    onSelect,
    onChange,
  };
  const state = useRef<{
    current: string;
    scrolling: boolean;
    scrollContainer?: HTMLElement | Window | undefined;
    container?: HTMLElement | undefined;
  }>({ current: '', scrolling: false });
  const [current, setCurrent] = useState('');
  const afterRender = useAfterRender();
  const [foundation] = useState(() =>
    createAnchor({
      get props() {
        return live.current;
      },
      links: {},
      get line() {
        return line.current ?? undefined;
      },
      get current() {
        return state.current.current;
      },
      set current(value) {
        state.current.current = value;
        setCurrent(value);
      },
      get scrolling() {
        return state.current.scrolling;
      },
      set scrolling(value) {
        state.current.scrolling = value;
      },
      get scrollContainer() {
        return state.current.scrollContainer;
      },
      set scrollContainer(value) {
        state.current.scrollContainer = value;
      },
      get container() {
        return state.current.container;
      },
      set container(value) {
        state.current.container = value;
      },
      afterRender(callback) {
        void afterRender().then(callback);
      },
      onChange(hash) {
        live.current.onChange?.(hash);
      },
      onSelect(hash, previous) {
        live.current.onSelect?.(hash, previous);
      },
    }),
  );
  useLayoutEffect(() => {
    foundation.mount();
    return foundation.dispose;
  }, [foundation]);
  const previousContainer = useRef(scrollContainer);
  useLayoutEffect(() => {
    if (previousContainer.current !== scrollContainer) {
      previousContainer.current = scrollContainer;
      foundation.containerChanged();
    }
  }, [foundation, scrollContainer]);
  useLayoutEffect(() => {
    foundation.syncLine();
  });
  const context = useMemo(() => ({ foundation, current }), [foundation, current]);
  const content = (
    <AnchorContext.Provider value={context}>
      <div
        ref={ref}
        role="navigation"
        aria-label={t('a11y.anchorNav')}
        className={[
          prefix,
          lineLess && `${prefix}-line-less`,
          direction === 'horizontal' && `${prefix}-horizontal`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!lineLess && <div ref={line} className={`${prefix}-line-slider`} />}
        <ul className={`${prefix}-list`}>{children}</ul>
      </div>
    </AnchorContext.Provider>
  );
  return affix ? (
    <Affix
      {...attrs}
      offsetTop={offsetTop}
      offsetBottom={offsetBottom}
      target={scrollContainer}
      style={{ ...affixStyle, ...attrs.style }}
    >
      {content}
    </Affix>
  ) : (
    <div {...attrs}>{content}</div>
  );
}

export function AnchorLink({
  title,
  href,
  sublist,
  children,
  className,
  ref,
  ...attrs
}: AnchorLinkProps) {
  const prefix = usePrefix('anchor');
  const context = useContext(AnchorContext);
  const foundation = context?.foundation;
  const node = useRef<HTMLLIElement>(null);
  const rootRef = useCallback(
    (element: HTMLLIElement | null) => {
      node.current = element;
      if (typeof ref === 'function') return ref(element);
      if (ref) ref.current = element;
    },
    [ref],
  );
  useLayoutEffect(() => {
    if (!foundation || !href || !node.current) return;
    foundation.addLink(href, node.current);
    foundation.syncLine();
    return () => {
      foundation.removeLink(href);
      foundation.syncLine();
    };
  }, [foundation, href]);
  const active = context?.current === href;
  return (
    <li
      {...attrs}
      ref={rootRef}
      className={[`${prefix}-link-item`, active && `${prefix}-link-active`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <a
        className={`${prefix}-link`}
        href={href}
        aria-current={active ? 'location' : undefined}
        onClick={(event) => foundation?.click(event.nativeEvent, href)}
      >
        {children ?? title}
      </a>
      {sublist != null && <ul className={`${prefix}-sublist`}>{sublist}</ul>}
    </li>
  );
}

export const Anchor = Object.assign(AnchorRoot, { Link: AnchorLink });
export default Anchor;

export type AnchorInstance = ReactComponentRef<typeof Anchor>;
export type AnchorLinkInstance = ReactComponentRef<typeof AnchorLink>;
