<script setup lang="ts">
  import { getCurrentInstance } from 'vue';

  import { Message, Notification } from '@sdata/web-vue';

  const context = getCurrentInstance()!.appContext;
  const showMessage = (deduplicate?: boolean) =>
    Message.success({ content: '保存成功', deduplicate }, context);
  const showNotification = (deduplicate?: boolean) =>
    Notification.success({ title: '保存结果', content: '保存成功', deduplicate }, context);
</script>

<template>
  <sd-config-provider global :message="{ deduplicate: true }" :notification="{ deduplicate: true }">
    <sd-space wrap>
      <sd-button @click="showMessage()">去重消息</sd-button>
      <sd-button @click="showMessage(false)">重复消息</sd-button>
      <sd-button @click="showNotification()">去重通知</sd-button>
      <sd-button @click="showNotification(false)">重复通知</sd-button>
    </sd-space>
  </sd-config-provider>
</template>
