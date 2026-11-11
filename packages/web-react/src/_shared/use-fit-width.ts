import type { FitWidthOptions } from '@sdata/web-core/text/fit-width';
import type { CSSProperties, RefObject } from 'react';

import { createFitWidthMeasurer } from '@sdata/web-core/text/fit-width';
import { useLayoutEffect, useRef, useState } from 'react';

import { usePrefix } from '../config-provider/index.js';

export function useFitWidth(
  element: RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  enabled: boolean,
  text: string | undefined,
  fallback: string,
  options?: FitWidthOptions,
) {
  const prefix = usePrefix('');
  const variable = `--${prefix}-fit-width`;
  const [width, setWidth] = useState(fallback);
  const [measurer] = useState(createFitWidthMeasurer);
  const measure = useRef(() => {});
  measure.current = () => {
    if (!enabled) return;
    if (!text || !element.current) {
      setWidth(fallback);
      measurer.invalidate();
      return;
    }
    setWidth(`${measurer.measure(text, getComputedStyle(element.current), options)}px`);
  };
  useLayoutEffect(() => {
    measure.current();
  });
  useLayoutEffect(() => {
    let mounted = true;
    void document.fonts?.ready.then(() => {
      if (mounted) {
        measurer.invalidate();
        measure.current();
      }
    });
    return () => {
      mounted = false;
    };
  }, [measurer]);
  return {
    style: enabled ? ({ [variable]: width } as CSSProperties) : undefined,
    value: `var(${variable})`,
  };
}
