// 媒体查询环境检测。移植自 vendor/motion-panels 的 core/env.ts。
const media = (query: string) => {
  let list: MediaQueryList | undefined;
  const get = () => {
    list ??= typeof matchMedia === 'function' ? matchMedia(query) : undefined;

    return list;
  };

  return {
    get: () => get()?.matches ?? false,
    subscribe: (listener: () => void) => {
      get()?.addEventListener('change', listener);

      return () => get()?.removeEventListener('change', listener);
    },
  };
};

export const coarsePointer = media('(pointer: coarse)');
export const reducedMotion = media('(prefers-reduced-motion: reduce)');

const EDGE_SIZE_FINE = 8;
const EDGE_SIZE_COARSE = 20;

/** 边缘伸缩杆的命中厚度（px）。 */
export const edgeSize = () => (coarsePointer.get() ? EDGE_SIZE_COARSE : EDGE_SIZE_FINE);
