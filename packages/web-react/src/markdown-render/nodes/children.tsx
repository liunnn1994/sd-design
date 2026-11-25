import type { ComponentProps } from 'react';
import type { UndefinedOnPartial } from 'type-fest';

import { renderNode, type HeadingNode, type NodeComponentProps } from 'markstream-react';

type Nodes = ComponentProps<typeof HeadingNode>['node']['children'];
export function MarkdownNodeChildren({
  nodes,
  ctx,
  indexKey,
  renderNode: render = renderNode,
}: UndefinedOnPartial<Omit<NodeComponentProps, 'node'>> & { nodes?: Nodes }) {
  const context = ctx ?? { htmlPolicy: 'safe', events: {} };
  return (
    <>{nodes?.map((node, index) => render(node, `${String(indexKey ?? '')}-${index}`, context))}</>
  );
}
