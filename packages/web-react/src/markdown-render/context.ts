import type { CustomComponentMap } from 'markstream-react';
import type { Context } from 'react';

import { getCustomNodeComponents } from 'markstream-react';
import { createContext, useContext, useMemo } from 'react';

import { withMarkdownRecursiveChildren } from './custom-children.js';
import { markdownComponents } from './nodes/index.js';

export const MarkdownComponentsContext: Context<CustomComponentMap | undefined> = createContext<
  CustomComponentMap | undefined
>(undefined);
export function useMarkdownComponents(customId?: string): CustomComponentMap {
  const inherited = useContext(MarkdownComponentsContext);
  return useMemo(
    () =>
      withMarkdownRecursiveChildren({
        ...markdownComponents,
        ...inherited,
        ...getCustomNodeComponents(customId),
      }),
    [customId, inherited],
  );
}
