import type { ModelSelectorItemData } from '@sdata/web-core/model-selector/types';

import {
  createModelSelectorFoundation,
  getModelSelectorVisible,
} from '@sdata/web-core/model-selector/foundation';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ModelSelectorContext, type SelectorFoundation } from './context.js';
import { createModelSelectorKeyTracker } from './keyboard.js';

export interface ModelSelectorSlotProps {
  close(): void;
  open(): void;
  visible: boolean;
}
export interface ModelSelectorProps {
  visible?: boolean;
  defaultVisible?: boolean;
  defaultExpanded?: boolean;
  closeOnSelect?: boolean;
  resetQueryOnClose?: boolean;
  onUpdateVisible?(visible: boolean): void;
  onVisibleChange?(visible: boolean): void;
  onSelect?(value: string, event: Event): void;
  children?: ReactNode | ((state: ModelSelectorSlotProps) => ReactNode);
}
const aliases = { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };

export function ModelSelector(props: ModelSelectorProps) {
  const current = useRef(props);
  current.current = props;
  const listId = `sd-model-selector-list-${useId()}`;
  const [, redraw] = useReducer((version: number) => version + 1, 0);
  const state = useRef({
    innerVisible: props.defaultVisible ?? false,
    query: '',
    activeId: undefined as symbol | undefined,
    itemsVersion: 0,
  });
  const [keys] = useState(createModelSelectorKeyTracker);
  const defaultExpanded = useRef(props.defaultExpanded ?? true);
  const visible = () =>
    getModelSelectorVisible(
      Object.hasOwn(current.current, 'visible'),
      current.current.visible,
      state.current.innerVisible,
    );
  const update = <Key extends keyof typeof state.current>(
    key: Key,
    next: (typeof state.current)[Key],
  ) => {
    if (Object.is(state.current[key], next)) return;
    state.current[key] = next;
    redraw();
  };
  const [foundation] = useState<SelectorFoundation>(() =>
    createModelSelectorFoundation(
      {
        props: {
          get closeOnSelect() {
            return current.current.closeOnSelect ?? true;
          },
          get resetQueryOnClose() {
            return current.current.resetQueryOnClose ?? true;
          },
        },
        get innerVisible() {
          return state.current.innerVisible;
        },
        set innerVisible(next) {
          update('innerVisible', next);
        },
        get visibleModel() {
          return current.current.visible;
        },
        set visibleModel(next) {
          current.current.onUpdateVisible?.(Boolean(next));
        },
        get query() {
          return state.current.query;
        },
        set query(next) {
          update('query', next);
        },
        get activeId() {
          return state.current.activeId;
        },
        set activeId(next) {
          update('activeId', next);
        },
        get itemsVersion() {
          return state.current.itemsVersion;
        },
        set itemsVersion(next) {
          update('itemsVersion', next);
        },
        get mergedVisible() {
          return visible();
        },
        get normalizedQuery(): string {
          return foundation.getNormalizedQuery();
        },
        get visibleItems(): ModelSelectorItemData[] {
          return foundation.getVisibleItems();
        },
        get navigableItems(): ModelSelectorItemData[] {
          return foundation.getNavigableItems();
        },
      },
      {
        keyAliases: aliases,
        currentKeys: keys.current,
        visibleChange: (next) => current.current.onVisibleChange?.(next),
        select: (value, event) => current.current.onSelect?.(value, event),
      },
    ),
  );
  const invalidate = () => update('itemsVersion', state.current.itemsVersion + 1);
  const previous = useRef({ query: state.current.query, visible: visible() });
  useLayoutEffect(() => {
    if (previous.current.query !== state.current.query) foundation.syncQuery();
    const nextVisible = visible();
    if (previous.current.visible !== nextVisible) foundation.syncVisible(nextVisible);
    previous.current = { query: state.current.query, visible: nextVisible };
    foundation.syncNavigableItems(foundation.getNavigableItems());
  });
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      keys.update(event);
      foundation.handleShortcut(event);
    };
    const clear = keys.clear;
    window.addEventListener('keydown', handle);
    window.addEventListener('keyup', handle);
    window.addEventListener('blur', clear);
    window.addEventListener('focus', clear);
    return () => {
      window.removeEventListener('keydown', handle);
      window.removeEventListener('keyup', handle);
      window.removeEventListener('blur', clear);
      window.removeEventListener('focus', clear);
      clear();
    };
  }, [foundation, keys]);
  const scope = {
    visible: visible(),
    open: () => foundation.setVisible(true),
    close: () => foundation.setVisible(false),
  };
  return (
    <ModelSelectorContext.Provider
      value={{
        foundation,
        visible: scope.visible,
        query: state.current.query,
        activeId: state.current.activeId,
        itemsVersion: state.current.itemsVersion,
        listId,
        defaultExpanded: defaultExpanded.current,
        setQuery: (value) => update('query', value),
        invalidate,
      }}
    >
      {typeof props.children === 'function' ? props.children(scope) : props.children}
    </ModelSelectorContext.Provider>
  );
}
