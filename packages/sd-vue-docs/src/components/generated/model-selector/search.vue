<template>
  <ModelSelector :close-on-select="false">
    <ModelSelectorTrigger>打开可搜索模型列表</ModelSelectorTrigger>
    <ModelSelectorContent :mask-closable="false">
      <ModelSelectorInput placeholder="输入模型、厂商或能力关键词" />
      <ModelSelectorList>
        <ModelSelectorEmpty>没有找到符合条件的模型</ModelSelectorEmpty>
        <ModelSelectorGroup v-for="group in groups" :key="group.name" :heading="group.name">
          <ModelSelectorItem
            v-for="model in group.models"
            :key="model.id"
            :value="model.id"
            :label="model.name"
            :keywords="model.keywords"
          >
            <ModelSelectorLogo :provider="model.provider" />
            <ModelSelectorName>{{ model.name }}</ModelSelectorName>
          </ModelSelectorItem>
        </ModelSelectorGroup>
      </ModelSelectorList>
    </ModelSelectorContent>
  </ModelSelector>
</template>

<script setup lang="ts">
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

  const groups = [
    {
      name: '通用模型',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', keywords: ['OpenAI', '多模态'] },
        {
          id: 'claude-sonnet',
          name: 'Claude Sonnet',
          provider: 'anthropic',
          keywords: ['Anthropic', '长文本'],
        },
      ],
    },
    {
      name: '国内模型',
      models: [
        { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'deepseek', keywords: ['推理'] },
        { id: 'qwen-max', name: 'Qwen Max', provider: 'alibaba-cn', keywords: ['阿里云', '通义'] },
      ],
    },
  ];
</script>
