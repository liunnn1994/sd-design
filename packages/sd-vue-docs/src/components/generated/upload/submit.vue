<template>
  <div>
    <sd-upload action="/" :auto-upload="false" ref="uploadRef" @change="onChange" multiple>
      <template #upload-button>
        <sd-space>
          <sd-button> 选择文件</sd-button>
          <sd-button type="primary" @click="submit"> 开始上传</sd-button>
          <sd-button type="primary" @click="submitOne"> 仅上传一个文件 </sd-button>
        </sd-space>
      </template>
    </sd-upload>
  </div>
</template>

<script setup lang="ts">
  import type { FileItem, UploadInstance } from '@sdata/web-vue';

  import { ref } from 'vue';

  const uploadRef = ref<UploadInstance | null>(null);
  const files = ref<FileItem[]>([]);

  const submitOne = (e: Event) => {
    e.stopPropagation();
    console.log(files.value);
    uploadRef.value?.submit(files.value.find((x) => x.status === 'init'));
  };

  const submit = (e: Event) => {
    e.stopPropagation();
    uploadRef.value?.submit();
  };

  const onChange = (fileList: FileItem[]) => {
    files.value = fileList;
  };
</script>
