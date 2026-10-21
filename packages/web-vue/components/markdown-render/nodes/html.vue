<template>
  <component :is="hostTag" v-bind="{ ...hostAttrs, ...nodeEvents }">
    <component :is="HtmlContent" v-if="canAdapt" />
    <UpstreamHtml v-else :node="node" :custom-id="customId" :html-policy="policy" />
  </component>
</template>
<script setup lang="ts">
  import type { MarkdownHtmlElement as ElementToken } from '@sdata/web-core/markdown/html';
  import type { HtmlToken, HtmlPolicy } from 'markstream-vue';

  import type { VNodeChild } from 'vue';
  import { computed, h, inject, useAttrs } from 'vue';

  import { createMarkdownHtmlFoundation } from '@sdata/web-core/markdown/html';
  import { HtmlBlockNode, HtmlInlineNode } from 'markstream-vue';

  import Button from '../../button';
  import Image from '../../image';
  import Link from '../../link';
  import { TypographyTitle, TypographyParagraph } from '../../typography';
  import { markdownContextKey } from '../context';
  import { useNodeEvents } from './use-node-events';

  defineOptions({ inheritAttrs: false });
  const nodeEvents = useNodeEvents();
  const { node, customId, htmlPolicy } = defineProps<{
    node: {
      type?: string;
      content: string;
      raw?: string;
      tag?: string;
      loading?: boolean;
      attrs?: [string, string][] | null;
    };
    customId?: string;
    htmlPolicy?: HtmlPolicy;
  }>();
  const context = inject(markdownContextKey);
  const foundation = createMarkdownHtmlFoundation({
    get node() {
      return node;
    },
    get htmlPolicy() {
      return htmlPolicy;
    },
    get contextPolicy() {
      return context?.value.htmlPolicy;
    },
    get policy(): HtmlPolicy {
      return policy.value;
    },
    get rawTokens(): HtmlToken[] {
      return rawTokens.value;
    },
    get safeTokens(): HtmlToken[] {
      return safeTokens.value;
    },
  });
  const policy = computed(foundation.getPolicy);
  // 上游会连同内部回调一起下发节点属性，只把字符串型属性落成宿主 DOM 属性。
  const attrs = useAttrs();
  const hostAttrs = computed(() =>
    Object.fromEntries(
      Object.entries(attrs).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    ),
  );
  const UpstreamHtml = computed(() =>
    node.type === 'html_inline' ? HtmlInlineNode : HtmlBlockNode,
  );
  // 一次分词，两处判断复用：适配用的安全文本与保留原节点用的原始 token。
  const rawTokens = computed(foundation.getRawTokens);
  const safeTokens = computed(foundation.getSafeTokens);
  // 自定义标签及流式未完成 HTML 继续交给原节点，保留上游协议和 placeholder。
  const canAdapt = computed(foundation.getCanAdapt);

  const tree = computed(() => foundation.buildTree(safeTokens.value));
  /** 块级标签不能放进 span；宿主标签按实际内容选，避免 <span><p> 这类非法嵌套。 */
  const hostTag = computed(foundation.getHostTag);
  function renderTokens(): VNodeChild[] {
    const render = (element: ElementToken | string): VNodeChild => {
      // 文本已经过 policy 清洗，作为文本子节点直接输出即可，
      // 不必为每段文本再实例化一个 HtmlInlineNode。
      if (typeof element === 'string') return element;
      const { tag, attrs, children } = element;
      const content = () => children.map(render);
      if (/^h[1-6]$/.test(tag))
        return h(
          TypographyTitle,
          { ...attrs, heading: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6 },
          { default: content },
        );
      if (tag === 'p') return h(TypographyParagraph, attrs, { default: content });
      if (tag === 'button') {
        const { type, disabled, ...rest } = attrs;
        return h(
          Button,
          {
            ...rest,
            htmlType: type === 'submit' || type === 'reset' ? type : 'button',
            disabled: disabled !== undefined && disabled !== 'false',
          },
          { default: content },
        );
      }
      if (tag === 'a') return h(Link, { ...attrs, ellipsis: false }, { default: content });
      if (tag === 'img') return h(Image, { ...attrs, hideFooter: true });
      return h(tag, attrs, content());
    };
    return tree.value.map(render);
  }
  const HtmlContent = () => renderTokens();
</script>
