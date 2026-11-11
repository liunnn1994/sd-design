import type { ElementType, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';

import { cloneElement, createElement, isValidElement, useMemo } from 'react';

import { tableClassName } from './utils.js';

interface RootAttrs extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
}
function assignRef(ref: Ref<HTMLElement> | undefined, value: HTMLElement | null) {
  if (typeof ref === 'function') return ref(value);
  if (ref) ref.current = value;
}

export function useTableRoot(
  component: ElementType,
  element: ReactElement | undefined,
  attrs: RootAttrs,
  children?: ReactNode,
) {
  const original = isValidElement<RootAttrs>(element) ? element.props : undefined;
  const originalRef = original?.ref;
  const viewRef = attrs.ref;
  const ref = useMemo(() => {
    if (!originalRef || originalRef === viewRef) return viewRef ?? originalRef;
    if (!viewRef) return originalRef;
    return (value: HTMLElement | null) => {
      const first = assignRef(originalRef, value);
      const second = assignRef(viewRef, value);
      if (value)
        return () => {
          if (typeof first === 'function') first();
          else assignRef(originalRef, null);
          if (typeof second === 'function') second();
          else assignRef(viewRef, null);
        };
    };
  }, [originalRef, viewRef]);
  const content = children === undefined ? attrs.children : children;
  if (!element || !original) return createElement(component, attrs, content);
  const merged: Record<string, unknown> = {
    ...original,
    ...attrs,
    ref,
    className: tableClassName(original.className, attrs.className),
    style: { ...original.style, ...attrs.style },
  };
  for (const [name, handler] of Object.entries(attrs)) {
    const previous = (original as Record<string, unknown>)[name];
    if (
      /^on[A-Z]/.test(name) &&
      typeof previous === 'function' &&
      typeof handler === 'function' &&
      previous !== handler
    ) {
      merged[name] = (...args: unknown[]) => {
        previous(...args);
        handler(...args);
      };
    }
  }
  return cloneElement(element, merged, content);
}
