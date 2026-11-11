import type { TreeDragState } from '@sdata/web-core/tree/drag';
import type { TreeNodeContext } from '@sdata/web-core/tree/node';
import type { TreeData, TreeModelNode, TreeNodeKey } from '@sdata/web-core/tree/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { createTreeGestures, type TreeGestureEvents } from '@sdata/web-core/tree/gestures';
import { createTreeNodeFoundation } from '@sdata/web-core/tree/node';
import { useLayoutEffect, useRef } from 'react';

import { Checkbox } from '../checkbox/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Ellipsis } from '../ellipsis/index.js';
import { PerformantEllipsis } from '../ellipsis/performant.js';
import IconCaretDown from '../icon/icon-caret-down.js';
import IconDragDotVertical from '../icon/icon-drag-dot-vertical.js';
import IconFile from '../icon/icon-file.js';
import IconLoading from '../icon/icon-loading.js';

export interface TreeNodeStatus {
  checked: boolean;
  indeterminate: boolean;
  selected: boolean;
  expanded: boolean;
  loading: boolean;
  isLeaf: boolean;
}
export interface TreeNodeData extends TreeData {
  title?: ReactNode;
  children?: TreeNodeData[];
  icon?(status: TreeNodeStatus): ReactNode;
  switcherIcon?(status: TreeNodeStatus): ReactNode;
  loadingIcon?(status: TreeNodeStatus): ReactNode;
  dragIcon?(status: TreeNodeStatus): ReactNode;
}
export interface TreeNodeViewProps<T extends TreeNodeData> extends ComponentPropsWithRef<'div'> {
  node: TreeModelNode<T>;
  context: Partial<TreeNodeContext>;
  activeKey?: TreeNodeKey;
  switcher?: boolean;
  disableSelectActionOnly?: boolean;
  ellipsis?: boolean | 'performant-ellipsis';
  virtual?: boolean;
  dragState?: TreeDragState;
  gestures?: TreeGestureEvents;
  renderTitle?(node: T, status: TreeNodeStatus): ReactNode;
  renderIcon?(node: T, status: TreeNodeStatus): ReactNode;
  renderSwitcherIcon?(node: T, status: TreeNodeStatus): ReactNode;
  renderLoadingIcon?(node: T, status: TreeNodeStatus): ReactNode;
  renderDragIcon?(node: T, status: TreeNodeStatus): ReactNode;
  renderExtra?(node: T, status: TreeNodeStatus): ReactNode;
}
export function TreeNodeView<T extends TreeNodeData>({
  node,
  context,
  activeKey,
  switcher = true,
  disableSelectActionOnly,
  ellipsis,
  virtual,
  dragState,
  gestures,
  renderTitle,
  renderIcon,
  renderSwitcherIcon,
  renderLoadingIcon,
  renderDragIcon,
  renderExtra,
  className,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  ...attrs
}: TreeNodeViewProps<T>) {
  const prefix = usePrefix('tree-node');
  const titleRef = useRef<HTMLSpanElement>(null);
  const liveGestures = useRef(gestures);
  liveGestures.current = gestures;
  useLayoutEffect(() => {
    if (!titleRef.current) return;
    return createTreeGestures(titleRef.current, {
      longPress: (event) => liveGestures.current?.longPress?.(event),
      swipeStart: (...args) => liveGestures.current?.swipeStart?.(...args),
      swipe: (...args) => liveGestures.current?.swipe?.(...args),
      swipeEnd: (...args) => liveGestures.current?.swipeEnd?.(...args),
    });
  }, []);
  const foundation = createTreeNodeFoundation(
    {
      key: node.key,
      isLeaf: node.isLeaf,
      children: node.children,
      disabled: node.disabled,
      disableCheckbox: node.disableCheckbox,
      selectable: node.selectable,
      expanded: context.expandedKeys?.includes(node.key),
      get actionOnNodeClick(): readonly string[] {
        return foundation.getActionOnNodeClick();
      },
    },
    context,
  );
  const status: TreeNodeStatus = {
    checked: !!foundation.getChecked(),
    indeterminate: !!foundation.getIndeterminate(),
    selected: !!foundation.getSelected(),
    expanded: !!foundation.getExpanded(),
    loading: !!foundation.getLoading(),
    isLeaf: node.isLeaf,
  };
  const clipped = !renderTitle && (!!ellipsis || !!virtual);
  const Clip = ellipsis === true && !virtual ? Ellipsis : PerformantEllipsis;
  const raw = node.treeNodeData;
  const dragging = dragState?.sourceKey === node.key;
  const over = dragState?.targetKey === node.key && dragState.allowed;
  const icon = raw.icon ? raw.icon(status) : renderIcon?.(raw, status);
  return (
    <div
      {...attrs}
      className={[
        prefix,
        status.selected && `${prefix}-selected`,
        node.isLeaf && `${prefix}-is-leaf`,
        node.isTail && `${prefix}-is-tail`,
        status.expanded && `${prefix}-expanded`,
        !node.selectable && !disableSelectActionOnly && `${prefix}-disabled-selectable`,
        node.disabled && `${prefix}-disabled`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-level={node.level}
      data-key={node.key}
      data-key-type={typeof node.key}
      data-tree-draggable={node.draggable || undefined}
      role="treeitem"
      tabIndex={activeKey === node.key ? 0 : -1}
      aria-level={node.level + 1}
      aria-expanded={node.isLeaf ? undefined : status.expanded}
      aria-selected={node.selectable ? status.selected : undefined}
      aria-disabled={node.disabled || undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) foundation.onTreeitemKeydown(event.nativeEvent);
      }}
      onKeyUp={(event) => {
        onKeyUp?.(event);
        foundation.onNodeDomEvent('keyup', event.nativeEvent);
      }}
      onKeyPress={(event) => {
        onKeyPress?.(event);
        foundation.onNodeDomEvent('keypress', event.nativeEvent);
      }}
    >
      <span className={`${prefix}-indent`}>
        {Array.from({ length: node.level }, (_, index) => (
          <span
            key={index}
            className={[
              `${prefix}-indent-block`,
              node.lineless[index] && `${prefix}-indent-block-lineless`,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </span>
      {switcher && (
        <span
          className={[`${prefix}-switcher`, status.expanded && `${prefix}-switcher-expanded`]
            .filter(Boolean)
            .join(' ')}
        >
          {status.loading ? (
            raw.loadingIcon ? (
              raw.loadingIcon(status)
            ) : renderLoadingIcon ? (
              renderLoadingIcon(raw, status)
            ) : (
              <IconLoading />
            )
          ) : (
            (!node.isLeaf || node.showLine) && (
              <span className={!node.isLeaf && !node.showLine ? `${prefix}-icon-hover` : undefined}>
                <span
                  className={`${prefix}-switcher-icon`}
                  onClick={(event) => foundation.onSwitcherClick(event.nativeEvent)}
                >
                  {raw.switcherIcon ? (
                    raw.switcherIcon(status)
                  ) : renderSwitcherIcon ? (
                    renderSwitcherIcon(raw, status)
                  ) : !node.isLeaf ? (
                    node.showLine ? (
                      <span className={`${prefix}-${status.expanded ? 'minus' : 'plus'}-icon`} />
                    ) : (
                      <IconCaretDown />
                    )
                  ) : (
                    <IconFile />
                  )}
                </span>
              </span>
            )
          )}
        </span>
      )}
      {node.checkable && (
        <Checkbox
          disabled={node.disableCheckbox || node.disabled}
          modelValue={status.checked}
          indeterminate={status.indeterminate}
          tabIndex={-1}
          uninjectGroupContext
          onChange={foundation.onCheckboxChange}
        />
      )}
      <span
        ref={titleRef}
        className={[
          `${prefix}-title`,
          node.draggable && `${prefix}-title-draggable`,
          dragging && `${prefix}-title-dragging`,
          over && dragState.position < 0 && `${prefix}-title-gap-top`,
          over && dragState.position > 0 && `${prefix}-title-gap-bottom`,
          over && !dragging && dragState.position === 0 && `${prefix}-title-highlight`,
          node.blockNode && `${prefix}-title-block`,
          clipped && `${prefix}-title-with-ellipsis`,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => foundation.onTitleClick(event.nativeEvent)}
        onDoubleClick={(event) => foundation.onNodeDomEvent('dblclick', event.nativeEvent)}
        onContextMenu={(event) => foundation.onNodeDomEvent('contextmenu', event.nativeEvent)}
        onMouseOver={(event) => foundation.onNodeDomEvent('mouseover', event.nativeEvent)}
        onMouseEnter={(event) => foundation.onNodeDomEvent('mouseenter', event.nativeEvent)}
        onMouseLeave={(event) => foundation.onNodeDomEvent('mouseleave', event.nativeEvent)}
        onMouseMove={(event) => foundation.onNodeDomEvent('mousemove', event.nativeEvent)}
        onMouseOut={(event) => foundation.onNodeDomEvent('mouseout', event.nativeEvent)}
        onMouseDown={(event) => foundation.onNodeDomEvent('mousedown', event.nativeEvent)}
        onMouseUp={(event) => foundation.onNodeDomEvent('mouseup', event.nativeEvent)}
        onPointerDown={(event) => foundation.onNodeDomEvent('pointerdown', event.nativeEvent)}
        onPointerMove={(event) => foundation.onNodeDomEvent('pointermove', event.nativeEvent)}
        onPointerUp={(event) => foundation.onNodeDomEvent('pointerup', event.nativeEvent)}
        onPointerEnter={(event) => foundation.onNodeDomEvent('pointerenter', event.nativeEvent)}
        onPointerLeave={(event) => foundation.onNodeDomEvent('pointerleave', event.nativeEvent)}
        onPointerOver={(event) => foundation.onNodeDomEvent('pointerover', event.nativeEvent)}
        onPointerOut={(event) => foundation.onNodeDomEvent('pointerout', event.nativeEvent)}
        onPointerCancel={(event) => foundation.onNodeDomEvent('pointercancel', event.nativeEvent)}
        onTouchStart={(event) => foundation.onNodeDomEvent('touchstart', event.nativeEvent)}
        onTouchMove={(event) => foundation.onNodeDomEvent('touchmove', event.nativeEvent)}
        onTouchEnd={(event) => foundation.onNodeDomEvent('touchend', event.nativeEvent)}
        onTouchCancel={(event) => foundation.onNodeDomEvent('touchcancel', event.nativeEvent)}
      >
        {icon != null && <span className={`${prefix}-icon ${prefix}-custom-icon`}>{icon}</span>}
        <span
          className={[`${prefix}-title-text`, clipped && `${prefix}-title-text-ellipsis`]
            .filter(Boolean)
            .join(' ')}
        >
          {renderTitle ? (
            renderTitle(node.treeNodeData, status)
          ) : clipped ? (
            <Clip className={`${prefix}-title-ellipsis`}>{node.title as ReactNode}</Clip>
          ) : (
            (node.title as ReactNode)
          )}
          {node.draggable && (
            <span className={`${prefix}-icon ${prefix}-drag-icon`}>
              {raw.dragIcon ? (
                raw.dragIcon(status)
              ) : renderDragIcon ? (
                renderDragIcon(raw, status)
              ) : (
                <IconDragDotVertical />
              )}
            </span>
          )}
        </span>
      </span>
      {renderExtra?.(node.treeNodeData, status)}
    </div>
  );
}
