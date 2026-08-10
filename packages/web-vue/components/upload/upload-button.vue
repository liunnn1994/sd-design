<template>
  <span
    ref="dropRef"
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

  import { getPrefixCls } from '../_utils/global-config';
  import { isFunction, isPromise } from '../_utils/is';
  import Button from '../button';
  import IconPlus from '../icon/icon-plus';
  import IconUpload from '../icon/icon-upload';
  import { useI18n } from '../locale';
  import { getFiles, loopDirectory } from './utils';

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
  const dropRef = ref<HTMLElement | null>(null);
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

  function setDragEnterCount(type: 'subtract' | 'add' | 'reset') {
    if (type === 'subtract') {
      dragEnterCount.value -= 1;
    } else if (type === 'add') {
      dragEnterCount.value += 1;
    } else {
      dragEnterCount.value = 0;
    }
  }

  function handleClick(event: Event) {
    if (props.disabled) return;
    if (isFunction(props.onButtonClick)) {
      const result = props.onButtonClick(event);
      if (isPromise<FileList>(result)) {
        result.then((files) => {
          props.uploadFiles(getFiles(files));
        });
        return;
      }
    }
    inputRef.value?.click();
  }

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      props.uploadFiles(getFiles(target.files));
    }

    target.value = '';
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging.value = false;
    setDragEnterCount('reset');
    if (props.disabled) {
      return;
    }

    if (props.directory && event.dataTransfer?.items) {
      loopDirectory(event.dataTransfer.items, props.accept, (files) => {
        props.uploadFiles(files);
      });
    } else {
      const files = getFiles(event.dataTransfer?.files, props.accept);
      props.uploadFiles(props.multiple ? files : files.slice(0, 1));
    }
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    setDragEnterCount('subtract');
    if (dragEnterCount.value === 0) {
      isDragging.value = false;
      setDragEnterCount('reset');
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!props.disabled && !isDragging.value) {
      isDragging.value = true;
    }
  }
</script>
