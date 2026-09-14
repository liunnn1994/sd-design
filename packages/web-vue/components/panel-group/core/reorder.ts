import type { PanelTransition } from '../types';
import type { Axes } from './axes';

// 子节点重排动画（FLIP）。移植自 vendor/motion-panels 的 core/reorder.ts，
// 元素位移动画用 WAAPI 实现，避免引入 motion 依赖。
import { FILL_ATTRIBUTE, SEPARATOR_ATTRIBUTE } from './dom';
import { cssEasing, timing } from './transition';

export const reorder = {
  measure: (root: HTMLElement, axes: Axes) =>
    new Map(
      [...root.children].map((child) => [child, child.getBoundingClientRect()[axes.edge]] as const),
    ),
  play: (before: Map<Element, number>, axes: Axes, transition?: PanelTransition) => {
    for (const [child, from] of before) {
      if (!(child instanceof HTMLElement) || !child.isConnected) {
        continue;
      }
      const delta = from - child.getBoundingClientRect()[axes.edge];
      if (delta === 0) {
        continue;
      }
      const lift = !child.hasAttribute(FILL_ATTRIBUTE) && !child.hasAttribute(SEPARATOR_ATTRIBUTE);
      if (lift) {
        child.style.zIndex = '1';
      }
      const animation = child.animate(
        [{ transform: `translate${axes.point.toUpperCase()}(${delta}px)` }, { transform: 'none' }],
        {
          duration: timing(transition).duration,
          easing: cssEasing(transition),
        },
      );
      animation.finished
        .finally(() => {
          if (lift) {
            child.style.zIndex = '';
          }
        })
        // 元素中途被移除时 finished 会 reject，吞掉取消噪声
        .catch(() => {});
    }
  },
};
