<template>
  <div>
    <sd-space>
      <sd-button @click="handleInfo">提示消息</sd-button>
      <sd-button @click="handleSuccess" status="success">成功消息 </sd-button>
      <sd-button @click="handleWarning" status="warning">警告消息 </sd-button>
      <sd-button @click="handleError" status="danger">错误消息</sd-button>
    </sd-space>
  </div>
  <div class="sd:mt-5">
    <sd-space>
      <sd-button @click="handleNormal">普通消息</sd-button>
      <sd-button @click="handleNormalWithIcon">带图标的普通消息 </sd-button>
      <sd-button @click="handleLoading" type="primary">加载消息 </sd-button>
    </sd-space>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue';

  import { Message } from '@sdata/web-vue';
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon/index.js';

  const renderIcon = () => h(IconExclamationCircleFill);
  const handleInfo = () => Message.info('这是一条提示消息！');
  const handleSuccess = () => Message.success('操作成功！');
  const handleWarning = () => Message.warning('请注意检查操作内容！');
  const handleError = () => Message.error('这是一条错误消息！');
  const handleNormal = () => Message.normal('这是一条普通消息！');
  const handleNormalWithIcon = () =>
    Message.normal({ content: '这是一条普通消息！', icon: renderIcon });
  const handleLoading = () => Message.loading('正在加载，请稍候…');
</script>
