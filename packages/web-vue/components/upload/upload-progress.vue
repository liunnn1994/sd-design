<template>
  <span :class="prefixCls">
    <Progress
      v-if="file.status === 'init' || file.status === 'uploading'"
      type="circle"
      size="mini"
      :show-text="false"
      :status="getProgressStatus(file.status)"
      :percent="file.percent"
    />

    <span
      v-if="file.status === 'error' && uploadCtx?.showRetryButton"
      :class="[uploadCtx.iconCls, `${uploadCtx.iconCls}-upload`]"
      @click="uploadCtx.onUpload(file)"
    >
      <component :is="uploadCtx.slots['retry-icon']" v-if="uploadCtx.slots['retry-icon']" />
      <component :is="uploadCtx.customIcon.retryIcon" v-else-if="uploadCtx.customIcon?.retryIcon" />
      <IconUpload v-else-if="listType === 'picture-card'" />
      <template v-else>{{ t('upload.retry') }}</template>
    </span>

    <span
      v-else-if="file.status === 'done'"
      :class="[uploadCtx?.iconCls, `${uploadCtx?.iconCls}-success`]"
    >
      <component :is="uploadCtx.slots['success-icon']" v-if="uploadCtx?.slots['success-icon']" />
      <component
        :is="uploadCtx.customIcon.successIcon"
        v-else-if="uploadCtx?.customIcon?.successIcon"
      />
      <IconCheck v-else />
    </span>

    <Tooltip
      v-else-if="file.status === 'init' && uploadCtx?.showStartButton"
      :content="t('upload.start')"
    >
      <span
        :class="[uploadCtx.iconCls, `${uploadCtx.iconCls}-start`]"
        @click="uploadCtx.onUpload(file)"
      >
        <component :is="uploadCtx.slots['start-icon']" v-if="uploadCtx.slots['start-icon']" />
        <component
          :is="uploadCtx.customIcon.startIcon"
          v-else-if="uploadCtx.customIcon?.startIcon"
        />
        <IconPlayArrowFill v-else />
      </span>
    </Tooltip>

    <Tooltip v-else-if="uploadCtx?.showCancelButton" :content="t('upload.cancel')">
      <span
        :class="[uploadCtx.iconCls, `${uploadCtx.iconCls}-cancel`]"
        @click="uploadCtx.onAbort(file)"
      >
        <component :is="uploadCtx.slots['cancel-icon']" v-if="uploadCtx.slots['cancel-icon']" />
        <component
          :is="uploadCtx.customIcon.cancelIcon"
          v-else-if="uploadCtx.customIcon?.cancelIcon"
        />
        <IconPause v-else />
      </span>
    </Tooltip>
  </span>
</template>

<script setup lang="ts">
  import { inject, type PropType } from 'vue';

  import type { FileItem, ListType } from './interfaces';

  import { getPrefixCls } from '../_utils/global-config';
  import IconCheck from '../icon/icon-check';
  import IconPause from '../icon/icon-pause';
  import IconPlayArrowFill from '../icon/icon-play-arrow-fill';
  import IconUpload from '../icon/icon-upload';
  import { useI18n } from '../locale';
  import Progress from '../progress';
  import Tooltip from '../tooltip';
  import { uploadInjectionKey } from './context';
  import { getProgressStatus } from './utils';

  defineOptions({ name: 'UploadProgress' });

  defineProps({
    file: {
      type: Object as PropType<FileItem>,
      required: true,
    },
    listType: {
      type: String as PropType<ListType>,
      required: true,
    },
  });

  const prefixCls = getPrefixCls('upload-progress');
  const { t } = useI18n();
  const uploadCtx = inject(uploadInjectionKey, undefined);
</script>
