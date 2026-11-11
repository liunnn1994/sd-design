// Pinned renderer defaults and measurement identity from markstream-vue 2.0.18.
const docs = {
  showTooltips: true,
  fade: true,
  batchRendering: true,
  initialRenderBatchSize: 40,
  renderBatchSize: 80,
  renderBatchDelay: 16,
  renderBatchBudgetMs: 6,
  renderBatchIdleTimeoutMs: 120,
  deferNodesUntilVisible: true,
  maxLiveNodes: 220,
  liveNodeBuffer: 60,
  nodeVirtual: 'auto' as const,
};
const chat = {
  showTooltips: false,
  fade: false,
  batchRendering: true,
  initialRenderBatchSize: 32,
  renderBatchSize: 48,
  renderBatchDelay: 6,
  renderBatchBudgetMs: 8,
  renderBatchIdleTimeoutMs: 60,
  deferNodesUntilVisible: true,
  maxLiveNodes: 0,
  liveNodeBuffer: 0,
  nodeVirtual: 'auto' as const,
};
export function getMarkdownModeOptions(mode?: string) {
  return mode === 'chat' || mode === 'minimal' ? chat : docs;
}
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}
function serialize(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
export function getMarkdownMeasurementKey(options: {
  measurementKey?: string | number;
  isDark?: boolean;
  renderCodeBlocksAsPre?: boolean;
  codeBlockStream?: boolean;
  codeBlockMinWidth?: string | number;
  codeBlockMaxWidth?: string | number;
  codeBlockOptions?: unknown;
  codeBlockProps?: unknown;
}) {
  const code = record(options.codeBlockOptions),
    props = record(options.codeBlockProps);
  return [
    options.measurementKey ?? '',
    options.isDark ? 'dark' : 'light',
    options.renderCodeBlocksAsPre ? 'code-pre' : 'code-rich',
    options.codeBlockStream === false ? 'code-static' : 'code-stream',
    options.codeBlockMinWidth,
    options.codeBlockMaxWidth,
    ...[
      'fontSize',
      'lineHeight',
      'fontFamily',
      'maxHeight',
      'tabSize',
      'padding',
      'overflow',
      'disableLineNumbers',
      'diffStyle',
      'diffIndicators',
      'hunkSeparators',
      'expandUnchanged',
      'collapsedContextThreshold',
      'expansionLineCount',
    ].map((key) => code[key]),
    record(code.parseDiffOptions).context,
    ...[
      'showHeader',
      'showCopyButton',
      'showExpandButton',
      'showPreviewButton',
      'showCollapseButton',
      'showFontSizeButtons',
      'showLineNumbers',
    ].map((key) => props[key]),
  ]
    .map(serialize)
    .join('\0');
}
