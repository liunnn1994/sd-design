import type { NodeRendererProps } from 'markstream-react';
import type { HTMLAttributes } from 'react';

import type { MarkdownRenderProps } from './types.js';

type RendererProp =
  | keyof NodeRendererProps
  | Exclude<keyof MarkdownRenderProps, keyof HTMLAttributes<HTMLDivElement>>;
const rendererProps: Record<RendererProp, true> = {
  content: true,
  nodes: true,
  final: true,
  parseOptions: true,
  customMarkdownIt: true,
  streamingComponents: true,
  htmlComponents: true,
  debugPerformance: true,
  customHtmlTags: true,
  htmlPolicy: true,
  viewportPriority: true,
  codeBlockStream: true,
  codeBlockDarkTheme: true,
  codeBlockLightTheme: true,
  renderCodeBlocksAsPre: true,
  codeBlockMinWidth: true,
  codeBlockMaxWidth: true,
  codeBlockOptions: true,
  codeBlockProps: true,
  mermaidProps: true,
  d2Props: true,
  infographicProps: true,
  showTooltips: true,
  themes: true,
  isDark: true,
  customId: true,
  indexKey: true,
  typewriter: true,
  fade: true,
  smoothStreaming: true,
  smoothStreamingOptions: true,
  batchRendering: true,
  initialRenderBatchSize: true,
  renderBatchSize: true,
  renderBatchDelay: true,
  renderBatchBudgetMs: true,
  renderBatchIdleTimeoutMs: true,
  deferNodesUntilVisible: true,
  maxLiveNodes: true,
  liveNodeBuffer: true,
  onCopy: true,
  onHandleArtifactClick: true,
  onClick: true,
  onMouseOver: true,
  onMouseOut: true,
  ref: true,
  mode: true,
  domMode: true,
  parseCoalesceMs: true,
  viewportPriorityOptions: true,
  nodeVirtual: true,
  virtualScroll: true,
  renderAsFragment: true,
  onCopyCode: true,
  onVirtualStateChange: true,
  onHeightChange: true,
  onRenderSettled: true,
  onRenderFinal: true,
  onAnchorChange: true,
};

export function getMarkdownRootAttributes(
  props: MarkdownRenderProps,
): HTMLAttributes<HTMLDivElement> {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([name]) => name !== 'children' && !Object.hasOwn(rendererProps, name),
    ),
  );
}
