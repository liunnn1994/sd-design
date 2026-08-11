<template>
  <svg
    v-bind="$attrs"
    color="currentColor"
    viewBox="0 0 1000 1000"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{{ t('sender.stopGenerating') }}</title>
    <rect fill="currentColor" height="250" rx="24" ry="24" width="250" x="375" y="375" />
    <circle
      cx="500"
      cy="500"
      fill="none"
      r="450"
      stroke="currentColor"
      stroke-width="100"
      opacity="0.45"
    />
    <circle
      :class="`${prefixCls}-loading-spinner`"
      cx="500"
      cy="500"
      fill="none"
      r="450"
      stroke="currentColor"
      stroke-width="100"
      stroke-dasharray="600 9999999"
    />
  </svg>
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';

  defineOptions({ name: 'SenderStopLoadingIcon', inheritAttrs: false });

  const { t } = useI18n();
  const prefixCls = getPrefixCls('sender');
</script>
