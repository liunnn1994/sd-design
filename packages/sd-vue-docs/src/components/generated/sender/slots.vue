<template>
  <div class="sender-demo">
    <sd-sender
      ref="senderRef"
      :slot-config="slotConfig"
      :skill="skill"
      placeholder="补充查询条件"
      @change="handleChange"
      @submit="handleSubmit"
    />
    <div class="sender-demo-actions">
      <sd-button size="small" @click="insertTone">插入语气</sd-button>
      <sd-button size="small" type="text" @click="senderRef?.clear()">清空</sd-button>
    </div>
    <sd-alert type="info"> 当前结果：{{ currentValue || '暂无内容' }} </sd-alert>
  </div>
</template>

<script setup lang="ts">
  import type {
    SenderInstance,
    SenderResolvedSlotConfig,
    SenderSkill,
    SenderSlotConfig,
  } from '@sdata/web-vue';

  import { ref } from 'vue';

  const senderRef = ref<SenderInstance>();
  const currentValue = ref('');
  const skill: SenderSkill = {
    title: '旅行助手',
    value: 'travel',
    closable: true,
  };
  const slotConfig: SenderSlotConfig[] = [
    { type: 'text', value: '帮我规划 ' },
    {
      type: 'select',
      key: 'city',
      props: {
        options: ['杭州', '上海', '北京'],
        defaultValue: '杭州',
        placeholder: '目的地',
      },
    },
    { type: 'text', value: ' 的 ' },
    {
      type: 'input',
      key: 'days',
      props: { defaultValue: '3 天', placeholder: '行程天数' },
    },
    {
      type: 'content',
      key: 'preference',
      props: { defaultValue: '亲子游', placeholder: '偏好' },
      formatResult: (value) => `，偏好 ${String(value)}`,
    },
  ];

  function handleChange(
    value: string,
    _event: Event | undefined,
    _config: SenderResolvedSlotConfig[],
    _skill: SenderSkill | undefined,
  ) {
    currentValue.value = value;
  }

  function handleSubmit(value: string) {
    currentValue.value = value;
  }

  function insertTone() {
    senderRef.value?.insert(
      [{ type: 'tag', key: `tone-${Date.now()}`, props: { label: '简洁', value: '，简洁地' } }],
      'end',
    );
  }
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 12px;
  }

  .sender-demo-actions {
    display: flex;
    gap: 8px;
  }
</style>
