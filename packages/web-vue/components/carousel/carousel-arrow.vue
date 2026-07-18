<template>
  <div :class="cls">
    <div
      role="button"
      tabindex="0"
      :aria-label="t('a11y.prevSlide')"
      :class="`${prefixCls}-arrow-${direction === 'vertical' ? 'top' : 'left'}`"
      @click="onPreviousClick"
      @keydown="(e) => onKeydown(e, 'previous')"
    >
      <IconLeft v-if="direction === 'horizontal'" />
      <IconUp v-else />
    </div>
    <div
      role="button"
      tabindex="0"
      :aria-label="t('a11y.nextSlide')"
      :class="`${prefixCls}-arrow-${direction === 'vertical' ? 'bottom' : 'right'}`"
      @click="onNextClick"
      @keydown="(e) => onKeydown(e, 'next')"
    >
      <IconRight v-if="direction === 'horizontal'" />
      <IconDown v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { isActivationKey } from '../_utils/keyboard';
  import IconDown from '../icon/icon-down';
  import IconLeft from '../icon/icon-left';
  import IconRight from '../icon/icon-right';
  import IconUp from '../icon/icon-up';
  import { useI18n } from '../locale';

  defineOptions({ name: 'Arrow' });

  const props = defineProps({
    direction: {
      type: String,
      default: 'horizontal',
    },
    showArrow: {
      type: String,
      default: 'always',
    },
  });

  const emit = defineEmits<{
    previousClick: [_ev: Event];
    nextClick: [_ev: Event];
  }>();

  const { t } = useI18n();

  const prefixCls = getPrefixCls('carousel');

  const onPreviousClick = (ev: MouseEvent) => {
    emit('previousClick', ev);
  };

  const onNextClick = (ev: MouseEvent) => {
    emit('nextClick', ev);
  };

  const onKeydown = (e: KeyboardEvent, which: 'previous' | 'next') => {
    if (isActivationKey(e)) {
      e.preventDefault();
      if (which === 'previous') {
        emit('previousClick', e);
      } else {
        emit('nextClick', e);
      }
    }
  };

  const cls = computed(() => [
    `${prefixCls}-arrow`,
    {
      [`${prefixCls}-arrow-hover`]: props.showArrow === 'hover',
    },
  ]);
</script>
