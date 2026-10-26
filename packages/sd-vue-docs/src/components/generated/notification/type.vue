<template>
  <sd-space>
    <sd-button type="primary" @click="showInfo"> 信息 </sd-button>
    <sd-button type="primary" status="success" @click="showSuccess"> 成功 </sd-button>
    <sd-button type="primary" status="warning" @click="showWarning"> 警告 </sd-button>
    <sd-button type="primary" status="danger" @click="showError"> 错误 </sd-button>
    <sd-button type="secondary" @click="showNormal"> 常规 </sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { getCurrentInstance } from 'vue';

  import { Notification } from '@sdata/web-vue';

  interface NotificationApi {
    info: (config: string | { content: string; showIcon?: boolean }) => void;
    success: (content: string) => void;
    warning: (content: string) => void;
    error: (content: string) => void;
  }

  type NotificationProxy = {
    $notification?: NotificationApi;
  };

  const instance = getCurrentInstance();
  const proxy = instance?.proxy as NotificationProxy | undefined;

  const showInfo = () => proxy?.$notification?.info('这是一条提示消息！');
  const showSuccess = () => proxy?.$notification?.success('操作成功！');
  const showWarning = () => proxy?.$notification?.warning('请注意检查操作内容！');
  const showError = () => proxy?.$notification?.error('这是一条错误消息！');
  const showNormal = () =>
    proxy?.$notification?.info({
      content: '这是一条错误消息！',
      showIcon: false,
    });
</script>
