import type { WatermarkOptions } from '@sdata/web-core/watermark/foundation';
import type { ComponentPropsWithRef } from 'react';

import { createWatermark } from '@sdata/web-core/watermark/foundation';
import { createWatermarkObserver } from '@sdata/web-core/watermark/observer';
import {
  getWatermarkTheme,
  handleWatermarkThemeMutations,
  WATERMARK_THEME_TOKEN,
} from '@sdata/web-core/watermark/theme';
import { useImperativeHandle, useLayoutEffect, useRef } from 'react';

import { usePrefix } from '../config-provider/index.js';

export type { WatermarkFont } from '@sdata/web-core/watermark/types';
export interface WatermarkProps
  extends Partial<WatermarkOptions>, Omit<ComponentPropsWithRef<'div'>, 'content'> {}
export type WatermarkInstance = HTMLDivElement;

export function Watermark({
  content,
  image,
  width,
  height,
  gap,
  offset,
  rotate = -22,
  font,
  zIndex = 6,
  alpha = 1,
  antiTamper = true,
  grayscale = false,
  repeat = true,
  staggered = true,
  ref,
  children,
  className,
  style,
  ...attrs
}: WatermarkProps) {
  const cls = usePrefix('watermark');
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => {
    let theme = getWatermarkTheme(document.body);
    const foundation = createWatermark({
      props: {
        content,
        image,
        width,
        height,
        gap,
        offset,
        rotate,
        font,
        zIndex,
        alpha,
        antiTamper,
        grayscale,
        repeat,
        staggered,
      },
      ratio: window.devicePixelRatio || 1,
      get container() {
        return root.current ?? undefined;
      },
      get theme() {
        return theme;
      },
    });
    const mutations = createWatermarkObserver(foundation.mutations, {
      window,
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
    const themes = createWatermarkObserver(
      (records) =>
        handleWatermarkThemeMutations(
          records,
          (next) => {
            theme = next;
          },
          foundation.render,
        ),
      {
        window,
        attributes: true,
        attributeFilter: [WATERMARK_THEME_TOKEN],
        subtree: false,
        childList: false,
        characterData: false,
      },
    );
    foundation.render();
    mutations.observe(root.current);
    themes.observe(document.body);
    return () => {
      mutations.stop();
      themes.stop();
      foundation.dispose();
    };
  }, [
    content,
    image,
    width,
    height,
    gap,
    offset,
    rotate,
    font,
    zIndex,
    alpha,
    antiTamper,
    grayscale,
    repeat,
    staggered,
  ]);
  return (
    <div
      {...attrs}
      ref={root}
      className={[cls, className].filter(Boolean).join(' ')}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
    </div>
  );
}
export default Watermark;
