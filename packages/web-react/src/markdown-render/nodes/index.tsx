import type { CustomComponentMap, NodeComponentProps } from 'markstream-react';

import { Divider } from '../../divider/index.js';
import { MarkdownAdmonitionNode } from './admonition.js';
import { MarkdownCheckboxNode } from './checkbox.js';
import { MarkdownContainerNode, MarkdownParagraphNode } from './container.js';
import { getMarkdownNodeEvents, type MarkdownNodeEvents } from './events.js';
import { MarkdownHtmlNode } from './html.js';
import { MarkdownImageNode } from './image.js';
import { MarkdownInlineCodeNode } from './inline-code.js';
import { MarkdownLinkNode } from './link.js';
import { MarkdownTextNode } from './text.js';

function MarkdownThematicBreakNode(props: NodeComponentProps & MarkdownNodeEvents) {
  return <Divider {...getMarkdownNodeEvents(props)} />;
}

export const markdownComponents: CustomComponentMap = {
  paragraph: MarkdownParagraphNode,
  text: MarkdownTextNode,
  admonition: MarkdownAdmonitionNode,
  inline_code: MarkdownInlineCodeNode,
  heading: MarkdownContainerNode,
  blockquote: MarkdownContainerNode,
  link: MarkdownLinkNode,
  image: MarkdownImageNode,
  checkbox: MarkdownCheckboxNode,
  checkbox_input: MarkdownCheckboxNode,
  thematic_break: MarkdownThematicBreakNode,
  html_block: MarkdownHtmlNode,
  html_inline: MarkdownHtmlNode,
};
