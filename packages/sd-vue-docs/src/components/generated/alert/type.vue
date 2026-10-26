<template>
  <sd-row :gutter="[40, 20]">
    <sd-col :span="12">
      <sd-alert>这是一条信息提示。</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="success">这是一条成功提示。</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="warning">这是一条警告提示。</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="error">这是一条错误提示。</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="normal">
        <template #icon>
          <icon-exclamation-circle-fill />
        </template>
        这是一条普通提示。
      </sd-alert>
    </sd-col>
  </sd-row>
</template>

<script setup lang="ts">
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon/index.js';
</script>
