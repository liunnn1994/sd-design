<template>
  <UpstreamMarkdownRender
    v-bind="options"
    :nodes="nodes"
    :custom-id="customId ?? options.customId"
    :index-key="indexKey"
    render-as-fragment
    :batch-rendering="false"
    :node-virtual="false"
  />
</template>
<script setup lang="ts">
  import type { BaseNode } from 'markstream-vue';

  import { computed, inject } from 'vue';

  import { MarkdownRender as UpstreamMarkdownRender } from 'markstream-vue';

  import { markdownContextKey } from '../context';
  // 标准节点类型（heading/paragraph/…）在上游走 nodeProps 分支，不会收到递归渲染插槽，
  // 因此子节点必须由 SD 显式渲染；这里复用父级渲染配置，不重新解析原始文本。
  defineOptions({ inheritAttrs: false });
  defineProps<{ nodes: BaseNode[]; customId?: string; indexKey?: string | number }>();
  const context = inject(markdownContextKey);
  const options = computed(() => {
    const {
      content: _content,
      nodes: _nodes,
      virtualScroll: _virtualScroll,
      ...rest
    } = context?.value ?? {};
    return rest;
  });
</script>
