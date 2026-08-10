<template>
  <TransitionGroup tag="div" :class="cls">
    <template v-for="(fileItem, index) in fileList" :key="`item-${index}`">
      <slot v-if="$slots['upload-item']" name="upload-item" :file-item="fileItem" :index="index" />
      <UploadPictureItem v-else-if="listType === 'picture-card'" :file="fileItem" />
      <UploadListItem v-else :file="fileItem" :list-type="listType" />
    </template>
    <slot v-if="listType === 'picture-card'" name="upload-button" />
  </TransitionGroup>
</template>

<script setup lang="ts">
  import { computed, type PropType } from 'vue';

  import type { FileItem, ListType } from './interfaces';

  import { getPrefixCls } from '../_utils/global-config';
  import UploadListItem from './upload-list-item';
  import UploadPictureItem from './upload-picture-item.vue';

  defineOptions({ name: 'UploadList' });

  const props = defineProps({
    fileList: {
      type: Array as PropType<FileItem[]>,
      required: true,
    },
    listType: {
      type: String as PropType<ListType>,
      required: true,
    },
  });

  const prefixCls = getPrefixCls('upload');
  const cls = computed(() => [`${prefixCls}-list`, `${prefixCls}-list-type-${props.listType}`]);
</script>
