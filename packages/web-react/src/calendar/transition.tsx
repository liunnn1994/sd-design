import type { CSSProperties, ReactNode } from 'react';

import { runCssTransition } from '@sdata/web-core/transition/css';
import { useLayoutEffect, useRef, useState } from 'react';

interface Entry {
  key: string;
  children: ReactNode;
  animate: boolean;
}

function Frame({
  entry,
  active,
  name,
  remove,
  style,
}: {
  entry: Entry;
  active: boolean;
  name: string;
  remove(key: string): void;
  style?: CSSProperties;
}) {
  const element = useRef<HTMLDivElement>(null);
  const wasActive = useRef(active);
  const removeRef = useRef(remove);
  removeRef.current = remove;
  useLayoutEffect(() => {
    const enter = active && (entry.animate || !wasActive.current);
    wasActive.current = active;
    if (!element.current || (active && !enter)) return;
    return runCssTransition(element.current, {
      name,
      enter: active,
      finish() {
        if (!active) removeRef.current(entry.key);
      },
    });
  }, [active, entry.animate, entry.key, name]);
  return (
    <div ref={element} style={style} inert={!active} aria-hidden={active ? undefined : true}>
      {entry.children}
    </div>
  );
}

export function CalendarTransition({
  identity,
  name,
  children,
  style,
}: {
  identity: string;
  name: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const [entries, setEntries] = useState<Entry[]>([{ key: identity, children, animate: false }]);
  const current = entries[entries.length - 1];
  if (current.key !== identity) {
    setEntries([
      ...entries.filter((entry) => entry.key !== identity),
      { key: identity, children, animate: true },
    ]);
  } else if (current.children !== children) {
    setEntries([...entries.slice(0, -1), { ...current, children }]);
  }
  return entries.map((entry) => (
    <Frame
      key={entry.key}
      entry={entry}
      active={entry.key === identity}
      name={name}
      style={style}
      remove={(key) =>
        setEntries((items) =>
          items[items.length - 1].key === key ? items : items.filter((item) => item.key !== key),
        )
      }
    />
  ));
}
