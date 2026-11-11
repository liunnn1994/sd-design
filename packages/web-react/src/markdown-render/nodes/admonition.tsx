import type { AdmonitionNode } from 'markstream-react';
import type { ComponentProps } from 'react';

import { Alert } from '../../alert/index.js';
import { MarkdownNodeChildren } from './children.js';
import { getMarkdownNodeEvents, type MarkdownNodeEvents } from './events.js';

export type MarkdownAdmonitionNodeProps = ComponentProps<typeof AdmonitionNode> &
  MarkdownNodeEvents;
export function MarkdownAdmonitionNode(props: MarkdownAdmonitionNodeProps) {
  const { node } = props;
  const type = ['danger', 'error'].includes(node.kind ?? '')
    ? 'error'
    : ['warning', 'caution'].includes(node.kind ?? '')
      ? 'warning'
      : node.kind === 'tip'
        ? 'success'
        : 'info';
  const children = (
    <MarkdownNodeChildren
      nodes={node.children}
      ctx={props.ctx}
      renderNode={props.renderNode}
      customId={props.customId}
      indexKey={props.indexKey}
    />
  );
  return node.collapsible ? (
    <details {...getMarkdownNodeEvents(props)} open={node.open}>
      <summary>{node.title || node.kind}</summary>
      <Alert type={type}>{children}</Alert>
    </details>
  ) : (
    <Alert {...getMarkdownNodeEvents(props)} type={type} title={node.title || node.kind}>
      {children}
    </Alert>
  );
}
