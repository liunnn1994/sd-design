import type { TimeList } from '@sdata/web-core/time-picker/types';

import { scrollTo } from '@sdata/web-core/_utils/scroll-to';
import { useLayoutEffect, useRef } from 'react';

export function TimeColumn({
  prefix,
  list,
  value,
  visible,
  onSelect,
}: {
  prefix: string;
  list: TimeList;
  value?: number | string | undefined;
  visible?: boolean | undefined;
  onSelect(value: number | string): void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const items = useRef(new Map<number | string, HTMLLIElement>());
  const previous = useRef({ value, visible });
  useLayoutEffect(() => {
    const element = wrapper.current;
    const selected = value === undefined ? undefined : items.current.get(value);
    if (element && selected && visible) {
      const animate = previous.current.visible === visible && previous.current.value !== value;
      scrollTo(element, selected.offsetTop, animate ? 100 : 0);
    }
    previous.current = { value, visible };
  }, [value, visible]);
  useLayoutEffect(() => {
    const element = wrapper.current;
    return () => {
      if (element) scrollTo(element, element.scrollTop, 0);
    };
  }, []);
  return (
    <div ref={wrapper} className={`${prefix}-column`}>
      <ul role="listbox">
        {list.map((item) => (
          <li
            key={item.value}
            ref={(element) => {
              if (element) items.current.set(item.value, element);
              else items.current.delete(item.value);
            }}
            role="option"
            aria-selected={!!item.selected}
            aria-disabled={item.disabled || undefined}
            className={[
              `${prefix}-cell`,
              item.disabled && `${prefix}-cell-disabled`,
              item.selected && `${prefix}-cell-selected`,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              if (!item.disabled) onSelect(item.value);
            }}
          >
            <div className={`${prefix}-cell-inner`}>{item.label}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
