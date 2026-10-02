<template>
  <Space direction="vertical" size="medium" fill>
    <RadioGroup v-model="policy" type="button" :options="policies" />
    <MarkdownRender :content="content" :html-policy="policy" final />
  </Space>
</template>
<script setup lang="ts">
  import type { MarkdownRenderProps } from '@sdata/web-vue';

  import { ref } from 'vue';

  import { MarkdownRender, RadioGroup, Space } from '@sdata/web-vue';
  const policy = ref<MarkdownRenderProps['htmlPolicy']>('trusted');
  const policies = [
    { label: 'safe · 安全清理', value: 'safe' },
    { label: 'trusted · 信任内容', value: 'trusted' },
    { label: 'escape · 显示源码', value: 'escape' },
  ];
  const content = [
    '<h2>临江仙·滚滚长江东逝水</h2>',
    '<p><em>明·杨慎</em> · <a href="https://example.com" title="诗词阅读示例">阅读札记</a></p>',
    '<p><strong>滚滚长江东逝水</strong>，浪花淘尽英雄。<br>是非成败转头空。青山依旧在，几度夕阳红。</p>',
    '<p>白发渔樵江渚上，惯看秋月春风。<br>一壶浊酒喜相逢。古今多少事，都付笑谈中。</p>',
    '<blockquote><p>青山依旧在，几度夕阳红。</p></blockquote>',
    '<p>批注：<mark>长江</mark>与<mark>青山</mark>形成对照；原始 HTML 中的 <code>strong</code>、<code>em</code> 和链接保留语义。</p>',
    '<hr>',
    '<button type="button">内容按钮</button>',
  ].join('\n\n');
</script>
