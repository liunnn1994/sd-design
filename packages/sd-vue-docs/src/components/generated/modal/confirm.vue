<template>
  <sd-button type="primary" @click="handleClick">确认</sd-button>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { Modal } from '@sdata/web-vue';

  const handleClick = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除所选的 3 个项目吗？点击删除按钮后，项目将立即删除，此操作无法撤销。',
      okButtonProps: {
        status: 'danger',
      },
    });
  };
</script>
