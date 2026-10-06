import type { EngineGroup } from './group';
import type { PanelController } from './panel';

// 伸缩杆交互控制器。移植自 vendor/motion-panels 的 core/separator.ts。
import { hasFillAfter, SEPARATOR_ATTRIBUTE } from './dom';
import { grips } from './grips';
import { noop } from './utils';

const PAN_THRESHOLD = 3;

export const attachSeparator = (
  element: HTMLElement,
  group: EngineGroup,
  own?: PanelController,
) => {
  const slot = element.closest(`[${SEPARATOR_ATTRIBUTE}]`) as HTMLElement | null;
  const findPanel = () => own ?? group.panels.get(hasFillAfter(slot) ? 'start' : 'end');

  let panel: PanelController | undefined;
  let unregister = noop;
  let unwatch = noop;
  let partners: PanelController[] = [];
  let pressed: PointerEvent | null = null;
  let dragging = false;
  let dragged = false;
  let joint = false;
  let cursor = '';

  const resizing = () => grips.state(element) === 'held' || !!panel?.state.dragging;

  const each = (act: (target: PanelController) => void) => {
    for (const target of [panel, ...partners]) {
      if (target) {
        act(target);
      }
    }
  };

  const render = () => {
    const hit = grips.state(element);
    element.toggleAttribute('data-resizing', resizing());
    element.toggleAttribute('data-crossing', hit === 'crossed' && !resizing());
    if (joint !== (hit !== null)) {
      joint = !joint;
      if (joint) {
        cursor = element.style.getPropertyValue('cursor');
        element.style.cursor = 'move';
      } else {
        element.style.cursor = cursor;
      }
    }
    if (panel) {
      const { max, min } = panel.bounds();
      element.setAttribute('aria-valuenow', String(panel.target));
      element.setAttribute('aria-valuetext', `${panel.target} pixels`);
      element.setAttribute('aria-valuemin', String(min));
      element.setAttribute('aria-valuemax', String(max));
    }
  };

  const bind = () => {
    const next = findPanel();
    if (next !== panel) {
      unregister();
      unwatch();
      panel = next;
      unregister = panel ? grips.register(element, panel) : noop;
      unwatch = panel ? panel.subscribe(render) : noop;
    }
    if (pressed && (group.disabled || (dragging && !panel?.state.dragging))) cancel();
    render();
  };

  const settle = () => {
    partners = [];
    pressed = null;
    dragging = false;
  };

  const cancel = () => {
    grips.mark('held', []);
    each((target) => target.drag.cancel());
    settle();
  };

  const listeners = {
    pointerdown: (event: PointerEvent) => {
      if (group.disabled || event.button > 0 || pressed) return;
      dragged = false;
      pressed = event;
      // 合成事件（如测试）没有活动指针时 setPointerCapture 会抛错
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        // ignore
      }
      grips.invalidate();
      grips.mark('held', grips.at(event));
      partners = grips.partners(grips.at(event), element);
      each((target) => {
        target.options.onMoveStart?.(event);
        target.group.onMoveStart?.(event);
      });
    },
    pointermove: (event: PointerEvent) => {
      if (group.disabled) return;
      if (!pressed) {
        if (!resizing()) {
          grips.mark('crossed', grips.at(event));
        }

        return;
      }
      const offset = {
        x: event.clientX - pressed.clientX,
        y: event.clientY - pressed.clientY,
      };
      if (!dragging) {
        if (Math.hypot(offset.x, offset.y) < PAN_THRESHOLD) {
          return;
        }
        dragging = true;
        dragged = true;
        each((target) => {
          if (!target.group.disabled) target.drag.start(partners.length > 0 ? 'move' : undefined);
        });
      }
      each((target) => {
        if (target.group.disabled) {
          target.drag.cancel();
          return;
        }
        target.options.onMoving?.(event);
        target.group.onMoving?.(event);
        if (target.group.disabled) target.drag.cancel();
        else target.drag.move(offset);
      });
    },
    pointerup: (event: PointerEvent) => {
      grips.mark('held', []);
      if (dragging && pressed) {
        const offset = { x: event.clientX - pressed.clientX, y: event.clientY - pressed.clientY };
        each((target) => {
          if (target.group.disabled) target.drag.cancel();
          else target.drag.move(offset);
        });
        each((target) => {
          if (target.group.disabled) target.drag.cancel();
          else target.drag.end();
        });
        grips.invalidate();
        grips.mark('crossed', grips.at(event));
      }
      if (pressed) {
        each((target) => {
          target.options.onMoveEnd?.(event);
          target.group.onMoveEnd?.(event);
        });
      }
      settle();
    },
    pointercancel: cancel,
    lostpointercapture: cancel,
    pointerenter: () => grips.invalidate(),
    pointerleave: () => {
      if (!resizing()) {
        grips.mark('crossed', []);
      }
    },
    dblclick: (event: MouseEvent) => {
      if (!group.disabled && !dragged) {
        for (const target of [panel, ...grips.partners(grips.at(event), element)]) {
          target?.reset();
        }
      }
    },
    keydown: (event: KeyboardEvent) => {
      if (!group.disabled) panel?.resizeByKey(event);
    },
  };

  const controller = new AbortController();
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && pressed) cancel();
    },
    { signal: controller.signal },
  );
  for (const [type, listener] of Object.entries(listeners)) {
    element.addEventListener(type, listener as EventListener, {
      signal: controller.signal,
    });
  }
  const unsubscribe = [group.subscribe(bind), grips.subscribe(render)];
  bind();

  return () => {
    if (pressed) cancel();
    controller.abort();
    for (const stop of unsubscribe) {
      stop();
    }
    unregister();
    unwatch();
  };
};
