import type { LinkNode } from 'markstream-react';
import type { ComponentProps, CSSProperties } from 'react';

import { getMarkdownLinkData, getMarkdownLinkLoadingStyle } from '@sdata/web-core/markdown/link';

import { usePrefix } from '../../config-provider/index.js';
import { Link } from '../../link/index.js';
import { Tooltip } from '../../tooltip/index.js';
import { MarkdownNodeChildren } from './children.js';
import { getMarkdownNodeEvents, type MarkdownNodeEvents } from './events.js';

export type MarkdownLinkNodeProps = ComponentProps<typeof LinkNode> &
  MarkdownNodeEvents & {
    node: ComponentProps<typeof LinkNode>['node'] & { attrs?: [string, string | null][] };
    hostAttrs?: Record<string, string>;
  };
export function MarkdownLinkNode(props: MarkdownLinkNodeProps) {
  const { node, color } = props;
  const showTooltip = props.showTooltip ?? props.ctx?.showTooltips ?? true;
  const prefix = usePrefix('markdown-render-link');
  const events = getMarkdownNodeEvents(props);
  if (node.loading)
    return (
      <span
        {...events}
        className={`${prefix}-loading`}
        style={getMarkdownLinkLoadingStyle(props) as CSSProperties}
        aria-busy="true"
      >
        {node.text}
        <span className={`${prefix}-loading-indicator`} aria-hidden="true" />
      </span>
    );
  const data = getMarkdownLinkData(node, props.hostAttrs);
  const attrs = { ...data.attrs };
  const className = attrs.class;
  delete attrs.class;
  for (const name of ['ref', 'key', 'children', 'dangerouslySetInnerHTML']) delete attrs[name];
  return (
    <Tooltip content={node.title || data.href || ''} disabled={!showTooltip}>
      <Link
        {...attrs}
        {...events}
        className={className}
        href={data.href}
        target={data.target}
        rel={data.rel}
        title={showTooltip ? undefined : (node.title ?? undefined)}
        ellipsis={false}
        style={color ? { color } : undefined}
      >
        <MarkdownNodeChildren
          nodes={node.children}
          ctx={props.ctx}
          renderNode={props.renderNode}
          customId={props.customId}
          indexKey={props.indexKey}
        />
      </Link>
    </Tooltip>
  );
}
