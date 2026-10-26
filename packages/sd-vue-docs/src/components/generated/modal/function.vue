<template>
  <sd-button @click="handleClick">打开对话框</sd-button>
</template>

<script setup lang="ts">
  import { h } from 'vue';

  import { Modal, Button } from '@sdata/web-vue';

  const ModalContent = {
    setup() {
      const onClick = () => {
        Modal.info({
          title: '提示标题',
          content: '这是一条嵌套提示消息',
        });
      };

      return () =>
        h('div', { class: 'info-modal-content' }, [
          h('span', { style: 'margin-bottom: 10px;' }, '这是一条提示消息'),
          h(Button, { size: 'mini', onClick }, '打开嵌套对话框'),
        ]);
    },
  };

  const handleClick = () => {
    Modal.info({
      title: '提示标题',
      content: () => h(ModalContent),
    });
  };
</script>

<style>
  .info-modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
