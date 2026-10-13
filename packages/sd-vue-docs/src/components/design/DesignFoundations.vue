<script setup lang="ts">
  import { shallowRef } from 'vue';

  import {
    Button,
    Collapse,
    CollapseItem,
    Copy,
    Input,
    Sender,
    Tabs,
    TabPane,
  } from '@sdata/web-vue';

  const value = shallowRef('');
  const sizes = ['mini', 'small', 'medium', 'large'] as const;
</script>

<template>
  <div class="design-foundations">
    <section aria-label="控件尺寸">
      <div v-for="size in sizes" :key="size" class="design-foundations-row">
        <Button type="primary" :size="size">{{ size }}</Button>
        <Input :size="size" :placeholder="`${size} 输入框`" />
      </div>
    </section>
    <section aria-label="胶囊导航">
      <Tabs type="capsule" animation>
        <TabPane key="chat" title="对话">用清晰的内容层级组织消息。</TabPane>
        <TabPane key="projects" title="项目">用轻量的滑块表达当前位置。</TabPane>
        <TabPane key="artifacts" title="产物">宽度随实际标题变化。</TabPane>
      </Tabs>
    </section>
    <section aria-label="输入与思考">
      <Sender v-model="value" placeholder="描述你希望完成的任务" @submit="value = ''" />
      <Collapse :default-active-key="['thinking']">
        <CollapseItem key="thinking" header="思考过程">
          折叠容器使用 Grid 在 0fr 与 1fr 之间过渡；内容变化时无需测量并写入固定高度。
        </CollapseItem>
      </Collapse>
    </section>
    <section aria-label="复制反馈">
      <Copy content="使用 SD Design 的语义 token 定制界面">复制示例文本</Copy>
    </section>
  </div>
</template>

<style lang="scss" scoped>
  .design-foundations {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    color: var(--sd-color-text-1);
    background: var(--sd-color-bg-1);
    border-radius: var(--sd-border-radius-large);

    section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }
  }

  .design-foundations-row {
    display: flex;
    gap: 12px;
    align-items: center;

    .sd-btn {
      flex: none;
      width: 88px;
    }
  }
</style>
