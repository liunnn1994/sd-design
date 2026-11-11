import type { HTMLAttributes, MouseEvent } from 'react';

export interface MarkdownNodeEvents {
  onClick?(event: globalThis.MouseEvent, referenceId?: string): void;
  onMouseOver?(event: globalThis.MouseEvent): void;
  onMouseOut?(event: globalThis.MouseEvent): void;
}
export function getMarkdownReferenceId(event: Event, boundary: Element): string | undefined {
  const target =
    event.target instanceof Element
      ? event.target
      : event.target instanceof Node
        ? event.target.parentElement
        : null;
  const reference = target?.closest<HTMLElement>('[data-markstream-reference-id]');
  return reference && boundary.contains(reference)
    ? reference.dataset.markstreamReferenceId
    : undefined;
}
export function getMarkdownNodeEvents(
  events: MarkdownNodeEvents,
): Pick<HTMLAttributes<HTMLElement>, 'onClick' | 'onMouseOver' | 'onMouseOut'> {
  const forward = (callback: ((event: globalThis.MouseEvent) => void) | undefined) =>
    callback
      ? (event: MouseEvent<HTMLElement>) => {
          // Vue's native bubbling excludes teleported previews outside the node's DOM.
          if (event.currentTarget.contains(event.target as Node)) callback(event.nativeEvent);
        }
      : undefined;
  return {
    onClick: events.onClick
      ? (event: MouseEvent<HTMLElement>) => {
          if (event.currentTarget.contains(event.target as Node))
            events.onClick?.(
              event.nativeEvent,
              getMarkdownReferenceId(event.nativeEvent, event.currentTarget),
            );
        }
      : undefined,
    onMouseOver: forward(events.onMouseOver),
    onMouseOut: forward(events.onMouseOut),
  };
}
