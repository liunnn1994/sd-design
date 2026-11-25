import type { CustomComponentMap, NodeComponentProps, RenderContext } from 'markstream-react';
import type { ComponentType } from 'react';

import { definedProps } from '@sdata/web-core/_utils/defined-props';
import {
  getMarkdownCustomNodeProps,
  isMarkdownBuiltinNode,
} from '@sdata/web-core/markdown/custom-node';
import { createContext, createElement, useContext } from 'react';

import type { MarkdownRenderProps } from './types.js';

const nestedKeys = [
  'customId',
  'customHtmlTags',
  'parseOptions',
  'customMarkdownIt',
  'htmlPolicy',
  'viewportPriority',
  'viewportPriorityOptions',
  'mode',
  'domMode',
  'codeBlockStream',
  'codeBlockDarkTheme',
  'codeBlockLightTheme',
  'renderCodeBlocksAsPre',
  'codeBlockMinWidth',
  'codeBlockMaxWidth',
  'codeBlockOptions',
  'codeBlockProps',
  'mermaidProps',
  'd2Props',
  'infographicProps',
  'showTooltips',
  'themes',
  'isDark',
  'typewriter',
  'smoothStreamingOptions',
  'parseCoalesceMs',
  'fade',
] as const satisfies readonly (keyof MarkdownRenderProps)[];
export function getMarkdownNestedProps(props: MarkdownRenderProps) {
  return Object.fromEntries(nestedKeys.map((key) => [key, props[key]])) as Pick<
    MarkdownRenderProps,
    (typeof nestedKeys)[number]
  >;
}
export const MarkdownNestedRendererContext = createContext<
  | {
      Renderer: ComponentType<MarkdownRenderProps>;
      props: MarkdownRenderProps;
      codeContext?: RenderContext;
    }
  | undefined
>(undefined);

type CustomNode = {
  type: string;
  tag?: string;
  attrs?: unknown;
  children?: NonNullable<MarkdownRenderProps['nodes']>;
  content?: string;
  loading?: boolean;
};
const wrappers = new WeakMap<CustomComponentMap[string], CustomComponentMap[string]>();
function withRecursiveChildren(Component: CustomComponentMap[string]) {
  const existing = wrappers.get(Component);
  if (existing) return existing;
  const Content = Component as ComponentType<
    NodeComponentProps<CustomNode> & { loading?: boolean | undefined }
  >;
  function CustomNode(props: NodeComponentProps<CustomNode>) {
    const nested = useContext(MarkdownNestedRendererContext);
    if (!nested) return createElement(Content, props);
    const { Renderer, props: inherited } = nested;
    const { indexKey: _inheritedIndexKey, ...inheritedOptions } = inherited;
    const { node, indexKey } = props;
    const options = {
      ...inheritedOptions,
      ...definedProps({
        customId: props.customId ?? inherited.customId,
        indexKey: indexKey == null ? undefined : String(indexKey),
      }),
      batchRendering: false,
      deferNodesUntilVisible: false,
      renderAsFragment: true,
    } satisfies MarkdownRenderProps;
    const children = node.children?.length ? (
      <Renderer {...options} nodes={node.children} />
    ) : node.content ? (
      <Renderer
        {...options}
        content={String(node.content)}
        final={!node.loading}
        indexKey={`${indexKey || 'child'}-content`}
        smoothStreaming={false}
      />
    ) : undefined;
    return createElement(Content, {
      ...getMarkdownCustomNodeProps(node, inherited.htmlPolicy),
      ...props,
      loading: node.loading,
      children,
    });
  }
  if (Component.markstreamDisplay !== undefined) {
    CustomNode.markstreamDisplay = Component.markstreamDisplay;
  }
  wrappers.set(Component, CustomNode);
  wrappers.set(CustomNode, CustomNode);
  return CustomNode;
}
export function withMarkdownRecursiveChildren(components: CustomComponentMap): CustomComponentMap {
  return Object.fromEntries(
    Object.entries(components).map(([type, component]) => [
      type,
      isMarkdownBuiltinNode(type) ? component : withRecursiveChildren(component),
    ]),
  );
}
