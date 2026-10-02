<template>
  <Space direction="vertical" size="medium" fill>
    <Space direction="vertical" size="small" fill>
      <Space>
        <RadioGroup v-model="engine" size="mini">
          <Radio value="sd">SD 封装</Radio>
          <Radio value="upstream">上游原生</Radio>
        </RadioGroup>
        <Button size="mini" @click="scrollToEnd">跳到末尾</Button>
        <Button size="mini" @click="measure">重新测量</Button>
      </Space>
      <Text type="secondary">
        300 段长文档（标题、段落、列表与代码块）。两种引擎的挂载节点数应保持一致：SD
        的节点适配不会让 上游退化为逐个列表项创建嵌套渲染器，虚拟化与节点预算因此原样生效。
      </Text>
    </Space>

    <div ref="scrollRoot" class="long-doc-scroll">
      <component
        :is="engine === 'sd' ? MarkdownRender : UpstreamMarkdownRender"
        ref="renderer"
        :content="content"
        final
        node-virtual="auto"
        :max-live-nodes="maxLiveNodes"
        :live-node-buffer="20"
        :virtual-scroll="virtualScroll"
        @virtual-state-change="onStateChange"
      />
    </div>

    <div class="long-doc-metrics">
      <div
        ><Text type="secondary">文档节点总数</Text
        ><strong>{{ metrics?.nodeCount ?? '—' }}</strong></div
      >
      <div
        ><Text type="secondary">实际挂载节点</Text><strong>{{ dom.slots }}</strong></div
      >
      <div
        ><Text type="secondary">已测量 / 估算</Text
        ><strong
          >{{ metrics?.measuredCount ?? 0 }} / {{ metrics?.estimatedCount ?? 0 }}</strong
        ></div
      >
      <div
        ><Text type="secondary">文档总高度</Text
        ><strong>{{ Math.round(metrics?.totalHeight ?? 0) }} px</strong></div
      >
      <div
        ><Text type="secondary">DOM 元素总数</Text><strong>{{ dom.elements }}</strong></div
      >
      <div :class="dom.nestedRenderers > 0 ? 'long-doc-metrics__bad' : 'long-doc-metrics__good'">
        <Text type="secondary">嵌套渲染器</Text><strong>{{ dom.nestedRenderers }}</strong>
      </div>
    </div>
  </Space>
</template>

<script setup lang="ts">
  import type { MarkstreamVirtualMetrics } from '@sdata/web-vue';

  import { computed, nextTick, onMounted, ref, shallowRef } from 'vue';

  import {
    Button,
    MarkdownRender,
    Radio,
    RadioGroup,
    Space,
    TypographyText as Text,
    UpstreamMarkdownRender,
  } from '@sdata/web-vue';

  type Engine = 'sd' | 'upstream';
  const SECTION_COUNT = 300;
  const engine = ref<Engine>('sd');
  const maxLiveNodes = 80;
  const scrollRoot = ref<HTMLElement | null>(null);
  // 同时承载 SD 封装与上游原生的实例类型，只用到共有的指标方法。
  const renderer = shallowRef<{
    getVirtualMetrics: () => MarkstreamVirtualMetrics;
    forceMeasure: () => Promise<MarkstreamVirtualMetrics>;
  } | null>(null);
  const metrics = shallowRef<MarkstreamVirtualMetrics | null>(null);
  const dom = ref({ slots: 0, elements: 0, nestedRenderers: 0 });

  const virtualScroll = computed(() =>
    scrollRoot.value
      ? ({ enabled: true, sessionKey: 'markdown-long-doc', scrollRoot: scrollRoot.value } as const)
      : undefined,
  );

  const content = Array.from({ length: SECTION_COUNT }, (_, index) => {
    const parts = [
      `## 第 ${index + 1} 节 滚滚长江东逝水`,
      `段落 ${index + 1}：**浪花淘尽英雄**，是*非成败转头空*，含 \`inline\` 与 [链接](https://example.com/${index + 1})。`,
      `- 项目 ${index + 1}-A`,
      `- 项目 ${index + 1}-B`,
    ];
    // 每 25 节插入一个代码块，让重节点也参与虚拟化与测量。
    if (index % 25 === 24) parts.push('```js\nconst section = ' + (index + 1) + ';\n```');
    return parts.join('\n\n');
  }).join('\n\n');

  function readDom() {
    const root = scrollRoot.value;
    if (!root) return;
    dom.value = {
      slots: root.querySelectorAll('.node-slot').length,
      elements: root.querySelectorAll('*').length,
      // 出现嵌套渲染器即表示上游的行内快路径被绕过。
      nestedRenderers: root.querySelectorAll('.markdown-renderer .markdown-renderer').length,
    };
  }
  function refreshMetrics() {
    metrics.value = renderer.value?.getVirtualMetrics() ?? null;
    void nextTick(readDom);
  }
  async function measure() {
    metrics.value = (await renderer.value?.forceMeasure()) ?? null;
    await nextTick();
    readDom();
  }
  function onStateChange(state: { metrics: MarkstreamVirtualMetrics }) {
    metrics.value = state.metrics;
    void nextTick(readDom);
  }
  function scrollToEnd() {
    const root = scrollRoot.value;
    if (root) root.scrollTop = root.scrollHeight;
    window.setTimeout(measure, 120);
  }

  onMounted(() => {
    refreshMetrics();
    scrollRoot.value?.addEventListener('scroll', refreshMetrics, { passive: true });
  });
</script>

<style scoped lang="scss">
  .long-doc-scroll {
    height: 420px;
    overflow: auto;
    padding: 16px;
    border: 1px solid var(--sd-color-border-2);
    border-radius: var(--sd-border-radius-medium);
  }

  .long-doc-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 12px 16px;
    font-size: 12px;
    border: 1px solid var(--sd-color-border-2);
    border-radius: var(--sd-border-radius-medium);

    > div {
      display: flex;
      gap: 6px;
      align-items: baseline;
    }

    strong {
      font-variant-numeric: tabular-nums;
    }

    &__good strong {
      color: var(--sd-color-success-6);
    }

    &__bad strong {
      color: var(--sd-color-danger-6);
    }
  }
</style>
