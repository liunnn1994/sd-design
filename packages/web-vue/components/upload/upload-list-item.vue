<template>
  <DefineFileName>
    <component
      :is="uploadCtx.slots['file-name']"
      v-if="uploadCtx?.slots['file-name']"
      :file-item="file"
    />
    <VNodeRenderer v-else-if="customFileName" :content="customFileName" />
    <template v-else>{{ file.name }}</template>
  </DefineFileName>

  <div :class="[itemCls, `${itemCls}-${file.status}`]">
    <div :class="`${itemCls}-content`">
      <span v-if="uploadCtx?.listType === 'picture'" :class="`${itemCls}-thumbnail`">
        <component :is="uploadCtx.slots.image" v-if="uploadCtx?.slots.image" :file-item="file" />
        <img
          v-else
          :src="file.url"
          :alt="file.name"
          :loading="uploadCtx?.imageLoading || undefined"
        />
      </span>
      <div :class="`${itemCls}-name`">
        <span v-if="uploadCtx?.listType === 'text'" :class="`${itemCls}-file-icon`">
          <component
            :is="uploadCtx.slots['file-icon']"
            v-if="uploadCtx?.slots['file-icon']"
            :file-item="file"
          />
          <VNodeRenderer v-else-if="customFileIcon" :content="customFileIcon" />
          <component :is="fileIconComponent" v-else />
        </span>
        <a
          v-if="uploadCtx?.showLink && file.url"
          :class="`${itemCls}-name-link`"
          target="_blank"
          :href="file.url"
          :download="uploadCtx?.download ? file.name : undefined"
        >
          <ReuseFileName />
        </a>
        <span v-else :class="`${itemCls}-name-text`" @click="uploadCtx?.onPreview(file)">
          <ReuseFileName />
        </span>
        <Tooltip v-if="file.status === 'error'" :content="t('upload.error')">
          <span :class="[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-error`]">
            <component :is="uploadCtx.slots['error-icon']" v-if="uploadCtx?.slots['error-icon']" />
            <component
              :is="uploadCtx.customIcon.errorIcon"
              v-else-if="uploadCtx?.customIcon?.errorIcon"
            />
            <IconExclamationCircleFill v-else />
          </span>
        </Tooltip>
      </div>
      <UploadProgress :file="file" :list-type="listType" />
    </div>
    <span v-if="uploadCtx?.showRemoveButton" :class="`${itemCls}-operation`">
      <span
        role="button"
        tabindex="0"
        :aria-label="t('a11y.remove')"
        @click="uploadCtx?.onRemove?.(file)"
        @keydown="onRemoveKeydown"
      >
        <IconHover>
          <span :class="[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-remove`]">
            <component
              :is="uploadCtx.slots['remove-icon']"
              v-if="uploadCtx?.slots['remove-icon']"
            />
            <component
              :is="uploadCtx.customIcon.removeIcon"
              v-else-if="uploadCtx?.customIcon?.removeIcon"
            />
            <IconDelete v-else />
          </span>
        </IconHover>
      </span>
    </span>
    <component
      :is="uploadCtx.slots['extra-button']"
      v-if="uploadCtx?.slots['extra-button']"
      :file-item="file"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, toRef, type PropType, type VNodeChild } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { FileItem, ListType } from './interfaces';

  import IconHover from '../_components/icon-hover.vue';
  import { getPrefixCls } from '../_utils/global-config';
  import { isActivationKey } from '../_utils/keyboard';
  import IconDelete from '../icon/icon-delete';
  import IconExclamationCircleFill from '../icon/icon-exclamation-circle-fill';
  import IconFile from '../icon/icon-file';
  import IconFileAudio from '../icon/icon-file-audio';
  import IconFileImage from '../icon/icon-file-image';
  import IconFilePdf from '../icon/icon-file-pdf';
  import IconFileVideo from '../icon/icon-file-video';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';
  import { uploadInjectionKey } from './context';
  import UploadProgress from './upload-progress.vue';

  defineOptions({
    name: 'UploadListItem',
  });

  const props = defineProps({
    file: {
      type: Object as PropType<FileItem>,
      required: true,
    },
    listType: {
      type: String as PropType<ListType>,
      required: true,
    },
  });

  const file = toRef(props, 'file');
  const prefixCls = getPrefixCls('upload-list');
  const itemCls = `${prefixCls}-item`;
  const { t } = useI18n();
  const uploadCtx = inject(uploadInjectionKey, undefined);
  const [DefineFileName, ReuseFileName] = createReusableTemplate();
  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;
  const customFileIcon = computed(() => uploadCtx?.customIcon?.fileIcon?.(file.value));
  const customFileName = computed(() => uploadCtx?.customIcon?.fileName?.(file.value));
  const fileIconComponent = computed(() => {
    let type = '';
    if (file.value.file?.type) {
      type = file.value.file.type;
    } else {
      const extension = file.value.name?.split('.')[1] ?? '';
      if (['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp'].includes(extension)) {
        type = 'image';
      } else if (['mp4', 'm2v', 'mkv', 'm4v', 'mov'].includes(extension)) {
        type = 'video';
      } else if (['mp3', 'wav', 'wmv', 'm4a', 'acc', 'flac'].includes(extension)) {
        type = 'audio';
      }
    }

    if (type.includes('image')) return IconFileImage;
    if (type.includes('pdf')) return IconFilePdf;
    if (type.includes('audio')) return IconFileAudio;
    if (type.includes('video')) return IconFileVideo;
    return IconFile;
  });

  function onRemoveKeydown(event: KeyboardEvent) {
    if (isActivationKey(event)) {
      event.preventDefault();
      uploadCtx?.onRemove?.(file.value);
    }
  }
</script>
