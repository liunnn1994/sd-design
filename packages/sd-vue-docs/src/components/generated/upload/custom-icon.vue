<template>
  <div>
    <div class="sd:mb-5">
      <sd-space>
        <span>类型： </span>
        <sd-radio-group v-model="type">
          <sd-radio value="text">文本</sd-radio>
          <sd-radio value="picture">图片</sd-radio>
          <sd-radio value="picture-card">图片卡片</sd-radio>
        </sd-radio-group>
      </sd-space>
    </div>
    <sd-upload
      action="/"
      :list-type="type"
      :default-file-list="[
        {
          uid: '-1',
          name: 'ice.png',
          url: '//picsum.photos/1000/1000',
        },
        {
          uid: '-3',
          name: 'light.png',
          url: '//picsum.photos/1000/1000',
        },
      ]"
      :custom-icon="getCustomIcon()"
    />
  </div>
</template>

<script setup lang="ts">
  import type { CustomIcon, FileItem } from '@sdata/web-vue';

  import { h, ref } from 'vue';

  import {
    IconClose,
    IconFaceFrownFill,
    IconFileAudio,
    IconUpload,
  } from '@sdata/web-vue/es/icon/index.js';

  const type = ref<'text' | 'picture' | 'picture-card'>('text');
  const getCustomIcon = (): CustomIcon => {
    return {
      retryIcon: () => h(IconUpload),
      cancelIcon: () => h(IconClose),
      fileIcon: () => h(IconFileAudio),
      removeIcon: () => h(IconClose),
      errorIcon: () => h(IconFaceFrownFill),
      fileName: (file: FileItem) => {
        return `文件名： ${file.name}`;
      },
    };
  };
</script>
