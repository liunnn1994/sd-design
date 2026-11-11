import type { MarkdownTextProbeProfile } from '@sdata/web-core/markdown/text-height';
import type { RenderContext } from 'markstream-react';

import {
  clearMarkdownTextHeightCache,
  loadMarkdownTextLayout,
  readMarkdownTextFontProfile,
} from '@sdata/web-core/markdown/text-height';
import { HeadingNode, ListItemNode, ListNode, ParagraphNode, renderNode } from 'markstream-react';
import { useLayoutEffect, useRef } from 'react';

const paragraphText = 'Probe paragraph text';
const paragraph = {
  type: 'paragraph' as const,
  children: [{ type: 'text' as const, content: paragraphText, raw: paragraphText }],
  raw: paragraphText,
};
const item = { type: 'list_item' as const, children: [paragraph], raw: `- ${paragraphText}` };
const list = { type: 'list' as const, ordered: false, items: [item], raw: item.raw };
const headings = Array.from({ length: 6 }, (_, index) => ({
  type: 'heading' as const,
  level: index + 1,
  children: [{ type: 'text' as const, content: 'Probe heading', raw: 'Probe heading' }],
  raw: `${'#'.repeat(index + 1)} Probe heading`,
}));

export function MarkdownHeightProbes({
  width,
  measurementKey,
  ctx,
  onProfile,
}: {
  width: number;
  measurementKey: string;
  ctx: RenderContext;
  onProfile(profile: MarkdownTextProbeProfile): void;
}) {
  const root = useRef<HTMLDivElement>(null),
    callback = useRef(onProfile);
  callback.current = onProfile;
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    let active = true,
      previous = '';
    function publish(force = false) {
      if (!active || !element) return;
      const wrapper = (name: string) =>
        element.querySelector<HTMLElement>(`[data-probe="${name}"]`);
      const profile = (name: string, selector: string) => {
        const node = wrapper(name);
        return readMarkdownTextFontProfile(
          node,
          node?.querySelector<HTMLElement>(selector) ?? null,
        );
      };
      const itemHeight = wrapper('list-item')?.offsetHeight ?? 0;
      const result: MarkdownTextProbeProfile = {
        paragraph: profile('paragraph', '.paragraph-node'),
        listItem: profile('list-item', '.paragraph-node'),
        listWrapperOverhead: Math.max(0, (wrapper('list')?.offsetHeight ?? 0) - itemHeight),
        headings: Object.fromEntries(
          headings.map((node) => [node.level, profile(`heading-${node.level}`, `h${node.level}`)]),
        ),
      };
      const key = JSON.stringify(result);
      if (force || key !== previous) {
        previous = key;
        callback.current(result);
      }
    }
    publish();
    void loadMarkdownTextLayout().then(() => publish(true));
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => publish()) : undefined;
    for (const child of element.children) observer?.observe(child);
    const onFont = () => {
      clearMarkdownTextHeightCache();
      publish(true);
    };
    element.ownerDocument.fonts?.addEventListener('loadingdone', onFont);
    return () => {
      active = false;
      observer?.disconnect();
      element.ownerDocument.fonts?.removeEventListener('loadingdone', onFont);
    };
  }, [width, measurementKey]);
  // Probe keys must not write into the document's streamed text cache.
  const probeCtx = { ...ctx, textStreamState: undefined, typewriter: false, fade: false };
  const props = { ctx: probeCtx, renderNode, typewriter: false, fade: false };
  const cls = 'node-content node-content-flow-root';
  return (
    <div ref={root} className="height-estimation-probes" style={{ width }} aria-hidden="true">
      <div className={cls} data-probe="paragraph">
        <ParagraphNode {...props} node={paragraph} indexKey="probe-paragraph" />
      </div>
      <div className={cls} data-probe="list-item">
        <ul className="m-0 p-0">
          <ListItemNode {...props} node={item} indexKey="probe-list-item" />
        </ul>
      </div>
      <div className={cls} data-probe="list">
        <ListNode {...props} node={list} indexKey="probe-list" />
      </div>
      {headings.map((node) => (
        <div key={node.level} className={cls} data-probe={`heading-${node.level}`}>
          <HeadingNode {...props} node={node} indexKey={`probe-heading-${node.level}`} />
        </div>
      ))}
    </div>
  );
}
