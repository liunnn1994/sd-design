import type { BlockquoteNode, HeadingNode } from 'markstream-react';
import type { ComponentProps } from 'react';

import { ParagraphNode } from 'markstream-react';

import { TypographyParagraph, TypographyTitle } from '../../typography/index.js';
import { MarkdownNodeChildren } from './children.js';
import { getMarkdownNodeEvents, type MarkdownNodeEvents } from './events.js';
import { getMarkdownHtmlStyle, normalizeMarkdownHtmlAttrs } from './html-attrs.js';

type ParagraphProps = ComponentProps<typeof ParagraphNode> & MarkdownNodeEvents;
function containsImage(nodes: ParagraphProps['node']['children']): boolean {
  return (
    nodes?.some(
      (node) =>
        node.type === 'image' ||
        ('children' in node && Array.isArray(node.children) && containsImage(node.children)),
    ) ?? false
  );
}
export function MarkdownParagraphNode(props: ParagraphProps) {
  if (!containsImage(props.node.children)) return <ParagraphNode {...props} />;
  // SD Image contains block elements, which cannot be hydrated inside a native paragraph.
  return (
    <div dir="auto" className="paragraph-node" {...getMarkdownNodeEvents(props)}>
      <MarkdownNodeChildren
        nodes={props.node.children}
        ctx={props.ctx}
        renderNode={props.renderNode}
        customId={props.customId}
        indexKey={props.indexKey}
      />
    </div>
  );
}

export type MarkdownContainerNodeProps = (
  | ComponentProps<typeof HeadingNode>
  | ComponentProps<typeof BlockquoteNode>
) & { node: { cite?: string } } & MarkdownNodeEvents;
export function MarkdownContainerNode(props: MarkdownContainerNodeProps) {
  const { node } = props;
  const children = (
    <MarkdownNodeChildren
      nodes={node.children}
      ctx={props.ctx}
      renderNode={props.renderNode}
      customId={props.customId}
      indexKey={props.indexKey}
    />
  );
  return (
    <div {...getMarkdownNodeEvents(props)}>
      {node.type === 'heading' ? (
        <TypographyTitle
          {...normalizeMarkdownHtmlAttrs(node.attrs ?? {})}
          ref={
            typeof node.attrs?.style === 'string'
              ? getMarkdownHtmlStyle(node.attrs.style).apply
              : undefined
          }
          heading={Math.max(1, Math.min(6, node.level ?? 1)) as 1 | 2 | 3 | 4 | 5 | 6}
        >
          {children}
        </TypographyTitle>
      ) : (
        <TypographyParagraph
          blockquote
          cite={'cite' in node && typeof node.cite === 'string' ? node.cite : undefined}
        >
          {children}
        </TypographyParagraph>
      )}
    </div>
  );
}
