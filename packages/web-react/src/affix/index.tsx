import type { ComponentPropsWithoutRef, Ref } from 'react';

import { createAffix, type AffixFixedStyle } from '@sdata/web-core/affix/foundation';
import { createResizeObserverController } from '@sdata/web-core/resize-observer/browser';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import { usePrefix } from '../config-provider/index.js';

export interface AffixExposed {
  updatePosition(): void;
}
export type AffixInstance = AffixExposed;
export interface AffixProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  offsetTop?: number;
  offsetBottom?: number | undefined;
  target?: string | HTMLElement | Window | undefined;
  targetContainer?: string | HTMLElement | Window;
  onChange?: (fixed: boolean) => void;
  ref?: Ref<AffixExposed>;
}

export function Affix({
  offsetTop = 0,
  offsetBottom,
  target,
  targetContainer,
  onChange,
  ref,
  children,
  ...attrs
}: AffixProps) {
  const prefix = usePrefix('affix');
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const live = useRef({ offsetTop, offsetBottom, target, targetContainer, onChange });
  live.current = { offsetTop, offsetBottom, target, targetContainer, onChange };
  const state = useRef<{ fixed: boolean; target?: HTMLElement | Window | undefined }>({
    fixed: false,
  });
  const [fixed, setFixed] = useState(false);
  const [placeholder, setPlaceholder] = useState<{ width: string; height: string }>();
  const [style, setStyle] = useState<AffixFixedStyle>({});
  const [foundation] = useState(() =>
    createAffix({
      get props() {
        return live.current;
      },
      get wrapper() {
        return wrapper.current ?? undefined;
      },
      get content() {
        return content.current ?? undefined;
      },
      get fixed() {
        return state.current.fixed;
      },
      get target() {
        return state.current.target;
      },
      set target(value) {
        state.current.target = value;
      },
      setFixed(value) {
        state.current.fixed = value;
        setFixed(value);
      },
      onChange(value) {
        live.current.onChange?.(value);
      },
      setPlaceholder,
      setStyle,
    }),
  );
  useLayoutEffect(() => {
    const unbindTarget = foundation.bindTarget();
    const unbindContainer = foundation.bindContainer();
    foundation.update();
    return () => {
      unbindTarget();
      unbindContainer?.();
      foundation.dispose();
    };
  }, [foundation, target, targetContainer]);
  useLayoutEffect(() => {
    foundation.update();
  }, [foundation, offsetTop, offsetBottom]);
  useLayoutEffect(() => {
    const observers = [wrapper.current, content.current].map((element) => {
      const observer = createResizeObserverController(() => foundation.update());
      observer.observe(element ?? undefined);
      return observer;
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, [foundation]);
  useImperativeHandle(ref, () => ({ updatePosition: foundation.update }), [foundation]);
  return (
    <div {...attrs} ref={wrapper}>
      {fixed && <div style={placeholder} />}
      <div ref={content} className={fixed ? prefix : undefined} style={style}>
        {children}
      </div>
    </div>
  );
}

export default Affix;
