import type { EngineGroup } from '@sdata/web-core/panel-group/group';
import type { ReactNode, RefObject } from 'react';

import { setGroupDisabled, setGroupOrientation } from '@sdata/web-core/panel-group/foundation';
import { reorder as reorderAnimation } from '@sdata/web-core/panel-group/reorder';
import {
  Component,
  createElement,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import type { PanelGroupProps, PanelTransition } from './types.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { usePrefix } from '../config-provider/index.js';
import { createPanelGroupStore, PanelGroupContext } from './context.js';

class ReorderBoundary extends Component<{
  root: RefObject<HTMLElement | null>;
  group: EngineGroup;
  enabled: boolean;
  transition?: PanelTransition | undefined;
  children: ReactNode;
  content: ReactNode;
}> {
  getSnapshotBeforeUpdate() {
    const { root, group, enabled } = this.props;
    return enabled && root.current ? reorderAnimation.measure(root.current, group.axes) : null;
  }
  componentDidUpdate(
    previous: Readonly<ReorderBoundary['props']>,
    _state: unknown,
    before: Map<Element, number> | null,
  ) {
    if (before) reorderAnimation.play(before, this.props.group.axes, this.props.transition);
    if (previous.content !== this.props.content) this.props.group.notify();
  }
  render() {
    return this.props.children;
  }
}

export function PanelGroup({
  orientation = 'horizontal',
  component = 'div',
  disabled,
  reorder = true,
  transition,
  onMoveStart,
  onMoving,
  onMoveEnd,
  children,
  className,
  style,
  ref,
  ...attrs
}: PanelGroupProps) {
  const parent = useContext(PanelGroupContext);
  const [store] = useState(() => {
    const initial = createPanelGroupStore(orientation);
    initial.group.disabled = !!disabled;
    return initial;
  });
  const { group } = store;
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const root = useRef<HTMLElement>(null);
  const afterRender = useAfterRender();
  const prefix = usePrefix('panel-group');
  const previousOrientation = useRef(orientation);
  useLayoutEffect(() => {
    group.onMoveStart = onMoveStart;
    group.onMoving = onMoving;
    group.onMoveEnd = onMoveEnd;
  }, [group, onMoveStart, onMoving, onMoveEnd]);
  useLayoutEffect(() => setGroupDisabled(group, disabled), [group, disabled]);
  useLayoutEffect(() => {
    if (previousOrientation.current === orientation) return;
    previousOrientation.current = orientation;
    void setGroupOrientation(group, orientation, afterRender);
  }, [group, orientation, afterRender]);
  return (
    <PanelGroupContext.Provider value={store}>
      <ReorderBoundary
        root={root}
        group={group}
        enabled={reorder}
        transition={transition}
        content={children}
      >
        {createElement(
          component,
          {
            ...attrs,
            ref: (node: HTMLDivElement | null) => {
              root.current = node;
              if (typeof ref === 'function') return ref(node);
              if (ref) ref.current = node;
            },
            className: [prefix, className].filter(Boolean).join(' '),
            style: {
              display: 'flex',
              flexDirection: group.axes.direction,
              height: '100%',
              width: '100%',
              overflow: parent ? undefined : 'clip',
              ...style,
            },
          },
          children,
        )}
      </ReorderBoundary>
    </PanelGroupContext.Provider>
  );
}
