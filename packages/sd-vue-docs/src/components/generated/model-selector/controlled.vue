<template>
  <div class="controlled-demo">
    <Button @click="visible = true">打开受控选择器</Button>
    <span>最近选择：{{ selected || '暂无' }}</span>
    <ModelSelectorDialog v-model:visible="visible" title="切换工作模型" @select="selected = $event">
      <ModelSelectorInput placeholder="搜索可用模型" />
      <ModelSelectorList>
        <ModelSelectorEmpty />
        <ModelSelectorGroup heading="工作区模型">
          <ModelSelectorItem value="gpt-4o">
            <ModelSelectorLogo provider="openai" />
            <ModelSelectorName>GPT-4o</ModelSelectorName>
          </ModelSelectorItem>
          <ModelSelectorItem value="claude-sonnet">
            <ModelSelectorLogo provider="anthropic" />
            <ModelSelectorName>Claude Sonnet</ModelSelectorName>
          </ModelSelectorItem>
        </ModelSelectorGroup>
      </ModelSelectorList>
    </ModelSelectorDialog>
  </div>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  import {
    Button,
    ModelSelectorDialog,
    ModelSelectorEmpty,
    ModelSelectorGroup,
    ModelSelectorInput,
    ModelSelectorItem,
    ModelSelectorList,
    ModelSelectorLogo,
    ModelSelectorName,
  } from '@sdata/web-vue';

  const visible = shallowRef(false);
  const selected = shallowRef('');
</script>

<style>
  .controlled-demo {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 280px;
  }
</style>
