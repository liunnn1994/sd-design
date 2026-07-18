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

  import { getPrefixCls } from '../_utils/global-config';
  import Copy from '../copy';
  import { PerformantEllipsis } from '../ellipsis';
  import IconEye from '../icon/icon-eye';
  import IconEyeInvisible from '../icon/icon-eye-invisible';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';

  type SecretProps = {
    /**
     * @zh 原始敏感文本
     * @en Original secret text
     */
    text: string;
    /**
     * @zh 隐藏状态下展示的占位内容
     * @en Placeholder content shown while hidden
     */
    hiddenText?: string;
    /**
     * @zh 是否展示复制按钮
     * @en Whether to show the copy button
     */
    showCopy?: boolean;
  };

  defineOptions({
    name: 'Secret',
  });

  const { text, hiddenText = '********', showCopy = true } = defineProps<SecretProps>();

  const visibleValue = defineModel<boolean>('visible', {
    default: false,
  });

  const { t } = useI18n();

  const prefixCls = getPrefixCls('secret');
  const toggleTooltip = computed(() => (visibleValue.value ? '隐藏' : '显示'));
  const toggleAriaLabel = computed(() =>
    visibleValue.value ? t('a11y.secretHide') : t('a11y.secretShow'),
  );

  function handleToggleVisible() {
    visibleValue.value = !visibleValue.value;
  }
</script>
