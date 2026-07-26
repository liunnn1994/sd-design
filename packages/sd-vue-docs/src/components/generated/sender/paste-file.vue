<template>
  <div class="sender-demo">
    <sd-sender
      v-model="value"
      placeholder="复制文件或图片后，在这里粘贴"
      @paste-file="handlePasteFile"
      @submit="clear"
    >
      <template #header>
        <sd-sender-header
          v-model:open="open"
          title="待发送文件"
          :closable="files.length > 0"
          force-render
        >
          <ul v-if="files.length" class="sender-demo-files">
            <li v-for="file in files" :key="`${file.name}-${file.size}`">
              <span>{{ file.name }}</span>
              <span>{{ formatSize(file.size) }}</span>
            </li>
          </ul>
          <span v-else class="sender-demo-empty">尚未粘贴文件</span>
        </sd-sender-header>
      </template>
      <template #prefix>
        <sd-button size="small" type="text" @click="open = !open">
          文件 {{ files.length ? `(${files.length})` : '' }}
        </sd-button>
      </template>
    </sd-sender>
    <p class="sender-demo-tip">
      当剪贴板只包含文件时触发 paste-file；普通文本仍按默认粘贴行为写入输入框。
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');
  const open = ref(false);
  const files = ref<File[]>([]);

  function handlePasteFile(fileList: FileList) {
    files.value = Array.from(fileList);
    open.value = true;
  }

  function clear() {
    value.value = '';
    files.value = [];
    open.value = false;
  }

  function formatSize(size: number) {
    return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`;
  }
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 8px;
  }

  .sender-demo-files {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sender-demo-files li {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    color: var(--sd-color-text-2);
    font-size: 13px;
  }

  .sender-demo-empty,
  .sender-demo-tip {
    color: var(--sd-color-text-3);
    font-size: 13px;
  }

  .sender-demo-tip {
    margin: 0;
    line-height: 1.5;
  }
</style>
