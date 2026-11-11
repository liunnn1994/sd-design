import {
  createModelSelectorGroupFoundation,
  getModelSelectorGroupInitialExpanded,
} from '@sdata/web-core/model-selector/group';
import {
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';

import { usePrefix } from '../config-provider/index.js';
import { IconRight } from '../icon/icon-right.js';
import { ModelSelectorGroupContext, useModelSelectorContext } from './context.js';

export interface ModelSelectorGroupProps extends Omit<ComponentPropsWithRef<'section'>, 'heading'> {
  heading?: ReactNode;
}
export function ModelSelectorGroup({
  heading,
  children,
  className,
  style,
  ...attrs
}: ModelSelectorGroupProps) {
  const context = useModelSelectorContext('ModelSelectorGroup');
  const current = useRef(context);
  current.current = context;
  const prefix = usePrefix('model-selector-group');
  const uid = useId();
  const [id] = useState(() => Symbol(uid));
  const headingId = `${context.listId}-group-${uid}`;
  const contentId = `${headingId}-content`;
  const [, redraw] = useReducer((version: number) => version + 1, 0);
  const state = useRef({
    expanded: getModelSelectorGroupInitialExpanded(heading, context.defaultExpanded),
    searchExpanded: undefined as boolean | undefined,
  });
  const [foundation] = useState(() =>
    createModelSelectorGroupFoundation({
      get query() {
        return current.current.query;
      },
      get isSearching(): boolean {
        return foundation.getIsSearching();
      },
      get isExpanded(): boolean {
        return foundation.getIsExpanded();
      },
      get expanded() {
        return state.current.expanded;
      },
      set expanded(value) {
        if (state.current.expanded !== value) {
          state.current.expanded = value;
          redraw();
        }
      },
      get searchExpanded() {
        return state.current.searchExpanded;
      },
      set searchExpanded(value) {
        if (state.current.searchExpanded !== value) {
          state.current.searchExpanded = value;
          redraw();
        }
      },
    }),
  );
  useLayoutEffect(() => {
    context.foundation.registerGroup(id, {
      get value() {
        return foundation.getIsExpanded();
      },
    });
    context.invalidate();
    return () => {
      context.foundation.unregisterGroup(id);
      context.invalidate();
    };
  }, [context.foundation, foundation, id]);
  const expanded = foundation.getIsExpanded();
  useLayoutEffect(() => {
    current.current.invalidate();
  }, [expanded]);
  useLayoutEffect(() => {
    foundation.syncQuery();
  }, [foundation, context.query.trim()]);
  const visible = context.foundation.getVisibleItems(id).length > 0;
  return (
    <ModelSelectorGroupContext.Provider value={id}>
      <section
        {...attrs}
        className={[prefix, className].filter(Boolean).join(' ')}
        style={{ ...style, ...(!visible ? { display: 'none' } : {}) }}
        role="group"
        aria-labelledby={heading ? headingId : undefined}
      >
        {heading && (
          <button
            id={headingId}
            type="button"
            className={`${prefix}-heading`}
            aria-controls={contentId}
            aria-expanded={expanded}
            onClick={foundation.toggleExpanded}
          >
            <span className={`${prefix}-heading-text`}>{heading}</span>
            <IconRight
              className={[`${prefix}-chevron`, expanded && `${prefix}-chevron--expanded`]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            />
          </button>
        )}
        <div
          id={contentId}
          className={[`${prefix}-content`, !expanded && `${prefix}-content--collapsed`]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!expanded}
          inert={!expanded}
        >
          <div className={`${prefix}-content-inner`}>{children}</div>
        </div>
      </section>
    </ModelSelectorGroupContext.Provider>
  );
}
