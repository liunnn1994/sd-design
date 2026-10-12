<template>
  <div>
    <sd-space>
      <sd-button @click="handleInfo">Info Message</sd-button>
      <sd-button @click="handleSuccess" status="success">Success Message </sd-button>
      <sd-button @click="handleWarning" status="warning">Warning Message </sd-button>
      <sd-button @click="handleError" status="danger">Error Message</sd-button>
    </sd-space>
  </div>
  <div class="sd:mt-5">
    <sd-space>
      <sd-button @click="handleNormal">Normal Message</sd-button>
      <sd-button @click="handleNormalWithIcon">Normal Message With Icon </sd-button>
      <sd-button @click="handleLoading" type="primary">Loading Message </sd-button>
    </sd-space>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue';

  import { Message } from '@sdata/web-vue';
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon/index.js';

  const renderIcon = () => h(IconExclamationCircleFill);
  const handleInfo = () => Message.info('This is an info message!');
  const handleSuccess = () => Message.success('This is a success message!');
  const handleWarning = () => Message.warning('This is a warning message!');
  const handleError = () => Message.error('This is an error message!');
  const handleNormal = () => Message.normal('This is a normal message!');
  const handleNormalWithIcon = () =>
    Message.normal({ content: 'This is a normal message!', icon: renderIcon });
  const handleLoading = () => Message.loading('This is a loading message!');
</script>
