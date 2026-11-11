import type { RefObject } from 'react';

import { createItemIndex } from '@sdata/web-core/_utils/item-index';
import { useLayoutEffect, useRef, useState } from 'react';

export function useItemIndex(
  item: RefObject<HTMLElement | null>,
  selector: string,
  parentClassName?: string,
) {
  const [index, setIndex] = useState(-1);
  const [parent, setParent] = useState<HTMLElement>();
  const live = useRef({ selector, index, parent, parentClassName });
  live.current = { selector, index, parent, parentClassName };
  const [foundation] = useState(() =>
    createItemIndex({
      get item() {
        return item.current ?? undefined;
      },
      get selector() {
        return live.current.selector;
      },
      explicit: undefined,
      get parentClassName() {
        return live.current.parentClassName;
      },
      get value() {
        return live.current.index;
      },
      get parent() {
        return live.current.parent;
      },
      set parent(value) {
        live.current.parent = value;
        setParent(value);
      },
      setValue(value) {
        live.current.index = value;
        setIndex(value);
      },
    }),
  );
  useLayoutEffect(() => {
    foundation.mount();
  }, [foundation]);
  useLayoutEffect(() => foundation.observe(parent), [foundation, parent]);
  useLayoutEffect(() => {
    foundation.updated();
  });
  return index;
}
