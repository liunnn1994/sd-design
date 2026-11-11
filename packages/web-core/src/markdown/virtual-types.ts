export type MarkstreamVirtualPhase =
  | 'estimating'
  | 'streaming'
  | 'measuring'
  | 'settling'
  | 'settled'
  | 'final';
export type MarkstreamVirtualConfidence = 'estimate' | 'mixed' | 'measured' | 'final';
export type MarkstreamVirtualReason =
  | 'content'
  | 'parse'
  | 'batch'
  | 'resize'
  | 'node-resize'
  | 'async-node'
  | 'font'
  | 'theme'
  | 'final'
  | 'restore'
  | 'manual';
export type MarkstreamVirtualAnchor =
  | { type: 'node'; nodeIndex: number; offsetWithinNodePx: number }
  | { type: 'bottom'; distanceFromBottomPx: number };
export interface MarkstreamMeasuredHeightCacheEntry {
  index: number;
  height: number;
}
export interface MarkstreamHeightCacheEntry extends MarkstreamMeasuredHeightCacheEntry {
  nodeType?: string;
  signature: string;
}
export type MarkstreamHeightCache = MarkstreamHeightCacheEntry[];
export interface MarkstreamVirtualMetrics {
  sessionKey: string;
  threadKey?: string;
  phase: MarkstreamVirtualPhase;
  nodeCount: number;
  liveRange: { start: number; end: number };
  renderedCount: number;
  measuredCount: number;
  estimatedCount: number;
  averageNodeHeight: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
  visibleDomHeight: number;
  totalHeight: number;
  width: number;
  final: boolean;
  stable: boolean;
  confidence: MarkstreamVirtualConfidence;
  reason: MarkstreamVirtualReason;
}
export interface MarkstreamVirtualState {
  sessionKey: string;
  threadKey?: string;
  anchor?: MarkstreamVirtualAnchor;
  anchorCaptured?: boolean;
  metrics: MarkstreamVirtualMetrics;
  width: number;
  contentHash?: string;
  measurementKey?: string;
  heightCache?: MarkstreamHeightCache;
}
export interface MarkstreamCaptureVirtualStateOptions {
  requireViewport?: boolean;
  allowFallbackAnchor?: boolean;
  includeEmptyState?: boolean;
}
export interface MarkstreamRendererHandle {
  getVirtualMetrics(): MarkstreamVirtualMetrics;
  captureVirtualState(
    options?: MarkstreamCaptureVirtualStateOptions,
  ): MarkstreamVirtualState | null;
  restoreVirtualState(
    state: MarkstreamVirtualState,
    options?: {
      restoreAnchor?: boolean;
      restoreToken?: string | number | boolean;
      allowUncapturedAnchor?: boolean;
    },
  ): void;
  forceMeasure(reason?: MarkstreamVirtualReason): Promise<MarkstreamVirtualMetrics>;
  settle(options?: {
    frames?: number;
    timeoutMs?: number;
    reason?: MarkstreamVirtualReason;
    flushPendingTimers?: boolean;
  }): Promise<MarkstreamVirtualMetrics>;
  scrollToNode(index: number, align?: 'start' | 'center' | 'end' | 'nearest'): void;
}
