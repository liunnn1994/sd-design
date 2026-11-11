import type { PanelController, PanelState } from '@sdata/web-core/panel-group/panel';

import {
  createPanelContentAnimation,
  getPanelContentPose,
  getPanelPoseTransition,
  isPanelContentMounted,
  isPanelPresent,
} from '@sdata/web-core/panel-group/foundation';
import { createPanel } from '@sdata/web-core/panel-group/panel';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { PanelProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import { usePanelGroup } from './context.js';
import { MotionValue } from './motion.js';
import { PanelSeparator } from './separator.js';

const initialState: PanelState = { bare: false, dragging: false, end: undefined, folding: false };
export function Panel(props: PanelProps) {
  const {
    size,
    defaultSize,
    collapsed,
    fold,
    minSize,
    maxSize,
    pin,
    keepMounted,
    transition,
    onSizeChange: _onSizeChange,
    onCollapsedChange,
    onMoveStart: _onMoveStart,
    onMoving: _onMoving,
    onMoveEnd: _onMoveEnd,
    children,
    className,
    style,
    ref,
    ...attrs
  } = props;
  const group = usePanelGroup();
  const { axes } = group;
  const prefix = usePrefix('panel');
  const [sized] = useState(() => size !== undefined || defaultSize !== undefined);
  const [hasCollapsedBinding] = useState(() => !!onCollapsedChange);
  const [localSize, setLocalSize] = useState(defaultSize ?? size ?? '50%');
  const wrapper = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [controller, setController] = useState<PanelController>();
  const [state, setState] = useState(initialState);
  const live = useRef(props);
  live.current = props;
  const local = useRef(localSize);
  local.current = localSize;
  const options = () => ({
    size: live.current.size ?? local.current,
    defaultSize: live.current.defaultSize,
    collapsed: live.current.collapsed,
    minSize: live.current.minSize,
    maxSize: live.current.maxSize,
    transition: live.current.transition,
    onSizeChange: (value: NonNullable<PanelProps['size']>) => {
      local.current = value;
      setLocalSize(value);
      live.current.onSizeChange?.(value);
    },
    onCollapsedChange: hasCollapsedBinding
      ? (value: boolean) => live.current.onCollapsedChange?.(value)
      : undefined,
    onMoveStart: (event: PointerEvent) => live.current.onMoveStart?.(event),
    onMoving: (event: PointerEvent) => live.current.onMoving?.(event),
    onMoveEnd: (event: PointerEvent) => live.current.onMoveEnd?.(event),
  });
  useLayoutEffect(() => {
    if (!sized || !wrapper.current) return;
    const engine = createPanel(group, options(), {
      createMotionValue: (value) => new MotionValue(value),
    });
    const stopState = engine.subscribe(() => setState(engine.state));
    const element = wrapper.current;
    const detach = engine.attach(element);
    const apply = (value: number) => {
      element.style[axes.extent] = `${Math.abs(value)}px`;
    };
    apply(engine.motion.size.get());
    const stopSize = engine.motion.size.on('change', apply);
    const stopGroup = group.subscribe(() => engine.sync(options()));
    engine.sync(options(), true);
    setController(engine);
    setState(engine.state);
    return () => {
      stopGroup();
      stopState();
      detach();
      stopSize();
      engine.destroy();
    };
  }, [group, sized]);
  useLayoutEffect(() => {
    controller?.sync(options());
  }, [controller, size, localSize, collapsed, defaultSize, minSize, maxSize, transition]);
  useLayoutEffect(() => {
    if (!controller || !wrapper.current) return;
    const element = wrapper.current;
    const extent = axes.extent;
    element.style[extent] = `${Math.abs(controller.motion.size.get())}px`;
    return () => {
      element.style[extent] = '';
    };
  }, [controller, axes.extent]);
  useLayoutEffect(() => {
    if (!content || !controller) return;
    const extent = axes.extent;
    const apply = (value: number) => {
      content.style[extent] = `${value}px`;
    };
    apply(controller.motion.content.get());
    const stop = controller.motion.content.on('change', apply);
    return () => {
      stop();
      // On an axis switch React has already written the new cross-axis style.
      if (axes.extent === extent) content.style[extent] = '';
    };
  }, [controller, content, axes.extent]);

  const present = isPanelPresent(
    collapsed,
    state.dragging,
    state.folding,
    fold?.hidden !== undefined,
  );
  const wasPresent = useRef(present);
  const desired = isPanelContentMounted(keepMounted, present, wasPresent.current);
  const [mounted, setMounted] = useState(desired);
  const [animation] = useState(() =>
    createPanelContentAnimation({
      get keepMounted() {
        return live.current.keepMounted;
      },
      get fold() {
        return live.current.fold;
      },
      get transition() {
        return live.current.transition;
      },
    }),
  );
  const entering = useRef(false);
  useLayoutEffect(() => {
    const current = controller?.state ?? state;
    const currentPresent = isPanelPresent(
      collapsed,
      current.dragging,
      current.folding,
      fold?.hidden !== undefined,
    );
    if (currentPresent) wasPresent.current = true;
    if (isPanelContentMounted(keepMounted, currentPresent, wasPresent.current)) {
      if (content) animation.cancel(content);
      if (!mounted) {
        entering.current = true;
        setMounted(true);
      }
    } else if (content) {
      animation.animate(content, () => setMounted(false), false);
    } else setMounted(false);
    return () => {
      if (content) animation.cancel(content);
    };
  }, [desired, content, present, animation, mounted, controller, collapsed, keepMounted]);
  useLayoutEffect(() => {
    if (content && entering.current) {
      entering.current = false;
      animation.animate(content, () => {}, true);
    }
  }, [content, animation]);
  useLayoutEffect(() => () => animation.dispose(), [animation]);
  const slot =
    typeof children === 'function'
      ? children({ collapsed: !!collapsed, dragging: state.dragging, folding: state.folding })
      : children;
  const contentRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContent(node);
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );
  if (sized)
    return (
      <div
        ref={wrapper}
        className={prefix}
        style={{
          flexDirection: axes.direction,
          justifyContent: state.end ? 'flex-start' : 'flex-end',
          overflow: collapsed || state.dragging || state.folding ? 'clip' : 'visible',
        }}
      >
        {mounted && (
          <div
            {...attrs}
            ref={contentRef}
            className={[`${prefix}-content`, className].filter(Boolean).join(' ')}
            style={{
              [axes.cross]: '100%',
              ...getPanelPoseTransition(transition),
              ...getPanelContentPose(present, fold),
              ...style,
            }}
          >
            {slot}
          </div>
        )}
        {state.bare && controller && <PanelSeparator own={controller} />}
      </div>
    );
  const fillStyle = {
    flex: '1 1 0%',
    minWidth: 0,
    minHeight: 0,
    overflow: group.fill.size !== '100%' ? 'clip' : 'visible',
  };
  return pin ? (
    <div
      className={`${prefix}-fill`}
      data-sd-panels-fill=""
      style={{
        ...fillStyle,
        display: 'flex',
        flexDirection: axes.direction,
        justifyContent: group.fill.anchor,
      }}
    >
      <div
        {...attrs}
        ref={ref}
        className={[`${prefix}-fill-inner`, className].filter(Boolean).join(' ')}
        style={{
          flexShrink: 0,
          [axes.cross]: '100%',
          [axes.extent]: group.fill.size,
          ...style,
        }}
      >
        {slot}
      </div>
    </div>
  ) : (
    <div
      {...attrs}
      ref={ref}
      className={[`${prefix}-fill`, className].filter(Boolean).join(' ')}
      data-sd-panels-fill=""
      style={{ ...fillStyle, ...style }}
    >
      {slot}
    </div>
  );
}
