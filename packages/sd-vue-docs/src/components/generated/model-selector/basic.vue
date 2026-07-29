<template>
  <div class="demo-row">
    <ModelSelector v-model:visible="visible" @select="selected = $event">
      <ModelSelectorTrigger>
        {{ currentModel?.name ?? '选择模型' }}
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="搜索模型或服务商" />
        <ModelSelectorList>
          <ModelSelectorEmpty />
          <ModelSelectorGroup heading="推荐模型">
            <ModelSelectorItem
              v-for="model in models"
              :key="model.id"
              :value="model.id"
              :label="model.name"
              :keywords="[model.providerName]"
              :selected="selected === model.id"
            >
              <ModelSelectorLogo :provider="model.provider" />
              <ModelSelectorName>{{ model.name }}</ModelSelectorName>
              <IconCheck v-if="selected === model.id" />
            </ModelSelectorItem>
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
    <span>当前模型：{{ currentModel?.name ?? '未选择' }}</span>
  </div>
</template>

<script setup lang="ts">
  import { computed, shallowRef } from 'vue';

  import {
    ModelSelector,
    ModelSelectorContent,
    ModelSelectorEmpty,
    ModelSelectorGroup,
    ModelSelectorInput,
    ModelSelectorItem,
    ModelSelectorList,
    ModelSelectorLogo,
    ModelSelectorName,
    ModelSelectorTrigger,
  } from '@sdata/web-vue';
  import { IconCheck } from '@sdata/web-vue/es/icon/index.js';

  const models = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', providerName: 'OpenAI' },
    {
      id: 'claude-sonnet',
      name: 'Claude Sonnet',
      provider: 'anthropic',
      providerName: 'Anthropic',
    },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', providerName: 'Google' },
  ] as const;

  const visible = shallowRef(false);
  const selected = shallowRef('gpt-4o');
  const currentModel = computed(() => models.find((model) => model.id === selected.value));
</script>

<style>
  .demo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 280px;
  }
</style>
