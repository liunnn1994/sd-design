import type { NodeRendererProps, CustomComponentMap } from 'markstream-react';
import type { ComponentProps } from 'react';
import type { IsAny } from 'type-fest';

import { createRef } from 'react';

import type {
  MarkdownRenderProps,
  MarkstreamVirtualScrollOptions,
  MarkstreamScrollRootRef,
} from '../../src/markdown-render/types.js';

import {
  CodeBlockNode,
  type CodeBlockNodeHandle,
  type CodeBlockNodeReactHandle,
} from '../../src/markdown-render/index.js';

type Checked<Type> = IsAny<Type> extends true ? never : Type;
type CodeBlockRef = ComponentProps<typeof CodeBlockNode>['ref'];
const codeBlockRef = createRef<Checked<CodeBlockNodeHandle>>() satisfies CodeBlockRef;
const reactCodeBlockRef = createRef<Checked<CodeBlockNodeReactHandle>>() satisfies CodeBlockRef;
const upstreamProps: Checked<NodeRendererProps> = { content: 'Markdown' };
const sdProps: Checked<MarkdownRenderProps> = {
  content: 'SD Markdown',
  mode: 'chat',
  isDark: true,
};
// @ts-expect-error Markdown content must be text.
const invalidContent: MarkdownRenderProps = { content: 42 };
const components: CustomComponentMap = { heading: () => null };
// @ts-expect-error A component mapping cannot contain numbers.
const invalidComponents: CustomComponentMap = { heading: 42 };
const root: MarkstreamScrollRootRef = { current: undefined };
const virtual: MarkstreamVirtualScrollOptions = {
  enabled: true,
  sessionKey: 'typed',
  scrollRoot: root,
  heightCache: [],
  heightCacheWidth: 640,
};
const disabled: MarkstreamVirtualScrollOptions = { enabled: false };
// @ts-expect-error SD enabled virtual scrolling requires a session key.
const unkeyed: MarkstreamVirtualScrollOptions = { enabled: true };
// @ts-expect-error SD imported height caches require a measurement width.
const unmeasured: MarkstreamVirtualScrollOptions = { heightCache: [] };
void [
  codeBlockRef,
  reactCodeBlockRef,
  upstreamProps,
  sdProps,
  invalidContent,
  components,
  invalidComponents,
  virtual,
  disabled,
  unkeyed,
  unmeasured,
];
