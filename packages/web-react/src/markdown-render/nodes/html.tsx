import type { MarkdownHtmlElement, MarkdownHtmlState } from '@sdata/web-core/markdown/html';
import type { NodeComponentProps } from 'markstream-react';

import { createMarkdownHtmlFoundation } from '@sdata/web-core/markdown/html';
import { HtmlBlockNode, HtmlInlineNode } from 'markstream-react';
import { createElement, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';

import { Button } from '../../button/index.js';
import { Image } from '../../image/index.js';
import { Link } from '../../link/index.js';
import { TypographyTitle, TypographyParagraph } from '../../typography/index.js';
import { getMarkdownNodeEvents, type MarkdownNodeEvents } from './events.js';
import { getMarkdownHtmlStyle, normalizeMarkdownHtmlAttrs } from './html-attrs.js';

type HtmlPolicy = MarkdownHtmlState['policy'];

function MarkdownHtmlInput({ attrs }: { attrs: Record<string, string> }) {
  const input = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const element = input.current;
    if (element && element.type !== 'file')
      element.value =
        attrs.value ?? (element.type === 'checkbox' || element.type === 'radio' ? 'on' : '');
  }, [attrs.value, attrs.type]);
  useLayoutEffect(() => {
    if (input.current) input.current.checked = attrs.checked !== undefined;
  }, [attrs.checked]);
  return (
    <input
      {...normalizeMarkdownHtmlAttrs(attrs)}
      value={undefined}
      checked={undefined}
      defaultValue={attrs.type === 'file' ? undefined : attrs.value}
      defaultChecked={attrs.checked !== undefined}
      ref={(element) => {
        input.current = element;
        if (attrs.style) getMarkdownHtmlStyle(attrs.style).apply(element);
      }}
    />
  );
}

export type MarkdownHtmlNodeProps = Omit<NodeComponentProps, 'node'> &
  MarkdownNodeEvents & {
    node: {
      type?: string;
      content: string;
      raw?: string;
      tag?: string;
      loading?: boolean;
      attrs?: [string, string | null][] | null;
    };
    htmlPolicy?: HtmlPolicy;
    hostAttrs?: Record<string, string>;
  };

export function MarkdownHtmlNode(props: MarkdownHtmlNodeProps) {
  const { node } = props;
  const policy = props.htmlPolicy ?? props.ctx?.htmlPolicy ?? 'safe';
  const prepared = useMemo(() => {
    const foundation = createMarkdownHtmlFoundation({
      node,
      htmlPolicy: policy,
      contextPolicy: undefined,
      policy,
      get rawTokens() {
        return rawTokens;
      },
      get safeTokens() {
        return safeTokens;
      },
    });
    const rawTokens = foundation.getRawTokens();
    const safeTokens = foundation.getSafeTokens();
    return {
      host: foundation.getHostTag(),
      canAdapt: foundation.getCanAdapt(),
      tree: foundation.buildTree(safeTokens),
    };
  }, [node.content, node.loading, node.type, policy]);
  const render = (element: MarkdownHtmlElement | string, key: string): ReactNode => {
    if (typeof element === 'string') return element;
    const { tag, attrs, children } = element;
    const attributes = normalizeMarkdownHtmlAttrs(attrs);
    const ref = attrs.style ? getMarkdownHtmlStyle(attrs.style).apply : undefined;
    const content = children.map((child, index) => render(child, `${key}-${index}`));
    if (/^h[1-6]$/.test(tag))
      return (
        <TypographyTitle
          {...attributes}
          ref={ref}
          key={key}
          heading={Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6}
        >
          {content}
        </TypographyTitle>
      );
    if (tag === 'p')
      return (
        <TypographyParagraph {...attributes} ref={ref} key={key}>
          {content}
        </TypographyParagraph>
      );
    if (tag === 'button') {
      const { type: _type, disabled: _disabled, ...rest } = attributes;
      return (
        <Button
          {...rest}
          ref={ref}
          key={key}
          htmlType={attrs.type === 'submit' || attrs.type === 'reset' ? attrs.type : 'button'}
          disabled={attrs.disabled !== undefined && attrs.disabled !== 'false'}
        >
          {content}
        </Button>
      );
    }
    if (tag === 'a')
      return (
        <Link {...attributes} ref={ref} key={key} ellipsis={false}>
          {content}
        </Link>
      );
    if (tag === 'img')
      return (
        <Image
          {...attributes}
          ref={ref ? (instance) => ref(instance?.imageRef?.parentElement ?? null) : undefined}
          key={key}
          hideFooter
        />
      );
    if (tag === 'input') return <MarkdownHtmlInput key={key} attrs={attrs} />;
    return createElement(tag, { ...attributes, ref, key }, content.length ? content : undefined);
  };
  const upstream =
    node.type === 'html_inline' ? (
      <HtmlInlineNode {...props} node={{ ...node, type: 'html_inline' }} htmlPolicy={policy} />
    ) : (
      <HtmlBlockNode {...props} node={{ ...node, type: 'html_block' }} htmlPolicy={policy} />
    );
  return createElement(
    prepared.host,
    {
      ...normalizeMarkdownHtmlAttrs(props.hostAttrs ?? {}),
      ...getMarkdownNodeEvents(props),
      ref: props.hostAttrs?.style ? getMarkdownHtmlStyle(props.hostAttrs.style).apply : undefined,
    },
    prepared.canAdapt
      ? prepared.tree.map((element, index) =>
          render(element, `${String(props.indexKey ?? 'html')}-${index}`),
        )
      : prepared.tree.length
        ? upstream
        : null,
  );
}
