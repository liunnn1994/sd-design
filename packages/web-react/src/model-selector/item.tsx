import { createModelSelectorItemFoundation } from '@sdata/web-core/model-selector/item';
import {
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';

import { usePrefix } from '../config-provider/index.js';
import { ModelSelectorGroupContext, useModelSelectorContext } from './context.js';

export interface ModelSelectorItemSlotProps {
  active: boolean;
  disabled: boolean;
  selected: boolean;
}
export interface ModelSelectorItemProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'onSelect'
> {
  value: string;
  label?: string;
  keywords?: string[];
  disabled?: boolean;
  selected?: boolean;
  shortcut?: string;
  onSelect?(value: string, event: Event): void;
  children?: ReactNode | ((state: ModelSelectorItemSlotProps) => ReactNode);
}
const emptyKeywords: string[] = [];
export function ModelSelectorItem(props: ModelSelectorItemProps) {
  const {
    value,
    label = '',
    keywords = emptyKeywords,
    disabled = false,
    selected = false,
    shortcut = '',
    onSelect: _onSelect,
    children,
    className,
    style,
    ref,
    onClick,
    onMouseEnter,
    ...attrs
  } = props;
  const context = useModelSelectorContext('ModelSelectorItem');
  const groupId = useContext(ModelSelectorGroupContext);
  const prefix = usePrefix('model-selector-item');
  const uid = useId();
  const [id] = useState(() => Symbol(uid));
  const domId = `${context.listId}-item-${uid}`;
  const element = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => element.current!, []);
  const [, redraw] = useReducer((version: number) => version + 1, 0);
  const current = useRef({
    props,
    groupId,
    context,
    renderedLabel: label || value,
    domTextVersion: 0,
  });
  current.current.props = props;
  current.current.groupId = groupId;
  current.current.context = context;
  const [foundation] = useState(() =>
    createModelSelectorItemFoundation(
      {
        props: {
          get value() {
            return current.current.props.value;
          },
          get label() {
            return current.current.props.label ?? '';
          },
          get keywords() {
            return current.current.props.keywords ?? emptyKeywords;
          },
          get disabled() {
            return current.current.props.disabled ?? false;
          },
          get shortcut() {
            return current.current.props.shortcut ?? '';
          },
        },
        get element() {
          return element.current;
        },
        get renderedLabel() {
          return current.current.renderedLabel;
        },
        get groupId() {
          return current.current.groupId;
        },
        id,
        domId,
        get domTextVersion() {
          return current.current.domTextVersion;
        },
        set domTextVersion(next) {
          current.current.domTextVersion = next;
          redraw();
        },
      },
      {
        select: (next, event) => current.current.props.onSelect?.(next, event),
        selectItem: (item, event) => current.current.context.foundation.selectItem(item, event),
      },
    ),
  );
  const renderedLabel = foundation.getRenderedLabel();
  current.current.renderedLabel = renderedLabel;
  useLayoutEffect(() => {
    foundation.startLabelObserver();
    foundation.updateRenderedLabel();
    context.foundation.registerItem(foundation.getItemData());
    return () => {
      foundation.stopLabelObserver();
      context.foundation.unregisterItem(id);
    };
  }, [foundation, context.foundation, id]);
  const keywordKey = JSON.stringify(keywords);
  useLayoutEffect(() => {
    context.foundation.updateItem(foundation.getItemData());
  }, [
    foundation,
    context.foundation,
    value,
    label,
    disabled,
    shortcut,
    keywordKey,
    renderedLabel,
    groupId,
  ]);
  const active = context.activeId === id;
  const visible = context.foundation.getVisibleItems(groupId).some((item) => item.id === id);
  return (
    <div
      {...attrs}
      ref={element}
      id={domId}
      className={[
        prefix,
        active && `${prefix}--active`,
        disabled && `${prefix}--disabled`,
        selected && `${prefix}--selected`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="option"
      aria-disabled={disabled}
      aria-selected={selected}
      aria-keyshortcuts={shortcut || undefined}
      style={{ ...style, ...(!visible ? { display: 'none' } : {}) }}
      onClick={(event) => {
        onClick?.(event);
        foundation.handleSelect(event.nativeEvent);
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        context.foundation.setActive(id);
      }}
    >
      {typeof children === 'function' ? children({ active, disabled, selected }) : children}
    </div>
  );
}
