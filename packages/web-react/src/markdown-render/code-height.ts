import type { CustomComponentMap } from 'markstream-react';

import { estimateMarkdownCodeHeight } from '@sdata/web-core/markdown/code-height';
import { normalizeLanguageIdentifier, resolveLanguageId } from 'markstream-react';

import type { MarkdownRenderProps } from './types.js';

export function createMarkdownCodeEstimator(
  props: MarkdownRenderProps,
  components: CustomComponentMap,
) {
  return (value: unknown, width: number) => {
    if (!value || typeof value !== 'object') return null;
    const node = value as { type?: string; language?: string };
    if (node.type !== 'code_block') return null;
    const language = String(node.language ?? '')
      .trim()
      .toLowerCase();
    const custom = [
      language,
      normalizeLanguageIdentifier(language),
      resolveLanguageId(language),
      language === 'd2lang' ? 'd2' : '',
    ]
      .map((key) => key && components[key])
      .find(Boolean);
    if (
      custom ||
      components.code_block ||
      (!props.renderCodeBlocksAsPre &&
        ['mermaid', 'infographic', 'd2', 'd2lang'].includes(language))
    )
      return null;
    return estimateMarkdownCodeHeight(node, width, {
      rendererKind: props.renderCodeBlocksAsPre ? 'pre' : 'stream-diffs',
      codeBlockOptions: props.codeBlockOptions,
      codeBlockProps: props.codeBlockProps,
    });
  };
}
