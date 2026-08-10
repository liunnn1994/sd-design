<template>
  <div :class="cls" @click="handleClick">
    <IconHover :disabled="disabled">
      <IconRight v-if="direction === 'horizontal' && type === 'next'" />
      <IconLeft v-else-if="direction === 'horizontal'" />
      <IconDown v-else-if="type === 'next'" />
      <IconUp v-else />
    </IconHover>
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed } from 'vue';

  import type { Direction } from '../_utils/constant';

  import IconHover from '../_components/icon-hover.vue';
  import { getPrefixCls } from '../_utils/global-config';
  import IconDown from '../icon/icon-down';
  import IconLeft from '../icon/icon-left';
  import IconRight from '../icon/icon-right';
  import IconUp from '../icon/icon-up';

  type ButtonTypes = 'previous' | 'next';

  defineOptions({ name: 'TabsButton' });

  const props = defineProps({
    type: {
      type: String as PropType<ButtonTypes>,
      default: 'next',
    },
    direction: {
      type: String as PropType<Direction>,
      default: 'horizontal',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    onClick: {
      type: Function as PropType<(type: ButtonTypes, ev: Event) => void>,
    },
  });

  const emit = defineEmits<{
    click: [type: ButtonTypes, event: Event];
  }>();

  const prefixCls = getPrefixCls('tabs-nav-button');

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled) {
      emit('click', props.type, event);
    }
  };

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-disabled`]: props.disabled,
      [`${prefixCls}-left`]: props.direction === 'horizontal' && props.type === 'previous',
      [`${prefixCls}-right`]: props.direction === 'horizontal' && props.type === 'next',
      [`${prefixCls}-up`]: props.direction === 'vertical' && props.type === 'previous',
      [`${prefixCls}-down`]: props.direction === 'vertical' && props.type === 'next',
    },
  ]);
</script>
