<template>
  <sd-space direction="vertical" :style="{ width: '100%' }">
    <sd-upload action="/" @before-upload="beforeUpload" />
  </sd-space>
</template>

<script>
  import { Modal } from '@sdata/web-vue';

  export default {
    setup() {
      const beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
          Modal.confirm({
            title: 'beforeUpload',
            content: `确认上传 ${file.name}`,
            onOk: () => resolve(true),
            onCancel: () => reject('cancel'),
          });
        });
      };
      return {
        beforeUpload,
      };
    },
  };
</script>
