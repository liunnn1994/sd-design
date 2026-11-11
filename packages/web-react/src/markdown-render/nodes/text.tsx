import type { NodeComponentProps } from 'markstream-react';

import { createMarkdownTextStream } from '@sdata/web-core/markdown/text-stream';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export function MarkdownTextNode({
  node,
  ctx,
  indexKey,
  fade,
  children,
}: NodeComponentProps<{
  content?: string;
  center?: boolean;
}>) {
  const content = String(node.content ?? '');
  const enabled = fade ?? ctx?.fade ?? true;
  const key = String(indexKey ?? '');
  const cache = ctx?.textStreamState;
  const [stream] = useState(() => createMarkdownTextStream(content));
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const root = useRef<HTMLSpanElement>(null);
  const base = useRef<HTMLSpanElement>(null);
  const appends = useRef<HTMLSpanElement>(null);
  const initial = useRef(content);
  const written = useRef(content);
  const pending = useRef<string | null>(null);
  const listener = useRef<{ remove(): void } | null>(null);
  const current = useRef({ key, cache, enabled });
  current.current = { key, cache, enabled };
  function selectedDelta() {
    const element = root.current;
    const selection = element?.ownerDocument.getSelection();
    if (!element || !selection || selection.isCollapsed) return false;
    const deltas = element.querySelectorAll(':scope > .text-node-stream-delta');
    for (let index = 0; index < selection.rangeCount; index++) {
      const range = selection.getRangeAt(index);
      if ([...deltas].some((delta) => range.intersectsNode(delta))) return true;
    }
    return false;
  }
  function apply(value: string) {
    const { key, cache, enabled } = current.current;
    if (stream.update(value, key ? cache?.get(key) : undefined, enabled, performance.now()))
      refresh();
    if (key) cache?.set(key, value);
  }
  function watchSelection() {
    if (listener.current || !root.current) return;
    const document = root.current.ownerDocument;
    const changed = () => {
      if (selectedDelta()) return;
      listener.current?.remove();
      listener.current = null;
      if (pending.current !== null) {
        const value = pending.current;
        pending.current = null;
        apply(value);
      }
      if (stream.settleFinished()) refresh();
    };
    document.addEventListener('selectionchange', changed);
    listener.current = {
      remove: () => document.removeEventListener('selectionchange', changed),
    };
  }
  useLayoutEffect(() => {
    if (children != null) return;
    if (selectedDelta()) {
      pending.current = content;
      watchSelection();
    } else {
      pending.current = null;
      apply(content);
    }
  }, [content, key, enabled, cache, children]);
  useLayoutEffect(() => {
    const element = base.current;
    const extra = appends.current;
    if (!element || !extra) return;
    const value = stream.settled;
    if (value.startsWith(written.current) && (element.firstChild || !value)) {
      const delta = value.slice(written.current.length);
      if (delta) extra.appendChild(element.ownerDocument.createTextNode(delta));
      const selection = element.ownerDocument.getSelection();
      const selected = Boolean(
        selection &&
        ((selection.anchorNode && extra.contains(selection.anchorNode)) ||
          (selection.focusNode && extra.contains(selection.focusNode))),
      );
      if (extra.childNodes.length > 4 && !selected)
        extra.replaceChildren(element.ownerDocument.createTextNode(extra.textContent ?? ''));
    } else {
      element.textContent = value;
      extra.textContent = '';
    }
    written.current = value;
  }, [stream.settled]);
  useLayoutEffect(
    () => () => {
      listener.current?.remove();
      listener.current = null;
    },
    [],
  );
  return (
    <span
      ref={root}
      className={`text-node whitespace-pre-wrap break-words${node.center ? ' text-node-center' : ''}`}
    >
      {children ?? (
        <>
          <span ref={base} style={stream.settled ? undefined : { display: 'none' }}>
            {initial.current}
          </span>
          <span ref={appends} style={stream.settled ? undefined : { display: 'none' }} />
          {stream.segments.map((segment) => (
            <span
              key={segment.id}
              className="text-node-stream-delta text-node-stream-delta--a"
              onAnimationEnd={() => {
                const hold = selectedDelta();
                if (stream.finish(segment.id, hold)) refresh();
                if (hold) watchSelection();
              }}
            >
              {segment.content}
            </span>
          ))}
        </>
      )}
    </span>
  );
}
