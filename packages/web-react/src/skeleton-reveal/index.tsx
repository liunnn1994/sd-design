import type {
  SkeletonRevealProps as CoreProps,
  SkeletonRevealExposed,
  SkeletonRevealState,
  SkeletonRevealShape,
  SkeletonRevealBox,
} from '@sdata/web-core/skeleton-reveal/types';
import type { ComponentPropsWithoutRef, Ref } from 'react';

import { animateSkeletonReveal } from '@sdata/web-core/skeleton-reveal/animation';
import { createSkeletonRevealFoundation } from '@sdata/web-core/skeleton-reveal/foundation';
import { useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useBeamPreferences } from '../_shared/use-beam-preferences.js';
import { usePrefix } from '../config-provider/index.js';
export type { SkeletonRevealExposed };
export type SkeletonRevealInstance = SkeletonRevealExposed;
export interface SkeletonRevealProps extends CoreProps, ComponentPropsWithoutRef<'div'> {
  ref?: Ref<SkeletonRevealExposed>;
  onFinish?: () => void;
}
export function SkeletonReveal({
  duration = 1600,
  autoplay = true,
  disabled = false,
  onFinish,
  ref,
  children,
  className,
  ...attrs
}: SkeletonRevealProps) {
  const prefix = usePrefix('skeleton-reveal');
  const id = `sd-reveal-${useId().replaceAll(':', '')}`;
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const overlay = useRef<SVGSVGElement>(null);
  const preferences = useBeamPreferences();
  const afterRender = useAfterRender();
  const current = useRef({ duration, autoplay, disabled, onFinish });
  current.current = { duration, autoplay, disabled, onFinish };
  const data = useRef({
    state: 'idle' as SkeletonRevealState,
    shapes: [] as SkeletonRevealShape[],
    box: { width: 1, height: 1 } as SkeletonRevealBox,
  });
  const [, render] = useState(0);
  const foundation = useRef<ReturnType<typeof createSkeletonRevealFoundation> | null>(null);
  useLayoutEffect(() => {
    let connected = true;
    const update = <K extends keyof typeof data.current>(
      key: K,
      value: (typeof data.current)[K],
    ) => {
      if (connected && data.current[key] !== value) {
        data.current[key] = value;
        render((version) => version + 1);
      }
    };
    update('state', 'idle');
    update('shapes', []);
    if (content.current) content.current.style.opacity = '';
    const instance = createSkeletonRevealFoundation({
      get props() {
        return current.current;
      },
      get root() {
        return connected ? root.current : null;
      },
      get content() {
        return connected ? content.current : null;
      },
      get overlay() {
        return connected ? overlay.current : null;
      },
      get reducedMotion() {
        return preferences.reducedMotion;
      },
      get state() {
        return data.current.state;
      },
      set state(value) {
        update('state', value);
      },
      get shapes() {
        return data.current.shapes;
      },
      set shapes(value) {
        update('shapes', value);
      },
      get box() {
        return data.current.box;
      },
      set box(value) {
        update('box', value);
      },
      afterRender,
      animate: animateSkeletonReveal,
      onFinish: () => current.current.onFinish?.(),
    });
    foundation.current = instance;
    instance.connect();
    return () => {
      // Disposed instances cancel work without mutating a reconnected React tree.
      connected = false;
      instance.dispose();
      foundation.current = null;
    };
  }, [afterRender, preferences]);
  useLayoutEffect(() => foundation.current?.syncOptions(), [disabled, preferences.reducedMotion]);
  useImperativeHandle(
    ref,
    () => ({
      replay: () => foundation.current?.replay() ?? Promise.resolve(),
      finish: () => foundation.current?.finish(),
    }),
    [],
  );
  const { state, shapes, box } = data.current;
  return (
    <div
      {...attrs}
      ref={root}
      className={[prefix, className].filter(Boolean).join(' ')}
      data-state={state}
      data-autoplay={autoplay && !disabled && duration > 0}
    >
      <div ref={content} className={`${prefix}-content`}>
        {children}
      </div>
      {state === 'idle' && autoplay && !disabled && duration > 0 && (
        <svg
          className={`${prefix}-overlay`}
          data-reveal-initial
          aria-hidden="true"
          focusable="false"
        >
          <rect width="100%" height="100%" />
        </svg>
      )}
      {shapes.length > 0 && (
        <svg
          ref={overlay}
          className={`${prefix}-overlay`}
          viewBox={`0 0 ${box.width} ${box.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {shapes.map((shape, index) => (
              <mask
                key={index}
                id={`${id}-${index}`}
                maskUnits="userSpaceOnUse"
                x={0}
                y={0}
                width={box.width}
                height={box.height}
              >
                <rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  rx={shape.radius}
                  fill="none"
                  stroke="white"
                  strokeWidth={5}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1}
                  data-reveal-draw
                />
              </mask>
            ))}
          </defs>
          {shapes.map((shape, index) => (
            <rect
              key={index}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              rx={shape.radius}
              mask={`url(#${id}-${index})`}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
