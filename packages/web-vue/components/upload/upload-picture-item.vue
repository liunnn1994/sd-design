<template>
  <span :class="cls">
    <DefineAction v-slot="{ action, className, label }">
      <span
        :class="[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-${className}`]"
        role="button"
        tabindex="0"
        :aria-label="label"
        @click="action"
        @keydown="onActionKeydown(action)"
      >
        <slot />
      </span>
    </DefineAction>
    <UploadProgress v-if="file.status === 'uploading'" :file="file" list-type="picture-card" />
    <template v-else>
      <component :is="uploadCtx.slots.image" v-if="uploadCtx?.slots.image" :file-item="file" />
      <img
        v-else
        :src="file.url"
        :alt="file.name"
        :loading="uploadCtx?.imageLoading || undefined"
      />
      <div :class="`${itemCls}-mask`">
        <div v-if="file.status === 'error'" :class="`${itemCls}-error-tip`">
          <span :class="[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-error`]">
            <component :is="uploadCtx.slots['error-icon']" v-if="uploadCtx?.slots['error-icon']" />
            <component
              :is="uploadCtx.customIcon.errorIcon"
              v-else-if="uploadCtx?.customIcon?.errorIcon"
            />
            <IconImageClose v-else />
          </span>
        </div>
        <div :class="`${itemCls}-operation`">
          <ReuseAction
            v-if="file.status !== 'error' && uploadCtx?.showPreviewButton"
            class-name="preview"
            :label="t('a11y.preview')"
            :action="() => uploadCtx?.onPreview(file)"
          >
            <component
              :is="uploadCtx.slots['preview-icon']"
              v-if="uploadCtx?.slots['preview-icon']"
            />
            <component
              :is="uploadCtx.customIcon.previewIcon"
              v-else-if="uploadCtx?.customIcon?.previewIcon"
            />
            <IconEye v-else />
          </ReuseAction>
          <ReuseAction
            v-if="file.status === 'init' && uploadCtx?.showStartButton"
            class-name="start"
            :label="t('upload.start')"
            :action="() => uploadCtx?.onUpload(file)"
          >
            <component :is="uploadCtx.slots['start-icon']" v-if="uploadCtx?.slots['start-icon']" />
            <component
              :is="uploadCtx.customIcon.startIcon"
              v-else-if="uploadCtx?.customIcon?.startIcon"
            />
            <IconPlayArrowFill v-else />
          </ReuseAction>
          <ReuseAction
            v-if="file.status === 'error' && uploadCtx?.showRetryButton"
            class-name="upload"
            :label="t('a11y.retryUpload')"
            :action="() => uploadCtx?.onUpload(file)"
          >
            <component :is="uploadCtx.slots['retry-icon']" v-if="uploadCtx?.slots['retry-icon']" />
            <component
              :is="uploadCtx.customIcon.retryIcon"
              v-else-if="uploadCtx?.customIcon?.retryIcon"
            />
            <IconUpload v-else />
          </ReuseAction>
          <ReuseAction
            v-if="!uploadCtx?.disabled && uploadCtx?.showRemoveButton"
            class-name="remove"
            :label="t('a11y.remove')"
            :action="() => uploadCtx?.onRemove(file)"
          >
            <component
              :is="uploadCtx.slots['remove-icon']"
              v-if="uploadCtx?.slots['remove-icon']"
            />
            <component
              :is="uploadCtx.customIcon.removeIcon"
              v-else-if="uploadCtx?.customIcon?.removeIcon"
            />
            <IconDelete v-else />
          </ReuseAction>
          <component
            :is="uploadCtx.slots['extra-button']"
            v-if="uploadCtx?.slots['extra-button']"
            v-bind="file"
          />
        </div>
      </div>
    </template>
  </span>
</template>

<script setup lang="ts">
  import { computed, inject, toRef, type PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { FileItem } from './interfaces';

  import { getPrefixCls } from '../_utils/global-config';
  import { isActivationKey } from '../_utils/keyboard';
  import IconDelete from '../icon/icon-delete';
  import IconEye from '../icon/icon-eye';
  import IconImageClose from '../icon/icon-image-close';
  import IconPlayArrowFill from '../icon/icon-play-arrow-fill';
  import IconUpload from '../icon/icon-upload';
  import { useI18n } from '../locale';
  import { uploadInjectionKey } from './context';
  import UploadProgress from './upload-progress.vue';

  defineOptions({
    name: 'UploadPictureItem',
  });

  const props = defineProps({
    file: {
      type: Object as PropType<FileItem>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const file = toRef(props, 'file');
  const { t } = useI18n();
  const prefixCls = getPrefixCls('upload-list');
  const itemCls = `${prefixCls}-picture`;
  const cls = computed(() => [
    itemCls,
    {
      [`${itemCls}-status-error`]: file.value.status === 'error',
    },
  ]);
  const uploadCtx = inject(uploadInjectionKey, undefined);
  const [DefineAction, ReuseAction] = createReusableTemplate<{
    action: () => void;
    className: string;
    label: string;
  }>();

  // 图标按钮（span）键盘激活
  const onActionKeydown = (action: (() => void) | undefined) => (event: KeyboardEvent) => {
    if (action && isActivationKey(event)) {
      event.preventDefault();
      action();
    }
  };
</script>
