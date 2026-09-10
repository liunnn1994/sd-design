<template>
  <div :class="prefixCls">
    <PerformantEllipsis v-if="visibleValue" :class="`${prefixCls}-content`">
      {{ text }}
    </PerformantEllipsis>
    <span v-else :class="[`${prefixCls}-content`, `${prefixCls}-placeholder`]">
      {{ hiddenText }}
    </span>

    <Tooltip :content="toggleTooltip">
      <button
        type="button"
        :class="`${prefixCls}-trigger`"
        :aria-label="toggleAriaLabel"
        :aria-pressed="visibleValue"
        @click="handleToggleVisible"
      >
        <IconEye v-if="!visibleValue" />
        <IconEyeInvisible v-else />
      </button>
    </Tooltip>

    <Copy v-if="showCopy" :content="text" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import type { SecretProps } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import Copy from '../copy';
  import { PerformantEllipsis } from '../ellipsis';
  import IconEye from '../icon/icon-eye';
  import IconEyeInvisible from '../icon/icon-eye-invisible';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';

  defineOptions({
    name: 'Secret',
  });

  const { text, hiddenText = '********', showCopy = true } = defineProps<SecretProps>();

  const visibleValue = defineModel<boolean>('visible', {
    default: false,
  });

  const { t } = useI18n();

  const prefixCls = getPrefixCls('secret');
  const toggleAriaLabel = computed(() =>
    visibleValue.value ? t('a11y.secretHide') : t('a11y.secretShow'),
  );
  const toggleTooltip = toggleAriaLabel;

  function handleToggleVisible() {
    visibleValue.value = !visibleValue.value;
  }
</script>
