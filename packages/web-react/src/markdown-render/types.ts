import type { DiffPreviewCollapseOptions } from '@sdata/web-core/markdown/pre-diff';
import type {
  MarkstreamHeightCache,
  MarkstreamRendererHandle,
  MarkstreamVirtualAnchor,
  MarkstreamVirtualMetrics,
  MarkstreamVirtualState,
} from '@sdata/web-core/markdown/virtual-types';
import type { NodeRendererProps } from 'markstream-react';
import type { HTMLAttributes, Ref, RefObject } from 'react';

export type {
  MarkstreamCaptureVirtualStateOptions,
  MarkstreamHeightCache,
  MarkstreamHeightCacheEntry,
  MarkstreamMeasuredHeightCacheEntry,
  MarkstreamRendererHandle,
  MarkstreamVirtualAnchor,
  MarkstreamVirtualConfidence,
  MarkstreamVirtualMetrics,
  MarkstreamVirtualPhase,
  MarkstreamVirtualReason,
  MarkstreamVirtualState,
} from '@sdata/web-core/markdown/virtual-types';
export type MarkdownRenderMethods = MarkstreamRendererHandle;
export type MarkdownRenderInstance = MarkdownRenderMethods;
export type NodeRendererDomMode = 'full' | 'minimal';
export type NodeRendererMode = 'docs' | 'chat' | 'minimal';
export type NodeRendererTypewriter = boolean | 'simple' | 'precise';
export type MarkstreamScrollRoot = HTMLElement | null | undefined;
export type MarkstreamScrollRootRef = RefObject<MarkstreamScrollRoot>;
export type MarkstreamScrollRootLike =
  | MarkstreamScrollRoot
  | MarkstreamScrollRootRef
  | { $el?: MarkstreamScrollRoot };
export type MarkstreamScrollRootResolver = () => MarkstreamScrollRootLike;
export type MarkstreamVirtualScrollHeightCacheOptions =
  | { heightCache?: null | undefined; heightCacheWidth?: number }
  | { heightCache: MarkstreamHeightCache; heightCacheWidth: number };
interface MarkstreamVirtualScrollSharedBaseOptions {
  threadKey?: string;
  scrollRoot?: MarkstreamScrollRootLike | MarkstreamScrollRootResolver;
  restoreState?: MarkstreamVirtualState | null;
  restoreAnchor?: boolean | string | number;
  measurementKey?: string | number;
  settleMode?: 'auto' | 'manual';
  settledToken?: string | number | boolean;
  emitIntervalMs?: number;
  heightDiffThresholdPx?: number;
  heightCacheLimit?: number;
}
export type MarkstreamVirtualScrollSharedOptions = MarkstreamVirtualScrollSharedBaseOptions &
  MarkstreamVirtualScrollHeightCacheOptions;
export type MarkstreamVirtualScrollOptions = MarkstreamVirtualScrollSharedOptions &
  (
    | { enabled: true; sessionKey: string }
    | { enabled: boolean; sessionKey: string }
    | { enabled?: false; sessionKey?: string }
  );
export interface MarkstreamViewportPriorityOptions {
  rootMargin?: string;
  heavyBlockMargin?: string;
  maxTargets?: number;
}
export type MarkdownCodeBlockProps = NonNullable<NodeRendererProps['codeBlockProps']> & {
  clipboardWriter?: (text: string) => void | Promise<void>;
  diffInline?: boolean;
  diffHideUnchangedRegions?: boolean | DiffPreviewCollapseOptions;
  reservedHeightPx?: number;
  theme?: string | { light?: string; dark?: string };
};
export interface MarkdownRenderProps
  extends
    Omit<
      NodeRendererProps,
      'onClick' | 'onMouseOver' | 'onMouseOut' | 'typewriter' | 'codeBlockProps'
    >,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      keyof NodeRendererProps | 'children' | 'onClick' | 'onMouseOver' | 'onMouseOut' | 'onCopy'
    > {
  ref?: Ref<MarkdownRenderMethods>;
  codeBlockProps?: MarkdownCodeBlockProps;
  mode?: NodeRendererMode;
  domMode?: NodeRendererDomMode;
  typewriter?: NodeRendererTypewriter;
  parseCoalesceMs?: number;
  viewportPriorityOptions?: MarkstreamViewportPriorityOptions;
  nodeVirtual?: boolean | 'auto';
  virtualScroll?: MarkstreamVirtualScrollOptions;
  renderAsFragment?: boolean;
  onClick?(event: MouseEvent, referenceId?: string): void;
  onMouseOver?(event: MouseEvent): void;
  onMouseOut?(event: MouseEvent): void;
  onCopyCode?(code: string): void;
  onVirtualStateChange?(state: MarkstreamVirtualState): void;
  onHeightChange?(metrics: MarkstreamVirtualMetrics): void;
  onRenderSettled?(metrics: MarkstreamVirtualMetrics): void;
  onRenderFinal?(metrics: MarkstreamVirtualMetrics): void;
  onAnchorChange?(anchor: MarkstreamVirtualAnchor): void;
}

export interface MarkdownRenderEmits {
  'copy': Parameters<NonNullable<MarkdownRenderProps['onCopy']>>;
  'copy-code': Parameters<NonNullable<MarkdownRenderProps['onCopyCode']>>;
  'click': Parameters<NonNullable<MarkdownRenderProps['onClick']>>;
  'mouseover': Parameters<NonNullable<MarkdownRenderProps['onMouseOver']>>;
  'mouseout': Parameters<NonNullable<MarkdownRenderProps['onMouseOut']>>;
  'handleArtifactClick': Parameters<NonNullable<MarkdownRenderProps['onHandleArtifactClick']>>;
  'virtual-state-change': Parameters<NonNullable<MarkdownRenderProps['onVirtualStateChange']>>;
  'height-change': Parameters<NonNullable<MarkdownRenderProps['onHeightChange']>>;
  'render-settled': Parameters<NonNullable<MarkdownRenderProps['onRenderSettled']>>;
  'render-final': Parameters<NonNullable<MarkdownRenderProps['onRenderFinal']>>;
  'anchor-change': Parameters<NonNullable<MarkdownRenderProps['onAnchorChange']>>;
}
