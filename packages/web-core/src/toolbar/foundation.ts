import { cloneDeep, omit } from 'es-toolkit';

import type { ToolbarModelValue } from './types.js';
export interface ToolbarSchema {
  readonly span?: unknown;
  readonly formItemProps?: { readonly style?: unknown } | undefined;
  readonly slotName?: unknown;
  readonly children?: readonly ToolbarSchema[] | undefined;
}
export interface ToolbarFoundationState<Schema extends ToolbarSchema> {
  readonly props: {
    readonly schemas: readonly Schema[];
    readonly resetSkipKeys: readonly string[];
    readonly allowExpand: boolean;
    readonly itemHeight: number;
  };
  modelValue: ToolbarModelValue;
  isExpand: boolean;
  isOverflow: boolean;
  bodyHeight: number;
}
export function createToolbarFoundation<Schema extends ToolbarSchema>(
  state: ToolbarFoundationState<Schema>,
  callbacks: { search(value: ToolbarModelValue): void; reset(): void; clearValidate(): void },
) {
  const initModel = Object.fromEntries(cloneDeep(Object.entries(state.modelValue ?? {})));

  function measure(entry: { readonly target: { readonly scrollHeight: number } }) {
    // scrollHeight reports the full content height even when clipped,
    // so this stays correct in both collapsed and expanded states.
    const fullHeight = entry.target.scrollHeight;
    state.bodyHeight = fullHeight;
    state.isOverflow = fullHeight > state.props.itemHeight;
  }

  function getResolvedSchemas() {
    return state.props.schemas.map((schema) => {
      const span = typeof schema.span === 'number' && schema.span > 0 ? schema.span : 1;
      const baseStyle = (schema.formItemProps?.style as Record<string, unknown> | undefined) ?? {};
      return {
        ...schema,
        formItemProps: {
          ...schema.formItemProps,
          style: { gridColumn: `span ${span}`, ...baseStyle },
        },
      };
    });
  }

  function getSchemaSlotNames() {
    const names = new Set<string>();
    const walk = (list: readonly ToolbarSchema[]) => {
      for (const item of list) {
        if (typeof item.slotName === 'string') names.add(item.slotName);
        if (item.children?.length) walk(item.children);
      }
    };
    walk(state.props.schemas);
    return [...names];
  }

  function getBodyMaxHeight() {
    if (!state.props.allowExpand) return 'none';
    return state.isExpand ? `${state.bodyHeight}px` : `${state.props.itemHeight}px`;
  }

  function handleSearch() {
    callbacks.search(state.modelValue);
  }

  function onEnter(event: KeyboardEvent) {
    if (event.isComposing || event.defaultPrevented) return;

    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('button, a, textarea, [contenteditable="true"]')
    ) {
      return;
    }

    handleSearch();
  }

  function reset(emitReset: unknown = true) {
    // Restore initial values (minus skipped keys), preserve skipped keys' current
    // values, and drop any keys that were added after mount.
    const next: ToolbarModelValue = Object.fromEntries(
      cloneDeep(Object.entries(omit(initModel, state.props.resetSkipKeys))),
    );
    for (const key of state.props.resetSkipKeys) {
      if (Object.hasOwn(state.modelValue, key)) {
        Object.defineProperty(next, key, {
          value: state.modelValue[key],
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
    }
    state.modelValue = next;
    callbacks.clearValidate();
    if (emitReset) callbacks.reset();
  }

  function toggleExpand() {
    state.isExpand = !state.isExpand;
  }

  return {
    getResolvedSchemas,
    getSchemaSlotNames,
    getBodyMaxHeight,
    handleSearch,
    onEnter,
    reset,
    toggleExpand,
    measure,
  };
}
