<template>
  <sd-space direction="vertical" fill>
    <sd-input v-model="lockKey" aria-label="上传互斥标识" placeholder="输入业务互斥标识" />
    <sd-upload :lock-key="lockKey" :custom-request="request" @error="handleError" />
    <div>在另一个标签页打开本页，使用相同标识选文件；模拟上传持续 5 秒。</div>
    <div v-if="message" role="status">{{ message }}</div>
  </sd-space>
</template>

<script setup lang="ts">
  import type { FileItem, RequestOption, UploadRequest } from '@sdata/web-vue';

  import { ref } from 'vue';

  const lockKey = ref('upload-demo');
  const message = ref('');
  const request = (option: RequestOption): UploadRequest => {
    message.value = '';
    // 示例仅模拟请求，实际接入时替换为可取消的上传请求。
    const timer = setTimeout(() => option.onSuccess(), 5000);
    return { abort: () => clearTimeout(timer) };
  };
  const handleError = (file: FileItem) => {
    const response = file.response;
    if (typeof response === 'object' && response !== null && 'code' in response) {
      if (response.code === 'UPLOAD_LOCK_BUSY') {
        message.value = '相同标识的上传正在进行，请结束后手动重试。';
      } else if (response.code === 'UPLOAD_LOCK_UNSUPPORTED') {
        message.value = '当前环境不支持上传互斥，请在支持 Web Locks 的 HTTPS 环境中使用。';
      }
    }
  };
</script>
