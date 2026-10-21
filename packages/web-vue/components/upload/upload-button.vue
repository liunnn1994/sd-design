<template>
  <span
    :class="cls"
    @click="handleClick"
    @dragenter="setDragEnterCount('add')"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <input
      ref="inputRef"
      type="file"
      style="display: none"
      :disabled="disabled"
      :accept="accept"
      :multiple="multiple"
      :webkitdirectory="directory ? 'webkitdirectory' : undefined"
      @change="handleInputChange"
    />
    <span v-if="$slots.default">
      <slot />
    </span>
    <div v-else-if="listType === 'picture-card'" :class="`${prefixCls}-picture-card`">
      <div :class="`${prefixCls}-picture-card-text`">
        <IconPlus />
      </div>
      <div v-if="tip" :class="`${prefixCls}-tip`">{{ tip }}</div>
    </div>
    <div
      v-else-if="draggable"
      :class="[
        `${prefixCls}-drag`,
        {
          [`${prefixCls}-drag-active`]: isDragging,
        },
      ]"
    >
      <div>
        <IconPlus />
      </div>
      <div :class="`${prefixCls}-drag-text`">
        {{ isDragging ? t('upload.dragHover') : t('upload.drag') }}
      </div>
      <div v-if="tip" :class="`${prefixCls}-tip`">{{ tip }}</div>
    </div>
    <Button v-else type="primary" :disabled="disabled">
      <template #icon>
        <IconUpload />
      </template>
      {{ t('upload.buttonText') }}
    </Button>
  </span>
</template>

<script setup lang="ts">
  import { computed, ref, type PropType } from 'vue';

  import { createUploadInput } from '@sdata/web-core/upload/input';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconPlus from '../icon/icon-plus';
  import IconUpload from '../icon/icon-upload';
  import { useI18n } from '../locale';

  defineOptions({
    name: 'UploadButton',
  });

  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
    directory: {
      type: Boolean,
      default: false,
    },
    accept: String,
    listType: String,
    tip: String,
    draggable: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    uploadFiles: {
      type: Function as PropType<(files: File[]) => void>,
      required: true,
    },
    hide: Boolean,
    onButtonClick: {
      type: Function as PropType<(event: Event) => Promise<FileList> | void>,
    },
  });

  const prefixCls = getPrefixCls('upload');
  const { t } = useI18n();
  const isDragging = ref(false);
  const inputRef = ref<HTMLInputElement | null>(null);
  const dragEnterCount = ref(0); // the number of times ondragenter was triggered
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-type-picture-card`]: props.listType === 'picture-card',
      [`${prefixCls}-draggable`]: props.draggable,
      [`${prefixCls}-disabled`]: props.disabled,
      [`${prefixCls}-hide`]: props.hide,
    },
  ]);

  const {
    setDragEnterCount,
    handleClick,
    handleInputChange,
    handleDrop,
    handleDragLeave,
    handleDragOver,
  } = createUploadInput({
    options: props,
    getDragging: () => isDragging.value,
    setDragging: (value) => {
      isDragging.value = value;
    },
    getDragEnterCount: () => dragEnterCount.value,
    setDragEnterCount: (value) => {
      dragEnterCount.value = value;
    },
    clickInput: () => inputRef.value?.click(),
  });
</script>
