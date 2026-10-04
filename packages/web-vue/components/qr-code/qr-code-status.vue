<template>
  <div :class="`${prefixCls}-status`" role="status" aria-live="polite">
    <sd-spin v-if="status === 'loading'" v-bind="spinProps" />
    <template v-else-if="status === 'expired'">
      <p :class="`${prefixCls}-expired`">{{ t('qrCode.expired') }}</p>
      <button type="button" :class="`${prefixCls}-refresh-btn`" @click="handleRefresh">
        {{ t('qrCode.refresh') }}
      </button>
    </template>
    <p v-else-if="status === 'scanned'" :class="`${prefixCls}-scanned`">{{
      t('qrCode.scanned')
    }}</p>
  </div>
</template>

<script lang="ts" setup>
  import type { QrCodeStatusProps } from './types';

  import { useI18n } from '../locale';
  import SdSpin from '../spin';

  const { t } = useI18n();

  const { prefixCls, status, spinProps } = defineProps<QrCodeStatusProps>();

  const emit = defineEmits<{
    /**
     * @zh 点击刷新时触发
     * @en Triggered when refresh action is clicked
     */
    refresh: [];
  }>();

  const handleRefresh = () => {
    emit('refresh');
  };
</script>
