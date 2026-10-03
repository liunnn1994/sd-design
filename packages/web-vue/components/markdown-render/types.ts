import type {
  CodeBlockPreviewPayload,
  MarkstreamVirtualState,
  MarkstreamVirtualMetrics,
  MarkstreamVirtualAnchor,
} from 'markstream-vue';
import type { MarkdownRender as UpstreamMarkdownRender, NodeRendererProps } from 'markstream-vue';
import type { BaseNode } from 'markstream-vue';

/**
 * @zh 与锁定版本的上游属性保持一致；默认值由上游组件自己拥有。
 * @en Props of the pinned upstream renderer.
 */
export type MarkdownRenderProps = NodeRendererProps;
export type UpstreamMarkdownRenderInstance = InstanceType<typeof UpstreamMarkdownRender>;
export type MarkdownRenderMethods = Pick<
  UpstreamMarkdownRenderInstance,
  | 'getVirtualMetrics'
  | 'captureVirtualState'
  | 'restoreVirtualState'
  | 'forceMeasure'
  | 'settle'
  | 'scrollToNode'
>;
/**
 * @zh 根渲染器在锁定版本没有公开插槽，代码块头部等插槽属于节点组件。
 * @en The root renderer exposes no slots in the pinned version; `header-left` and friends live on node components.
 */
export type MarkdownRenderSlots = UpstreamMarkdownRenderInstance['$slots'];

/**
 * @zh 容器节点由 SD 显式递归渲染子节点。
 * @en Container nodes render their children explicitly.
 */
export interface MarkdownContainerProps {
  node: {
    type?: string;
    level?: number;
    attrs?: Record<string, string | boolean>;
    cite?: string;
    children?: BaseNode[];
  };
  customId?: string;
  indexKey?: string | number;
}

/**
 * @zh 上游事件名称与载荷。
 * @en Upstream event names and payloads.
 */
export interface MarkdownRenderEmits {
  'copy': [code: string];
  'copy-code': [code: string];
  'click': [event: MouseEvent, referenceId?: string];
  'mouseover': [event: MouseEvent];
  'mouseout': [event: MouseEvent];
  'handleArtifactClick': [payload: CodeBlockPreviewPayload];
  'virtual-state-change': [state: MarkstreamVirtualState];
  'height-change': [metrics: MarkstreamVirtualMetrics];
  'render-settled': [metrics: MarkstreamVirtualMetrics];
  'render-final': [metrics: MarkstreamVirtualMetrics];
  'anchor-change': [anchor: MarkstreamVirtualAnchor];
}
