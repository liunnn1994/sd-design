import type { InlineCodeNode } from 'markstream-react';
import type { ComponentProps } from 'react';

import { TypographyText } from '../../typography/index.js';
import { getMarkdownNodeEvents, type MarkdownNodeEvents } from './events.js';

export type MarkdownInlineCodeNodeProps = ComponentProps<typeof InlineCodeNode> & {
  node: { raw?: string };
} & MarkdownNodeEvents;
export function MarkdownInlineCodeNode(props: MarkdownInlineCodeNodeProps) {
  return (
    <TypographyText {...getMarkdownNodeEvents(props)} code>
      {props.children ?? props.node.code}
    </TypographyText>
  );
}
