<template>
  <div class="sender-demo">
    <div class="sender-demo-toolbar">
      <div class="sender-demo-agents">
        <sd-button
          v-for="item in agents"
          :key="item.key"
          size="small"
          :type="activeAgent === item.key ? 'primary' : 'outline'"
          @click="activeAgent = item.key"
        >
          {{ item.label }}
        </sd-button>
      </div>
      <sd-sender-switch v-model="deepThinking">
        <template #checked>深度思考：开</template>
        <template #unchecked>深度思考：关</template>
      </sd-sender-switch>
    </div>
    <sd-sender
      :key="activeAgent"
      :slot-config="currentAgent.slotConfig"
      :skill="currentAgent.skill"
      :loading="loading"
      :auto-size="{ minRows: 2, maxRows: 6 }"
      @submit="handleSubmit"
      @cancel="loading = false"
    >
      <template #footer>
        <span class="sender-demo-footer">
          当前模式：{{ currentAgent.label }}{{ deepThinking ? ' · 深度思考' : '' }}
        </span>
      </template>
    </sd-sender>
    <sd-alert v-if="lastMessage" :type="loading ? 'info' : 'success'">
      {{ loading ? `正在生成：${lastMessage}` : '已停止生成' }}
    </sd-alert>
  </div>
</template>

<script setup lang="ts">
  import type { SenderSkill, SenderSlotConfig } from '@sdata/web-vue';

  import { computed, ref } from 'vue';

  interface Agent {
    key: string;
    label: string;
    skill: SenderSkill;
    slotConfig: SenderSlotConfig[];
  }

  const agents: Agent[] = [
    {
      key: 'writing',
      label: '写作助手',
      skill: { title: '写作助手', value: 'writing', closable: true },
      slotConfig: [
        { type: 'text', value: '请写一篇关于 ' },
        {
          type: 'select',
          key: 'topic',
          props: { options: ['旅行', '阅读', '科技'], defaultValue: '旅行' },
        },
        { type: 'text', value: ' 的文章，篇幅约 ' },
        {
          type: 'content',
          key: 'length',
          props: { defaultValue: '800 字', placeholder: '输入篇幅' },
        },
      ],
    },
    {
      key: 'search',
      label: '深度搜索',
      skill: { title: '深度搜索', value: 'search', closable: true },
      slotConfig: [
        { type: 'text', value: '请搜索 ' },
        {
          type: 'input',
          key: 'keyword',
          props: { defaultValue: 'Vue 生态', placeholder: '输入关键词' },
        },
        { type: 'text', value: ' 的最新资料，并整理为要点。' },
      ],
    },
    {
      key: 'code',
      label: '代码助手',
      skill: { title: '代码助手', value: 'code', closable: true },
      slotConfig: [
        { type: 'text', value: '请使用 ' },
        {
          type: 'select',
          key: 'language',
          props: { options: ['TypeScript', 'Vue', 'Node.js'], defaultValue: 'Vue' },
        },
        { type: 'text', value: ' 实现一个可复用示例。' },
      ],
    },
  ];

  const activeAgent = ref('writing');
  const deepThinking = ref(true);
  const loading = ref(false);
  const lastMessage = ref('');
  const currentAgent = computed<Agent>(
    () => agents.find((item) => item.key === activeAgent.value) ?? agents[0]!,
  );

  function handleSubmit(value: string) {
    lastMessage.value = value;
    loading.value = true;
  }
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 12px;
  }

  .sender-demo-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .sender-demo-agents {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sender-demo-footer {
    color: var(--sd-color-text-3);
    font-size: 12px;
  }
</style>
