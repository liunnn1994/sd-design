import type { createModelSelectorFoundation } from '@sdata/web-core/model-selector/foundation';

import { createContext, useContext } from 'react';

export type SelectorFoundation = ReturnType<typeof createModelSelectorFoundation>;
export interface SelectorContext {
  foundation: SelectorFoundation;
  visible: boolean;
  query: string;
  activeId: symbol | undefined;
  itemsVersion: number;
  listId: string;
  defaultExpanded: boolean;
  setQuery(value: string): void;
  invalidate(): void;
}
export const ModelSelectorContext = createContext<SelectorContext | undefined>(undefined);
export const ModelSelectorGroupContext = createContext<symbol | undefined>(undefined);
export function useModelSelectorContext(component: string) {
  const context = useContext(ModelSelectorContext);
  if (!context) throw new Error(`[${component}] 必须在 ModelSelector 内使用。`);
  return context;
}
