<template>
  <svg
    v-bind="$attrs"
    color="currentColor"
    viewBox="0 0 1000 1000"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{{ t('sender.recording') }}</title>
    <rect
      v-for="index in 4"
      :key="index"
      :class="`${prefixCls}-recording-bar`"
      :style="{ animationDelay: `${(index - 1) * 0.2}s` }"
      fill="currentColor"
      rx="70"
      ry="70"
      height="250"
      width="140"
      :x="(index - 1) * 286.6667"
      y="375"
    />
  </svg>
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';

  defineOptions({ name: 'SenderRecordingIcon', inheritAttrs: false });

  const { t } = useI18n();
  const prefixCls = getPrefixCls('sender');
</script>
