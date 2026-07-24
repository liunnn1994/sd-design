<template>
  <sd-json-form v-model="formState" :adapter="A2UI_0_9_1" :schemas="components" />

  <sd-space wrap>
    <sd-tag color="blue">{{ formState.contact.name || '未填写姓名' }}</sd-tag>
    <sd-tag color="green">{{ formState.contact.channels.join('、') || '未选择渠道' }}</sd-tag>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { A2UI_0_9_1, type JsonFormA2UI_0_9_1ComponentNode } from '@sdata/web-vue';

  const formState = ref({
    contact: {
      name: '',
      subscribed: false,
      channels: [] as string[],
    },
  });

  const components: JsonFormA2UI_0_9_1ComponentNode[] = [
    {
      id: 'name-field',
      component: 'TextField',
      label: '姓名',
      value: { path: '/contact/name' },
      variant: 'shortText',
    },
    {
      id: 'root',
      component: 'Card',
      child: 'form-column',
    },
    {
      id: 'form-column',
      component: 'Column',
      children: ['name-field', 'subscribed-field', 'channel-field'],
    },
    {
      id: 'subscribed-field',
      component: 'CheckBox',
      label: '订阅通知',
      value: { path: '/contact/subscribed' },
    },
    {
      id: 'channel-field',
      component: 'ChoicePicker',
      label: '首选渠道',
      variant: 'mutuallyExclusive',
      options: [
        { label: '短信', value: 'sms' },
        { label: '邮件', value: 'email' },
      ],
      value: { path: '/contact/channels' },
    },
  ];
</script>

<style scoped>
  :deep(.sd-space) {
    margin-top: 16px;
  }
</style>
