import { compute } from 'compute-scroll-into-view';

import type { BoundaryPosition } from './utils.js';

import { getElement, off, on } from '../_utils/dom.js';
import { isNumber, isWindow } from '../_utils/is.js';
import { throttleByRaf } from '../_utils/throttle-by-raf.js';
import { slide } from './utils.js';

export function createAnchor(adapter: {
  readonly props: {
    boundary: BoundaryPosition | number;
    targetOffset?: number;
    scrollContainer?: string | HTMLElement | Window;
    smooth: boolean;
    changeHash: boolean;
    lineLess: boolean;
  };
  readonly links: Record<string, HTMLElement>;
  readonly line: HTMLElement | undefined;
  current: string;
  scrolling: boolean;
  scrollContainer: HTMLElement | Window | undefined;
  container: HTMLElement | undefined;
  afterRender(callback: () => void): void;
  onChange(hash: string): void;
  onSelect(hash: string | undefined, previous: string): void;
}) {
  let cancelScroll: (() => void) | undefined;
  function change(hash: string) {
    if (hash !== adapter.current) {
      adapter.current = hash;
      adapter.afterRender(() => adapter.onChange(hash));
    }
  }
  function scrollIntoView(hash: string) {
    cancelScroll?.();
    adapter.scrolling = false;
    try {
      const element = getElement(hash, adapter.container) ?? getElement(hash);
      if (!element) return;
      const boundary = adapter.props.boundary;
      const block = isNumber(boundary) ? 'start' : boundary;
      const diff = isNumber(boundary) ? boundary : 0;
      const actions = compute(element, { block });
      if (!actions.length) return;
      const { el, top } = actions[0];
      adapter.scrolling = true;
      cancelScroll = slide(
        el as HTMLElement,
        top - diff,
        () => {
          adapter.scrolling = false;
        },
        adapter.props.smooth,
      );
    } catch (error) {
      // oxlint-disable-next-line no-console
      console.error(error);
    }
  }
  function firstInViewport(): HTMLElement | undefined {
    if (!adapter.scrollContainer || !adapter.container) return undefined;
    const boundary = isNumber(adapter.props.boundary) ? adapter.props.boundary : 0;
    const rect = adapter.container.getBoundingClientRect();
    const offset = isNumber(adapter.props.targetOffset)
      ? adapter.props.targetOffset
      : rect.height / 2;
    for (const hash of Object.keys(adapter.links)) {
      const element = getElement(hash, adapter.container) ?? getElement(hash);
      if (element) {
        const { top } = element.getBoundingClientRect();
        const offsetTop = isWindow(adapter.scrollContainer)
          ? top - boundary
          : top - rect.top - boundary;
        if (offsetTop >= 0 && offsetTop <= offset) return element;
      }
    }
    return undefined;
  }
  const scroll = throttleByRaf(() => {
    if (adapter.scrolling) return;
    const element = firstInViewport();
    if (element?.id) change(`#${element.id}`);
  });
  function bind() {
    if (adapter.scrollContainer) on(adapter.scrollContainer, 'scroll', scroll);
  }
  function unbind() {
    if (adapter.scrollContainer) off(adapter.scrollContainer, 'scroll', scroll);
  }
  function resolveContainer() {
    const target = adapter.props.scrollContainer;
    if (target) {
      adapter.scrollContainer = isWindow(target) ? window : getElement(target);
      adapter.container = isWindow(target) ? document.documentElement : getElement(target);
    } else {
      adapter.scrollContainer = window;
      adapter.container = document.documentElement;
    }
  }
  return {
    firstInViewport,
    addLink(hash: string, node: HTMLElement) {
      if (hash) adapter.links[hash] = node;
    },
    removeLink(hash: string) {
      delete adapter.links[hash];
    },
    click(event: MouseEvent, hash?: string) {
      if (!adapter.props.changeHash) event.preventDefault();
      const previous = adapter.current;
      if (hash) {
        scrollIntoView(hash);
        change(hash);
      }
      adapter.onSelect(hash, previous);
    },
    syncLine() {
      const link = adapter.links[adapter.current];
      if (!adapter.props.lineLess && link && adapter.line)
        adapter.line.style.top = `${link.offsetTop}px`;
    },
    containerChanged() {
      cancelScroll?.();
      adapter.scrolling = false;
      unbind();
      resolveContainer();
      bind();
      scroll();
    },
    mount() {
      resolveContainer();
      let hash = window.location.hash;
      try {
        hash = decodeURIComponent(hash);
      } catch {
        /* Preserve literal percent signs. */
      }
      if (hash) {
        scrollIntoView(hash);
        change(hash);
      } else scroll();
      bind();
    },
    dispose() {
      cancelScroll?.();
      scroll.cancel();
      unbind();
    },
  };
}
