import type { Orientation } from './axes.js';
import type { EngineGroup } from './group.js';
import type { PanelTransition } from './types.js';

import { AXES } from './axes.js';
import { grips } from './grips.js';
import { cssEasing, timing } from './transition.js';

export function setGroupDisabled(group: EngineGroup, disabled: boolean | undefined) {
  group.disabled = !!disabled;
  if (group.disabled) {
    for (const panel of group.panels.values()) panel.drag.cancel();
  }
  group.notify();
}

export async function setGroupOrientation(
  group: EngineGroup,
  orientation: Orientation,
  nextRender: () => Promise<unknown>,
) {
  for (const panel of group.panels.values()) panel.drag.cancel();
  Object.assign(group.axes, AXES[orientation]);
  grips.invalidate();
  await nextRender();
  group.notify();
}

export function isPanelPresent(
  collapsed: boolean | undefined,
  dragging: boolean,
  folding: boolean,
  hasHiddenPose: boolean,
) {
  return !collapsed || dragging || (!hasHiddenPose && folding);
}

export function isPanelContentMounted(
  keepMounted: boolean | undefined,
  present: boolean,
  wasPresent: boolean,
) {
  return keepMounted === false ? present : wasPresent || present;
}

export function getPanelContentPose<Pose>(
  present: boolean,
  fold: { shown?: Pose; hidden?: Pose } | undefined,
) {
  return present || !fold?.hidden ? fold?.shown : fold.hidden;
}

export function getPanelPoseTransition(transition: PanelTransition | undefined) {
  const duration = transition?.duration ?? 250;
  const easing = cssEasing(transition);
  return { transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}` };
}

export function createPanelContentAnimation(adapter: {
  readonly keepMounted: boolean | undefined;
  readonly fold:
    | {
        shown?: { opacity?: string | number; transform?: string };
        hidden?: { opacity?: string | number; transform?: string };
      }
    | undefined;
  readonly transition: PanelTransition | undefined;
}) {
  const animations = new Map<Element, Animation>();
  const cancel = (element: Element) => {
    animations.get(element)?.cancel();
    animations.delete(element);
  };
  return {
    cancel,
    animate(element: Element, done: () => void, entering: boolean) {
      cancel(element);
      if (adapter.keepMounted !== false || !adapter.fold?.hidden) {
        done();
        return;
      }
      const shown = {
        opacity: adapter.fold.shown?.opacity ?? 1,
        transform: adapter.fold.shown?.transform ?? 'none',
      };
      const hidden = {
        opacity: adapter.fold.hidden.opacity ?? shown.opacity,
        transform: adapter.fold.hidden.transform ?? shown.transform,
      };
      const animation = element.animate(entering ? [hidden, shown] : [shown, hidden], {
        duration: timing(adapter.transition).duration,
        easing: cssEasing(adapter.transition),
      });
      animations.set(element, animation);
      animation.finished.then(
        () => {
          animations.delete(element);
          done();
        },
        () => {},
      );
    },
    dispose() {
      for (const element of animations.keys()) cancel(element);
    },
  };
}
